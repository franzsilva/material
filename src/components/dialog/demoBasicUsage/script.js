angular.module('dialogDemo1', ['ngMaterial'])

  .controller('AppCtrl', function($scope, $mdDialog) {
    $scope.alert = '';

  $scope.alertDialog = function(ev) {
    $mdDialog.alert()
      .title('This is an alert')
      .content('You can specify some description text in here')
      .ariaLabel('Password notification')
      .ok('Got it!')
      .targetEvent(ev)
    .show().then(function() {
      $scope.alert = "Alert was dismissed";
    });
  };

  $scope.confirmDialog = function(ev) {
    $mdDialog.confirm()
      .title('Would you like to delete your debt?')
      .content('All of the banks have agreed to drop all debt you have accumulated')
      .ariaLabel('Lucky day')
      .ok('Please do it!')
      .cancel('Sounds like a scam')
      .targetEvent(ev)
    .show().then(function() {
      $scope.alert = 'You decided to get rid of your debt';
    }, function() {
      $scope.alert = 'You decided to keep your debt';
    });
  };

  $scope.dialogAdvanced = function(ev) {
    $mdDialog.custom()
      .controller(DialogController)
    .show({
      templateUrl: 'dialog1.tmpl.html',
      targetEvent: ev,
    })
    .then(function(answer) {
      $scope.alert = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.alert = 'You cancelled the dialog.';
    });
  };
});

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}
