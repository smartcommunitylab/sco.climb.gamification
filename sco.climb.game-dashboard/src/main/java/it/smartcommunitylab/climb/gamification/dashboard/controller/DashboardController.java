package it.smartcommunitylab.climb.gamification.dashboard.controller;

import it.smartcommunitylab.climb.gamification.dashboard.common.GEngineUtils;
import it.smartcommunitylab.climb.gamification.dashboard.common.Utils;
import it.smartcommunitylab.climb.gamification.dashboard.exception.EntityNotFoundException;
import it.smartcommunitylab.climb.gamification.dashboard.exception.UnauthorizedException;
import it.smartcommunitylab.climb.gamification.dashboard.model.CalendarDay;
import it.smartcommunitylab.climb.gamification.dashboard.model.Excursion;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusGame;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusPlayer;
import it.smartcommunitylab.climb.gamification.dashboard.model.PedibusTeam;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.Notification;
import it.smartcommunitylab.climb.gamification.dashboard.storage.DataSetSetup;
import it.smartcommunitylab.climb.gamification.dashboard.storage.RepositoryManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@Controller
public class DashboardController {
	private static final transient Logger logger = LoggerFactory.getLogger(DashboardController.class);
	
	@Autowired
	@Value("${contextstore.url}")
	private String contextstoreURL;

	@Autowired
	@Value("${gamification.user}")
	private String gamificationUser;

	@Autowired
	@Value("${gamification.password}")
	private String gamificationPassword;
	
	@Autowired
	@Value("${gamification.url}")
	private String gamificationURL;
	
	@Autowired
	private RepositoryManager storage;

	@Autowired
	private DataSetSetup dataSetSetup;
	
	@Autowired
	private GEngineUtils gengineUtils;

	@RequestMapping(value = "/api/player/{ownerId}/{gameId}/{classRoom}", method = RequestMethod.GET)
	public @ResponseBody List<PedibusPlayer> getPlayersByClassRoom(@PathVariable String ownerId, 
			@PathVariable String gameId, @PathVariable String classRoom, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}
		List<PedibusPlayer> players = storage.getPedibusPlayersByClassRoom(ownerId, gameId, classRoom);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getPlayersByClassRoom[%s]: %s - %s", ownerId, gameId, players.size()));
		}
		return players; 
	}
	
	@RequestMapping(value = "/api/team/{ownerId}/{gameId}", method = RequestMethod.GET)
	public @ResponseBody List<PedibusTeam> getTeams(@PathVariable String ownerId, 
			@PathVariable String gameId, HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}
		List<PedibusTeam> teams = storage.getPedibusTeams(ownerId, gameId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getTeams[%s]: %s - %s", ownerId, gameId, teams.size()));
		}
		return teams; 
	}
	
	@RequestMapping(value = "/api/calendar/{ownerId}/{gameId}/{classRoom}", method = RequestMethod.POST)
	public @ResponseBody void saveCalendarDay(@PathVariable String ownerId, 
			@PathVariable String gameId, @PathVariable String classRoom,
			@RequestBody CalendarDay calendarDay,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}
		storage.saveCalendarDay(ownerId, gameId, classRoom, calendarDay);
		//TODO send action to GE
		if(logger.isInfoEnabled()) {
			logger.info(String.format("saveCalendarDay[%s]: %s - %s", ownerId, gameId, classRoom));
		}
	}
	
	@RequestMapping(value = "/api/calendar/{ownerId}/{gameId}/{classRoom}", method = RequestMethod.GET)
	public @ResponseBody List<CalendarDay> getCalendarDays(@PathVariable String ownerId, 
			@PathVariable String gameId, @PathVariable String classRoom,
			@RequestParam Long from, @RequestParam Long to, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}
		Date dateFrom = new Date(from);
		Date dateTo = new Date(to);
		List<CalendarDay> result = storage.getCalendarDays(ownerId, gameId, classRoom, dateFrom, dateTo);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getCalendarDays[%s]: %s - %s - %s", ownerId, gameId, classRoom, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/excursion/{ownerId}/{gameId}/{classRoom}", method = RequestMethod.POST)
	public @ResponseBody void saveExcursion(@PathVariable String ownerId, 
			@PathVariable String gameId, @PathVariable String classRoom,
			@RequestParam Integer children, @RequestParam Double distance, @RequestParam Long date,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}
		Date day = new Date(date);
		storage.saveExcursion(ownerId, gameId, classRoom, children, distance, day);
		//TODO send action to GE
		if(logger.isInfoEnabled()) {
			logger.info(String.format("saveExcursion[%s]: %s - %s - %s - %s", ownerId, gameId, classRoom, children, distance));
		}
	}	
	
	@RequestMapping(value = "/api/excursion/{ownerId}/{gameId}/{classRoom}", method = RequestMethod.GET)
	public @ResponseBody List<Excursion> getExcursions(@PathVariable String ownerId, 
			@PathVariable String gameId, @PathVariable String classRoom,
			@RequestParam Long from, @RequestParam Long to,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}
		Date dateFrom = new Date(from);
		Date dateTo = new Date(to);
		List<Excursion> result = storage.getExcursions(ownerId, gameId, classRoom, dateFrom, dateTo);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getExcursions[%s]: %s - %s - %s", ownerId, gameId, classRoom, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/notification/{ownerId}/{gameId}/{classRoom}", method = RequestMethod.GET)
	public @ResponseBody List<Notification> getNotifications(@PathVariable String ownerId, 
			@PathVariable String gameId, @PathVariable String classRoom, @RequestParam Long timestamp,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
			throw new UnauthorizedException("Unauthorized Exception: token not valid");
		}
		List<Notification> result = new ArrayList<Notification>();
		PedibusGame game = storage.getPedibusGame(ownerId, gameId);
		if(game != null) {
			List<Notification> classNotifications = gengineUtils.getNotification(gameId, classRoom, timestamp);
			List<Notification> schoolNotifications = gengineUtils.getNotification(gameId, game.getGlobalTeam(), timestamp);
			result.addAll(classNotifications);
			result.addAll(schoolNotifications);
			Collections.sort(result, new Comparator<Notification>() {
				@Override
				public int compare(Notification o1, Notification o2) {
					if(o1.getTimestamp() < o2.getTimestamp()) {
						return -1;
					} else if(o1.getTimestamp() > o2.getTimestamp()) {
						return 1;
					} else { 
						return 0; 
					}
				}
			});
		}
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getNotifications[%s]: %s - %s - %s", ownerId, gameId, classRoom, result.size()));
		}
		return result;
	}
	
	@ExceptionHandler(EntityNotFoundException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleEntityNotFoundError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(UnauthorizedException.class)
	@ResponseStatus(value=HttpStatus.FORBIDDEN)
	@ResponseBody
	public Map<String,String> handleUnauthorizedError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleGenericError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}
}
