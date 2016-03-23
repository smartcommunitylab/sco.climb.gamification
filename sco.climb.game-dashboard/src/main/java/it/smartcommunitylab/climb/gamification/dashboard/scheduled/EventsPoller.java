package it.smartcommunitylab.climb.gamification.dashboard.scheduled;

import it.smartcommunitylab.climb.contextstore.model.Route;
import it.smartcommunitylab.climb.contextstore.model.Stop;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusGame;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusPlayer;
import it.smartcommunitylab.climb.gamification.dashboard.model.events.WsnEvent;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.ExecutionDataDTO;
import it.smartcommunitylab.climb.gamification.dashboard.storage.RepositoryManager;
import it.smartcommunitylab.climb.gamification.dashboard.utils.HTTPUtils;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.GregorianCalendar;
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

//	@Scheduled(cron = "0 * * * * *")
	public Map<String, Integer> pollEvents() throws Exception {
		Map<String, Integer> results = Maps.newTreeMap();

			List<PedibusGame> games = storage.getPedibusGames();
			for (PedibusGame game : games) {
				logger.info("Reading game " + game.getGameId() + " events.");
				

				Date date = new Date();
				
				if (game.getFrom().compareTo(date) > 0 || game.getTo().compareTo(date) < 0) {
					logger.info("Skipping game " + game.getGameId() + ", date out of range.");
					continue;
				}
				
				String ownerId = game.getOwnerId();

				List<String> routesList = getRoutes(game.getSchoolId(), ownerId, game.getToken());

				Calendar cal = new GregorianCalendar(TimeZone.getDefault());
				cal.setTime(cal.getTime());

				String to = sdf.format(date);

				cal.set(Calendar.HOUR_OF_DAY, 0);
				cal.set(Calendar.MINUTE, 0);
				cal.set(Calendar.SECOND, 1);
				cal.set(Calendar.MILLISECOND, 0);

				String from = sdf.format(cal.getTime());

				ObjectMapper mapper = new ObjectMapper();

				for (String routeId : routesList) {
					logger.info("Reading route " + routeId + " events.");
					
					WsnEvent lastEvent = storage.getLastEvent(ownerId, routeId);
					if (lastEvent != null) {
						Date lastDate = lastEvent.getTimestamp();
						cal.setTime(lastDate);
						cal.add(Calendar.SECOND, 1);
						from = sdf.format(cal.getTime());
					}
					
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
						Collection<ChildStatus> result = ep.process(eventsList);

						sendScores(result, ownerId, game.getGameId());

						results.put(routeId, eventsList.size());
						storage.saveLastEvent(Collections.max(eventsList));
						logger.info("Computed scores for route " + routeId + " = " + result);
					} else {
						results.put(routeId, -1);
						logger.info("No recent events for route " + routeId);
					}
				}
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
	
	private void sendScores(Collection<ChildStatus> childrenStatus, String ownerId, String gameId) throws Exception {
		for (ChildStatus childStatus: childrenStatus) {
			PedibusPlayer player = storage.getPedibusPlayerByChildId(ownerId, gameId, childStatus.getChildId());
			
			if (player == null) {
				logger.error("Player with childId = " + childStatus.getChildId() + " not found.");
				continue;
			}
			String address = gamificationURL + "/gengine/execute";
			
			ExecutionDataDTO ed = new ExecutionDataDTO();
			ed.setGameId(gameId);
			ed.setPlayerId(player.getChildId());
			ed.setActionId(actionIncrease);
			
			Map<String, Object> data = Maps.newTreeMap();
			data.put(scoreName, childStatus.getScore());
			ed.setData(data);
			
			HTTPUtils.post(address, ed, null, gamificationUser, gamificationPassword);	
		}
	}
	
	
	

}
