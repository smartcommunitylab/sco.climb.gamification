/* global angular */
angular.module('climbGame.controllers.home', [])
  .controller('HomeCtrl', [
    '$rootScope',
    '$scope',
    '$log',
    '$state',
    '$mdSidenav',
    '$timeout',
    '$location',
    'loginService',

    function ($rootScope, $scope, $log, $state, $mdSidenav, $timeout, $location, loginService) {
      $state.go('home.class');
      // TODO change this!
      //$state.go('home.excursions')

      $scope.go = function (path) {
        $scope.closeSideNavPanel()
        $state.go(path)
      }
      $scope.isCurrentState = function (state) {
        return $state.includes(state);
      }
      $scope.logout = function () {
        // delete storage
        loginService.logout()
          // go to login
        $state.go('login')
      }

      $scope.changeClass = function (path) {
        loginService.removeClass()
        $state.go('classSelection')
      }

      $scope.openSideNavPanel = function () {
        $mdSidenav('leftMenu').open()
      }

      $scope.closeSideNavPanel = function () {
        $mdSidenav('leftMenu').close()
      }
    }
  ])
