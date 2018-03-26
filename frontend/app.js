'use strict';
var user = null;
var profile = null;
var token = null;
var loginStatus = false;

var app = angular.module("myApp", ["ngRoute", 'ui-notification']);
app.config(function(NotificationProvider){
  NotificationProvider.setOptions({
            delay: 5000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'left',
            positionY: 'bottom'
        });
});

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "partials/login.html",
        controller: "LoginCtrl"
    })
    .when("/register", {
        templateUrl : "partials/register.html",
        controller: "RegisterCtrl"
    })
    .when("/app", {
        templateUrl : "partials/app.html",
        controller: "AppCtrl"
    })
    .when("/profile", {
        templateUrl : "partials/profile.html",
        controller: "ProfileCtrl"
    })
    .when("/liste", {
        templateUrl : "partials/liste.html",
        controller: "ListeCtrl"
    })
    .when("/view", {
        templateUrl : "partials/view.html",
        controller: "ViewCtrl"
    })
    .when("/new",{
      templateUrl : "partials/new.html",
      controller : "NewCtrl"
    })
})
.controller("LoginCtrl", function($scope, $http, $location, $rootScope, Notification){
  //console.log("$scope", $scope);

  $scope.sending = false;
  if (token !== null) {
    console.log("token not null");
    $location.path("/app");

  }

  $rootScope.checkLogin = function(){
    if (token === null || $rootScope.token === null) {
      return false;
    }else {
      return true;
    }
  }
  $rootScope.gotoRegister = function(){
    $location.path("/register");
  }
  $rootScope.gotoLogin = function(){
    $location.path("/");
  }
  $rootScope.login = function(form){
    $http({
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:8000/api/login",
      "method": "POST",
      "headers": {'Content-Type' : 'application/json',
        "PHP_AUTH_USER": form.username,
        "PHP_AUTH_PW": form.password,
        "Cache-Control": "no-cache"
      }
    }).then(function(response){
       if (response.data == "404") {
        Notification.error("User not found");
      } else if (response.data === "401") {
        //console.log("bad password");
        Notification.error("Bad password");
      }else {
        //console.log(response.data);
        $scope.sending = true;
        $rootScope.token = response.data.token;
        token = response.data.token;
        $location.path("/app");
      }
    })

  }
})
.controller("RegisterCtrl", function($scope, $http, $location, $rootScope){
  //console.log("$scope", $scope);
  $scope.sending = false;

  $scope.register = function(form){
    $http({
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:8000/api/register",
      "method": "POST",
      "headers": {'Content-Type' : 'application/json',
        "Cache-Control": "no-cache"
      },
      "data": {"user":{
              "name":form.username,
              "email":form.email,
              "plainPassword":{
	               "first":form.password.first,
 	               "second":form.password.second
	              },
                "age":form.age,
                "famille":form.famille,
                "race":form.race,
                "nourriture":form.nourriture
              }
            }
    }).then(function(response){
      $scope.sending = true;
      $location.path("/");
    })

  }
})
.controller("AppCtrl", function($scope, $http, $location, $rootScope, Notification){
  if (loginStatus === false) {
    Notification.success('Successfully logged in. ');
    loginStatus = true;
  }

  $http({
    "async": true,
    "crossDomain": true,
    "url": "http://localhost:8000/api/users",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer "+$rootScope.token,
      "Cache-Control": "no-cache"
    }
  }).then(function(response){
    $scope.users = response.data;
    //console.log(response.data);

  })
  $http({
    "async": true,
    "crossDomain": true,
    "url": "http://localhost:8000/api/profile",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer "+$rootScope.token,
      "Cache-Control": "no-cache"
    }
  }).then(function(response){
    profile = response.data;
    $rootScope.profile = profile;
    //console.log(response.data);

  })
  $http({
    "async": true,
    "crossDomain": true,
    "url": "http://localhost:8000/api/mesMoustiques",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer "+$rootScope.token,
      "Cache-Control": "no-cache"
    }
  }).then(function(response){
    console.log("mes moustiques : ",response.data);
    $rootScope.liste = response.data;
    var finalArray = [];
    for (var i = 0; i < response.data.length; i++) {
       finalArray.push(response.data[i].id);
     }

    $rootScope.array = finalArray;
    console.log("FinalArray filled with data", $rootScope.array);
  })
  $rootScope.getUser = function(id){
    $http({
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:8000/api/user/"+id,
      "method": "GET",
      "headers": {
        "Authorization": "Bearer "+$rootScope.token,
        "Cache-Control": "no-cache"
      }
    }).then(function(response){
      //console.log(response.data);
      user = response.data;
      $location.path("/view");
    })
  }

  $rootScope.viewProfile = function(){
      $scope.profile = profile;
      //console.log($scope.profile);
      $location.path("/profile");
  }

  $rootScope.viewListe = function(){
      //console.log($scope.profile);
      $location.path("/liste");
  }

  $rootScope.logout = function(){
    $rootScope.token = null;
    token = null;
    $location.path("/");
  }
  $rootScope.gotoNew = function(){
    $location.path("/new");
  }


})
.filter('searchFor', function(){
  return function(arr, searchString){
    if(!searchString){
      return arr;
    }
    var result = [];
    searchString = searchString.toLowerCase();
    angular.forEach(arr, function(item){
      if(item.name.toLowerCase().indexOf(searchString) !== -1){
        result.push(item);
      }
    })
    return result;
  }
})
.controller("ViewCtrl", function($scope, $http, $location, $rootScope){
  //console.log(user);
  $scope.user = user;

  $scope.check = function(id){
    if ($rootScope.array.includes(user.id)) {
      //console.log("add impossible ==> remove");
      return true;
    }else if (user.id === profile.id) {
      console.log("same id");
    } else {
      //console.log("add possible");
      return false;
    }

  }

  $scope.add = function(id){
    $http({
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:8000/api/add/"+id,
      "method": "GET",
      "headers": {
        "Authorization": "Bearer "+$rootScope.token,
        "Cache-Control": "no-cache"
      }
    }).then(function(response){
      console.log(response);
      $location.path("/app");

    })
  }
    $scope.remove = function(id){
      $http({
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:8000/api/remove/"+id,
        "method": "GET",
        "headers": {
          "Authorization": "Bearer "+$rootScope.token,
          "Cache-Control": "no-cache"
        }
      }).then(function(response){
        //console.log(response);
        $location.path("/app");

      })
  }
    //console.log(user);
})
.controller("ProfileCtrl", function($scope, $http, $location, $rootScope){
  $scope.profile = $rootScope.profile;

  $scope.updateProfile = function(form){
    console.log(form);
    /*
    $http({
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:8000/api/updateProfile",
      "method": "POST",
      "headers": {
        "Authorization": "Bearer "+$rootScope.token,
        "Cache-Control": "no-cache"
      },
      "data": {"user":{
              "name":profile.username,
              "email":profile.email,
              "plainPassword":{
	               "first":profile.password,
 	               "second":profile.password,
	              },
                "age":profile.age,
                "famille":profile.famille,
                "race":profile.race,
                "nourriture":profile.nourriture
              }
      }
    }).then(function(response){
        console.log(response.data);
    })
    */
  }
})
.controller("ListeCtrl", function($scope, $http, $location, $rootScope){
  $scope.liste = $rootScope.liste;

})
.controller("NewCtrl", function($scope, $http, $location, $rootScope){
  $scope.createUser = function(form){
    $http({
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:8000/api/register",
      "method": "POST",
      "headers": {'Content-Type' : 'application/json',
        "Cache-Control": "no-cache"
      },
      "data": {"user":{
              "name":form.username,
              "email":form.email,
              "plainPassword":{
                 "first":"azerty",
                 "second":"azerty"
                },
                "age":form.age,
                "famille":form.famille,
                "race":form.race,
                "nourriture":form.nourriture
              }
            }
    }).then(function(response){
      console.log(response.data);
      $http({
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:8000/api/add/"+response.data,
        "method": "GET",
        "headers": {
          "Authorization": "Bearer "+$rootScope.token,
          "Cache-Control": "no-cache"
        }
      }).then(function(response){
        //console.log(response);
        $location.path("/app");

      })

      //$location.path("/");
    })
  }
})
