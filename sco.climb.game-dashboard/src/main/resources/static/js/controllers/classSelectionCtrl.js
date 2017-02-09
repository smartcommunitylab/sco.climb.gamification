/* global angular */
angular.module('climbGame.controllers.classSelection', [])
  .controller('classSelectionCtrl', ["$scope", "$state", "$mdToast", "$filter", "loginService", function ($scope, $state, $mdToast, $filter, loginService) {
    $scope.classes = loginService.getAllClasses();
    $scope.formClasses = [];
    $scope.labelClasses = [
                   "Prima",
                   "Seconda",
                   "Terza",
                   "Quarta",
                   "Quinta"];
    for (var i = 0; i < $scope.classes.length; i++) {
      $scope.formClasses.push({
        id: $scope.classes[i],
        value: $scope.classes[i],
        label: $scope.labelClasses[i]
      });

    }
    $scope.data = {
      selectedClass : $scope.formClasses[0]
    }

    $scope.login = function () {
      if ($scope.data.selectedClass) {
        loginService.setClassRoom($scope.data.selectedClass.id);
        $state.go('home')
      } else {
        $mdToast.show($mdToast.simple().content($filter('translate')('class_choose_room')));
      }
    }
  }])
