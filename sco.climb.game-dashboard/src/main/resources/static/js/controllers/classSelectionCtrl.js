/* global angular */
angular.module('climbGame.controllers.classSelection', [])
  .controller('classSelectionCtrl', ["$scope", "$state", "loginService", function ($scope, $state, loginService) {
    $scope.classes = loginService.getAllClasses();
    $scope.formClasses = [];
    for (var i = 0; i < $scope.classes.length; i++) {
      $scope.formClasses.push({
        id: $scope.classes[i],
        value: $scope.classes[i]
      });

    }
    $scope.selectedClass = null;;

    $scope.login = function () {
      loginService.setClassRoom($scope.selectedClass.id);
      $state.go('home')
    }
  }])
