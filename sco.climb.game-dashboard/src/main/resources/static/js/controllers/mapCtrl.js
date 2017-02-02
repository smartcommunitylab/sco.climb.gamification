angular.module("climbGame.controllers.map", [])
  .controller("mapCtrl", ["$scope", "leafletData", "mapService", function ($scope, leafletData, mapService) {
    var init = function () {
      angular.extend($scope, {
        defaults: {
          zoomControl: false
        },
        center: {
          lat: 0,
          lng: 0,
          zoom: 2
        },
        pathLine: {},
        pathMarkers: [],
        layers: {
          baselayers: {
            osm: {
              name: 'OpenStreetMap',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz'
            },
            altro: {
              name: 'Watercolor',
              url: 'http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
              type: 'xyz'
            }
          }
        }
      });
      var controlsStyle = {
        leftarrow: {
          backgroundColor: 'white',
          backgroundImage: "url(https://cdn0.iconfinder.com/data/icons/navigation-set-arrows-part-one/32/ChevronLeft-128.png)",
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '80px',
          left: '60px',
        },
        rightarrow: {
          backgroundColor: 'white',
          backgroundImage: "url(https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-arrow-right-128.png)",
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '80px',
          left: '140px',
        },
        uparrow: {
          backgroundColor: 'white',
          backgroundImage: "url(http://www.iconarchive.com/download/i87622/icons8/ios7/Arrows-Up-4.ico)",
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '40px',
          left: '100px',
        },
        downarrow: {
          backgroundColor: 'white',
          backgroundImage: "url(http://icons.veryicon.com/ico/System/iOS%207/Arrows%20Down%204.ico)",
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '120px',
          left: '100px',
        },
        zoomin: {
          backgroundColor: 'white',
          backgroundImage: "url(http://www.iconarchive.com/download/i91602/icons8/windows-8/Science-Plus2-Math.ico)",
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '40px',
          left: '20px',
        },
        zoomout: {
          backgroundColor: 'white',
          backgroundImage: "url(http://www.iconarchive.com/download/i91592/icons8/windows-8/Science-Minus2-Math.ico)",
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '120px',
          left: '20px',
        },
        home: {
          backgroundColor: 'white',
          backgroundImage: "url(https://cdn4.iconfinder.com/data/icons/pictype-free-vector-icons/16/home-512.png)",
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '80px',
          left: '20px',
        }
      };
      var assignStyle = function (containerStyle, styleValues) {
        containerStyle.backgroundColor = styleValues.backgroundColor;
        containerStyle.backgroundImage = styleValues.backgroundImage;
        containerStyle.backgroundSize = styleValues.backgroundSize;
        containerStyle.width = styleValues.width;
        containerStyle.height = styleValues.height;
        containerStyle.position = styleValues.position;
        containerStyle.top = styleValues.top;
        containerStyle.left = styleValues.left;
      }
      leafletData.getMap('map').then(function (map) {
        var leftarrow = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            assignStyle(container.style, controlsStyle['leftarrow']);
            container.onclick = function () {

              // Calculate the offset
              var offset = map.getSize().x * 0.14;
              // Then move the map
              map.panBy(new L.Point(-offset, 0), {
                animate: false
              })
            }
            return container;
          }
        });
        var rightarrow = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            assignStyle(container.style, controlsStyle['rightarrow']);
            container.onclick = function () {

              // Calculate the offset
              var offset = map.getSize().x * 0.14;
              // Then move the map
              map.panBy(new L.Point(offset, 0), {
                animate: false
              })
            }
            return container;
          }
        });
        var uparrow = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            assignStyle(container.style, controlsStyle['uparrow']);
            container.onclick = function () {

              // Calculate the offset
              var offset = map.getSize().x * 0.14;
              // Then move the map
              map.panBy(new L.Point(0, -offset), {
                animate: false
              })
            }
            return container;
          }
        });
        var downarrow = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            assignStyle(container.style, controlsStyle['downarrow'])
            container.onclick = function () {

              // Calculate the offset
              var offset = map.getSize().x * 0.14;
              // Then move the map
              map.panBy(new L.Point(0, offset), {
                animate: false
              })
            }
            return container;
          }
        });

        var zoomin = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            assignStyle(container.style, controlsStyle['zoomin'])
            container.onclick = function () {

              // Calculate the offset
              var offset = map.getSize().x * 0.14;
              // Then move the map
              map.zoomIn();
            }
            return container;
          }
        });
        var zoomout = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            assignStyle(container.style, controlsStyle['zoomout'])
            container.onclick = function () {

              // Calculate the offset
              var offset = map.getSize().x * 0.14;
              // Then move the map
              map.zoomOut();
            }
            return container;
          }
        });
        var home = L.Control.extend({
          options: {
            position: 'topleft'
          },
          onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            assignStyle(container.style, controlsStyle['home'])
            container.onclick = function () {

              map.panTo([0, 0]);
              map.setZoom(2);
            }
            return container;
          }
        });
        map.addControl(new leftarrow());
        map.addControl(new rightarrow());
        map.addControl(new uparrow());
        map.addControl(new downarrow());

        map.addControl(new zoomin());
        map.addControl(new zoomout());
        map.addControl(new home());
      }, function (error) {
        console.log('error creation');
      });
    }
    init();
    mapService.getStatus().then(function (data) {
        //visualize the status trought path
        $scope.legs = data.legs;
        $scope.globalTeam = data.game.globalTeam;
        // get actual situation
        for (var i = 0; i < data.teams.length; i++) {
          if (data.teams[i].classRoom == $scope.globalTeam) {
            $scope.globalScore = data.teams[i].score;
            $scope.currentLeg = data.teams[i].currentLeg;
            break;
          }
        }
        for (var i = 0; i < data.legs.length; i++) {
          $scope.pathLine[i] = {
              color: '#3f51b5',
              weight: 5,
              latlngs: mapService.decode(data.legs[i].polyline)
            }
            //create div of external url
          var externalUrl = "<div>";
          for (var k = 0; k < data.legs[i].externalUrls.length; k++) {
            externalUrl = externalUrl + '<div class="row"> ' + ' <a href="' + data.legs[i].externalUrls[k] + '">' + data.legs[i].externalUrls[k] + '</div>';
          }
          externalUrl = externalUrl + '</div>';
          var icon = getMarkerIcon(data.legs[i])
          $scope.pathMarkers.push({
            getMessageScope: function () {
              return $scope;
            },
            lat: data.legs[i].geocoding[1],
            lng: data.legs[i].geocoding[0],
            message: '<div class="map-balloon">' +
              '<h4 class="text-pop-up">' + (i + 1) + '. ' + data.legs[i].name + '</h4>' +
              '<div class="row">' +
              '<div class="col">' + externalUrl + '</div>' +
              '</div>' +
              '</div>',
            icon: {
              iconUrl: icon,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              popupAnchor: [0, -5]
            }
          });
          addPlayerPosition();
        }
      },
      function (err) {
        //error with status
      });

    function addPlayerPosition() {
      $scope.pathMarkers.push({
        getMessageScope: function () {
          return $scope;
        },
        lat: data.legs[i].geocoding[1],
        lng: data.legs[i].geocoding[0],
        message: '<div class="map-balloon">' +
          '<h4 class="text-pop-up">' + (i + 1) + '. ' + data.legs[i].name + '</h4>' +
          '<div class="row">' +
          '<div class="col">' + externalUrl + '</div>' +
          '</div>' +
          '</div>',
        icon: {
          iconUrl: "POI_walk_full",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -5]
        }
      });
    }

    function getMarkerIcon(leg) {
      //check leg and give me icon based on my status and type of mean
      if (leg.position < $scope.currentLeg.position) {
        return './img/POI_full.png';
      }
      return './img/POI_empty.png';

    }

  }]);
