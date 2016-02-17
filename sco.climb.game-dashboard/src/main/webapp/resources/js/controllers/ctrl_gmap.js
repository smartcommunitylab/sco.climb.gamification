'use strict';

/* Controllers */
var cgControllers = angular.module('cgControllers');

cg.controller('ViewCtrlGmap',['$scope', '$http', '$route', '$routeParams', '$rootScope', 'localize', 'sharedDataService', 'invokeWSService', 'invokeWSServiceNS', 'invokeWSServiceProxy', '$timeout',
                      function($scope, $http, $route, $routeParams, $rootScope, localize, sharedDataService, invokeWSService, invokeWSServiceNS, invokeWSServiceProxy, $timeout, $location, $filter) { 
	
	$scope.$route = $route;
	$scope.$routeParams = $routeParams;
	var hidedLegsMarkers = [];
	
	$scope.colorMissing = "#808080";
	$scope.colorDone = "#4285F4";
	$scope.missingMarkerColor = "http://maps.google.com/mapfiles/kml/paddle/wht-circle-lv.png";//"http://maps.google.com/mapfiles/ms/icons/red-dot.png";
	$scope.doneMarkerColor = "http://maps.google.com/mapfiles/kml/paddle/blu-circle-lv.png";//"http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
	$scope.actualMarkerColor = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";//"https://maps.gstatic.com/mapfiles/ms2/micons/ltblu-pushpin.png";
	
	
	$scope.getToken = function() {
        return 'Bearer ' + sharedDataService.getToken();
    };
                  		    
    $scope.authHeaders = {
         'Authorization': $scope.getToken(),
         'Accept': 'application/json;charset=UTF-8'
        //json/json
        //X-ACCESS-TOKEN L2MEq8WPbTAIT134
    };
		
	$scope.mapOption = {
		center : sharedDataService.getConfMapCenter(),	//"[" + $scope.mapCenter.latitude + "," + $scope.mapCenter.longitude + "]",
		zoom : parseInt(sharedDataService.getConfMapZoom())
	};
	
	
	$scope.initPage = function(){
		$scope.mapelements = {
			gamepolys : true,
			legmarkers : true,
		};
	};
	
	$scope.initWs = function(){
		//$scope.hideAllMapElements();
		$scope.mapGameLegMarkers = [];
		$scope.mapGamePolylines = [];
		$scope.mapReady = false;
		$scope.initPage();
		var gameId = sharedDataService.getGameId();
		$scope.getUserGameStatus(gameId);
	};
	
	$scope.hideAllMapElements = function(){
		$scope.hideLegsMarkers();
		$scope.hideStreetPolylines();
	};
	
	$scope.changeLegMarkers = function(){
		if($scope.mapelements.legmarkers){
			$scope.showLegsMarkers();
		} else {
			$scope.hideLegsMarkers();
		}
	};
	
	$scope.showLegsMarkers = function() {
        $scope.mapGameLegMarkers = $scope.setAllMarkersMap(hidedLegsMarkers, $scope.map, true, 0);
    };
    
    $scope.hideLegsMarkers = function() {
    	//$scope.mapGameLegMarkers = $scope.setAllMarkersMap($scope.mapGameLegMarkers, null, false, 0);
    	if(hidedLegsMarkers == null || hidedLegsMarkers.length == 0){
    		angular.copy($scope.mapGameLegMarkers, hidedLegsMarkers);
    	}
    	$scope.mapGameLegMarkers = [];
    };
	
    $scope.changeGamePolylines = function(){
		if($scope.mapelements.gamepolys){
			$scope.showGamePolylines();
		} else {
			$scope.hideGamePolylines();
		}
	};
    
    $scope.showGamePolylines = function() {
    	$scope.mapGamePolylines = $scope.initPolysOnMap($scope.gameState, true);
    };
    
    $scope.hideGamePolylines = function() {
    	$scope.mapGamePolylines = $scope.initPolysOnMap($scope.gameState, false);
    	$scope.hideAllPolys();
    };
    
    $scope.hideAllPolys = function(){
    	if($scope.map && $scope.mapGamePolylines){
    		var toDelPath = $scope.map.shapes;
	    	for(var i = 0; i < $scope.mapGamePolylines.length; i++){
	    		toDelPath[$scope.mapGamePolylines[i].id].setMap(null);		// I can access dinamically the value of the object shapes for street
	    	}
    	}
    };
	
    $scope.setAllMarkersMap = function(markers, map, visible, type){
    	for(var i = 0; i < markers.length; i++){
    		markers[i].options.visible = visible;
    		markers[i].options.map = map;
    	}
    	return markers;
    };
    
    $scope.getPointFromLatLng = function(latLng, type){
		var point = "" + latLng;
		var pointCoord = point.split(",");
		var res;
		if(type == 1){
			var lat = pointCoord[0].substring(1, pointCoord[0].length);
			var lng = pointCoord[1].substring(0, pointCoord[1].length - 1);
		
			res = {
				latitude: lat,
				longitude: lng
			};
		} else {
			var lat = Number(pointCoord[0]);
			var lng = Number(pointCoord[1]);
			res = {
				lat: lat,
				lng: lng
			};
		}
		return res;
	};
    
    $scope.$on('mapInitialized', function(evt, map) {
    	switch(map.id){
	    	case "viewMap":
	    		$scope.viewMap = map;
	    		break;
	    	default:
	    		break;
    	}
    	var newCenter = $scope.getPointFromLatLng(sharedDataService.getConfMapCenter(), 2);
    	$scope.mapOption.center = sharedDataService.getConfMapCenter();
    	map.setCenter(newCenter);
    	//map.setZoom(parseInt($scope.mapOption.zoom));
    	map.panTo(newCenter);
    	map.fitBounds(sharedDataService.getConfMapBounds());
    	$scope.mapOption.zoom = map.zoom;
    	// configure new center
    });	
	
    $scope.initPolysOnMap = function(gameState, visible){
		var poly = {};
		var poligons = {};
		var tmpPolys = [];
		var actualMarkerPosition = [];
		if(gameState){
			var polylines = gameState.legs;
			var allTeams = gameState.teams;
			var teamId = sharedDataService.getName();
			//var teamId = "TEST";
			var myTeam = $scope.getTeamFromId(allTeams, teamId);
			var myLeg = myTeam.previousLeg;
			var myScores = myTeam.score;								//2800;
			var totalRange = myTeam.currentLeg.score - myLeg.score;		//1000;
			var doneRange = myScores - myLeg.score;						//800;
			if(polylines){
				for(var i = 0; i < polylines.length; i++){
					var pointArr = polyline.decode(polylines[i].polyline);
					if(polylines[i].position == myLeg.position + 1){
						// Actual leg. I have to split them in 2 part considering the percentage
						var actual_completing = doneRange / totalRange;		//0,8
						var lengthInMeters = $scope.sumAllDistances(pointArr) * 1000;
						var splittedSubPolys = $scope.retrievePercentagePoly(pointArr, actual_completing);
						for(var y = 0; y < splittedSubPolys.length; y++){
							var partialPath = {
								id: polylines[i].position + "_" + y,
								path: $scope.correctPointsGoogle(splittedSubPolys[y]),
								stroke: {
								    color: (y == 0) ? $scope.colorDone : $scope.colorMissing,
								    weight: 5
								},
								data: polylines[i],
								info_windows_pos: pointArr[0],
								info_windows_cod: "iw" + polylines[i].position,
								editable: false,
								draggable: false,
								geodesic: false,
								visible: visible
							};
							if(y == 0){	// I initialize the actual position for the specific marker with the last coord of the firt splitted polyline
								actualMarkerPosition = splittedSubPolys[y][splittedSubPolys[y].length - 1];
							}
							tmpPolys.push(partialPath);
						}
					} else {
						var partialPath = {
							id: polylines[i].position,
							path: $scope.correctPointsGoogle(pointArr),
							stroke: {
							    color: (polylines[i].position <= myLeg.position) ? $scope.colorDone : $scope.colorMissing,
							    weight: 5
							},
							data: polylines[i],
							info_windows_pos: pointArr[0],
							info_windows_cod: "iw" +polylines[i].position,
							editable: false,
							draggable: false,
							geodesic: false,
							visible: visible
						};
						tmpPolys.push(partialPath);
					}				
				}
			}
		}
		return tmpPolys;
	};
	
	$scope.getUserGameStatus = function(gameId){
		//http://localhost:8080/game-dashboard/api/game/status/TEST/56b9b129dd0a82ada7cce4c5
		//$scope.gameState = null;
    	//var method = "GET";
    	//var user = sharedDataService.getName();
    	//var myDataPromise = invokeWSService.getProxy(method, "/game/status/" + user + "/" + gameId, null, $scope.authHeaders, null);
		//myDataPromise.then(function(result){
		//   angular.copy(result, $scope.gameState);
		//});
		//return myDataPromise;
		$scope.gameState = {
				"game": {
				    "ownerId": "TEST",
				    "objectId": "59be0c50-2c1b-4a4e-bf43-a1fbda964b3b",
				    "creationDate": 1454599874222,
				    "lastUpdate": 1455180953901,
				    "schoolId": "schoolId1",
				    "schoolName": "schooldName1",
				    "classRooms": null,
				    "gameId": "56b9b129dd0a82ada7cce4c5",
				    "gameName": "climb-pedibus-local",
				    "gameDescription": "gameDescription1",
				    "gameOwner": "TEST",
				    "from": 1454593685879,
				    "to": 1454680085000,
				    "token": "L2MEq8WPbTAIT134"
				  },
				  "legs": [
				    {
				      "ownerId": "TEST",
				      "objectId": "1ea6a55a-ed88-4a3a-8540-df392ba4b0b0",
				      "creationDate": 1454599904665,
				      "lastUpdate": 1454599904665,
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "legId": "legId1",
				      "badgeId": "badgeId1",
				      "name": "name1",
				      "description": "description1",
				      "position": 1,
				      "geocoding": [	// punto tappa: dovrebbe coincidere con ultimo punto polyline
				          46.06421,
				          11.23054
				      ],
				      "externalUrl": "https://www.google.it",
				      "polyline": "}mdxGu}tcAdB~EVxC~CxJn@|LfCvMjBhK~CzKbEhNvBjHcCxJwBlLmFjO",
				      "score": 1000
				    },
				    {
				      "ownerId": "TEST",
				      "objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
				      "creationDate": 1454599904665,
				      "lastUpdate": 1454599904665,
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "legId": "legId2",
				      "badgeId": "badgeId2",
				      "name": "name2",
				      "description": "description2",
				      "position": 2,
				      "geocoding": [
				          46.06668,
				          11.21077
				      ],
				      "externalUrl": "https://www.google.it",
				      "polyline": "g|cxG{mpcA_JhNk@|H@pJWdMEzKPnMu@nM_BhK?pCfAdEKrF",
				      "score": 2000
				    },
				    {
					  "ownerId": "TEST",
					  "objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
					  "creationDate": 1454599904665,
					  "lastUpdate": 1454599904665,
					  "gameId": "56b9b129dd0a82ada7cce4c5",
					  "legId": "legId3",
					  "badgeId": "badgeId3",
					  "name": "name3",
					  "description": "description3",
					  "position": 3,
					  "geocoding": [
					      46.06947,
					      11.20021
					  ],
					  "externalUrl": "https://www.google.it",
					  "polyline": "ukdxGkrlcAcCnDaFpG}BjDu@pC?|Az@|A~A~B`AxC}BhCyCtEE|Hh@lE",
					  "score": 3000
					},
				    {
						"ownerId": "TEST",
						"objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
						"creationDate": 1454599904665,
						"lastUpdate": 1454599904665,
						"gameId": "56b9b129dd0a82ada7cce4c5",
						"legId": "legId4",
						"badgeId": "badgeId4",
						"name": "name4",
						"description": "description4",
						"position": 4,
						"geocoding": [
						    46.07073,
						    11.19553
						],
						"externalUrl": "https://www.google.it",
						"polyline": "e}dxGgpjcAaAzGeBnFWz@{@YyAuAeBQaAh@c@bAvBr@xAnBrAlE",
						"score": 4000
					},
				    {
						"ownerId": "TEST",
						"objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
						"creationDate": 1454599904665,
						"lastUpdate": 1454599904665,
						"gameId": "56b9b129dd0a82ada7cce4c5",
						"legId": "legId5",
						"badgeId": "badgeId5",
						"name": "name5",
						"description": "description5",
						"position": 5,
						"geocoding": [
						    46.0676,
						    11.18487
						],
						"externalUrl": "https://www.google.it",
						"polyline": "_eexG_sicApBpG`AhCn@`@xAPjB?`Az@lAlEEjHDvI?xJ?zGt@|A",
						"score": 5000
					}
				  ],
				  "players": [
				    {
				      "ownerId": "TEST",
				      "objectId": "afb6ef3b-454d-42f3-92c8-c0d629e093b7",
				      "creationDate": 1455121091808,
				      "lastUpdate": 1455181004853,
				      "childId": "59be0c51-2c1b-4a4e-bf43-a1fbda964b3b",
				      "wsnId": 1,
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "score": 1001,
				      "badges": {
				        "Cammino": []
				      }
				    },
				    {
				      "ownerId": "TEST",
				      "objectId": "b9eedf81-28e2-462a-b4b6-b09dbfcecebc",
				      "creationDate": 1455121091935,
				      "lastUpdate": 1455181018687,
				      "childId": "59be0d51-2c1b-4a4e-bf43-a1fbda964b3b",
				      "wsnId": 2,
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "score": 1001,
				      "badges": {
				        "Cammino": []
				      }
				    }
				  ],
				  "teams": [
				    {
				      "ownerId": "TEST",
				      "objectId": "d184ca43-b3bc-4f78-8351-2b2be73d33d8",
				      "creationDate": 1455121091969,
				      "lastUpdate": 1455181031619,
				      "classRoom": "classRoom1",
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "childrenId": [
				        "59be0c51-2c1b-4a4e-bf43-a1fbda964b3b",
				        "59be0d51-2c1b-4a4e-bf43-a1fbda964b3b"
				      ],
				      "badges": {
				        "Cammino": []
				      },
				      "score": 2500,
				      "previousLeg":{
					      "ownerId": "TEST",
					      "objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
					      "creationDate": 1454599904665,
					      "lastUpdate": 1454599904665,
					      "gameId": "56b9b129dd0a82ada7cce4c5",
					      "legId": "legId2",
					      "badgeId": "badgeId2",
					      "name": "name2",
					      "description": "description2",
					      "position": 2,
					      "geocoding": [
					          46.06668,
						      11.21077
					      ],
					      "externalUrl": "",
					      "polyline": "g|cxG{mpcA_JhNk@|H@pJWdMEzKPnMu@nM_BhK?pCfAdEKrF",
					      "score": 2000
					    },
				      "currentLeg": {
						  "ownerId": "TEST",
						  "objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
						  "creationDate": 1454599904665,
						  "lastUpdate": 1454599904665,
						  "gameId": "56b9b129dd0a82ada7cce4c5",
						  "legId": "legId3",
						  "badgeId": "badgeId3",
						  "name": "name3",
						  "description": "description3",
						  "position": 3,
						  "geocoding": [
						      46.06947,
							  11.20021
						  ],
						  "externalUrl": "",
						  "polyline": "ukdxGkrlcAcCnDaFpG}BjDu@pC?|Az@|A~A~B`AxC}BhCyCtEE|Hh@lE",
						  "score": 3000
				      }
				    }
				  ]
				};
		
		$scope.gameState2 = {
				"game": {
				    "ownerId": "TEST",
				    "objectId": "59be0c50-2c1b-4a4e-bf43-a1fbda964b3b",
				    "creationDate": 1454599874222,
				    "lastUpdate": 1455180953901,
				    "schoolId": "schoolId1",
				    "schoolName": "schooldName1",
				    "classRooms": null,
				    "gameId": "56b9b129dd0a82ada7cce4c6",
				    "gameName": "gameName2",
				    "gameDescription": "gameDescription2",
				    "gameOwner": "TEST",
				    "from": 1454593685879,
				    "to": 1454680085000,
				    "token": "L2MEq8WPbTAIT134"
				  },
				  "legs": [
				    {
				      "ownerId": "TEST",
				      "objectId": "1ea6a55a-ed88-4a3a-8540-df392ba4b0b0",
				      "creationDate": 1454599904665,
				      "lastUpdate": 1454599904665,
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "legId": "legId1",
				      "badgeId": "badgeId1",
				      "name": "name1",
				      "description": "description1",
				      "position": 1,
				      "geocoding": [	// punto tappa: dovrebbe coincidere con ultimo punto polyline
				           46.0118468064287853,
				           11.1303348530782387
				      ],
				      "externalUrl": "https://www.google.it",
				      "polyline": "wu}wGkg}bAbCuAtEYjD?bE`@bEh@jBFnEi@dGcAfFcAbEi@|DGrCPnH`@rFnBzEX~FF|Dz@vD|AhEpC~FhC",
				      "score": 1000
				    },
				    {
				      "ownerId": "TEST",
				      "objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
				      "creationDate": 1454599904665,
				      "lastUpdate": 1454599904665,
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "legId": "legId2",
				      "badgeId": "badgeId2",
				      "name": "name2",
				      "description": "description2",
				      "position": 2,
				      "geocoding": [
				          45.9886237447671959,
				          11.1216659535421059
				      ],
				      "externalUrl": "https://www.google.it",
				      "polyline": "auywGq{|bAtEpC|GdI~C~BbElAbEh@zHh@pGX`IXrFGtE?hEz@~CtEnCxCbE|A|DP`FG|D`@vBr@tCGvDFlFvBtEzD",
				      "score": 2000
				    },
				    {
					  "ownerId": "TEST",
					  "objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
					  "creationDate": 1454599904665,
					  "lastUpdate": 1454599904665,
					  "gameId": "56b9b129dd0a82ada7cce4c5",
					  "legId": "legId3",
					  "badgeId": "badgeId3",
					  "name": "name3",
					  "description": "description3",
					  "position": 3,
					  "geocoding": [
					        45.9731410130839109,
					        11.1131772989756428
					  ],
					  "externalUrl": "https://www.google.it",
					  "polyline": "{cuwGme{bAvBbDhExCdDdBrIhC~IrDzErDbE~BnCvB\\z@`@v@ZnD`@h@d@?\\o@d@y@h@Av@NbDz@rEnBpDh@fF`@jFd@",
					  "score": 3000
					},
				    {
						"ownerId": "TEST",
						"objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
						"creationDate": 1454599904665,
						"lastUpdate": 1454599904665,
						"gameId": "56b9b129dd0a82ada7cce4c5",
						"legId": "legId4",
						"badgeId": "badgeId4",
						"name": "name4",
						"description": "description4",
						"position": 4,
						"geocoding": [
						     45.9503194447946228,
						     11.1072120661265217
						],
						"externalUrl": "https://www.google.it",
						"polyline": "ccrwGkpybAnDJtDPrECpDC`EB~EbA|GtA|KrBfFvB|CpA~Bv@fEPbEXrETpFr@rDChDFfD?rE\\tElC`EnD|DjD",
						"score": 4000
					},
				    {
						"ownerId": "TEST",
						"objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
						"creationDate": 1454599904665,
						"lastUpdate": 1454599904665,
						"gameId": "56b9b129dd0a82ada7cce4c5",
						"legId": "legId5",
						"badgeId": "badgeId5",
						"name": "name5",
						"description": "description5",
						"position": 5,
						"geocoding": [
						    45.9219210692995858,
						    11.0914406797382981
						],
						"externalUrl": "https://www.google.it",
						"polyline": "otmwGakxbAtCnDlD|CzDtCjIvFpIfFxHtEvI~E`FnFtEvFlEvDhEbAzHfAnD\\fEr@hEpClDdC~EjD~An@~JHlO?rOzDdD|C",
						"score": 5000
					},
					{
						"ownerId": "TEST",
						"objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
						"creationDate": 1454599904665,
						"lastUpdate": 1454599904665,
						"gameId": "56b9b129dd0a82ada7cce4c5",
						"legId": "legId6",
						"badgeId": "badgeId6",
						"name": "name6",
						"description": "description6",
						"position": 6,
						"geocoding": [
						    45.9178906944797376,
						    11.0645542165730149
						],
						"externalUrl": "https://www.google.it",
						"polyline": "_chwGohubAfD~EbCdGrBbHlAtJv@rKlAzGfBlId@nDTlCAfDGbFDzG\\xCn@~BfAdCRjB@rBQjHaA|HaBvOFlCPpG",
						"score": 6000
					}
				  ],
				  "players": [
				    {
				      "ownerId": "TEST",
				      "objectId": "afb6ef3b-454d-42f3-92c8-c0d629e093b7",
				      "creationDate": 1455121091808,
				      "lastUpdate": 1455181004853,
				      "childId": "59be0c51-2c1b-4a4e-bf43-a1fbda964b3b",
				      "wsnId": 1,
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "score": 1001,
				      "badges": {
				        "Cammino": []
				      }
				    },
				    {
				      "ownerId": "TEST",
				      "objectId": "b9eedf81-28e2-462a-b4b6-b09dbfcecebc",
				      "creationDate": 1455121091935,
				      "lastUpdate": 1455181018687,
				      "childId": "59be0d51-2c1b-4a4e-bf43-a1fbda964b3b",
				      "wsnId": 2,
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "score": 1001,
				      "badges": {
				        "Cammino": []
				      }
				    }
				  ],
				  "teams": [
				    {
				      "ownerId": "TEST",
				      "objectId": "d184ca43-b3bc-4f78-8351-2b2be73d33d8",
				      "creationDate": 1455121091969,
				      "lastUpdate": 1455181031619,
				      "classRoom": "classRoom2",
				      "gameId": "56b9b129dd0a82ada7cce4c5",
				      "childrenId": [
				        "59be0c51-2c1b-4a4e-bf43-a1fbda964b3b",
				        "59be0d51-2c1b-4a4e-bf43-a1fbda964b3b"
				      ],
				      "badges": {
				        "Cammino": []
				      },
				      "score": 3700,
				      "previousLeg":{
						  "ownerId": "TEST",
						  "objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
						  "creationDate": 1454599904665,
						  "lastUpdate": 1454599904665,
						  "gameId": "56b9b129dd0a82ada7cce4c5",
						  "legId": "legId3",
						  "badgeId": "badgeId3",
						  "name": "name3",
						  "description": "description3",
						  "position": 3,
						  "geocoding": [
						        45.9731410130839109,
						        11.1131772989756428
						  ],
						  "externalUrl": "https://www.google.it",
						  "polyline": "{cuwGme{bAvBbDhExCdDdBrIhC~IrDzErDbE~BnCvB\\z@`@v@ZnD`@h@d@?\\o@d@y@h@Av@NbDz@rEnBpDh@fF`@jFd@",
						  "score": 3000
						},
				      "currentLeg": {
							"ownerId": "TEST",
							"objectId": "1ea6a55a-ed99-4a3a-8540-df392ba4b0b0",
							"creationDate": 1454599904665,
							"lastUpdate": 1454599904665,
							"gameId": "56b9b129dd0a82ada7cce4c5",
							"legId": "legId4",
							"badgeId": "badgeId4",
							"name": "name4",
							"description": "description4",
							"position": 4,
							"geocoding": [
							     45.9503194447946228,
							     11.1072120661265217
							],
							"externalUrl": "https://www.google.it",
							"polyline": "ccrwGkpybAnDJtDPrECpDC`EB~EbA|GtA|KrBfFvB|CpA~Bv@fEPbEXrETpFr@rDChDFfD?rE\\tElC`EnD|DjD",
							"score": 4000
						}
				    }
				  ]
				};
		
		if(gameId == '56b9b129dd0a82ada7cce4c5'){	// TODO: if block to be removed in prod
			var actualMarkerCoords = $scope.correctAndDrowPolylines($scope.gameState);
			$scope.correctAndDrowMarkers($scope.gameState, actualMarkerCoords);
		} else {
			var actualMarkerCoords = $scope.correctAndDrowPolylines($scope.gameState2);
			$scope.correctAndDrowMarkers($scope.gameState2, actualMarkerCoords);
		}
		
	};
	
	$scope.correctAndDrowMarkers = function(gameState, actualCoords){
		$scope.mapGameLegMarkers = [];
		if(gameState){
			var polylines = gameState.legs;
			var allTeams = gameState.teams;
			var teamId = sharedDataService.getName()
			//var teamId = "TEST";
			var myTeam = $scope.getTeamFromId(allTeams, teamId);
			var myLeg = myTeam.previousLeg;
			myLeg.scores = myTeam.score;
			if(polylines){
				for(var i = 0; i < polylines.length; i++){
					var coord = polylines[i].geocoding;
					var ret = {
						id: i,
						position: coord,
						options: { 
						    draggable: true,
						    visible: true,
						    map:null
						},
						data: polylines[i],
						isActualMarker: false,
						icon: (polylines[i].position <= myLeg.position) ? $scope.doneMarkerColor : $scope.missingMarkerColor,
						showWindow: false
					};
					ret.closeClick = function () {
					    ret.showWindow = false;
					};
					ret.onClick = function () {
						ret.showWindow = !ret.showWindow;
					};
					$scope.mapGameLegMarkers.push(ret);
				}
			}
			if(actualCoords && actualCoords.length > 0){
				var actualStateMarker = {
					id: myLeg.position + "_ac",
					position: actualCoords,
					options: { 
					    draggable: true,
					    visible: true,
					    map:null
					},
					data: myLeg,
					isActualMarker: true,
					icon: $scope.actualMarkerColor,
					showWindow: false
				};
				actualStateMarker.closeClick = function () {
					actualStateMarker.showWindow = false;
				};
				actualStateMarker.onClick = function () {
					actualStateMarker.showWindow = !actualStateMarker.showWindow;
				};
				$scope.mapGameLegMarkers.push(actualStateMarker);
			}
		}
	};
	
	$scope.correctAndDrowPolylines = function(gameState){
		$scope.mapGamePolylines = [];
		var actualMarkerPosition = [];
		if(gameState){
			var polylines = gameState.legs;
			var allTeams = gameState.teams;
			var teamId = sharedDataService.getName()
			//var teamId = "TEST";
			var myTeam = $scope.getTeamFromId(allTeams, teamId);
			var myLeg = myTeam.previousLeg;
			var myScores = myTeam.score;								//2800;
			var totalRange = myTeam.currentLeg.score - myLeg.score;		//1000;
			var doneRange = myScores - myLeg.score;						//800;
			if(polylines){
				var bounds = new google.maps.LatLngBounds();
				for(var i = 0; i < polylines.length; i++){
					var pointArr = polyline.decode(polylines[i].polyline);
					var lengthInMeters = $scope.sumAllDistances(pointArr) * 1000;
					polylines[i].length = lengthInMeters;
					var middlePoint = Math.floor(pointArr.length / 2);
					if(polylines[i].position == myLeg.position + 1){
						// Actual leg. I have to split them in 2 part considering the percentage
						var actual_completing = doneRange / totalRange;		//0,8
						//var lengthInMeters = google.maps.geometry.spherical.computeLength(pointArr);	//polylines[i].polyline
						//var lengthInMeters = $scope.sumAllDistances(pointArr) * 1000;
						//var proportionalLength = lengthInMeter * actual_completing;
						//alert("polyline is "+lengthInMeters+" long");
						var splittedSubPolys = $scope.retrievePercentagePoly(pointArr, actual_completing);
						for(var y = 0; y < splittedSubPolys.length; y++){
							var partialPath = {
								id: polylines[i].position + "_" + y,
								path: $scope.correctPointsGoogle(splittedSubPolys[y]),
								stroke: {
								    color: (y == 0) ? $scope.colorDone : $scope.colorMissing,
								    weight: 5
								},
								data: polylines[i],
								info_windows_pos: pointArr[middlePoint],
								info_windows_cod: "iw" +polylines[i].position,
								editable: false,
								draggable: false,
								geodesic: false,
								visible: true
							};
							for (var p = 0; p < splittedSubPolys[y].length; p++) {
								var lat = Number(splittedSubPolys[y][p][0]);
								var lng = Number(splittedSubPolys[y][p][1]);
								var gPoint = new google.maps.LatLng(lat,lng);
							    bounds.extend(gPoint);
							}
							if(y == 0){	// I initialize the actual position for the specific marker with the last coord of the firt splitted polyline
								actualMarkerPosition = splittedSubPolys[y][splittedSubPolys[y].length - 1];
							}
							$scope.mapGamePolylines.push(partialPath);
						}
					} else {
						var partialPath = {
							id: polylines[i].position,
							path: $scope.correctPointsGoogle(pointArr),
							//gpath: $scope.correctPointsGoogle(poligons.points),
							stroke: {
							    color: (polylines[i].position <= myLeg.position) ? $scope.colorDone : $scope.colorMissing,
							    weight: 5
							},
							data: polylines[i],
							info_windows_pos: pointArr[middlePoint],
							info_windows_cod: "iw" +polylines[i].position,
							editable: false,
							draggable: false,
							geodesic: false,
							visible: true
						};
						for (var p = 0; p < pointArr.length; p++) {
							var lat = Number(pointArr[p][0]);
							var lng = Number(pointArr[p][1]);
							var gPoint = new google.maps.LatLng(lat,lng);
							bounds.extend(gPoint);
						}
						//street.setMap($scope.map);
						$scope.mapGamePolylines.push(partialPath);
					}
				}
			}
		}
		sharedDataService.setConfMapBounds(bounds);
		var newCenter = bounds.getCenter().lat() + "," + bounds.getCenter().lng();
		console.log("Map center " + newCenter);
		sharedDataService.setConfMapCenter(newCenter);
		return actualMarkerPosition;
	};
	
	$scope.retrievePercentagePoly = function(pointArr, percentage){
		var splittedPolys = [];
		var perc = Math.floor(percentage * pointArr.length);
		var partialPoly1 = pointArr.slice(0, perc);
		var partialPoly2 = pointArr.slice(perc - 1, pointArr.length);
		splittedPolys.push(partialPoly1);
		splittedPolys.push(partialPoly2);
		return splittedPolys;
	};
	
	$scope.sumAllDistances = function(arrOfPoints){
		var partialDist = 0;
		for(var i = 1; i < arrOfPoints.length; i++){
			var lat1 = arrOfPoints[i-1][0];
			var lon1 = arrOfPoints[i-1][1];
			var lat2 = arrOfPoints[i][0];
			var lon2 = arrOfPoints[i][1];
			partialDist += $scope.getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
		}
		return partialDist;
	};
	
	$scope.getDistanceFromLatLonInKm = function(lat1,lon1,lat2,lon2) {
	  var R = 6371; // Radius of the earth in km
	  var dLat = deg2rad(lat2-lat1);  // deg2rad below
	  var dLon = deg2rad(lon2-lon1); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in km
	  return d;
	};

	var deg2rad = function(deg) {
	  return deg * (Math.PI/180)
	};
	
	$scope.getTeamFromId = function(allTeams, teamId){
		var myTeam = null;
		if(allTeams){
			var find = false;
			for(var i = 0; (i < allTeams.length && !find); i++){
				if(allTeams[i].ownerId == teamId){
					myTeam = allTeams[i];
					find = true;
				}
			}
		}
		return myTeam;
	};
	
	$scope.correctGooglePolyline = function(polystring){
		var res = polystring;
		if(polystring){
			if(polystring.indexOf("\\") > -1){
				res = polystring.replace("\\", "\\\\");
			}
		}
		return res;
	};
	
	$scope.correctPoints = function(points){
		var corr_points = [];
		for(var i = 0; i < points.length; i++){
			var point = {
				latitude: points[i].lat,
				longitude: points[i].lng
			};
			corr_points.push(point);
		}
		return corr_points;
	};
	
	$scope.correctPointsGoogle = function(points){
		var corr_points = "[";
		for(var i = 0; i < points.length; i++){
			var point = "";
			if(points[i].lat != null){
				point = "[ " + points[i].lat + "," + points[i].lng + "]";
			} else {
				point = "[ " + points[i][0] + "," + points[i][1] + "]";
			}
			corr_points = corr_points +point + ",";
		}
		corr_points = corr_points.substring(0, corr_points.length-1);
		corr_points = corr_points + "]";
		return corr_points;
	};
	
	$scope.invertLatLong = function(arr){
		var tmp_arr = [];
		for(var i = 0; i < arr.length; i++){
			var coord = new Array(2);
			coord[0] = arr[i][1];
			coord[1] = arr[i][0];
			tmp_arr.push(coord);
		}
		return tmp_arr;
	};
	
	/*var primoseg = [ 
         [11.1322231282247230,46.0324383102441388],
	[11.1326522816671059,46.0317828379018223], 
    [11.1327810276998207,46.0307102300278075],
	[11.1327810276998207,46.0298461696578229],
	[11.1326093663228676,46.0288629121160042], 
    [11.1323947896016762,46.0278796370829824],
	[11.1323518742574379,46.0273432978744310],
    [11.1325664509786293,46.0263004011827377], 
    [11.1329097737325355,46.0249893031406714], 
    [11.1332530964864418,46.0238271675164370],
	[11.1334676732076332,46.0228438029067632],
    [11.1335105885518715,46.0218902205203335], 
	[11.1334247578633949,46.0211452228368501], 
    [11.1332530964864418,46.0196253955251393],
    [11.1326951970113441,46.0184035440069934],
    [11.1325664509786293,46.0173008743376357],
    [11.1325235356343910,46.0160193657439649], 
    [11.1322231282247230,46.0150656656556620],
    [11.1317510594381019,46.0141417530105983],
    [11.1310214985860512,46.0131284117158188], 
    [11.1303348530782387,46.0118468064287853]];
	
	var secondoseg = [ 
	    [11.1303348530782387,46.0118468064287853],
    [11.1296052922261879,46.0107738117202913], 
    [11.1279745091451332,46.0093431197277951], 
    [11.1273307789815590,46.0085383392191147], 
    [11.1269445408834144,46.0075547026958844], 
    [11.1267299641622230,46.0065710486809536], 
    [11.1265153874410316,46.0049912041118674], 
    [11.1263866414083168,46.0036199816858087], 
    [11.1262578953756019,46.0020102424263015], 
    [11.1263008107198402,46.0007880017072708], 
    [11.1263008107198402,45.9997147924721190], 
    [11.1260004033101723,45.9987011868581135], 
    [11.1249275197042152,45.9978962515255319], 
    [11.1241550435079262,45.9971807436219891], 
    [11.1236829747213051,45.9961969051479329], 
    [11.1235971440328285,45.9952428632561023], 
    [11.1236400593770668,45.9941099171465524],
    [11.1234683980001137,45.9931558392749409], 
    [11.1232109059346840,45.9925595322527059], 
    [11.1232538212789223,45.9918141394397821], 
    [11.1232109059346840,45.9908898384095224], 
    [11.1226100911153480,45.9896971691101299], 
    [11.1216659535421059,45.9886237447671959]];
	
	var terzoseg = [
	    [11.1216659535421059,45.9886237447671959],
    [11.1208505620015785,45.9880273889149933], 
    [11.1200780858052894,45.9870135692208279], 
    [11.1195631016744301,45.9861786449421359], 
    [11.1188764561666176,45.9844789387489428], 
    [11.1179752339376137,45.9827195387757115], 
    [11.1170740117086098,45.9816161577228613], 
    [11.1164302815450355,45.9806320425558113], 
    [11.1158294667256996,45.9799163114474325], 
    [11.1155312058690470,45.9797668274013347], 
    [11.1152522561314981,45.9795953483198119], 
    [11.1143724915746134,45.9794536912866789], 
    [11.1141579148534220,45.9792822112353434], 
    [11.1141579148534220,45.9790883635813188], 
    [11.1143939492467325,45.9789392495394935], 
    [11.1146836278203409,45.9787528564225028], 
    [11.1146943566564005,45.9785440962967016], 
    [11.1146192548039835,45.9782607764890230], 
    [11.1143145555979572,45.9774357864155476], 
    [11.1137566561228596,45.9763770364249496], 
    [11.1135420794016682,45.9754823023413550], 
    [11.1133704180247150,45.9743191264202267], 
    [11.1131772989756428,45.9731410130839109]];
	
	var quartoseg = [
	     [11.1131772989756428,45.9731410130839109],
    [11.1131129259592853,45.9722611399404855], 
    [11.1130270952708088,45.9713514258913207], 
    [11.1130485529429279,45.9702925595738137], 
    [11.1130700106150471,45.9693977271857079], 
    [11.1130485529429279,45.9684283091180461], 
    [11.1127052301890217,45.9673097287266188], 
    [11.1122760767466389,45.9658779128644284], 
    [11.1116967195994221,45.9638046972268697], 
    [11.1110959047800861,45.9626412760492684], 
    [11.1106882090098225,45.9618507323340637], 
    [11.1104092592722736,45.9612093395218864], 
    [11.1103234285837971,45.9602099452257420], 
    [11.1101946825510822,45.9592254496371524], 
    [11.1100873941904865,45.9581663515187344], 
    [11.1098299021250568,45.9569580599301162], 
    [11.1098513597971760,45.9560630121369940], 
    [11.1098084444529377,45.9552127033428661], 
    [11.1098084444529377,45.9543772995409228], 
    [11.1096582407481037,45.9533181087582108], 
    [11.1089501375681721,45.9522439791221586], 
    [11.1080703730112873,45.9512742608758984], 
    [11.1072120661265217,45.9503194447946228]];
	
	var quintoseg = [
	     [11.1072120661265217,45.9503194447946228],
    [11.1063323015696369,45.9495734832860521], 
    [11.1055383677012287,45.9487081553585952], 
    [11.1047873491770588,45.9477682148896989], 
    [11.1035428041941486,45.9461120905207849], 
    [11.1023840898997150,45.9444260752487565], 
    [11.1013112062937580,45.9428593779284924], 
    [11.1001954073435627,45.9411434205391558], 
    [11.0989937777048908,45.9400093673782663], 
    [11.0977492353413254,45.9389349798293125], 
    [11.0968265554402024,45.9379053388930672], 
    [11.0964832326862961,45.9368906015832721], 
    [11.0961184522602707,45.9353087681542220], 
    [11.0959682485554367,45.9344282941510968], 
    [11.0957107564900070,45.9334284168914238], 
    [11.0949811956379563,45.9324135976576144], 
    [11.0943160078022629,45.9315480018723648], 
    [11.0934577009174973,45.9304286769482957], 
    [11.0932216665241867,45.9299510914388094], 
    [11.0931701702065766,45.9280310084030461], 
    [11.0931701702065766,45.9254041236636397], 
    [11.0922260326333344,45.9227472614354539], 
    [11.0914406797382981,45.9219210692995858]];
        
	var sestoseg = [
	     [11.0914406797382981,45.9219210692995858],
    [11.0903248807881027,45.9210851637708899], 
    [11.0890159627888352,45.9204283720204103], 
    [11.0875568410847336,45.9198462091963222], 
    [11.0856900236103684,45.9194580972534325], 
    [11.0836730024311692,45.9191744752706512], 
    [11.0822567960713059,45.9187863586290916], 
    [11.0805830976460129,45.9182638896322786], 
    [11.0797033330891281,45.9180698284661943], 
    [11.0789952299091965,45.9179578697924313], 
    [11.0781583806965500,45.9179653337110381], 
    [11.0770211240742356,45.9180101172016393], 
    [11.0756049177143723,45.9179802615452459], 
    [11.0748324415180832,45.9178309830223981], 
    [11.0741887113545090,45.9175921365505175], 
    [11.0735235235188156,45.9172338649149978], 
    [11.0729870817158371,45.9171293685855915], 
    [11.0724077245686203,45.9171144405224538], 
    [11.0709056875202805,45.9172040088409616], 
    [11.0693178197834641,45.9175324247718919], 
    [11.0666356107685715,45.9180250450238034], 
    [11.0659275075886399,45.9179802615452459], 
    [11.0645542165730149,45.9178906944797376]];         
	
	var primoSegPoly = polyline.encode($scope.invertLatLong(primoseg));
	var secondoSegPoly = polyline.encode($scope.invertLatLong(secondoseg));
	var terzoSegPoly = polyline.encode($scope.invertLatLong(terzoseg));
	var quartoSegPoly = polyline.encode($scope.invertLatLong(quartoseg));
	var quintoSegPoly = polyline.encode($scope.invertLatLong(quintoseg));
	var sestoSegPoly = polyline.encode($scope.invertLatLong(sestoseg));
	
	console.log("encoded string primo seg " + primoSegPoly);
	console.log("encoded string secondo seg " + secondoSegPoly);
	console.log("encoded string terzo seg " + terzoSegPoly);
	console.log("encoded string quarto seg " + quartoSegPoly);
	console.log("encoded string quinto seg " + quintoSegPoly);
	console.log("encoded string sesto seg " + sestoSegPoly);*/
	
}]);