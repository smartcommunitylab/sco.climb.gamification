/* global angular */
angular.module('climbGame.controllers.stats', [])
  .controller('statsCtrl', function ($scope, $filter, dataService) {
    var KMS_PER_FOOT = 10

    $scope.stats = null

    /* temporary data *
    var data = {
      'gameScore': 303770,
      'maxGameScore': 5900000,
      'scoreModeMap': {
        'zeroImpact_wAdult': 101070,
        'bus': 147600,
        'pandr': 600,
        'car': 0,
        'bonus': 31000,
        'zeroImpact_solo': 23500
      }
    }
    */

    var data2stats = function (data) {
      return {
        'gameScore': $filter('number')(data.gameScore / 1000, 0),
        'maxGameScore': data.maxGameScore / 1000,
        'scoreModeMap': {
          'zeroImpact_wAdult': Math.floor(data['scoreModeMap']['zeroImpact_wAdult'] / (1000 * KMS_PER_FOOT)),
          'bus': Math.floor(data['scoreModeMap']['bus'] / (1000 * KMS_PER_FOOT)),
          'pandr': Math.floor(data['scoreModeMap']['pandr'] / (1000 * KMS_PER_FOOT)),
          'bonus': Math.floor(data['scoreModeMap']['bonus'] / (1000 * KMS_PER_FOOT)),
          'zeroImpact_solo': Math.floor(data['scoreModeMap']['zeroImpact_solo'] / (1000 * KMS_PER_FOOT))
        }
      }
    }

    dataService.getStats().then(
      function (stats) {
        $scope.stats = data2stats(stats)
      },
      function (reason) {
        console.log(reason)
      }
    )

    $scope.getGameScorePercentage = function () {
      return ($scope.stats.gameScore * 100) / $scope.stats.maxGameScore
    }

    $scope.getCount = function (count) {
      return !count ? 0 : new Array(count)
    }
  })
