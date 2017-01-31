angular.module('climbGame.services.login', [])
  .factory('loginService', function () {
    var loginService = {};
    loginService.getOwnerId = function () {
      return loginService.ownId;
    }
    loginService.getGameId = function () {
      return loginService.gameId;
    }
    loginService.getUserToken = function () {
      return loginService.userToken;
    }
    loginService.getAllClasses = function () {
      return loginService.classes;
    }
    loginService.getClassRoom = function () {
      return loginService.classRoom;
    }
    loginService.setOwnerId = function (id) {
      loginService.ownId = id;
    }
    loginService.setGameId = function (id) {
      loginService.gameId = id;
    }
    loginService.setUserToken = function (token) {
      loginService.userToken = token;
    }
    loginService.setAllClasses = function (classes) {
      loginService.classes = classes;
    }
    loginService.setClassRoom = function (classRoom) {
      loginService.classRoom = classRoom;
    }

    return loginService;
  });
