'use strict';
var user = null;
var profile = null;
var token = null;
var app = angular.module("myApp", ["ngRoute"])
.config(function($routeProvider) {
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
})
.controller("LoginCtrl", function($scope, $http, $location, $rootScope){
  //console.log("$scope", $scope);
  $scope.sending = false;
  if (token !== null) {
    console.log("token not null");
    $location.path("/app");
  }
  $scope.login = function(form){
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
      $scope.sending = true;
      //console.log("RES", response.data.token);
      $rootScope.token = response.data.token;
      token = response.data.token;
      //console.log(token);
      $location.path("/app");
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
.controller("AppCtrl", function($scope, $http, $location, $rootScope){
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
  $scope.getUser = function(id){
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

  $scope.viewProfile = function(){
      $scope.profile = profile;
      //console.log($scope.profile);
      $location.path("/profile");
  }

  $scope.viewListe = function(){
      //console.log($scope.profile);
      $location.path("/liste");
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
    }else {
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
      //console.log(response);
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

  $scope.updateProfile = function(profile){
    console.log(profile);
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
  $scope.getUser = function(id){
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
})
