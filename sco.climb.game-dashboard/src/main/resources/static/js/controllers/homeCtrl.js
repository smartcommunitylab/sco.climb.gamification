/* global angular */
angular.module('climbGame.controllers.home', [])
  .controller('HomeCtrl', [
    '$rootScope',
    '$scope',
    '$log',
    '$state',
    '$timeout',
    '$location',
    '$mdSidenav',

    function ($rootScope, $scope, $log, $state, $timeout, $location, $mdSidenav) {
      $state.go('home.stats')

      $scope.go = function (path) {
        $scope.closeSideNavPanel()
        $state.go(path)
      }

      $scope.openSideNavPanel = function () {
        $mdSidenav('left').open()
      }
      $scope.closeSideNavPanel = function () {
        $mdSidenav('left').close()
      }
    }
  ])