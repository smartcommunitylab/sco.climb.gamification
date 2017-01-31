/* global angular */
angular.module('climbGame.controllers.stats', [])
  .controller('statsCtrl', function ($scope) {
    $scope.distance = {
      total: 100,
      done: 33
    }

    $scope.data = {
      'zeroimpact_solo': 15,
      'pedibus': 18,
      'bus': 20,
      'pandr': 11,
      'car': 7,
      'bonus': 4
    }

    $scope.getDistanceDonePercentage = function () {
      return ($scope.distance.done * 100) / $scope.distance.total
    }

    $scope.getCount = function (count) {
      return new Array(count)
    }
  })
