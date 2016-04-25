/**
 * Created by sparshithp on 2/7/16.
 */
app.controller('UpcomingCtrl', function($scope, $auth, $alert, $http) {

    $scope.listMatches = function(){
        $http.get('http://localhost:3000/match/list')
            .success(function(data){
            console.log(data);
                $scope.matches=data;
        }).error(function(err) {
            $alert({
                content: err.message,
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
            })
        });
    };

    $scope.listMatches();

});