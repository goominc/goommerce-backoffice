
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

  $scope.userDatatables = {
    field: '',
    url: '/api/v1/users',
    columns: [
      {
        data: 'id',
      },
      {
        data: 'email',
      },
      {
        data: 'roles',
        render: (roles) => {
          if (!roles) return '';
          return JSON.stringify(roles);
        }
      },
    ],
  };

  $scope.newUser = {};
  $scope.createUser = (user) => {
    $http.post('/api/v1/users', user).then((res) => {
      console.log(res);
      $http.post(`/api/v1/users/${res.data.id}/roles`, $scope.newUserRole).then(() => {
        // $scope.closeUserPopup();
        $state.reload();
      }).catch((err) => {
        window.alert(err.data.message);
      });
      $state.reload();
    }, (err) => {
      window.alert(err.data.message);
    });
  };
  $scope.closeUserPopup = () => {
    // 2016. 02. 23. [heekyu] modal hide is not work on page reload
    // $('#user_manage_create_user').modal('hide');
    $('.modal').removeClass('in');
    $('.modal-backdrop').remove();
  };
  $scope.newUserPopup = {};
  $scope.newUseris = (role) => {
    $scope.newUserPopup.name = $translate.instant(`user.createUser.${role}`);
    $scope.newUserRole = { roleType: role };
  };
  $scope.closeUserPopup();
});

userModule.controller('UserWaitConfirmController', ($scope, $state, $rootScope, $translate) => {
  $scope.contentTitle = $translate.instant('user.waitConfirm.title');
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
    {
      sref: 'user.waitConfirm',
      name: $translate.instant('user.waitConfirm.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);
});
