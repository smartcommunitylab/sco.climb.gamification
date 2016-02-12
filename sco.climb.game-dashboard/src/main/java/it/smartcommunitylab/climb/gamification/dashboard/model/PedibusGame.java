package it.smartcommunitylab.climb.gamification.dashboard.model;

import it.smartcommunitylab.climb.contextstore.model.BaseObject;

import java.util.Date;
import java.util.List;

public class PedibusGame extends BaseObject {
	
	private String schoolId;
	private String schoolName;
	private List<String> classRooms;
	private String gameId;
	private String gameName;
	private String gameDescription;
	private String gameOwner;
	private Date from;
	private Date to;
	private String token;
	
	public String getSchoolId() {
		return schoolId;
	}
	public void setSchoolId(String schoolId) {
		this.schoolId = schoolId;
	}
	public String getSchoolName() {
		return schoolName;
	}
	public void setSchoolName(String schoolName) {
		this.schoolName = schoolName;
	}
	public String getGameId() {
		return gameId;
	}
	public void setGameId(String gameId) {
		this.gameId = gameId;
	}
	public String getGameName() {
		return gameName;
	}
	public void setGameName(String gameName) {
		this.gameName = gameName;
	}
	public String getGameOwner() {
		return gameOwner;
	}
	public void setGameOwner(String gameOwner) {
		this.gameOwner = gameOwner;
	}
	public Date getFrom() {
		return from;
	}
	public void setFrom(Date from) {
		this.from = from;
	}
	public Date getTo() {
		return to;
	}
	public void setTo(Date to) {
		this.to = to;
	}
	public String getGameDescription() {
		return gameDescription;
	}
	public void setGameDescription(String gameDescription) {
		this.gameDescription = gameDescription;
	}
	public List<String> getClassRooms() {
		return classRooms;
	}
	public void setClassRooms(List<String> classRooms) {
		this.classRooms = classRooms;
	}
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
}
