/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package it.smartcommunitylab.climb.gamification.dashboard.controller;
import it.smartcommunitylab.climb.gamification.dashboard.common.Utils;
import it.smartcommunitylab.climb.gamification.dashboard.security.DataSetInfo;
import it.smartcommunitylab.climb.gamification.dashboard.storage.RepositoryManager;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.view.RedirectView;

import org.apache.log4j.Logger;

import it.smartcommunitylab.climb.gamification.dashboard.security.Token;


@Controller
public class ConsoleController {

	@Autowired
	@Value("${climbdashboard.map.center}")
	private String mapCenter;
	
	@Autowired
	@Value("${climbdashboard.map.zoom}")
	private String mapZoom;
	
	@Autowired
	@Value("${dashboardws.url}")
	private String dashboardWsUrl;
	
	@Autowired
	private ServletContext context;
	
	@Autowired
	private RepositoryManager storage;
	
	private static final Logger logger = Logger.getLogger(ConsoleController.class);
		
	@RequestMapping(value = "/")
	public View root() {
		return new RedirectView("console");
	}
	
	@RequestMapping(value = "/upload")
	public String upload() {
		return "upload";
	}

	@RequestMapping(value = "/login")
	public String login() {
		return "login";
	}
	
	@RequestMapping(value = "/logout")
	public View logout() {
		return new RedirectView("logout");
	}
	
/*	@RequestMapping(value = "/console")
	public String console() {
		return "console";
	}*/
	
	@SuppressWarnings("unchecked")
	@RequestMapping(method = RequestMethod.GET, value = "/console")
	public ModelAndView index_console(ModelMap model, Principal principal) {
		String name = principal.getName();
		List<DataSetInfo> allDataSets = null;
		try {
			allDataSets = (List<DataSetInfo>) storage.findData(DataSetInfo.class, null, null, name);
		} catch (ClassNotFoundException e) {
			logger.error(e.getMessage());
		}
		logger.debug("Principal Data " + allDataSets.get(0).getToken());
		Token token = storage.findTokenByToken(allDataSets.get(0).getToken());
		model.addAttribute("token", token.getToken());
		model.addAttribute("map_center", mapCenter);
		model.addAttribute("map_zoom", mapZoom);
		//model.addAttribute("api", (token.getPaths() != null && token.getPaths().size() > 0) ? token.getPaths().get(0) : "");
		model.addAttribute("api", dashboardWsUrl);
		model.addAttribute("gname", name);
		return new ModelAndView("console", model);
	}
	

	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
}
