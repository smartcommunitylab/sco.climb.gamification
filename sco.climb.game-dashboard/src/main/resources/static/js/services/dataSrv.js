/* global angular */
angular.module('climbGame.services.data', [])
  .factory('dataService', function ($q, $http, configService, loginService) {
    var dataService = {}

    // get status of the game
    dataService.getStatus = function () {
      var deferred = $q.defer()
      $http({
        method: 'GET',
        url: configService.getGameStatusURL() + loginService.getOwnerId() + '/' + loginService.getGameId(),
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        timeout: configService.httpTimout()
      }).then(function (response) {
        deferred.resolve(response.data)
      }, function (reason) {
        console.log(reason)
        deferred.reject(reason)
      })
      return deferred.promise
    }

    // get calendar's days
    dataService.getCalendar = function (from, to) {
      var deferred = $q.defer()
      $http({
        method: 'GET',
        url: configService.getCalendarURL() + loginService.getOwnerId() + '/' + loginService.getGameId() + '/' + loginService.getClassRoom(),
        params: {
          from: from,
          to: to
        },
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        timeout: configService.httpTimout()
      }).then(function (response) {
        deferred.resolve(response.data)
      }, function (reason) {
        console.log(reason)
        deferred.reject(reason)
      })
      return deferred.promise
    }

    // get components of the class
    dataService.getClassPlayers = function () {
      var deferred = $q.defer()
      $http({
        method: 'GET',
        url: configService.getPlayersURL() + loginService.getOwnerId() + '/' + loginService.getGameId() + '/' + loginService.getClassRoom(),
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        timeout: configService.httpTimout()
      }).then(function (response) {
        deferred.resolve(response.data)
      }, function (reason) {
        console.log(reason)
        deferred.reject(reason)
      })
      return deferred.promise
    }

    dataService.sendData = function (data) {
      var deferred = $q.defer()
      $http({
        method: 'POST',
        url: configService.getCalendarURL() + loginService.getOwnerId() + '/' + loginService.getGameId() + '/' + loginService.getClassRoom(),
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        data: {
          'day': data.day,
          'meteo': data.meteo,
          'modeMap': data.modeMap
        },
        timeout: configService.httpTimout()
      }).then(function (response) {
        deferred.resolve(response.data)
      }, function (reason) {
        console.log(reason)
        deferred.reject(reason)
      })
      return deferred.promise
    }
    return dataService
  })
