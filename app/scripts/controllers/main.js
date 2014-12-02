'use strict';

/**
 * @ngdoc function
 * @name secretSantaApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the secretSantaApp
 */
angular.module('secretSantaApp')
.controller('MainCtrl', function ($scope, parseUserService, $location) {
	$scope.userData = {}

	$scope.signUp = function () {
		parseUserService.createAccount($scope.userData)
		.then(function (res) {
			console.log(res)
		})
	}
	$scope.signUpFacebook = function () {
		parseUserService.createFacebookAccount()
		.then(signUpSuccess)
	}
	function signUpSuccess (data) {
		$location.path('newGroup')
	}
	function signUpError (data) {
		// parseUserService.createFacebookAccount()
		// .then(signUpSuccess, signUpError)
		console.log(data)
	}
})
.controller('newGroupCtrl', function ($scope, $location, addFriendsService, createSecretSanta) {
	$scope.message = "";
	$scope.friends = [];
	var user = Parse.User.current()
	console.log(user)
	
	addFriendsService.getFacebookFriends()
	.then(addFriends)

	function addFriends (friendsObj) {
		console.log(friendsObj);
		$scope.friends = friendsObj.data;
		if (!$scope.friends.length) {
			$scope.message = "Share the App and invite your friends to play"
		}
	}

	$scope.selectedUsers = [{id: user.attributes.information.id, name: user.attributes.information.name}]
	$scope.price = 0;

	$scope.addFriend = function (friend, index) {
		$scope.friends[index].selected = true;
		$scope.selectedUsers.push(friend)
	}
	$scope.removeFriend = function (friend, index) {
		$scope.friends[index].selected = false;
		$scope.selectedUsers.slice($scope.selectedUsers.indexOf(friend.id), 1)
		console.log($scope.selectedUsers)
	}
	$scope.createGame = function () {
		$scope.message = ""
		createSecretSanta.addGroup($scope.selectedUsers, $scope.price, $scope.title)
		.then(createSuccess, createError)
	}
	function createSuccess (gameObj) {
		$location.path('games')
	}
	function createError (error) {
		$scope.message = error;
	}

})
.controller('gamesCtrl', function ($scope, $location, userGamesService) {
	userGamesService.getUsersGames()
	.then(showGames)

	$scope.goToGame = function (gameId) {
		$location.path('games/' + gameId)
	}

	function showGames (games) {
		if (games.length) {
			$scope.games = games;
			console.log(games)
		} else {
			$location.path('newGroup')
		}
	}
})
.controller('gameCtrl', function ($scope, $location, gameId, userGamesService, parseUserService) {
	
	var user = Parse.User.current()
	init()

	function init () {
		userGamesService.getGame(gameId)
		.then(setGame)
		.then(setCurrentUser)
	}
	function setGame (game) {
		$scope.game = game;
		$scope.gameAuthorization = userGamesService.getPercentAuthorized(game)
		return $scope.game;
	}
	function setCurrentUser (game) {
		if ($scope.gameAuthorization.total == $scope.gameAuthorization.auth) {
			$scope.setAuthorized = true;
			userGamesService.randomlySelectPartner(game)
			.then(userGamesService.getPartner)
			.then(parseUserService.addPhoto)
			.then(showPartner)
		} else {
			$scope.setAuthorized = game.attributes.gameData[user.attributes.facebookId].authorized;
		}
	}
	function showPartner (partner) {
		$scope.partner = partner
	}

	$scope.authorize = function () {
		userGamesService.authorizeGame(user.attributes.information.id, gameId)
		.then(init)
	}
})
.controller('addPhotoCtrl', function ($scope, $location, parseUserService, DEFAULT_PHOTO, userPhoto) {
	var defaultPhoto = (userPhoto)?userPhoto:DEFAULT_PHOTO;

	$scope.user = Parse.User.current()
	
	$scope.photo = defaultPhoto
	$scope.photoChosen = false;
	
	var base64 = ''
	$scope.$on('fileSelected', function (event, data) {
		$scope.$apply(function () {
			base64 = data.url;
			$scope.photo = 'data:image/png;base64,'+base64;
			$scope.photoChosen = true;
		})
	})

	function proceed () {
		parseUserService.savePhoto(base64)
		.then(function () {
			$location.path('games')
		})
	}

	$scope.useDefault = function () {
		$scope.photoChosen = true;
		if ($scope.photo == defaultPhoto) {
			proceed()
		} else {
			$scope.photo = defaultPhoto
		}
	}

	$scope.savePhoto = function () {
		proceed()
	}
})
