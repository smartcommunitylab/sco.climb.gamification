angular.module('climbGame.services.login', [])
  .factory('loginService', function () {
    var loginService = {};
    loginService.getOwnerId = function () {
      return 'VELA';
    }
    loginService.getGameId = function () {
      return '588889c0e4b0464e16ac40a0';
    }
    loginService.getUserToken = function () {
      return 'e2lEbKBXKE04CoS1';
    }
    loginService.getClassRoom = function () {
      return '1^';
    }
    return loginService;
  });
