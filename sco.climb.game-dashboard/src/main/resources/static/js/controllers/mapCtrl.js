angular.module("climbGame.controllers.map", [])
  .controller("mapCtrl", ["$scope", "leafletData", "mapService", "configService", function ($scope, leafletData, mapService, configService) {
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
          backgroundColor: '#f39c12',
          backgroundImage: 'url("./img/arrow_left.png")',
          color: 'white',
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '80px',
          left: '60px',
          padding: '1px',
          border: '1px solid white'
        },
        rightarrow: {
          backgroundColor: '#f39c12',
          backgroundImage: 'url("./img/arrow_right.png")',
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '80px',
          left: '140px',
          border: '1px solid white'
        },
        uparrow: {
          backgroundColor: '#f39c12',
          backgroundImage: 'url("./img/arrow_up.png")',

          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '40px',
          left: '100px',
          border: '1px solid white'
        },
        downarrow: {
          backgroundColor: '#f39c12',
          backgroundImage: 'url("./img/arrow_down.png")',

          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '120px',
          left: '100px',
          border: '1px solid white'
        },
        zoomin: {
          backgroundColor: '#f39c12',
          backgroundImage: 'url("./img/zoom-in.png")',

          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '40px',
          left: '20px',
          border: '1px solid white'
        },
        zoomout: {
          backgroundColor: '#f39c12',
          backgroundImage: 'url("./img/zoom-out.png")',
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '120px',
          left: '20px',
          border: '1px solid white'
        },
        home: {
          backgroundColor: '#f39c12',
          backgroundImage: 'url("./img/home.png")',
          backgroundSize: "30px 30px",
          width: '30px',
          height: '30px',
          position: 'absolute',
          top: '80px',
          left: '20px',
          border: '1px solid white'
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
            externalUrl = externalUrl + '<div class="row"> ' + ' <a href="' + data.legs[i].externalUrls[k] + '" target="_blank">' + data.legs[i].externalUrls[k] + '</div>';
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
              iconSize: [50, 50],
              iconAnchor: [25, 25],
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
      //      $scope.pathMarkers.push({
      //        getMessageScope: function () {
      //          return $scope;
      //        },
      //        lat: data.legs[i].geocoding[1],
      //        lng: data.legs[i].geocoding[0],
      //        message: '<div class="map-balloon">' +
      //          '<h4 class="text-pop-up">' + (i + 1) + '. ' + data.legs[i].name + '</h4>' +
      //          '<div class="row">' +
      //          '<div class="col">' + externalUrl + '</div>' +
      //          '</div>' +
      //          '</div>',
      //        icon: {
      //          iconUrl: "POI_walk_full",
      //          iconSize: [20, 20],
      //          iconAnchor: [10, 10],
      //          popupAnchor: [0, -5]
      //        }
      //      });
    }

    function getMarkerIcon(leg) {
      //check leg and give me icon based on my status and type of mean
      if (leg.position == 0) {
        return './img/POI_start.png'
      }
      if (leg.position == $scope.legs.length - 1) {
        return './img/POI_destination.png'
      }
      switch (leg.transport) {
      case configService.getFootConstant():
        if (leg.position < $scope.currentLeg.position) {
          return './img/POI_walk_full.png';
        }
        return './img/POI_walk_empty.png';
        break;
      case configService.getPlaneConstant():
        if (leg.position < $scope.currentLeg.position) {
          return './img/POI_airplane_full.png';
        }
        return './img/POI_airplane_empty.png';
        break;
      case configService.getBoatConstant():
        if (leg.position < $scope.currentLeg.position) {
          return './img/POI_boat_full.png';
        }
        return './img/POI_boat_empty.png';
        break;
      default:
        if (leg.position < $scope.currentLeg.position) {
          return './img/POI_full.png';
        }
        return './img/POI_empty.png';
      }


    }

  }]);
