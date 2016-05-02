
const userModule = require('./module');

userModule.controller('UserManageController', ($scope, $http, $q, $state, $rootScope, $translate, $compile, userUtil, boUtils) => {
  $scope.contentTitle = $translate.instant('user.manage.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'user.manage',
      name: $translate.instant('user.manage.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.tabName = $state.params.tabName || '';
  $scope.changeTab = (tabName) => {
    if (!tabName) {
      $state.go('user.manage', {}, { reload: true });
      return;
    }
    $state.go('user.manage.tab', { tabName }, { reload: true });
  };

  $scope.userDatatables = {
    field: 'users',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return `<a ui-sref="user.info({ userId: ${id} })">${id}</a>`;
        },
      },
      {
        data: 'email',
      },
      {
        data: (data) => data,
        render: (user) => {
          return userUtil.getRoleName(user);
        },
      },
      {
        // edit role button
        data: 'id',
        render: (id) => {
          return `<button class="btn blue" data-ng-click="openRolePopup(${id})"><i class="fa fa-wrench"></i> ${$translate.instant('user.info.editRoleButton')}</button>`;
        },
      },
      {
        // show user info button
        data: 'id',
        render: (id) => {
          return `<a ui-sref="user.info({ userId: ${id} })"><button class="btn blue"><i class="fa fa-info"></i> ${$translate.instant('user.info.userDetailButton')}</button></a>`;
        },
      },
      {
        data: 'id',
        render: (id) => `<button class="btn blue" data-ng-click="openPasswordPopup(${id})"><i class="fa fa-password"></i> ${$translate.instant('user.info.changePasswordButton')}</button>`,
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
    ],
  };

  $scope.buyerDatatables = {
    field: 'users',
    // ID, Email, Name, tel, bizName, bizNumber
    columns: [
      {
        data: 'id',
        render: (id) => {
          return `<a ui-sref="user.info({ userId: ${id} })">${id}</a>`;
        },
      },
      {
        data: 'email',
      },
      {
        data: (data) => data.name || '',
      },
      {
        data: (data) => _.get(data, 'data.tel') || '',
      },
      {
        data: (data) => _.get(data, 'data.bizName') || '',
      },
      {
        data: (data) => _.get(data, 'data.bizNumber') || '',
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
    ],
  };

  $scope.sellerDatatables = {
    field: 'users',
    // ID, Email, Name, tel
    columns: [
      {
        data: 'id',
        render: (id) => {
          return `<a ui-sref="user.info({ userId: ${id} })">${id}</a>`;
        },
      },
      {
        data: (data) => _.get(data, 'roles[0].brand.id') || '',
        render: (brandId) => `<a ui-sref="brand.edit({ brandId: ${brandId} })">${brandId}</a>`,
      },
      {
        data: 'email',
      },
      {
        data: (data) => data.name || '',
      },
      {
        data: (data) => _.get(data, 'data.tel') || '',
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
    ],
  };

  $scope.noRoleDatatables = {
    field: 'users',
    // ID, Email, Name, tel, bizName, bizNumber, bizImage, changeToBuyer(action)
    columns: [
      {
        data: 'id',
        render: (id) => {
          return `<a ui-sref="user.info({ userId: ${id} })">${id}</a>`;
        },
      },
      {
        data: 'email',
      },
      {
        data: (data) => data.name || '',
      },
      {
        data: (data) => _.get(data, 'data.tel') || '',
      },
      {
        data: (data) => _.get(data, 'data.bizName') || '',
      },
      {
        data: (data) => _.get(data, 'data.bizNumber') || '',
      },
      {
        data: (data) => data,
        render: (user) => _.get(user, 'data.bizImage')
          ? `<button class="btn blue" data-ng-click="openBizImage(${user.id})">사업자 등록증 보기</button>` : '',
      },
      {
        data: (data) => data,
        render: (user) => `<button class="btn blue" data-ng-click="changeToBuyer(${user.id})">바이어 인증</button>`,
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
    ],
  };

  $scope.openBizImage = (userId) => {
    $scope.activeUser = $scope.userIdToData[userId];
    $('#user_biz_image').modal();
  };

  $scope.changeToBuyer = (userId) => {
    $http.post(`/api/v1/users/${userId}/roles`, { roleType: 'buyer' }).then(() => {
      window.alert('바이어 인증이 완료되었습니다');
      $state.reload();
    });
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

  $scope.editRole = { admin: false, buyer: false, bigBuyer: false, seller: false };
  // former item has more priority
  const roles = ['admin', 'bigBuyer', 'buyer'];
  $scope.makeUserRolePopupData = (user) => {
    const res = { admin: false, buyer: false, bigBuyer: false, seller: false };
    if (user.roles) {
      for (let i = 0; i < user.roles.length; i++) {
        const role = user.roles[i];
        roles.forEach((item) => {
          if (role.type === item) {
            res[item] = true;
          }
        });
        if (role.type === 'owner') {
          res.seller = true;
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

  $scope.openRolePopup = (userId) => {
    const user = $scope.userIdToData[userId];
    $scope.editRoleUser = user;
    $scope.makeUserRolePopupData(user);
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $('#user_change_role').modal();
  };

  $scope.changePasswordUser = null;
  $scope.openPasswordPopup = (userId) => {
    const user = $scope.userIdToData[userId];
    $scope.changePasswordUser = user;
    $('#user_change_password').modal();
  };
  $scope.closePasswordPopup = () => {
    $('#user_change_password').modal('hide');
  };
  $scope.savePassword = () => {
    const user = $scope.changePasswordUser;
    if (!user.password) {
      window.alert('비밀번호를 입력하세요');
      return;
    }
    const password = user.password;
    delete user.password;
    $http.put(`/api/v1/users/${user.id}/reset_password`, { password }).then(() => {
      window.alert('비밀번호 저장되었습니다');
      $scope.closePasswordPopup();
    }, () => {
      window.alert('비밀번호 저장이 실패하였습니다.')
    });
  };

  $scope.datatablesLoaded = () => {
    const datas = $('.tabbable-bordered').find('table').DataTable().rows().data();
    if (!$scope.userIdToData) {
      $scope.userIdToData = {};
    }
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      $scope.userIdToData[data.id] = data;
    }
    $compile(angular.element($('table')))($scope);
  };

  // 2016. 02. 23. [heekyu] this is very limited since server cannot handle race condition properly
  $scope.saveRole = () => {
    const editRoleToData = () => {
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        if ($scope.editRole[role]) {
          return [ { type: role } ];
        }
      }
      return null;
    };
    const newRoleData = editRoleToData();
    if (!newRoleData && !$scope.editRoleUser.roles) {
      return;
    }
    const addOrDelete = {};

    const isChangable = (roleType) => {
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        if (role === roleType) {
          return true;
        }
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
      sref: 'user.manage',
      name: $translate.instant('user.manage.title'),
    },
    {
      sref: 'user.waitConfirm',
      name: $translate.instant('user.waitConfirm.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);
});

userModule.controller('UserInfoController', ($scope, $http, $state, $rootScope, $translate, user, userUtil, convertUtil) => {
  $scope.contentTitle = $translate.instant('user.info.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'user.manage',
      name: $translate.instant('user.manage.title'),
    },
    {
      sref: 'user.waitConfirm',
      name: $translate.instant('user.info.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  const init = (user) => {
    $scope.user = user;

    $scope.userFields = [
      {title: 'ID', key: 'id', obj: $scope.user.id, isReadOnly: true, isRequired: true},
      {title: $translate.instant('user.info.emailLabel'), obj: $scope.user.email, key: 'email', isReadOnly: true, isRequired: true},
      {title: $translate.instant('user.info.userTypeLabel'), obj: userUtil.getRoleName($scope.user), isReadOnly: true, isRequired: false},
      {title: $translate.instant('user.info.telLabel'), obj: _.get($scope.user, 'data.tel'), key: 'data.tel', isRequired: false},
      {title: $translate.instant('user.info.gradeLabel'), obj: _.get($scope.user, 'data.grade'), key: 'data.grade', isRequired: false},
      {title: $translate.instant('user.info.bizNameLabel'), obj: _.get($scope.user, 'data.bizName'), key: 'data.grade', isRequired: false},
      {title: $translate.instant('user.info.bizNumberLabel'), obj: _.get($scope.user, 'data.bizNumber'), key: 'data.grade', isRequired: false},
      {title: $translate.instant('user.info.vbankCodeLabel'), obj: _.get($scope.user, 'inipay.vbank.bank'), key: 'inipay.vbank.bank', isRequired: false},
      {title: $translate.instant('user.info.vbankAccountLabel'), obj: _.get($scope.user, 'inipay.vbank.vacct'), key: 'inipay.vbank.vacct', isRequired: false},
    ];
  };
  init(user);

  $scope.save = () => {
    convertUtil.copyFieldObj($scope.userFields, $scope.user);
    $http.put(`/api/v1/users/${$scope.user.id}`, _.pick($scope.user, 'data', 'inipay')).then((res) => {
      // init(res.data);
      $state.go('user.manage');
    });
  };

  $scope.openBizImage = () => {
    $('#user_biz_image').modal();
  };
});
