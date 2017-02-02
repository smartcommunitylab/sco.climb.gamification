/* global angular */
angular.module('climbGame.services.data', [])
  .factory('dataService', function ($q, $http, configService, loginService) {
    var dataService = {}

    // get status of the game
    dataService.getStatus = function () {
      var deferr = $q.defer()
      $http({
        method: 'GET',
        url: configService.getGameStatusURL() + loginService.getOwnerId() + '/' + loginService.getGameId(),
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        timeout: configService.httpTimout()
      }).then(function (data, status, headers, config) {
        deferr.resolve(data)
      }, function (data, status, headers, config) {
        console.log(data)
        deferr.reject(data)
      })
      return deferr.promise
    }

    // get calendar's days
    dataService.getCalendar = function (from, to) {
      var deferr = $q.defer()
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
      }).then(function (data, status, headers, config) {
        deferr.resolve(data)
      }, function (data, status, headers, config) {
        console.log(data)
        deferr.reject(data)
      })
      return deferr.promise
    }

    // get components of the class
    dataService.getClassPlayers = function () {
      var deferr = $q.defer()
      $http({
        method: 'GET',
        url: configService.getPlayersURL() + loginService.getOwnerId() + '/' + loginService.getGameId() + '/' + loginService.getClassRoom(),
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        timeout: configService.httpTimout()
      }).then(function (data, status, headers, config) {
        deferr.resolve(data)
      }, function (data, status, headers, config) {
        console.log(data)
        deferr.reject(data)
      })
      return deferr.promise
    }

    dataService.sendData = function (data) {
      var deferr = $q.defer()
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
      }).then(function (data, status, headers, config) {
        deferr.resolve(data)
      }, function (data, status, headers, config) {
        console.log(data)
        deferr.reject(data)
      })
      return deferr.promise
    }
    return dataService
  })
