
const userModule = require('./module');

userModule.controller('UserManageController', ($scope, $http, $q, $state, $rootScope, $translate) => {
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
      $http.post(`/api/v1/users/${res.data.id}/roles`, $scope.newUserRole).then(() => {
        $scope.closeUserPopup();
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
    $('#user_manage_create_user').modal('hide');
    $('#user_manage_create_user').removeClass('in');
    $('.modal-backdrop').remove();
  };
  $scope.editRole = { admin: false, buyer: false, seller: false };
  $scope.makeUserRolePopupData = (user) => {
    const res = { admin: false, buyer: false, seller: false };
    if (user.roles) {
      for (let i = 0; i < user.roles.length; i++) {
        const role = user.roles[i];
        if (role.type === 'admin') {
          res.admin = true;
        } else if (role.type === 'buyer') {
          res.buyer = true;
        }
      };
    }
    $scope.editRole = res;
  };
  $scope.closeRolePopup = () => {
    $('#user_change_role').modal('hide');
    $('#user_change_role').removeClass('in');
    $('.modal-backdrop').remove();
  };
  $scope.newUserPopup = {};
  $scope.newUseris = (role) => {
    $scope.newUserPopup.name = $translate.instant(`user.createUser.${role}`);
    $scope.newUserRole = { roleType: role };
  };

  const userIdToData = {};

  $scope.datatablesLoaded = () => {
    const datas = $('#user_list').find('table').DataTable().rows().data();
    const children = $('#user_list').find('tbody').children();
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      userIdToData[data.id] = data;

      const child = children[i];
      $(child).css('cursor', 'pointer');
      $(child).click((e) => {
        const userId = $(e.target).closest('tr').attr('id');
        const user = userIdToData[userId];
        $scope.editRoleUser = user;
        $scope.makeUserRolePopupData(user);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        $('#user_change_role').modal();
      });
    }
  };

  // 2016. 02. 23. [heekyu] this is very limited since server cannot handle race condition properly
  $scope.saveRole = () => {
    const editRoleToData = () => {
      if ($scope.editRole.admin) {
        return [{ type: 'admin' }];
      } else if ($scope.editRole.buyer) {
        return [{ type: 'buyer' }];
      }
      return null;
    };
    const newRoleData = editRoleToData();
    if (!newRoleData && !$scope.editRoleUser.roles) {
      return;
    }
    const addOrDelete = {};

    const isChangable = (roleType) => {
      if (roleType === 'admin' || roleType === 'buyer') {
        return true;
      }
      return false;
    };

    ($scope.editRoleUser.roles || []).forEach((role) => {
      if (!isChangable(role.type)) {
        return;
      }
      if (addOrDelete[role.type]) {
        addOrDelete[role.type]--;
      } else {
        addOrDelete[role.type] = -1;
      }
    });
    (newRoleData || []).forEach((role) => {
      if (!isChangable(role.type)) {
        return;
      }
      if (addOrDelete[role.type]) {
        addOrDelete[role.type]++;
      } else {
        addOrDelete[role.type] = 1;
      }
    });
    const url = `/api/v1/users/${$scope.editRoleUser.id}/roles`;
    const keys = Object.keys(addOrDelete);
    const addRoles = [];
    const deleteRoles = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const count = addOrDelete[key];
      if (count === 1) {
        addRoles.push(key);
        // promises.push($http.post(url, { roleType: key }));
      } else if (count === -1) {
        deleteRoles.push(key);
        // promises.push($http.delete(url, { data: { type: key }, headers: {"Content-Type": "application/json;charset=utf-8"} }));
      }
    }
    if (deleteRoles.length > 0) {
      $http.delete(url, { data: { type: deleteRoles[0] }, headers: {"Content-Type": "application/json;charset=utf-8"} }).then(() => {
        if (addRoles.length > 0) {
          $http.post(url, { roleType: addRoles[0] }).then(() => {
            $scope.closeRolePopup();
            $state.reload();
          }).catch((err) => {
            window.alert(err.message);
          });
        } else {
          $scope.closeRolePopup();
          $state.reload();
        }
      }).catch((err) => {
        window.alert(err.message);
      });
    } else if (addRoles.length > 0) {
      $http.post(url, { roleType: addRoles[0] }).then(() => {
        $scope.closeRolePopup();
        $state.reload();
      }).catch((err) => {
        window.alert(err.message);
      });
    } else {
      $scope.closeRolePopup();
    }
  };
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
