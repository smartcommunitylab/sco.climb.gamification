/* global angular */
angular.module('climbGame.controllers.classSelection', [])
  .controller('classSelectionCtrl', ["$scope", "$state", "loginService", function ($scope, $state, loginService) {
    $scope.classes = loginService.getAllClasses();
    $scope.slectedClass = {
      id: $scope.classes[0]
    }

    $scope.login = function () {
      loginService.setClassRoom($scope.slectedClass.id);
      $state.go('home')

    }
  }])
