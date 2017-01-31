//  'use strict';
/* global angular */
angular.module('climbGame', [
    'ngAnimate',
    'ui.router',
    'ngMaterial',
    'ngAria',
    'leaflet-directive',
    'pascalprecht.translate',
    'climbGame.controllers.home',
    'climbGame.controllers.map',
    'climbGame.controllers.calendar',
    'climbGame.controllers.stats',
    'climbGame.controllers.login',
    'climbGame.services.data',
    'climbGame.services.conf',
    'climbGame.services.map',
    'climbGame.services.login',
    'climbGame.services.map',
    'climbGame.services.calendar'
  ])

  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('light-blue', {
        'default': '300'
      })
      .accentPalette('deep-orange', {
        'default': '500'
      })
  })

  .config(['$translateProvider', function ($translateProvider) {
    // $translateProvider.translations('it', {});
    $translateProvider.preferredLanguage('it')
    $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/',
      suffix: '.json'
    })

    // $translateProvider.useSanitizeValueStrategy('sanitize');
    // $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useSanitizeValueStrategy('escapeParameters')
  }])

  .config(['$stateProvider', '$urlRouterProvider', '$logProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/')

      $stateProvider.state('home', {
          url: '/',
          views: {
            '@': {
              templateUrl: 'templates/home.html',
              controller: 'HomeCtrl'
            }
          }
        })
        .state('home.login', {
          url: 'login',
          views: {
            'content@home': {
              templateUrl: 'templates/login.html',
              controller: 'loginCtrl'
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
              templateUrl: 'templates/calendar.html',
              controller: 'calendarCtrl'
            }
          }
        })
        .state('home.stats', {
          url: 'stats',
          views: {
            'content@home': {
              templateUrl: 'templates/stats.html',
              controller: 'statsCtrl'
            }
          }
        })
    }
  ])

  // take all whitespace out of string
  .filter('nospace', function () {
    return function (value) {
      return (!value) ? '' : value.replace(/ /g, '')
    }
  })

  // replace uppercase to regular case
  .filter('humanizeDoc', function () {
    return function (doc) {
      if (!doc) return
      if (doc.type === 'directive') {
        return doc.name.replace(/([A-Z])/g, function ($1) {
          return '-' + $1.toLowerCase()
        })
      }

      return doc.label || doc.name
    }
  })