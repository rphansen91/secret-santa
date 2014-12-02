'use strict';

/**
 * @ngdoc overview
 * @name secretSantaApp
 * @description
 * # secretSantaApp
 *
 * Main module of the application.
 */
angular
  .module('secretSantaApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .run(function (parseService) {
    parseService()
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/newGroup', {
        templateUrl: 'views/newGroup.html',
        controller: 'newGroupCtrl'
      })
      .when('/games', {
        templateUrl: 'views/games.html',
        controller: 'gamesCtrl'
      })
      .when('/games/:id', {
        templateUrl: 'views/game.html',
        controller: 'gameCtrl',
        resolve: {
          gameId: function ($route) {
            return $route.current.params.id;
          }
        }
      })
      .when('/addPhoto', {
        templateUrl: 'views/addPhoto.html',
        controller: 'addPhotoCtrl'
      })
      .when('/profile', {
        templateUrl: 'views/addPhoto.html',
        controller: 'addPhotoCtrl',
        resolve: {
          userPhoto: function (parseUserService) {
            return parseUserService.getPhoto()
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  });
