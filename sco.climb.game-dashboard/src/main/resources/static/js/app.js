//(function () {

//  'use strict';

// Declare app level module which depends on filters, and services

angular.module('climbGame', [
  'ngAnimate',
  'ui.router',
  'ngMaterial',
  'ngAria',
  'leaflet-directive',
  'climbGame.controllers.home',
  'climbGame.controllers.map',
  'climbGame.controllers.class',
  'climbGame.services.data',
  'climbGame.services.conf',
  'climbGame.services.map',
  'climbGame.services.login',
  'climbGame.services.map'

  ])
  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('light-blue', {
        'default': '300'
      })
      .accentPalette('deep-orange', {
        'default': '500'
      });
  })
  .config(['$stateProvider', '$urlRouterProvider', '$logProvider',
    function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.otherwise("/");

      $stateProvider
        .state('home', {
          url: '/',
          views: {
            '@': {
              templateUrl: 'templates/home.html',
              controller: 'HomeCtrl'
            }
          }
        })
        .state('home.map', {
          url: 'map',
          views: {
            'content@home': {
              templateUrl: 'templates/map.html',
              controller: 'mapCtrl'
            }
          }
        })
        .state('home.class', {
          url: 'class',

          views: {
            'content@home': {
              templateUrl: 'templates/class.html',
              controller: 'classCtrl'
            }
          }
        })
    }])
  //take all whitespace out of string
  .filter('nospace', function () {
    return function (value) {
      return (!value) ? '' : value.replace(/ /g, '');
    };
  })
  //replace uppercase to regular case
  .filter('humanizeDoc', function () {
    return function (doc) {
      if (!doc) return;
      if (doc.type === 'directive') {
        return doc.name.replace(/([A-Z])/g, function ($1) {
          return '-' + $1.toLowerCase();
        });
      }

      return doc.label || doc.name;
    };
  });

//})()
;
