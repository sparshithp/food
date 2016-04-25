app.controller('ProfileCtrl', function($scope, $auth, $alert, Account) {

	$scope.getProfile = function(){
		Account.getProfile()
			.success(function(data){
				$scope.user = data;
			}).error(function(err){
				$alert({
					content: err.message,
					animation: 'fadeZoomFadeDown',
					type: 'material',
					duration: 3
				})
			});
	};

	$scope.updateProfile = function(){
		Account.updateProfile({
			displayName: $scope.user.displayName,
			email: $scope.user.email
		}).then(function(){
			$alert({
				content: 'Profile updated!',
				animation: 'fadeZoomFadeDown',
				type: 'material',
				duration: 3
			})
		})
	};

	// link 3rd party provider
	$scope.link = function(provider){
		$auth.link(provider)
	        .then(function() {
	          $alert({
	            content: 'You have successfully linked ' + provider + ' account',
	            animation: 'fadeZoomFadeDown',
	            type: 'material',
	            duration: 3
	          });
	        })
	        .then(function() {
	          $scope.getProfile();
	        })
	        .catch(function(response) {
	          $alert({
	            content: response.data.message,
	            animation: 'fadeZoomFadeDown',
	            type: 'material',
	            duration: 3
	          });
	        });
	};

	// Unlink 3rd party provider
	$scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function() {
          $alert({
            content: 'You have successfully unlinked ' + provider + ' account',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        })
        .then(function() {
          $scope.getProfile();
        })
        .catch(function(response) {
          $alert({
            content: response.data ? response.data.message : 'Could not unlink ' + provider + ' account',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        });
    };

    $scope.getProfile();

});