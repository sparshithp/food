var app = angular.module('hubChat', [ 
  'ui.router', 
  'satellizer', 
  'mgcrea.ngStrap',
  'pubnub.angular.service',
  'ngMessages',
  'ngAnimate'
]);

app.config(function($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/home.html'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .state('logout', {
        url: '/logout',
        template: null,
        controller: 'LogoutCtrl'
      })
        .state('upcoming', {
            url: '/upcoming',
            templateUrl: 'views/upcoming.html',
            controller: 'UpcomingCtrl'
        })
      .state('profile', {
        url: '/profile',
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl',
        resolve: {
          authenticated: ['$location', '$auth', function($location, $auth) {
            if (!$auth.isAuthenticated()) {
              return $location.path('/login');
            }
          }]
        }
      });

    $urlRouterProvider.otherwise('/');

    $authProvider.loginUrl = "http://localhost:3000/auth/login";
    $authProvider.signupUrl = "http://localhost:3000/auth/signup";


  });