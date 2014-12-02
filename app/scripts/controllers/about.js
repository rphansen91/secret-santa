'use strict';

/**
 * @ngdoc function
 * @name secretSantaApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the secretSantaApp
 */
angular.module('secretSantaApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
