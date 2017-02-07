/* global angular */
angular.module('climbGame.controllers.excursions', [])
  .controller('excursionsCtrl', function ($scope, $window, dataService) {
    $scope.showHints = false
    $scope.datepickerisOpen = false
    $scope.excursions = null

    /* excursion example
    {
      children: 12,
      classRoom: '1^',
      creationDate: 1486042491236,
      day: 1485385200000,
      distance: 750,
      gameId: '588889c0e4b0464e16ac40a0',
      lastUpdate: 1486042491236,
      meteo: 'cloudy',
      name: 'test1',
      objectId: 'c219c822-35af-4e34-ad81-b39591dd36a2',
      ownerId: 'VELA'
    }
    */

    $scope.refreshExcursions = function () {
      dataService.getExcursions().then(
        function (excursions) {
          $scope.excursions = excursions
        },
        function (reason) {
          // console.log(reason)
        }
      )
    }

    $scope.refreshExcursions()

    $scope.scrollTimer = null

    $scope.startScroll = function (direction) {
      /*
      $scope.scrollTimer = setInterval(function () {
        if (direction === 'up') {
          if ($window.document.getElementById('excursions-list').scrollTop === 0) {
            clearInterval($scope.scrollTimer)
          } else {
            $window.document.getElementById('excursions-list').scrollTop -= 10
          }
        } else if (direction === 'down') {
          $window.document.getElementById('excursions-list').scrollTop += 10
        }
      }, 10)
      */
      if (direction === 'up') {
        $window.document.getElementById('excursions-list').scrollTop -= 50
      } else if (direction === 'down') {
        $window.document.getElementById('excursions-list').scrollTop += 50
      }
    }

    $scope.stopScroll = function () {
      // clearInterval($scope.scrollTimer)
    }

    /* Form */
    $scope.newExcursion = {
      name: null,
      date: null,
      children: null,
      distance: null,
      meteo: 'sunny'
    }

    $scope.createExcursion = function () {
      var params = {
        name: $scope.newExcursion.name,
        date: $scope.newExcursion.date.getTime(),
        children: $scope.newExcursion.children,
        distance: $scope.newExcursion.distance * 1000,
        meteo: $scope.newExcursion.meteo
      }

      dataService.postExcursion(params).then(
        function (data) {
          // refresh?
          $scope.refreshExcursions()
        },
        function (reason) {
          // console.log(reason)
        }
      )
    }
  })
