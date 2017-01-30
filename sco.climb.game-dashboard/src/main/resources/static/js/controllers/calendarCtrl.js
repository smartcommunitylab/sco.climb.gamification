angular.module("climbGame.controllers.calendar", [])
  .controller("calendarCtrl", ["$scope", "calendarService", function ($scope, calendarService) {
    $scope.week = [];
    $scope.selectedWeather = "";
    $scope.selectedMean = "";
    $scope.selectedMeanColor = "cal-menu-col";
    $scope.classMap = {};
    $scope.weekData = [];
    $scope.todayData = {
      babies: []
    };


    setTodayIndex();

    for (var i = 0; i < 5; i++) {
      $scope.week.push(new Date(getMonday(new Date()).getTime() + (i * 24 * 60 * 60 * 1000)));
    }

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
      case "pedibus":
        color = "cal-pedibus-col"
        break;
      }
      return color;
    }
    $scope.selectWather = function (weather) {
      $scope.selectedWeather = weather;
    }
    $scope.selectGeneralMean = function (mean) {
      $scope.selectedMean = mean;
      $scope.selectedMeanColor = $scope.returnColorByType($scope.selectedMean);
    }
    $scope.selectBabyMean = function (index) {
      //set baby[$index]= selected mean;
      $scope.todayData.babies[index].color = $scope.returnColorByType($scope.selectedMean);
      $scope.todayData.babies[index].mean = $scope.selectedMean;
    }
    $scope.today = function (index) {
      return (index == $scope.todayIndex);
    }

    $scope.sendData = function () {
      //check if data are ok then ...
      $scope.todayData.meteo = $scope.selectedWeather;
      $scope.todayData.day = new Date().setHours(0, 0, 0, 0);
      var babiesMap = {};
      for (var i = 0; i < $scope.todayData.babies.length; i++) {
        if ($scope.todayData.babies[i].mean) {
          babiesMap[$scope.todayData.babies[i].childId] = $scope.todayData.babies[i].mean;
        }
      }
      $scope.todayData.modeMap = babiesMap;
      calendarService.sendData($scope.todayData).then(function () {
        //sent data
      }, function (error) {
        //get error
      });
    }

    $scope.prevWeek = function () {
      changeWeek(-1);
    }
    $scope.nextWeek = function () {
      changeWeek(1);
    }
    var scrollup = function () {
      document.getElementById('table').scrollTop -= 10
    }
    var scrolldown = function () {
      document.getElementById('table').scrollTop += 10
    }
    $scope.scrollUp = function () {
      $scope.scrollupTimer = setInterval(scrollup, 10);

    }
    $scope.scrollDown = function () {
      $scope.scrolldownTimer = setInterval(scrolldown, 10);
    }
    $scope.resetTimerUp = function () {
      clearInterval($scope.scrollupTimer);
    }
    $scope.resetTimerDown = function () {
      clearInterval($scope.scrolldownTimer);
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
    }

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
        } else {
          //add entire day of null data
        }
      }
    }
  }]);
