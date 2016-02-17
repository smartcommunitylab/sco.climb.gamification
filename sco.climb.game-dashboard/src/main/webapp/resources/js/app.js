'use strict';

/* App Module */

var cg = angular.module('cg', [
	'ngLocale',
	'ngRoute',
	'ngSanitize',
	'colorpicker.module',
	'ngMap',
	
	'cgServices',
	'cgControllers',
	'cgFilters',
	'cgDirectives',
	
	'ngCookies',
	'dialogs',
	'ui.bootstrap',
	'localization'
]);

cg.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
  	$routeProvider
  		.when('/', {
    		templateUrl: 'html/home.html',
    		controller: 'MainCtrl',
    		controllerAs: 'main'
    	})
    	.when('/console', {
    		templateUrl: 'html/home.html',
    		controller: 'MainCtrl',
    		controllerAs: 'main'
    	})
    	.when('/console/home', {
    		templateUrl: 'html/home.html',
    		controller: 'MainCtrl',
    		controllerAs: 'main'
    	})
    	.when('/console/game/map', {
    		templateUrl: 'html/game_map.html',
    		controller: 'ViewCtrlGmap',
    		controllerAs: 'view_ctrl_gmap'
    	})
    	.otherwise({
    		redirectTo:'/'
    	});
  			
  	$locationProvider.html5Mode({
  		enabled: true,
  		requiredBase: false
  	});
}]);
cg.config(['$provide', function($provide) {
    $provide.decorator('$browser', ['$delegate', function($delegate) {
        var originalUrl = $delegate.url;
        $delegate.url = function() {
            var result = originalUrl.apply(this, arguments);
            if (result && result.replace) {
                result = result.replace(/%23/g, '#');
            }
            return result;
        };
        return $delegate;
    }]);
}]);
cg.config(['$compileProvider',
    function( $compileProvider )
    {  
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data|file):/);
    }
]);
cg.run(function($rootScope, $templateCache) {
	$rootScope.$on('$viewContentLoaded', function() {
		$templateCache.removeAll();
	});
});
//cg.config(['ngTranslationProvider', function(ngTranslationProvider) {
//    ngTranslationProvider
//    .setDirectory('/game-dashboard/i18n')
//    .langsFiles({
//      en: 'resources_en.json',
//      it: 'resources_it.json'
//    })
//    .fallbackLanguage('it')
//}]).run(['ngTranslation', '$location'], function(ngTranslation, $location) {
//  ngTranslation.use(
//     $location.search().lang
//  );
//});