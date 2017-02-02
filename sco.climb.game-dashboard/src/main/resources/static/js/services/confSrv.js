angular.module('climbGame.services.conf', [])

.factory('configService', function () {
  var configService = {};
  var DEVELOPMENT = true;
  var URL = 'https://' + (DEVELOPMENT ? 'climbdev' : 'climb') + '.smartcommunitylab.it';
  var FOOT_CONSTANT = "piedi";
  var BOAT_CONSTANT = "nave";
  var PLANE_CONSTANT = "volo";
  var httpTimeout = 10000;

  var APP_BUILD = '';
  configService.getURl = function () {
    return URL;
  };
  configService.getGameStatusURL = function () {
    return URL + '/game-dashboard/api/game/status/';
  };
  configService.getCalendarURL = function () {
    return URL + '/game-dashboard/api/calendar/';
  };
  configService.getPlayersURL = function () {
    return URL + '/game-dashboard/api/player/';
  };
  configService.getTokenURL = function () {
    return URL + '/game-dashboard/token';
  };
  configService.getGameId = function () {
    return URL + '/game-dashboard/api/game/';
  };
  configService.httpTimout = function () {
    return httpTimeout;
  }

  configService.getFootConstant = function () {
    return FOOT_CONSTANT;
  }
  configService.getBoatConstant = function () {
    return BOAT_CONSTANT;
  }
  configService.getPlaneConstant = function () {
    return PLANE_CONSTANT;
  }

  return configService;
});
