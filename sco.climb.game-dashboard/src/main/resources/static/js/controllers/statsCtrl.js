/* global angular */
angular.module('climbGame.controllers.stats', [])
  .controller('statsCtrl', function ($scope) {
    $scope.distance = {
      total: 100,
      done: 33
    }

    $scope.getDistanceDonePercentage = function () {
      return ($scope.distance.done * 100) / $scope.distance.total
    }
  })
