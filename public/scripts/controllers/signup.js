app.controller('SignupCtrl', function($scope, $auth) {
    $scope.signup = function() {
      $auth.signup({
      	fullName: $scope.fullName,
        email: $scope.email,
        password: $scope.password
      });
    };
});