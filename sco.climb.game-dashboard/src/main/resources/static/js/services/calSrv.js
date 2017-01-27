angular.module('climbGame.services.calendar', [])
  .factory('calendarService', function ($q, dataService) {
    var calendarService = {};
    calendarService.getCalendar = function (from, to) {
      var deferr = $q.defer();
      dataService.getCalendar(from, to).then(function (data) {
        //return only the path and the legs
        deferr.resolve(data);
      }, function (err) {
        deferr.reject();
      });
      return deferr.promise;
    }
    calendarService.getClassPlayers = function () {
      var deferr = $q.defer();
      dataService.getClassPlayers().then(function (data) {
        //return only the path and the legs
        deferr.resolve(data);
      }, function (err) {
        deferr.reject();
      });
      return deferr.promise;
    }
    calendarService.sendData = function (todayData) {
      var deferr = $q.defer();
      dataService.sendData(todayData).then(function (data) {
        //return only the path and the legs
        deferr.resolve(data);
      }, function (err) {
        deferr.reject();
      });
      return deferr.promise;
    }
    return calendarService;
  });
