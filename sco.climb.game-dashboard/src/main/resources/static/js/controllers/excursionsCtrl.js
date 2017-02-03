/* global angular */
angular.module('climbGame.controllers.excursions', [])
  .controller('excursionsCtrl', function ($scope, dataService) {
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

    dataService.getExcursions().then(
      function (excurions) {
        $scope.excurions = excurions
      },
      function (reason) {
        // console.log(reason)
      }
    )

    $scope.newExcursion = {
      name: null,
      date: null,
      children: null,
      distance: null,
      meteo: null
    }
  })
