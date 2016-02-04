package it.smartcommunitylab.climb.gamification.dashboard.model;

import it.smartcommunitylab.climb.contextstore.model.BaseObject;

public class PedibusItineraryLeg extends BaseObject {
	private String gameId;
	private String legId;
	private String badgeId;
	private String name;
	private String description;
	private int position;
	private double[] geocoding;
	private String externalUrl;
	private byte[] polyline;
	private int score;
	
	public String getGameId() {
		return gameId;
	}
	public void setGameId(String gameId) {
		this.gameId = gameId;
	}
	public String getLegId() {
		return legId;
	}
	public void setLegId(String legId) {
		this.legId = legId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public int getPosition() {
		return position;
	}
	public void setPosition(int position) {
		this.position = position;
	}
	public double[] getGeocoding() {
		return geocoding;
	}
	public void setGeocoding(double[] geocoding) {
		this.geocoding = geocoding;
	}
	public String getExternalUrl() {
		return externalUrl;
	}
	public void setExternalUrl(String externalUrl) {
		this.externalUrl = externalUrl;
	}
	public byte[] getPolyline() {
		return polyline;
	}
	public void setPolyline(byte[] polyline) {
		this.polyline = polyline;
	}
	public int getScore() {
		return score;
	}
	public void setScore(int points) {
		this.score = points;
	}
	public String getBadgeId() {
		return badgeId;
	}
	public void setBadgeId(String badgeId) {
		this.badgeId = badgeId;
	}
}
