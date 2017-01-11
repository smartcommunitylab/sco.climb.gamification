package it.smartcommunitylab.climb.gamification.dashboard.scheduled;

import it.smartcommunitylab.climb.contextstore.model.Route;
import it.smartcommunitylab.climb.contextstore.model.Stop;
import it.smartcommunitylab.climb.gamification.dashboard.common.Const;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusGame;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusPlayer;
import it.smartcommunitylab.climb.gamification.dashboard.model.events.WsnEvent;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.ExecutionDataDTO;
import it.smartcommunitylab.climb.gamification.dashboard.storage.RepositoryManager;
import it.smartcommunitylab.climb.gamification.dashboard.utils.HTTPUtils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Component
public class EventsPoller {

	@Autowired
	@Value("${contextstore.url}")
	private String contextstoreURL;

	@Autowired
	@Value("${eventstore.url}")
	private String eventstoreURL;
	
	@Autowired
	@Value("${gamification.url}")
	private String gamificationURL;			
	
	@Autowired
	@Value("${gamification.user}")
	private String gamificationUser;

	@Autowired
	@Value("${gamification.password}")
	private String gamificationPassword;
	
	@Autowired
	@Value("${action.increase.name}")	
	private String actionIncrease;	

	@Autowired
	@Value("${score.name}")	
	private String scoreName;	

	@Autowired
	private RepositoryManager storage;

	private static final transient Logger logger = LoggerFactory.getLogger(EventsPoller.class);
	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
	private static final SimpleDateFormat shortSdf = new SimpleDateFormat("yyyy-MM-dd");

	
	//@Scheduled(cron = "0 0 9 * * *") // second, minute, hour, day, month, weekday
	public void scheduledPollEvents() throws Exception {
		pollEvents(true);
	}
	
	public Map<String, Collection<ChildStatus>> pollEvents(boolean checkDate) throws Exception {
		Map<String, Collection<ChildStatus>> results = Maps.newTreeMap();
		List<PedibusGame> games = storage.getPedibusGames();
		for (PedibusGame game : games) {
			logger.info("Reading game " + game.getGameId() + " events.");
			Map<String, Collection<ChildStatus>> childrenStatusMap = pollGameEvents(game.getOwnerId(), game.getGameId(), checkDate);
			for(Collection<ChildStatus> childrenStatus : childrenStatusMap.values()) {
				sendScores(childrenStatus, game.getGameId());
			}
			results.putAll(childrenStatusMap);
		}
		return results;
	}
	
	public Map<String, Collection<ChildStatus>> pollGameEvents(String ownerId, String gameId, 
			boolean checkDate) throws Exception {
		Map<String, Collection<ChildStatus>> results = Maps.newTreeMap();
		PedibusGame game = storage.getPedibusGame(ownerId, gameId);
		if(game != null) {
			Date date = new Date();
			if(checkDate) {
				if(game.getFrom().compareTo(date) > 0 || game.getTo().compareTo(date) < 0) {
					logger.info("Skipping game " + game.getGameId() + ", date out of range.");
					return results;
				}
			}
			List<String> routesList = getRoutes(game.getSchoolId(), ownerId, game.getToken());

			Calendar cal = new GregorianCalendar(TimeZone.getDefault());

			String from, to;

			if (game.getLastDaySeen() != null) {
				cal.setTime(shortSdf.parse(game.getLastDaySeen()));
				cal.add(Calendar.DAY_OF_YEAR, 1);
			} else {
				cal.setTime(cal.getTime());
			}
			game.setLastDaySeen(shortSdf.format(cal.getTime()));

			String h[];

			// h = (game.getFromHour() != null ? game.getFromHour() :
			// "00:01").split(":");
			h = game.getFromHour().split(":");
			cal.set(Calendar.HOUR_OF_DAY, Integer.parseInt(h[0]));
			cal.set(Calendar.MINUTE, Integer.parseInt(h[1]));
			cal.set(Calendar.SECOND, 0);
			cal.set(Calendar.MILLISECOND, 0);

			from = sdf.format(cal.getTime());

			// h = (game.getToHour() != null ? game.getToHour() :
			// "23:59").split(":");
			h = game.getToHour().split(":");
			cal.set(Calendar.HOUR_OF_DAY, Integer.parseInt(h[0]));
			cal.set(Calendar.MINUTE, Integer.parseInt(h[1]));

			to = sdf.format(cal.getTime());

			ObjectMapper mapper = new ObjectMapper();
			
			for (String routeId : routesList) {
				logger.info("Reading route " + routeId + " events.");

				String address = eventstoreURL + "/api/event/" + ownerId + "?" + "routeId=" + routeId + "&dateFrom=" + from + "&dateTo=" + to;

				String routeEvents = HTTPUtils.get(address, game.getToken(), null, null);

				List<WsnEvent> eventsList = Lists.newArrayList();

				List<?> events = mapper.readValue(routeEvents, List.class);

				for (Object e : events) {
					WsnEvent event = mapper.convertValue(e, WsnEvent.class);
					eventsList.add(event);
				}
				if (!eventsList.isEmpty()) {
					address = contextstoreURL + "/api/stop/" + ownerId + "/" + routeId;

					String routeStops = HTTPUtils.get(address, game.getToken(), null, null);

					Map<String, Stop> stopsMap = Maps.newTreeMap();

					List<?> stops = mapper.readValue(routeStops, List.class);
					for (Object e : stops) {
						Stop stop = mapper.convertValue(e, Stop.class);
						stopsMap.put(stop.getObjectId(), stop);
					}

					logger.info("Computing scores for route " + routeId);
					EventsProcessor ep = new EventsProcessor(stopsMap);
					Collection<ChildStatus> status = ep.process(eventsList);

					results.put(routeId, status);
					logger.info("Computed scores for route " + routeId + " = " + status);
				} else {
					results.put(routeId, null);
					logger.info("No recent events for route " + routeId);
				}
			}	
			storage.updatePedibusGameLastDaySeen(ownerId, game.getGameId(), game.getLastDaySeen());
		}
		return results;
	}
	
	private List<String> getRoutes(String schoolId, String ownerId, String token) throws Exception {
		String address = contextstoreURL + "/api/route/" + ownerId + "/school/" + schoolId;

		String result = HTTPUtils.get(address, token, null, null);

		List<String> routesList = Lists.newArrayList();
		ObjectMapper mapper = new ObjectMapper();
		List<?> routes = mapper.readValue(result, List.class);
		for (Object e : routes) {
			Route route = mapper.convertValue(e, Route.class);
			routesList.add(route.getObjectId());
		}

		return routesList;
	}
	
	public void sendScores(Collection<ChildStatus> childrenStatus, String gameId) {
		String address = gamificationURL + "/gengine/execute";
		if(childrenStatus == null) { 
			return;
		}
		for (ChildStatus childStatus: childrenStatus) {
			if(childStatus.isArrived()) {
				String playerId = childStatus.getChildId();
				Double score = childStatus.getScore();
						
				ExecutionDataDTO ed = new ExecutionDataDTO();
				ed.setGameId(gameId);
				ed.setPlayerId(playerId);
				ed.setActionId(actionIncrease);
				
				Map<String, Object> data = Maps.newTreeMap();
				data.put(scoreName, score);
				ed.setData(data);
				
				try {
					if(logger.isInfoEnabled()) {
						logger.info(String.format("increased game[%s] player[%s] score[%s]", gameId, playerId, score));
					}
					HTTPUtils.post(address, ed, null, gamificationUser, gamificationPassword);
				} catch (Exception e) {
					logger.warn(e.getMessage());
				}				
			}
		}
	}
	
	public void updateCalendarDayFromPedibus(String ownerId, String gameId,
			Map<String, Collection<ChildStatus>> childrenStatusMap) {
		
		Map<String, Map<String, String>> classModeMap = new HashMap<String, Map<String,String>>();
		
		for(Collection<ChildStatus> childrenStatus : childrenStatusMap.values()) {
			if(childrenStatus == null) {
				continue;
			}
			for(ChildStatus childStatus : childrenStatus) {
				if(childStatus.isArrived()) {
					PedibusPlayer player = storage.getPedibusPlayerByChildId(ownerId, gameId, childStatus.getChildId());
					if(player != null) {
						String classRoom = player.getClassRoom();
						Map<String, String> modeMap = classModeMap.get(classRoom);
						if(modeMap == null) {
							modeMap = new HashMap<String, String>();
							classModeMap.put(classRoom, modeMap);
						}
						modeMap.put(player.getChildId(), Const.MODE_PEDIBUS);
					}
				}
			}
		}
		
		PedibusGame game = storage.getPedibusGame(ownerId, gameId);
		if(game != null) {
			try {
				Date day = shortSdf.parse(game.getLastDaySeen());
				for(String classRoom : classModeMap.keySet()) {
					Map<String, String> modeMap = classModeMap.get(classRoom);
					storage.updateCalendarDayFromPedibus(ownerId, gameId, classRoom, day, modeMap);
				}
			} catch (ParseException e) {
				logger.warn(e.getMessage());
			}
		}
	}
}
