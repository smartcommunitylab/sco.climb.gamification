package it.smartcommunitylab.climb.gamification.dashboard.model;

import java.util.Collection;
import java.util.Map;

public interface Gamified {

	public void setScore(Double score);
	public Double getScore();
	
	public void setBadges(Map<String, Collection> badges);
	public Map<String, Collection> getBadges();
	
}
