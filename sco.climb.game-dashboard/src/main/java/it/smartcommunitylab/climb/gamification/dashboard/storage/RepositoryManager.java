package it.smartcommunitylab.climb.gamification.dashboard.storage;

import it.smartcommunitylab.climb.gamification.dashboard.exception.StorageException;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusGame;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusItineraryLeg;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusPlayer;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusTeam;
import it.smartcommunitylab.climb.gamification.dashboard.security.DataSetInfo;
import it.smartcommunitylab.climb.gamification.dashboard.security.Token;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

public class RepositoryManager {
	private static final transient Logger logger = LoggerFactory.getLogger(RepositoryManager.class);
	
	private MongoTemplate mongoTemplate;
	private String defaultLang;
	
	public RepositoryManager(MongoTemplate template, String defaultLang) {
		this.mongoTemplate = template;
		this.defaultLang = defaultLang;
	}
	
	public String getDefaultLang() {
		return defaultLang;
	}

	public Token findTokenByToken(String token) {
		Query query = new Query(new Criteria("token").is(token));
		Token result = mongoTemplate.findOne(query, Token.class);
		return result;
	}
	
	public List<DataSetInfo> getDataSetInfo() {
		List<DataSetInfo> result = mongoTemplate.findAll(DataSetInfo.class);
		return result;
	}

	public List<PedibusGame> getPedibusGames() {
		return mongoTemplate.findAll(PedibusGame.class);		
	}		
	
	public PedibusGame getPedibusGame(String ownerId, String gameId) {
		Query query = new Query(new Criteria("ownerId").is(ownerId).and("gameId").is(gameId));
		return mongoTemplate.findOne(query, PedibusGame.class);		
	}		
	
	public List<PedibusGame> getPedibusGames(String ownerId) {
		Query query = new Query(new Criteria("ownerId").is(ownerId));
		return mongoTemplate.find(query, PedibusGame.class);		
	}	
	
	public PedibusItineraryLeg getPedibusItineraryLeg(String ownerId, String legId) {
		Query query = new Query(new Criteria("ownerId").is(ownerId).and("legId").is(legId));
		return mongoTemplate.findOne(query, PedibusItineraryLeg.class);		
	}		
	
	public List<PedibusItineraryLeg> getPedibusItineraryLegs(String ownerId) {
		Query query = new Query(new Criteria("ownerId").is(ownerId));
		List<PedibusItineraryLeg> result = mongoTemplate.find(query, PedibusItineraryLeg.class);
		Collections.sort(result);
		return result;
	}		
	
	public List<PedibusItineraryLeg> getPedibusItineraryLegsByGameId(String ownerId, String gameId) {
		Query query = new Query(new Criteria("ownerId").is(ownerId).and("gameId").is(gameId));
		return mongoTemplate.find(query, PedibusItineraryLeg.class);		
	}		
	
	public List<PedibusPlayer> getPedibusPlayers(String ownerId, String gameId) {
		Query query = new Query(new Criteria("ownerId").is(ownerId).and("gameId").is(gameId));
		return mongoTemplate.find(query, PedibusPlayer.class);		
	}	
	
	public PedibusPlayer getPedibusPlayerByWsnId(String ownerId, String gameId, int wsnId) {
		Query query = new Query(new Criteria("ownerId").is(ownerId).and("gameId").is(gameId).and("wsnId").is(wsnId));
		return mongoTemplate.findOne(query, PedibusPlayer.class);		
	}	
	
	public List<PedibusTeam> getPedibusTeams(String ownerId, String gameId) {
		Query query = new Query(new Criteria("ownerId").is(ownerId).and("gameId").is(gameId));
		return mongoTemplate.find(query, PedibusTeam.class);		
	}		
		
	
	public void saveDataSetInfo(DataSetInfo dataSetInfo) {
		Query query = new Query(new Criteria("ownerId").is(dataSetInfo.getOwnerId()));
		DataSetInfo appInfoDB = mongoTemplate.findOne(query, DataSetInfo.class);
		if (appInfoDB == null) {
			mongoTemplate.save(dataSetInfo);
		} else {
			Update update = new Update();
			update.set("password", dataSetInfo.getPassword());
			update.set("token", dataSetInfo.getToken());
			mongoTemplate.updateFirst(query, update, DataSetInfo.class);
		}
	}
	
	public void saveAppToken(String name, String token) {
		Query query = new Query(new Criteria("name").is(name));
		Token tokenDB = mongoTemplate.findOne(query, Token.class);
		if(tokenDB == null) {
			Token newToken = new Token();
			newToken.setToken(token);
			newToken.setName(name);
			newToken.getPaths().add("/api");
			mongoTemplate.save(newToken);
		} else {
			Update update = new Update();
			update.set("token", token);
			mongoTemplate.updateFirst(query, update, Token.class);
		}
	}
	
	public void savePedibusGame(PedibusGame game, String ownerId, boolean canUpdate) throws StorageException {
		Query query = new Query(new Criteria("gameId").is(game.getGameId()).and("ownerId").is(ownerId));
		PedibusGame gameDB = mongoTemplate.findOne(query, PedibusGame.class);
		Date now = new Date();
		if (gameDB == null) {
			game.setCreationDate(now);
			game.setLastUpdate(now);
			game.setObjectId(generateObjectId(game));
			game.setOwnerId(ownerId);
			mongoTemplate.save(game);
		} else if (canUpdate) {
			Update update = new Update();
			update.set("schoolId", game.getSchoolId());
			update.set("schoolName", game.getSchoolName());
			update.set("classRoom", game.getClassRooms());
			update.set("gameName", game.getGameName());
			update.set("gameDescription", game.getGameDescription());
			update.set("gameOwner", game.getGameOwner());
			update.set("from", game.getFrom());
			update.set("to", game.getTo());
			update.set("lastUpdate", now);
			mongoTemplate.updateFirst(query, update, PedibusGame.class);
		} else {
			throw new StorageException("Cannot update existing PedibusGame with gameId " + game.getGameId());
		}
	}	
	
	public void savePedibusItineraryLeg(PedibusItineraryLeg leg, String ownerId, boolean canUpdate) throws StorageException {
		Query query = new Query(new Criteria("gameId").is(leg.getGameId()).and("legId").is(leg.getLegId()).and("ownerId").is(ownerId));
		PedibusItineraryLeg legDB = mongoTemplate.findOne(query, PedibusItineraryLeg.class);
		Date now = new Date();
		if (legDB == null) {
			leg.setCreationDate(now);
			leg.setLastUpdate(now);
			leg.setObjectId(generateObjectId(leg));
			leg.setOwnerId(ownerId);
			mongoTemplate.save(leg);
		} else if (canUpdate) {
			Update update = new Update();
			update.set("badgeId", leg.getBadgeId());
			update.set("name", leg.getName());
			update.set("description", leg.getDescription());
			update.set("position", leg.getPosition());
			update.set("geocoding", leg.getGeocoding());
			update.set("externalUrl", leg.getExternalUrl());
			update.set("polyline", leg.getPolyline());
			update.set("score", leg.getScore());
			update.set("lastUpdate", now);
			mongoTemplate.updateFirst(query, update, PedibusGame.class);
		} else {
			throw new StorageException("Cannot update existing PedibusItineraryLeg with gameId " + leg.getGameId() + " and legId " + leg.getLegId());
		}
	}	
	
	public boolean savePedibusPlayer(PedibusPlayer player, String ownerId, boolean canUpdate) throws StorageException {
		Query query = new Query(new Criteria("childId").is(player.getChildId()).and("ownerId").is(ownerId));
		PedibusPlayer playerDB = mongoTemplate.findOne(query, PedibusPlayer.class);
		Date now = new Date();
		if (playerDB == null) {
			player.setCreationDate(now);
			player.setLastUpdate(now);
			player.setObjectId(generateObjectId(player));
			player.setOwnerId(ownerId);
			mongoTemplate.save(player);
			return false;
		} else if (canUpdate) {
			Update update = new Update();
			update.set("childId", player.getChildId());
			update.set("wsnId", player.getWsnId());
			update.set("gameId", player.getGameId());
			update.set("lastUpdate", now);
			mongoTemplate.updateFirst(query, update, PedibusPlayer.class);
			return true;
		} else {
			throw new StorageException("Cannot update existing PedibusPlayer with childId " + player.getChildId());
		}
	}	
	
	public boolean savePedibusTeam(PedibusTeam team, String ownerId, boolean canUpdate) throws StorageException {
		Query query = new Query(new Criteria("classRoom").is(team.getClassRoom()).and("ownerId").is(ownerId));
		PedibusTeam teamDB = mongoTemplate.findOne(query, PedibusTeam.class);
		Date now = new Date();
		if (teamDB == null) {
			team.setCreationDate(now);
			team.setLastUpdate(now);
			team.setObjectId(generateObjectId(team));
			team.setOwnerId(ownerId);
			mongoTemplate.save(team);
			return false;
		} else if (canUpdate) {
			Update update = new Update();
			update.set("classRoom", team.getClassRoom());
			update.set("gameId", team.getGameId());
			update.set("childrenId", team.getChildrenId());
			update.set("lastUpdate", now);
			mongoTemplate.updateFirst(query, update, PedibusTeam.class);
			return true;
		} else {
			throw new StorageException("Cannot update existing PedibusPlayer with classRoom " + team.getClassRoom());
		}
	}	
	
	
	
	public List<?> findData(Class<?> entityClass, Criteria criteria, Sort sort, String ownerId)
			throws ClassNotFoundException {
		Query query = null;
		if (criteria != null) {
			query = new Query(new Criteria("ownerId").is(ownerId).andOperator(criteria));
		} else {
			query = new Query(new Criteria("ownerId").is(ownerId));
		}
		if (sort != null) {
			query.with(sort);
		}
		query.limit(5000);
		List<?> result = mongoTemplate.find(query, entityClass);
		return result;
	}

	public <T> T findOneData(Class<T> entityClass, Criteria criteria, String ownerId)
			throws ClassNotFoundException {
		Query query = null;
		if (criteria != null) {
			query = new Query(new Criteria("ownerId").is(ownerId).andOperator(criteria));
		} else {
			query = new Query(new Criteria("ownerId").is(ownerId));
		}
		T result = mongoTemplate.findOne(query, entityClass);
		return result;
	}

	private String generateObjectId(Object obj) {
		return UUID.randomUUID().toString();
	}

}
