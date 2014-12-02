'use strict';

angular.module('secretSantaApp')
.directive('userPhoto', function (parseUserService) {
	return {
		restrict: 'EA',
		template: '<img src="{{photo}}" alt="" class="profileImage img-responsive">',
		scope: {
			facebookId: '='
		},
		link: function (scope, element, attrs) {
			scope.$watch('facebookId', function (updatedId) {
				if (updatedId) {
					parseUserService.getPhoto(updatedId)
					.then(function (data) {
						scope.photo = data
					})
				}
			})
		}
	}
})