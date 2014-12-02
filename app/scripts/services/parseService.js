angular.module('secretSantaApp')

.factory('parseService', function ($window, $location, $timeout, parseUserService) {
	return function () {
		Parse.initialize("Levf5DgpFH6TSijddwtPrDntpyCvYfI3XgWEbluP", "Giwc1BK09snyVjebMhmFAFRJzcZfB8zi5WQTjFex");

		$window.fbAsyncInit = function() {
		    Parse.FacebookUtils.init({ // this line replaces FB.init({
		      appId      : '622191047891429', // Facebook App ID
		      version    : 'v2.1',
		      status     : true, // check Facebook Login status
		      cookie     : true, // enable cookies to allow Parse to access the session
		      xfbml      : true
		    });
		    // Run code after the Facebook SDK is loaded.
		    FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					parseUserService.hasPhoto()
					.then(goToGames, goToAddPhoto)
				}
			})
		};
		function goToGames () {
			$location.path('games')
		}
		function goToAddPhoto () {
			$location.path('addPhoto')
		}
		 
		(function(d, s, id){
		    var js, fjs = d.getElementsByTagName(s)[0];
		    if (d.getElementById(id)) {return;}
		    js = d.createElement(s); js.id = id;
		    js.src = "//connect.facebook.net/en_US/sdk.js";
		    fjs.parentNode.insertBefore(js, fjs);
	  	}(document, 'script', 'facebook-jssdk'));
	}	
})