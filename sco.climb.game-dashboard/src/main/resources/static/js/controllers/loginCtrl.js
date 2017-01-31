angular.module("climbGame.controllers.login", [])
  .controller("loginCtrl", ["$scope", "$http", "$state", "loginService", function ($scope, $http, $state, loginService) {
    $scope.isAuth = false;
    $scope.user = {
      username: "",
      password: ""
    }
    $scope.auth = function () {
      $scope.isAuth = true;
    }
    $scope.login = function () {
      //$state.go('home.class')
      $http({
        method: 'POST',
        url: 'https://climbdev.smartcommunitylab.it/game-dashboard/token',
        params: {
          username: $scope.user.username,
          password: $scope.user.password
        }

      }).
      success(function (data, status, headers, config) {
        console.log(data);
        //store owner id and token
        loginService.setOwnerId(data.name);
        loginService.setUserToken(data.token);
        $http({
          method: 'GET',
          url: 'https://climbdev.smartcommunitylab.it/game-dashboard/api/game/' + data.name,
          headers: {
            'Accept': 'application/json',
            'x-access-token': data.token
          }

        }).
        success(function (data, status, headers, config) {
          console.log(data);
          // store gameid
          loginService.setGameId(data[0].gameId);
          //show class List
          loginService.setAllClasses(data[0].classRooms);
          $state.go('classSelection');
        }).
        error(function (data, status, headers, config) {
          console.log(data);
          // deferr.reject(data);
        });
      }).
      error(function (data, status, headers, config) {
        console.log(data);
        // deferr.reject(data);
      });
    }
  }]);
