package it.smartcommunitylab.climb.gamification.dashboard.model;

import it.smartcommunitylab.climb.contextstore.model.BaseObject;

import java.util.Collection;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class PedibusPlayer extends BaseObject implements Gamified {

	private String childId;
	private int wsnId;
	private String gameId;
	private Double score;
	private Map<String, Collection> badges;

	public String getChildId() {
		return childId;
	}

	public void setChildId(String childId) {
		this.childId = childId;
	}

	public int getWsnId() {
		return wsnId;
	}

	public void setWsnId(int wsnId) {
		this.wsnId = wsnId;
	}

	public String getGameId() {
		return gameId;
	}

	public void setGameId(String gameId) {
		this.gameId = gameId;
	}

	public Double getScore() {
		return score;
	}

	public void setScore(Double score) {
		this.score = score;
	}

	public Map<String, Collection> getBadges() {
		return badges;
	}

	public void setBadges(Map<String, Collection> badges) {
		this.badges = badges;
	}
	
}
