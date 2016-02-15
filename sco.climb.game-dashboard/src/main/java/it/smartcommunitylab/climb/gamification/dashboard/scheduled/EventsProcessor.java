package it.smartcommunitylab.climb.gamification.dashboard.scheduled;

import it.smartcommunitylab.climb.contextstore.model.Stop;
import it.smartcommunitylab.climb.gamification.dashboard.model.events.WsnEvent;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;
import com.google.common.collect.Maps;

public class EventsProcessor {

	private static final transient Logger logger = LoggerFactory.getLogger(EventsProcessor.class);
	
	private Map<String, Stop> stopsMap;

	public EventsProcessor(Map<String, Stop> stopsMap) {
		this.stopsMap = stopsMap;
	}

	public Collection<ChildStatus> process(List<WsnEvent> events) {
		BiMap<Date, Integer> childrenInRange = HashBiMap.create();
		BiMap<Date, Integer> childrenLost = HashBiMap.create();
		BiMap<Date, Integer> childrenCheckin = HashBiMap.create();
		BiMap<Date, Integer> childrenCheckout = HashBiMap.create();
		BiMap<Date, Integer> childrenDestination = HashBiMap.create();

		BiMap<Date, Integer> anchors = HashBiMap.create();

		Map<Integer, ChildStatus> childrenStatus = Maps.newTreeMap();

		boolean travelling = false;
		
		for (WsnEvent event : events) {

			Date timestamp = event.getTimestamp();
			Integer wsnId = event.getWsnNodeId();
			ChildStatus cs = null;

			switch (event.getEventType()) {
			case 101: // add child in range
				childrenInRange.put(timestamp, wsnId);
				cs = getChildStatus(childrenStatus, wsnId);
				cs.setInRange(true);
				break;
			case 102: // checkin child
				childrenCheckin.put(timestamp, wsnId);
				cs = getChildStatus(childrenStatus, wsnId);
				cs.setInPedibus(true);
				break;
			case 103: // checkout child
				childrenCheckout.put(timestamp, wsnId);
				cs = getChildStatus(childrenStatus, wsnId);
				cs.setInPedibus(false);
				break;
			case 104: // child at school
				childrenDestination.put(timestamp, wsnId);
				cs = getChildStatus(childrenStatus, wsnId);
				cs.setArrived(true);
				break;
			case 105: // child lost
				childrenLost.put(timestamp, wsnId);
				cs = getChildStatus(childrenStatus, wsnId);
				cs.setInRange(false);
				break;
//			case 201: // anchor
//				anchors.put(timestamp, wsnId);
//				if (travelling) {
//					for (ChildStatus css : childrenStatus.values()) {
//						if (css.isInPedibus() && css.isInRange() && !css.isArrived()) {
//							css.getAnchors().add(wsnId);
//						}
//					}
//				}
//				break;				
			case 202: // stop reached
				anchors.put(timestamp, wsnId);
				if (travelling) {
					for (ChildStatus css : childrenStatus.values()) {
						if (css.isInPedibus() && css.isInRange() && !css.isArrived()) {
							css.getStops().add((String)event.getPayload().get("stopId"));
//							css.getAnchors().add(wsnId);
						}
					}
				}
				break;

			case 301: // driver
				break;
			case 302: // helper
				break;
			case 303: // driver position
				break;

			case 401: // start
				travelling = true;
				break;
			case 402: // end
				travelling = false;
				break;

			default:
				;
			}
		}

		computeScore(childrenStatus.values());
		
		return childrenStatus.values();
	}
	
	private ChildStatus getChildStatus(Map<Integer, ChildStatus> childrenStatus, Integer wsnId) {
		if (!childrenStatus.containsKey(wsnId)) {
			ChildStatus cs = new ChildStatus(wsnId);
			childrenStatus.put(wsnId, cs);
		}
		return childrenStatus.get(wsnId);
	}

	private double computeScore(Collection<ChildStatus> childrenStatus) {
		double score = 0;
		for (ChildStatus cs : childrenStatus) {
			score += computeScore(cs);
		}
		return score;
	}
	
	private double computeScore(ChildStatus childStatus) {
		double score = 0;
		if (childStatus.isArrived()) {
			for (String stopId : childStatus.getStops()) {
				Stop stop = stopsMap.get(stopId);
				if (stop != null) {
					score += stop.getDistance();
				}
			}
		}
		childStatus.setScore(score);
		return score;
	}

}
