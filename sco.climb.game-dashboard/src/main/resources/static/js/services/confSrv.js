angular.module('climbGame.services.conf', [])

.factory('configService', function () {
  var configService = {};
  var DEVELOPMENT = true;
  var URL = 'https://' + (DEVELOPMENT ? 'climbdev' : 'climb') + '.smartcommunitylab.it';

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
  configService.httpTimout = function () {
    return httpTimeout;
  }
  return configService;
});
