angular.module('secretSantaApp')

.factory('createSecretSanta', function ($q) {
	var factory = {}
	var SecretSanta = Parse.Object.extend("SecretSanta");
 
	factory.addGroup = function (friendsArr, price, title) {
		var defer = $q.defer();
		var secretSanta = new SecretSanta();
		var user = Parse.User.current()
		var params = []
		var gameData = {}
		if (friendsArr.length > 2 && price && title) {
			friendsArr.forEach(function (friend) {
				params.push(friend.id)
				gameData[friend.id] = {authorized: false, companion: null, user: friend.name, facebookId: friend.id}
			})
			secretSanta.set("title", title)
			secretSanta.set("priceLimit", price)
			secretSanta.set("participants", params)
			secretSanta.set("gameData", gameData)
			secretSanta.save(null, {
				success: function(result) {
				    defer.resolve(result)
				},
				error: function(result, error) {
				    defer.reject(error.message)
				}
			})
		} else if (!title) {
			defer.reject("Must have a title for this Secret Santa")
		} else if (!price) {
			defer.reject("Must have a price limit in order to have a Secret Santa")
		} else {
			defer.reject("Must have at least three people in order to have a Secret Santa")
		}
		return defer.promise;
	}

	return factory;
})
.factory('userGamesService', function($q, $filter) {
	var factory = {}

	factory.getUsersGames = function () {
		var defer = $q.defer();
		var user = Parse.User.current();
		var SecretSanta = Parse.Object.extend("SecretSanta");
		var query = new Parse.Query(SecretSanta);
		query.equalTo("participants", user.attributes.information.id);
		query.find({
			success: function(usersGames) {
				defer.resolve(usersGames)
			}
		});
		return defer.promise;
	}
	factory.getGame = function (gameId) {
		var defer = $q.defer();
		var SecretSanta = Parse.Object.extend("SecretSanta");
		var query = new Parse.Query(SecretSanta);
		query.equalTo("objectId", gameId);
		query.first({
			success: function (data) {
				defer.resolve(data)
			}
		})
		return defer.promise;
	}

	factory.getPercentAuthorized = function (game) {
		var count = {total: 0, auth: 0}
		var data = game.attributes.gameData;
		for (var id in data) {
			count.total++;
			if (data[id].authorized) {count.auth++}
		}
		return count;
	}

	factory.authorizeGame = function (userId, gameId) {
		var defer = $q.defer();
		var SecretSanta = Parse.Object.extend("SecretSanta");
		var query = new Parse.Query(SecretSanta);
		query.equalTo("objectId", gameId);
		query.first({
			success: function (game) {
				var data = game.get("gameData")
				data[userId].authorized = true;
				game.set("gameData", data)
				game.save(null, {
					success: function () {
						defer.resolve()
					}
				})
			}
		})
		return defer.promise;
	}

	factory.randomlySelectPartner = function (game) {
		console.log(game)
		var user = Parse.User.current()
		var defer = $q.defer()
		if (game.attributes.gameData[user.attributes.facebookId].companion) {
			defer.resolve(game.attributes.gameData[user.attributes.facebookId].companion)
		} else {
			factory.sortUsers(game)
			.then(factory.randomlySelectPartner)
		}
		return defer.promise;
	}

	factory.getPartner = function (facebookId) {
		console.log(facebookId)
		var defer = $q.defer()
		var query = new Parse.Query(Parse.User);
		query.equalTo("facebookId", facebookId);
		query.first({
			success: function (partner) {
				defer.resolve(partner)
			}
		})
		return defer.promise;
	}

	factory.sortUsers = function (data) {
		var defer = $q.defer()
		var order = $filter('orderBy')(data.attributes.participants)
		var SecretSanta = Parse.Object.extend("SecretSanta");
		var query = new Parse.Query(SecretSanta);
		query.equalTo("objectId", data.id);
		query.first({
			success: function (currentGame) {
				order.forEach(function (id, index) {
					index = (index+1 == order.length)?0:index+1;
					data.attributes.gameData[id].companion = order[index]
				})
				currentGame.set("gameData", data.attributes.gameData)
				currentGame.save(null, {
					success: function (newData) {
						defer.resolve(newData)
					}
				})
			}
		})
		return defer.promise;
	}

	return factory;
})