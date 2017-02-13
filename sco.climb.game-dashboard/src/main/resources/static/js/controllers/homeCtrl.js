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
    'CacheSrv',
    function ($rootScope, $scope, $log, $state, $mdSidenav, $timeout, $location, loginService, CacheSrv) {
      $state.go('home.class')
        //$state.go('home.stats')

      $scope.go = function (path) {
        $scope.closeSideNavPanel()
        $state.go(path)
      }

      $scope.isCurrentState = function (state) {
        return $state.includes(state)
      }

      $scope.logout = function () {
        CacheSrv.resetLastCheck('calendar')
        CacheSrv.resetLastCheck('notifications')
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
