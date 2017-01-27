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
    /*set the day of week*/
    var day = new Date().getDay();
    day = day - (day == 0 ? -6 : 1);
    $scope.todayIndex = day;

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
            // calendarService.getCalendar(1477267200000, 1477612800000).then(function (calendar) {
            var calendar = calendar;
            for (var i = 0; i < 5; i++) {
              //get i-th day data and put baby with that object id with that setted mean
              $scope.weekData.push({});
              //if calendar[i] esiste vado avanti
              if (calendar[i]) {
                //se giorno della settimana coincide con calendar.day vado avanti altrimenti skip
                if (checkDayOfTheWeek(calendar[i], i)) {
                  for (var property in calendar[i].modeMap) {
                    // for (var k = 0; k < calendar[i].modeMap.length; k++) {
                    //    var baby = $scope.classMap[property];
                    //   baby.mean = calendar[i].modeMap[property];
                    $scope.weekData[i][property] = calendar[i].modeMap[property];

                  }
                } else {
                  //add entire day of null data
                }
              } else {
                //add entire day of null data
              }
            }
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
        babiesMap[$scope.todayData.babies[i].childId] = $scope.todayData.babies[i].mean;
      }
      $scope.todayData.modeMap = babiesMap;
      calendarService.sendData($scope.todayData).then(function () {
        //sent data
      }, function (error) {
        //get error
      });
    }
      }]);
