/* global angular */
angular.module('climbGame.controllers.notifications', [])
  .controller('notificationsCtrl', function ($scope, $window, $translate, dataService) {
    $scope.notifications = []

    $scope.scroll = function (direction) {
      if (direction === 'up') {
        $window.document.getElementById('notifications-list').scrollTop -= 50
      } else if (direction === 'down') {
        $window.document.getElementById('notifications-list').scrollTop += 50
      }
    }

    dataService.getNotifications().then(
      function (data) {
        $scope.notifications = data
      },
      function (reason) {
        // console.log(reason)
      }
    )
  })
