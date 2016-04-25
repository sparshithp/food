app.controller('LogoutCtrl', function($auth, $alert, $state) {
  $auth.logout()
    .then(function() {
      $alert({
        content: 'You have been logged out',
        animation: 'fadeZoomFadeDown',
        type: 'material',
        duration: 3
      });
        $state.go('home');
    });
});