
angular.module('toastDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdToast, $animate) {
  
  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };

  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  $scope.complexToastIt = function() {
    $mdToast.custom().show({
      controller: 'ToastCtrl',
      templateUrl: 'toast-template.html',
      hideDelay: 6000,
      position: $scope.getToastPosition()
    });
  };

  $scope.toastIt = function() {
    $mdToast.basic('Hello world')
    .position($scope.getToastPosition())
    .hideDelay(0)
    .show();
  };

  $scope.toastAction = function() {
    $mdToast.basic('Hello world')
    .action('Click me')
    .highlightAction(false)
    .position($scope.getToastPosition())
    .show().then(function() {
      alert('Action clicked!');
    });
  };

})

.controller('ToastCtrl', function($scope, $mdToast) {
  $scope.closeToast = function() {
    $mdToast.hide();
  };
});
