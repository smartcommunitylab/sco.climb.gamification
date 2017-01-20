angular.module('climbGame.services.data', [])

.factory('dataService', function ($q, $http, configService, loginService) {
  var dataService = {};
  dataService.getStatus = function () {
    var deferr = $q.defer();
    $http({
      method: 'GET',
      url: configService.getGameStatusURL() + loginService.getOwnerId() + '/' + loginService.getGameId(),
      headers: {
        'Accept': 'application/json',
        'x-access-token': loginService.getUserToken()
      },
      timeout: configService.httpTimout()

    }).
    success(function (data, status, headers, config) {
      deferr.resolve(data);
    }).
    error(function (data, status, headers, config) {
      console.log(data);
      deferr.reject(data);
    });

    return deferr.promise;
  };
  return dataService;
});
