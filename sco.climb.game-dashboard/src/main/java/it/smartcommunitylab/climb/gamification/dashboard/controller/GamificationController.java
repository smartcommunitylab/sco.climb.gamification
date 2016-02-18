package it.smartcommunitylab.climb.gamification.dashboard.controller;

import it.smartcommunitylab.climb.contextstore.model.Child;
import it.smartcommunitylab.climb.gamification.dashboard.common.Utils;
import it.smartcommunitylab.climb.gamification.dashboard.exception.UnauthorizedException;
import it.smartcommunitylab.climb.gamification.dashboard.model.Gamified;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusGame;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusItineraryLeg;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusPlayer;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusTeam;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.BadgeCollectionConcept;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.CustomData;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.ExecutionDataDTO;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.PlayerStateDTO;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.PointConcept;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.TeamDTO;
import it.smartcommunitylab.climb.gamification.dashboard.scheduled.EventsPoller;
import it.smartcommunitylab.climb.gamification.dashboard.storage.DataSetSetup;
import it.smartcommunitylab.climb.gamification.dashboard.storage.RepositoryManager;
import it.smartcommunitylab.climb.gamification.dashboard.utils.HTTPUtils;

import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Controller
public class GamificationController {

	private static final transient Logger logger = LoggerFactory.getLogger(GamificationController.class);

	@Autowired
	@Value("${contextstore.url}")
	private String contextstoreURL;

	@Autowired
	@Value("${gamification.url}")
	private String gamificationURL;

	@Autowired
	@Value("${points.name}")
	private String pointsName;

	@Autowired
	@Value("${action.name}")
	private String actionName;

	@Autowired
	@Value("${score.name}")
	private String scoreName;

	@Autowired
	private RepositoryManager storage;

	@Autowired
	private DataSetSetup dataSetSetup;

	@Autowired
	private EventsPoller eventsPoller;

	private ObjectMapper mapper = new ObjectMapper();

	@RequestMapping(value = "/api/game/{ownerId}", method = RequestMethod.POST)
	public @ResponseBody void createPedibusGame(@PathVariable String ownerId, @RequestBody PedibusGame game, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			String token = request.getHeader("X-ACCESS-TOKEN");

			game.setToken(token);

			storage.savePedibusGame(game, ownerId, false);

			for (String classRoom : game.getClassRooms()) {

				String address = contextstoreURL + "/api/child/" + ownerId + "/" + game.getSchoolId() + "/classroom?classRoom=" + classRoom;

				String result = HTTPUtils.get(address, token);

				List<?> children = mapper.readValue(result, List.class);
				List<String> childrenId = Lists.newArrayList();

				for (Object c : children) {
					Child child = mapper.convertValue(c, Child.class);
					childrenId.add(child.getObjectId());

					PedibusPlayer pp = new PedibusPlayer();
					pp.setChildId(child.getObjectId());
					pp.setWsnId(child.getWsnId());
					pp.setGameId(game.getGameId());
					storage.savePedibusPlayer(pp, ownerId, false);

					address = gamificationURL + "/console/game/" + game.getGameId() + "/player";
					PlayerStateDTO player = new PlayerStateDTO();
					player.setPlayerId(child.getObjectId());
					player.setGameId(game.getGameId());
					CustomData cd = new CustomData();
					cd.put("name", child.getName());
					cd.put("surname", child.getSurname());
					player.setCustomData(cd);

					result = HTTPUtils.post(address, player, null);
				}
				PedibusTeam pt = new PedibusTeam();
				pt.setChildrenId(childrenId);
				pt.setGameId(game.getGameId());
				pt.setClassRoom(classRoom);
				storage.savePedibusTeam(pt, ownerId, false);

				address = gamificationURL + "/console/game/" + game.getGameId() + "/team";
				TeamDTO team = new TeamDTO();

				team.setName(classRoom);
				team.setMembers(childrenId);
				team.setPlayerId(classRoom);
				team.setGameId(game.getGameId());

				result = HTTPUtils.post(address, team, null);
			}

			if (logger.isInfoEnabled()) {
				logger.info("add pedibusGame");
			}
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
		}
	}

	@RequestMapping(value = "/api/game/{ownerId}", method = RequestMethod.PUT)
	public @ResponseBody void updatePedibusGame(@PathVariable String ownerId, @RequestBody PedibusGame game, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			String token = request.getHeader("X-ACCESS-TOKEN");

			game.setToken(token);

			storage.savePedibusGame(game, ownerId, true);

			for (String classRoom : game.getClassRooms()) {

				String address = contextstoreURL + "/api/child/" + ownerId + "/" + game.getSchoolId() + "/classroom?classRoom=" + classRoom;

				String result = HTTPUtils.get(address, token);

				List<?> children = mapper.readValue(result, List.class);
				List<String> childrenId = Lists.newArrayList();

				for (Object c : children) {
					Child child = mapper.convertValue(c, Child.class);
					childrenId.add(child.getObjectId());

					PedibusPlayer pp = new PedibusPlayer();
					pp.setChildId(child.getObjectId());
					pp.setWsnId(child.getWsnId());
					pp.setGameId(game.getGameId());
					boolean updated = storage.savePedibusPlayer(pp, ownerId, true);

					if (!updated) {
						address = gamificationURL + "/console/game/" + game.getGameId() + "/player";
						PlayerStateDTO player = new PlayerStateDTO();
						player.setPlayerId(child.getObjectId());
						player.setGameId(game.getGameId());
						CustomData cd = new CustomData();
						cd.put("name", child.getName());
						cd.put("surname", child.getSurname());
						player.setCustomData(cd);

						result = HTTPUtils.post(address, player, null);
					}
				}
				PedibusTeam pt = new PedibusTeam();
				pt.setChildrenId(childrenId);
				pt.setGameId(game.getGameId());
				pt.setClassRoom(classRoom);
				boolean updated = storage.savePedibusTeam(pt, ownerId, true);

				if (!updated) {
					address = gamificationURL + "/console/game/" + game.getGameId() + "/team";
					TeamDTO team = new TeamDTO();

					team.setName(classRoom);
					team.setMembers(childrenId);
					team.setPlayerId(classRoom);
					team.setGameId(game.getGameId());

					result = HTTPUtils.post(address, team, null);
				} else {
					address = gamificationURL + "/console/game/" + game.getGameId() + "/team/" + classRoom + "/members";
					result = HTTPUtils.post(address, childrenId, null);
				}
			}

			if (logger.isInfoEnabled()) {
				logger.info("add pedibusGame");
			}
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
		}
	}

	@RequestMapping(value = "/api/game/{ownerId}/{gameId}", method = RequestMethod.GET)
	public @ResponseBody PedibusGame getPedibusGame(@PathVariable String ownerId, @PathVariable String gameId, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			PedibusGame result = storage.getPedibusGame(ownerId, gameId);

			if (logger.isInfoEnabled()) {
				logger.info("get pedibusGame");
			}
			return result;
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
			return null;
		}
	}

	@RequestMapping(value = "/api/game/{ownerId}", method = RequestMethod.GET)
	public @ResponseBody List<PedibusGame> getPedibusGames(@PathVariable String ownerId, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			List<PedibusGame> result = storage.getPedibusGames(ownerId);

			if (logger.isInfoEnabled()) {
				logger.info("get pedibusGames");
			}
			return result;
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
			return null;
		}
	}

	@RequestMapping(value = "/api/leg/{ownerId}", method = RequestMethod.POST)
	public @ResponseBody void createPedibusItineraryLeg(@PathVariable String ownerId, @RequestBody PedibusItineraryLeg leg, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			leg.setLegId(getUUID());
			storage.savePedibusItineraryLeg(leg, ownerId, false);

			if (logger.isInfoEnabled()) {
				logger.info("add pedibusItineraryLeg");
			}
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
		}
	}
	
	@RequestMapping(value = "/api/legs/{ownerId}", method = RequestMethod.POST)
	public @ResponseBody void createPedibusItineraryLeg(@PathVariable String ownerId, @RequestBody List<PedibusItineraryLeg> legs, @RequestParam(required = false) Boolean sum, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		Collections.sort(legs);
		int sumValue = 0;
		try {
			for (PedibusItineraryLeg leg: legs) {
				leg.setLegId(getUUID());
				if (sum != null && sum) {
					sumValue += leg.getScore();
					leg.setScore(sumValue);
				}
				storage.savePedibusItineraryLeg(leg, ownerId, false);
			}

			if (logger.isInfoEnabled()) {
				logger.info("add pedibusItineraryLegs");
			}
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
		}
	}	

	@RequestMapping(value = "/api/leg/{ownerId}/{legId}", method = RequestMethod.GET)
	public @ResponseBody PedibusItineraryLeg getPedibusItineraryLeg(@PathVariable String ownerId, @PathVariable String legId, HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			PedibusItineraryLeg result = storage.getPedibusItineraryLeg(ownerId, legId);

			if (logger.isInfoEnabled()) {
				logger.info("get pedibusItineraryLegs");
			}
			return result;
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
			return null;
		}
	}

	@RequestMapping(value = "/api/leg/{ownerId}", method = RequestMethod.GET)
	public @ResponseBody List<PedibusItineraryLeg> getPedibusItineraryLegs(@PathVariable String ownerId, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			List<PedibusItineraryLeg> result = storage.getPedibusItineraryLegs(ownerId);

			if (logger.isInfoEnabled()) {
				logger.info("get pedibusItineraryLegs");
			}
			return result;
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
			return null;
		}
	}

	@RequestMapping(value = "/api/game/status/{ownerId}/{gameId}", method = RequestMethod.GET)
	public @ResponseBody Map<String, Object> getGameStatus(@PathVariable String ownerId, @PathVariable String gameId, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			PedibusGame game = storage.getPedibusGame(ownerId, gameId);
			List<PedibusItineraryLeg> legs = storage.getPedibusItineraryLegsByGameId(ownerId, gameId);

			// players score
			List<PedibusPlayer> players = storage.getPedibusPlayers(ownerId, gameId);

			for (PedibusPlayer player : players) {
				updateGamificationData(player, gameId, player.getChildId());
			}

			// teams score
			List<PedibusTeam> teams = storage.getPedibusTeams(ownerId, gameId);
			for (PedibusTeam team : teams) {
				updateGamificationData(team, gameId, team.getClassRoom());

				// find "current" leg
				for (PedibusItineraryLeg leg : legs) {
					if (team.getScore() >= leg.getScore()) {
						team.setPreviousLeg(leg);
					} else {
						team.setCurrentLeg(leg);
						break;
					}
				}

			}

			Map<String, Object> result = Maps.newTreeMap();
			result.put("game", game);
			result.put("legs", legs);
			result.put("players", players);
			result.put("teams", teams);

			if (logger.isInfoEnabled()) {
				logger.info("get pedibus game status");
			}

			return result;
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
			return null;
		}
	}

	@RequestMapping(value = "/api/game/events/{ownerId}", method = RequestMethod.POST)
	public @ResponseBody Map<String, Integer> pollEvents(@PathVariable String ownerId, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			return eventsPoller.pollEvents();
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
			return null;
		}
	}

	@RequestMapping(value = "/api/child/score/{ownerId}", method = RequestMethod.POST)
	public @ResponseBody void increaseChildScore(@PathVariable String ownerId, @RequestParam String gameId, @RequestParam String playerId, @RequestParam Double score, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}

		try {
			String address = gamificationURL + "/gengine/execute";

			ExecutionDataDTO ed = new ExecutionDataDTO();
			ed.setGameId(gameId);
			ed.setPlayerId(playerId);
			ed.setActionId(actionName);

			Map<String, Object> data = Maps.newTreeMap();
			data.put(scoreName, score);
			ed.setData(data);

			HTTPUtils.post(address, ed, null);
			
			if (logger.isInfoEnabled()) {
				logger.info("increased player score");
			}			
		} catch (Exception e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, Throwables.getStackTraceAsString(e));
		}
	}

	private void updateGamificationData(Gamified entity, String gameId, String id) throws Exception {
		String address = gamificationURL + "/gengine/state/" + gameId + "/" + id;
		String result = HTTPUtils.get(address, null);

		PlayerStateDTO gamePlayer = mapper.readValue(result, PlayerStateDTO.class);

		Set<?> pointConcept = (Set) gamePlayer.getState().get("PointConcept");
		
		if (pointConcept != null) {
			Iterator<?> it = pointConcept.iterator();
			while (it.hasNext()) {
				PointConcept pc = mapper.convertValue(it.next(), PointConcept.class);
				if (pointsName.equals(pc.getName())) {
					entity.setScore(pc.getScore());
				}
			}
		}

		Set<?> badgeCollectionConcept = (Set) gamePlayer.getState().get("BadgeCollectionConcept");
		if (badgeCollectionConcept != null) {
			Map<String, Collection> badges = Maps.newTreeMap();
			Iterator<?> it = badgeCollectionConcept.iterator();
			while (it.hasNext()) {
				BadgeCollectionConcept bcc = mapper.convertValue(it.next(), BadgeCollectionConcept.class);
				badges.put(bcc.getName(), bcc.getBadgeEarned());
			}
			entity.setBadges(badges);
		}

	}
	
	public static String getUUID() {
		return UUID.randomUUID().toString();
	}	

}
