/* global angular */
angular.module('climbGame.controllers.stats', [])
  .controller('statsCtrl', function ($scope, $filter) {
    $scope.stats = {}

    /* temporary data */
    var data = {
      'gameScore': 156870,
      'maxGameScore': 5900000,
      'scoreModeMap': {
        'zeroImpact_wAdult': 98070,
        'bus': 39600,
        'pandr': 600,
        'bonus': 7100,
        'zeroImpact_solo': 11500
      }
    }

    var data2stats = function (data) {
      var gameScore = $filter('number')(data.gameScore / 1000, 2)
      if (gameScore % 1 === 0) {
        gameScore = data.gameScore / 1000
      }

      return {
        'gameScore': gameScore,
        'maxGameScore': data.maxGameScore / 1000,
        'scoreModeMap': {
          'zeroImpact_wAdult': Math.floor(data['scoreModeMap']['zeroImpact_wAdult'] / 10000),
          'bus': Math.floor(data['scoreModeMap']['bus'] / 10000),
          'pandr': Math.floor(data['scoreModeMap']['pandr'] / 10000),
          'bonus': Math.floor(data['scoreModeMap']['bonus'] / 10000),
          'zeroImpact_solo': Math.floor(data['scoreModeMap']['zeroImpact_solo'] / 10000)
        }
      }
    }

    $scope.stats = data2stats(data)
    console.log($scope.stats)

    $scope.getGameScorePercentage = function () {
      return ($scope.stats.gameScore * 100) / $scope.stats.maxGameScore
    }

    $scope.getCount = function (count) {
      console.log(count)
      return !count ? 0 : new Array(count)
    }
  })
