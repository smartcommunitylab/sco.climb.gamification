package it.smartcommunitylab.climb.gamification.dashboard.model.events;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class WsnEvent extends BaseObject {
	private String routeId;
	private int wsnNodeId;
	private int eventType;
	private Date timestamp;
	private Map<String, Object> payload = new HashMap<String, Object>();
	
	public int getWsnNodeId() {
		return wsnNodeId;
	}
	public void setWsnNodeId(int wsnNodeId) {
		this.wsnNodeId = wsnNodeId;
	}
	public int getEventType() {
		return eventType;
	}
	public void setEventType(int eventType) {
		this.eventType = eventType;
	}
	public Date getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}
	public Map<String, Object> getPayload() {
		return payload;
	}
	public void setPayload(Map<String, Object> payload) {
		this.payload = payload;
	}
	public String getRouteId() {
		return routeId;
	}
	public void setRouteId(String routeId) {
		this.routeId = routeId;
	}
	
}	
