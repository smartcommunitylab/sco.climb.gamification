/* global angular */
angular.module('climbGame.services.conf', [])
  .factory('configService', function () {
    var configService = {}
    var DEVELOPMENT = true
    var URL = 'https://' + (DEVELOPMENT ? 'climbdev' : 'climb') + '.smartcommunitylab.it'
    var FOOT_CONSTANT = 'piedi'
    var BOAT_CONSTANT = 'nave'
    var PLANE_CONSTANT = 'volo'
    var httpTimeout = 10000
    var DEFAULT_CENTER_MAP = [37.973378, 23.730957]
    var DEFAULT_ZOOM_MAP = 4
    var DEFAULT_ZOOM_POI = 9
    // var APP_BUILD = ''

    configService.getURL = function () {
      return URL
    }

    configService.getGameStatusURL = function () {
      return URL + '/game-dashboard/api/game/status/'
    }

    configService.getCalendarURL = function () {
      return URL + '/game-dashboard/api/calendar/'
    }

    configService.getPlayersURL = function () {
      return URL + '/game-dashboard/api/player/'
    }

    configService.getStatsURL = function () {
      return URL + '/game-dashboard/api/stat/'
    }

    configService.getExcursionsURL = function () {
      return URL + '/game-dashboard/api/excursion/'
    }

    configService.getNotificationsURL = function () {
      return URL + '/game-dashboard/api/notification/'
    }

    configService.getTokenURL = function () {
      return URL + '/game-dashboard/token'
    }

    configService.getGameId = function () {
      return URL + '/game-dashboard/api/game/'
    }

    configService.httpTimout = function () {
      return httpTimeout
    }

    configService.getFootConstant = function () {
      return FOOT_CONSTANT
    }

    configService.getBoatConstant = function () {
      return BOAT_CONSTANT
    }

    configService.getPlaneConstant = function () {
      return PLANE_CONSTANT
    }
    configService.getDefaultMapCenterConstant = function () {
      return DEFAULT_CENTER_MAP
    }
    configService.getDefaultZoomMapConstant = function () {
      return DEFAULT_ZOOM_MAP
    }
    configService.getDefaultZoomPoiConstant = function () {
      return DEFAULT_ZOOM_POI
    }

    return configService
  })
