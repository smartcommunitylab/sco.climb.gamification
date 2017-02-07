angular.module("climbGame.controllers.calendar", [])
  .controller("calendarCtrl", ["$scope", "$filter", "$mdDialog", "$mdToast", "calendarService",
    function ($scope, $filter, $mdDialog, $mdToast, calendarService) {
      $scope.week = [];
      $scope.selectedWeather = "";
      $scope.selectedMean = "";
      $scope.selectedMeanColor = "cal-menu-col";
      $scope.labelWeek = "";
      $scope.cal = {
        meanOpen: false
      }
      $scope.classMap = {};
      $scope.weekData = [];
      $scope.todayData = {
        babies: [],
        means: {}
      };


      setTodayIndex();

      for (var i = 0; i < 5; i++) {
        $scope.week.push(new Date(getMonday(new Date()).getTime() + (i * 24 * 60 * 60 * 1000)));
      }
      setLabelWeek($scope.week);

      calendarService.setTitle().then(function () {

      }, function (err) {
        //default value

      });
      calendarService.getClassPlayers().then(function (players) {
          $scope.class = players;
          for (var i = 0; i < players.length; i++) {
            $scope.todayData.babies.push({
              name: players[i].name,
              surname: players[i].surname,
              childId: players[i].childId,
              color: ''
            });
            $scope.classMap[players[i].childId] = players[i];

          }
          calendarService.getCalendar($scope.week[0].getTime(), $scope.week[$scope.week.length - 1].getTime()).then(function (calendar) {
              createWeekData(calendar);
              updateTodayData(calendar);

            },
            function (err) {

            });
        },
        function (err) {

        });

      $scope.returnColorByType = function (type) {
        var color = "";
        switch (type) {
        case "zeroImpact_solo":
          color = "cal-foot-friend-col";
          break;
        case "zeroImpact_wAdult":
          color = "cal-foot-adult-col";
          break;
        case "bus":
          color = "cal-bus-col"
          break;
        case "pandr":
          color = "cal-car-square-col"
          break;
        case "car":
          color = "cal-car-school-col"
          break;
        case "absent":
          color = "cal-away-col"
          break;
        case "pedibus":
          color = "cal-pedibus-col"
          break;
        }
        return color;
      }
      $scope.selectWather = function (weather) {
          $scope.selectedWeather = weather;
        }
        //      $scope.openMeans = function () {
        //        $scope.cal.meanOpen = !$scope.cal.meanOpen;
        //      }
      $scope.selectGeneralMean = function (mean) {
        $scope.selectedMean = mean;
        $scope.selectedMeanColor = $scope.returnColorByType($scope.selectedMean);
      }
      $scope.selectBabyMean = function (index) {
        if (!$scope.selectedMean) {
          $mdToast.show($mdToast.simple().content('Selezionare un mezzo di trasporto'));
          return;
        }
        if ($scope.todayData.babies[index].mean == 'pedibus') {
          $mdToast.show($mdToast.simple().content('Non e\' possibile sovrascrivere PEDIBUS'));
          return;
        }
        //set baby[$index]= selected mean;
        //add mean to index and remove the other
        if ($scope.todayData.babies[index].mean) {
          $scope.todayData.means[$scope.todayData.babies[index].mean]--;
        }
        $scope.todayData.babies[index].color = $scope.returnColorByType($scope.selectedMean);
        $scope.todayData.babies[index].mean = $scope.selectedMean;
        if (!$scope.todayData.means[$scope.todayData.babies[index].mean]) {
          $scope.todayData.means[$scope.todayData.babies[index].mean] = 0;
        }
        $scope.todayData.means[$scope.todayData.babies[index].mean]++;

      }
      $scope.today = function (index) {
        return (index == $scope.todayIndex);
      }

      $scope.sendData = function () {
        if (dataAreComplete()) {
          $mdDialog.show({
            //targetEvent: $event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            template: '<md-dialog>' +
              '  <div class="cal-dialog-title"> Invio dati  </div><md-divider></md-divider>' +
              '  <div class="cal-dialog-text">Invia dati definitivi al sistema, completata l\'operazione non sara piu possibile modificarli.</div>' +
              '    <div layout="row"  layout-align="start center" ><div layout"column" flex="50" ><md-button ng-click="closeDialog()" class=" send-dialog-delete">' +
              '      Annulla' +
              '   </div> </md-button>' +
              '<div layout"column" flex="50" ><md-button ng-click = "confirmSend()" class = "send-dialog-confirm" > ' +
              '      Invia' +
              '    </md-button></div>' +
              '</div></md-dialog>',
            controller: function DialogController($scope, $mdDialog) {
              $scope.closeDialog = function () {
                $mdDialog.hide();
              }
              $scope.confirmSend = function () {
                $scope.todayData.meteo = $scope.selectedWeather;
                $scope.todayData.day = new Date().setHours(0, 0, 0, 0);
                var babiesMap = {};
                for (var i = 0; i < $scope.todayData.babies.length; i++) {
                  if ($scope.todayData.babies[i].mean) {
                    babiesMap[$scope.todayData.babies[i].childId] = $scope.todayData.babies[i].mean;
                  }
                }
                $scope.todayData.modeMap = babiesMap;
                calendarService.sendData($scope.todayData).then(function (returnValue) {
                  //change weekdata to closed
                  $scope.weekData[$scope.todayIndex].closed = true;
                  // check if merged or not
                  if (returnValue) {
                    //popup dati backend cambiati
                    $mdDialog.show({
                      //targetEvent: $event,
                      scope: $scope, // use parent scope in template
                      preserveScope: true, // do not forget this if use parent scope
                      template: '<md-dialog>' +
                        '  <div class="cal-dialog-title"> Dati cambiati </div><md-divider></md-divider>' +
                        '  <div class="cal-dialog-text">I dati presenti sono cambiati. </div>' +
                        '    <div layout="row"  layout-align="start center" ><div layout"column" flex="100" ><md-button ng-click="closeDialogChanged()" class=" send-dialog-delete">' +
                        '      Ho capito' +
                        '   </div> </md-button>' +
                        '</div></md-dialog>',
                      controller: function DialogController($scope, $mdDialog) {
                        //reload and show
                        calendarService.getCalendar($scope.week[0].getTime(), $scope.week[$scope.week.length - 1].getTime()).then(function (calendar) {
                            createWeekData(calendar);
                            updateTodayData(calendar);

                          },
                          function (err) {

                          });
                        $scope.closeDialogChanged = function () {
                          $mdDialog.hide();
                        }
                      }
                    });
                  } else {
                    //sent data
                    $mdToast.show($mdToast.simple().content('Dati inviati'));
                  }
                  $scope.closeDialog();

                }, function (error) {
                  //TODO get error
                });
              }
            }
          });
        } else {
          $mdDialog.show({
            //targetEvent: $event,
            scope: $scope, // use parent scope in template
            preserveScope: true, // do not forget this if use parent scope
            template: '<md-dialog>' +
              '  <div class="cal-dialog-title"> Dati incompleti  </div><md-divider></md-divider>' +
              '  <div class="cal-dialog-text">Per poter inviare i dato e necessario compilare tutti i campi.</div>' +
              '    <div layout="row"  layout-align="start center" ><div layout"column" flex="100" ><md-button ng-click="closeDialog()" class=" send-dialog-delete">' +
              '      Ho capito' +
              '   </div> </md-button>' +
              '</div></md-dialog>',
            controller: function DialogController($scope, $mdDialog) {
              $scope.closeDialog = function () {
                $mdDialog.hide();
              }
            }
          });
        }
      }

      $scope.prevWeek = function () {
        changeWeek(-1);
      }
      $scope.nextWeek = function () {
        changeWeek(1);
      }

      $scope.scrollUp = function () {
        document.getElementById('table').scrollTop -= 50;

      }
      $scope.scrollDown = function () {
        document.getElementById('table').scrollTop += 50;
      }

      $scope.isFuture = function (dayIndex) {
        return (new Date().setHours(0, 0, 0, 0) < $scope.week[dayIndex].setHours(0, 0, 0, 0));
      }

      $scope.isPast = function (dayIndex) {
        return (new Date().setHours(0, 0, 0, 0) > $scope.week[dayIndex].setHours(0, 0, 0, 0));
      }

      function dataAreComplete() {
        //meteo and means must  be chosen
        if (!$scope.selectedWeather) {
          return false;
        }
        for (var i = 0; i < $scope.todayData.babies.length; i++) {
          if (!$scope.todayData.babies[i].mean) {
            return false;
          }
        }
        //all babies  have a mean
        return true;
      }

      function getMonday(d) {
        d = new Date(d);
        d.setHours(0, 0, 0, 0);
        var day = d.getDay(),
          diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
      }

      function checkDayOfTheWeek(dayFromData, indexOfWeek) {
        //compare timestamp dayFromData.day with timestamp of the $scope.week[indexOfWeek]
        //return true if it is the same day and false otherwise
        if (dayFromData.day === $scope.week[indexOfWeek].getTime())
          return true;
        return false;
      }

      function setTodayIndex() {
        /*set the day of week*/
        var day = new Date().getDay();
        day = day - (day == 0 ? -6 : 1);
        $scope.todayIndex = day;
      }

      function changeWeek(skipWeek) {
        //take date of week[0] and go 1 week before or after
        var monday = $scope.week[0];
        monday.setDate(monday.getDate() + 7 * skipWeek);
        $scope.week = [];
        for (var i = 0; i < 5; i++) {
          $scope.week.push(new Date(monday.getTime() + (i * 24 * 60 * 60 * 1000)));
        }
        calendarService.getCalendar($scope.week[0].getTime(), $scope.week[$scope.week.length - 1].getTime()).then(function (calendar) {
            createWeekData(calendar);
          },
          function (err) {

          });
        //if the new week is the actual week
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        if (now.getTime() >= $scope.week[0].getTime() && now.getTime() <= $scope.week[$scope.week.length - 1].getTime()) {
          setTodayIndex();
        } else {
          $scope.todayIndex = -1;
        }
        setLabelWeek($scope.week);
        //      $scope.labelWeek = $filter('date')($scope.week[0], 'dd') + " - "
        //      $filter('date')($scope.week[$scope.week.length - 1], 'dd MMM yyyy');
      }

      function setLabelWeek(weekArray) {
        $scope.labelWeek = $filter('date')(weekArray[0], 'dd') + " - " +
          $filter('date')(weekArray[weekArray.length - 1], 'dd MMM yyyy');
      }

      function updateTodayData(calendar) {
        //if there is today data merge it with $scope.todayData
        var today = new Date().setHours(0, 0, 0, 0);
        for (var i = 0; i < calendar.length; i++) {
          if (calendar[i].day == today) {
            //merge it
            for (var k = 0; k < $scope.todayData.babies.length; k++) {
              if (calendar[i].modeMap[$scope.todayData.babies[k].childId]) {
                $scope.todayData.babies[k].color = $scope.returnColorByType(calendar[i].modeMap[$scope.todayData.babies[k].childId]);
                $scope.todayData.babies[k].mean = calendar[i].modeMap[$scope.todayData.babies[k].childId];
                if (!$scope.todayData.means[$scope.todayData.babies[k].mean]) {
                  $scope.todayData.means[$scope.todayData.babies[k].mean] = 0;
                }
                $scope.todayData.means[$scope.todayData.babies[k].mean]++;
              }
            }
            break;
          }

        }

      };

      function createWeekData(calendar) {
        $scope.weekData = [];
        for (var i = 0; i < 5; i++) {
          //get i-th day data and put baby with that object id with that setted mean
          $scope.weekData.push({});
          //if calendar[i] esiste vado avanti
          if (calendar[i]) {
            //se giorno della settimana coincide con calendar.day vado avanti altrimenti skip
            if (checkDayOfTheWeek(calendar[i], i)) {
              for (var property in calendar[i].modeMap) {
                $scope.weekData[i][property] = {
                  mean: calendar[i].modeMap[property]
                };
                $scope.weekData[i][property].color = $scope.returnColorByType(calendar[i].modeMap[property]);
                if (!$scope.weekData[i][calendar[i].modeMap[property]]) {
                  $scope.weekData[i][calendar[i].modeMap[property]] = 0
                }
                $scope.weekData[i][calendar[i].modeMap[property]] = $scope.weekData[i][calendar[i].modeMap[property]] + 1;
              }
            } else {
              //add entire day of null data
            }
            if (calendar[i].meteo) {
              $scope.weekData[i].meteo = calendar[i].meteo;
            }
            //if (calendar[i].closed) {
            $scope.weekData[i].closed = calendar[i].closed;
            //}
          } else {
            //add entire day of null data
          }
        }
      }
  }]);
