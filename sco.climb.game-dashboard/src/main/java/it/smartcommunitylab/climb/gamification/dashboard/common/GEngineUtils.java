package it.smartcommunitylab.climb.gamification.dashboard.common;

import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.ExecutionDataDTO;
import it.smartcommunitylab.climb.gamification.dashboard.model.gamification.Notification;
import it.smartcommunitylab.climb.gamification.dashboard.utils.HTTPUtils;

import java.net.URLEncoder;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class GEngineUtils {
	@Autowired
	@Value("${gamification.url}")
	private String gamificationURL;
	
	@Autowired
	@Value("${gamification.user}")
	private String gamificationUser;

	@Autowired
	@Value("${gamification.password}")
	private String gamificationPassword;
	
	private ObjectMapper mapper = new ObjectMapper();

	public void executeAction(ExecutionDataDTO executionData) throws Exception {
		String address = gamificationURL + "/gengine/execute";
		HTTPUtils.post(address, executionData, null, gamificationUser, gamificationPassword);
	}
	
	public List<Notification> getNotification(String gameId, String playerId, long timestamp) 
			throws Exception {
		String address = gamificationURL + "/gengine/notification/" + gameId + "/" 
			+ URLEncoder.encode(playerId, "UTF-8") + "?timestamp=" + timestamp;
		String json = HTTPUtils.get(address, null, gamificationUser, gamificationPassword);
		Notification[] notifications = mapper.readValue(json, Notification[].class);
		List<Notification> result = Arrays.asList(notifications);
		return result;
	}
}
