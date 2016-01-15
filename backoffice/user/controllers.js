
const userModule = require('./module');

userModule.controller('UserManageController', ($scope, $http, $state, $rootScope, $translate) => {
  $scope.contentTitle = $translate.instant('user.manage.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'user.main',
      name: $translate.instant('user.manage.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.newUser = {};
  $scope.createUser = (user) => {
    $http.post('/api/v1/users', user).then(() => {
      $scope.closeUserPopup();
    }, (res) => {
      window.alert(res.data.message);
    });
  };
  $scope.closeUserPopup = () => {
    $('#user_manage_create_user').modal('hide');
  };

});
