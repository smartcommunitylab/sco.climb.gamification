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

    // get game statistics
    dataService.getStats = function () {
      var deferred = $q.defer()
      $http({
        method: 'GET',
        url: configService.getStatsURL() + loginService.getOwnerId() + '/' + loginService.getGameId(),
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

    // get excursions
    dataService.getExcursions = function (from, to) {
      var deferred = $q.defer()

      if (!from) {
        from = new Date(2016, 9, 1, 0, 0, 0, 0).getTime()
      }

      if (!to) {
        to = new Date(2017, 6, 30, 0, 0, 0, 0).getTime()
      }

      $http({
        method: 'GET',
        url: configService.getExcursionsURL() + loginService.getOwnerId() + '/' + loginService.getGameId() + '/' + loginService.getClassRoom(),
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        timeout: configService.httpTimout(),
        params: {
          'from': from,
          'to': to
        }
      }).then(function (response) {
        deferred.resolve(response.data)
      }, function (reason) {
        console.log(reason)
        deferred.reject(reason)
      })
      return deferred.promise
    }

    // post new excursions
    dataService.postExcursion = function (params) {
      var deferred = $q.defer()

      if (!params || !params.name || !params.date || !params.children || !params.distance || !params.meteo) {
        deferred.reject('Invalid or missing data')
        return deferred.promise
      }

      $http({
        method: 'POST',
        url: configService.getExcursionsURL() + loginService.getOwnerId() + '/' + loginService.getGameId() + '/' + loginService.getClassRoom(),
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        timeout: configService.httpTimout(),
        params: {
          name: params.name,
          date: params.date,
          children: params.children,
          distance: params.distance,
          meteo: params.meteo
        }
      }).then(function (response) {
        deferred.resolve(response.data)
      }, function (reason) {
        console.log(reason)
        deferred.reject(reason)
      })
      return deferred.promise
    }

    // get notifications
    dataService.getNotifications = function (timestamp) {
      var deferred = $q.defer()

      if (!timestamp) {
        // January 1, 2017
        timestamp = new Date(2017, 1, 1, 0, 0, 0, 0).getTime()
      }

      $http({
        method: 'GET',
        url: configService.getNotificationsURL() + loginService.getOwnerId() + '/' + loginService.getGameId() + '/' + loginService.getClassRoom(),
        headers: {
          'Accept': 'application/json',
          'x-access-token': loginService.getUserToken()
        },
        timeout: configService.httpTimout(),
        params: {
          timestamp: timestamp
        }
      }).then(function (response) {
        deferred.resolve(response.data)
      }, function (reason) {
        console.log(reason)
        deferred.reject(reason)
      })
      return deferred.promise
    }

    // get challenges
    dataService.getChallenges = function () {
      var deferred = $q.defer()

      $http({
        method: 'GET',
        url: configService.getChallengesURL() + loginService.getOwnerId() + '/' + loginService.getGameId() + '/' + loginService.getClassRoom(),
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

    return dataService
  })
