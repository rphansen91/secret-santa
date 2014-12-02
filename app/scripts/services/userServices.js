angular.module('secretSantaApp')
.factory('parseUserService', function($q, $location, DEFAULT_IMAGE){
	var factory = {}

	factory.createAccount = function (userData) {
		var defer = $q.defer();
		var user = new Parse.User();
		var username = userData.email.slice(0, userData.email.indexOf('@'))
		user.set("username", username);
		user.set("password", userData.password);
		user.set("email", userData.email);
		user.signUp(null, {
		success: function(user) {
			defer.resolve(user)
		},
		error: function(user, error) {
			// Show the error message somewhere and let the user try again.
			defer.reject(error.message)
		}
		})
		return defer.promise;
	}

	factory.createFacebookAccount = function () {
		var defer = $q.defer();
		Parse.FacebookUtils.logIn('user_friends,public_profile', {
			success: function(user) {
		  		console.log(user)
		    	if (!user.existed()) {
		    		factory.addUserData()
		    		.then(function (data) {
		    			user.set("information", data)
		    			user.set("facebookId", data.id)
		    			user.save(null, {
		    				success: function (user) {
		    					defer.resolve(user)
		    				}
		    			})
		    		})
		    	} else {
		        	defer.resolve(user)
		    	}
		  	},
		  	error: function(user, error) {
		  		defer.reject(error.message)
		  	}
		});
		return defer.promise;
	}

	factory.addUserData = function () {
		var defer = $q.defer()
		FB.api('/me', {}, function (response) {
			defer.resolve(response)
		})
		return defer.promise;
	}

	factory.getLoginStatus = function () {
		var defer = $q.defer();
		FB.getLoginStatus(function(response) {
			console.log(response)
		    defer.resolve(response);
		})
		return defer.promise;
	}

	factory.addPhoto = function (user) {
		var defer = $q.defer()
		factory.hasPhoto(user.attributes.facebookId)
		.then(pushPhoto, pushDefault)

		function pushPhoto (data) {
			user.attributes.photo = data;
			defer.resolve(user)
		}
		function pushDefault () {
			user.attributes.photo = DEFAULT_IMAGE;
			defer.resolve(user)
		}
		return defer.promise;
	}

	factory.getPhoto = function (facebookId) {
		var defer = $q.defer()
		factory.hasPhoto(facebookId)
		.then(pushPhoto, pushDefault)

		function pushPhoto (data) {
			defer.resolve(data)
		}
		function pushDefault () {
			defer.resolve(DEFAULT_IMAGE)
		}
		return defer.promise;
	}

	factory.hasPhoto = function (facebookId) {
		facebookId = (facebookId)?facebookId:Parse.User.current().attributes.facebookId;
		var defer = $q.defer();
		var profilePhoto = Parse.Object.extend("ProfilePhoto");
		var query = new Parse.Query(profilePhoto);
		query.equalTo("facebookId", facebookId);
		query.first({
			success: function (data) {
				if (data) {
					defer.resolve(data.attributes.image._url)
				} else {
					defer.reject(data)
				}
			},
			error: function (data) {
				defer.reject(data)
			}
		})
		return defer.promise;
	}

	factory.savePhoto = function (base64) {
		var defer = $q.defer();
		var ProfilePhoto = Parse.Object.extend("ProfilePhoto");
		var profilePhoto = new ProfilePhoto();
		var facebookId = Parse.User.current().attributes.facebookId;
		console.log(facebookId)
		var file = new Parse.File("image", {base64: base64});
		profilePhoto.set("facebookId", facebookId);
		profilePhoto.set("image", file);
		profilePhoto.save(null, {
			success: function (data) {
				console.log(data)
				defer.resolve(data)
			},
			error: function (err) {
				console.log(err)
				defer.resolve(data)
			}
		})
		return defer.promise;
	}

	return factory;
})
.factory('addFriendsService', function ($q, $location, parseUserService) {
	var factory = {}

	factory.getAllUsers = function () {
		var defer = $q.defer();
		var query = new Parse.Query(Parse.User);
		query.find({
			success: function(response) {
				defer.resolve(response);
			}
		});
		return defer.promise;
	}

	factory.getFacebookFriends = function () {
		var defer = $q.defer();
		try {
			FB.api("/me/friends",
		    function (response) {
				if (response && !response.error) {
					defer.resolve(response);
				} else {
					defer.reject(response)
				}
		    });
		} catch (err) {
			defer.reject()
			$location.path('/')
		}
	    return defer.promise;
	}

	return factory;
})

// .filter('userPhoto', function (parseUserService) {
// 	return function (facebookId) {
// 		parseUserService.getPhoto(facebookId)
// 		.then(function (data) {
// 			return data;
// 		})
// 	}
// })