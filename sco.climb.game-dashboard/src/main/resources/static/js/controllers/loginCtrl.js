angular.module("climbGame.controllers.login", [])
  .controller("loginCtrl", ["$scope", "$state", function ($scope, $state) {
    $scope.isAuth = false;
    $scope.user = {
      username: "",
      password: ""
    }
    $scope.auth = function () {
      $scope.isAuth = true;
    }
    $scope.login = function () {
      $state.go('home.class')
    }
  }]);
