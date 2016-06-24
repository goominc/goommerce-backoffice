
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

  $('#user_start_date').datepicker({ autoclose: true });
  $('#user_end_date').datepicker({ autoclose: true });
  $('#user_start_date').on('change', (e) => {
    _.set($rootScope, 'state.userMain.startDate', $('#user_start_date').val());
    $state.reload();
    // reloadDatatables();
  });
  $('#user_end_date').on('change', (e) => {
    _.set($rootScope, 'state.userMain.endDate', $('#user_end_date').val());
    $state.reload();
    // reloadDatatables();
  });

  $scope.fnUrlParams = (urlParams) => {
    const queryParams = {};
    // 2016. 06. 22. [heekyu] start, end is common for all datatables
    const startDate = _.get($rootScope.state, `userMain.startDate`);
    const endDate = _.get($rootScope.state, `userMain.endDate`);
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = end.getTime() - start.getTime();
      if (diff >= 0) {
        queryParams.start = startDate;
        queryParams.end = endDate;
      } else {
        window.alert('시작 날짜가 종료 날짜와 같거나 더 작아야 합니다');
      }
    }
    _.merge(urlParams, queryParams);
  };

  $scope.tabName = $state.params.tabName || '';
  $scope.changeTab = (tabName) => {
    if (!tabName) {
      $state.go('user.manage', {}, { reload: true });
      return;
    }
    $state.go('user.manage.tab', { tabName }, { reload: true });
  };
  $scope.userIdMap = {};

  $scope.userDatatables = {
    field: 'users',
    storeKey: 'userMain',
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
      {
        data: (data) => data,
        render: (user) => {
          $scope.userIdMap[user.id] = user;
          return `<button class="btn red" data-ng-click="inactivateUser($event, ${user.id})">비활성화</button>`;
        },
      },
    ],
  };

  $scope.buyerDatatables = {
    field: 'users',
    storeKey: 'userBuyer',
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
    storeKey: 'userSeller',
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
    storeKey: 'userNoRole',
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
        // render: (user) => `<button class="btn blue" data-ng-click="changeToBuyer(${user.id})">바이어 인증</button>`,
        render: (user) => `<button class="btn blue" data-ng-click="openBuyerApproval(${user.id})">바이어 인증</button>`
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
    ],
  };

  $scope.inactiveDatatables = {
    field: 'users',
    storeKey: 'userInactive',
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
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
      {
        data: (data) => data,
        render: (user) => {
          $scope.userIdMap[user.id] = user;
          return `<button class="btn blue" data-ng-click="activateUser($event, ${user.id})">활성화</button>`;
        },
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
      ($scope.newUserRole ? $http.post(`/api/v1/users/${res.data.id}/roles`, $scope.newUserRole) : $q.when(true)).then(() => {
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
    $scope.newUserPopup.name = $translate.instant(`user.createUser.${role || 'user'}`);
    if (role) {
      $scope.newUserRole = { roleType: role };
    } else {
      $scope.newUserRole = null;
    }
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

  $scope.inactivateUser = (e, userId) => {
    e.preventDefault();
    const user = $scope.userIdMap[userId];
    if (window.confirm(`유저 ${user.name || ''} 비활성화 하시겠습니까?`)) {
      $http.delete(`/api/v1/users/${user.id}/inactivate`).then(() => {
        user.isActive = !user.isActive;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        $('.tabbable-bordered').find('table').DataTable().ajax.reload();
      }, () => {
        window.alert('fail');
      });
    }
  };

  $scope.activateUser = (e, userId) => {
    e.preventDefault();
    const user = $scope.userIdMap[userId];
    if (window.confirm(`유저 ${user.name || ''} 다시 활성화 하시겠습니까?`)) {
      $http.put(`/api/v1/users/${user.id}`, { isActive: true }).then(() => {
        /*
        user.isActive = !user.isActive;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        */
        $('.tabbable-bordered').find('table').DataTable().ajax.reload();
      }, () => {
        window.alert('fail');
      });
    }
  };

  $scope.openBuyerApproval = (userId) => {
    $scope.buyerApprovalUser = $scope.userIdToData[userId];
    $('#user_buyer_approval').modal();
  };
  $scope.closeBuyerApproval = () => {
    // 2016. 02. 23. [heekyu] modal hide is not work on page reload
    $('#user_buyer_approval').modal('hide');
    $('#user_buyer_approval').removeClass('in');
    $('.modal-backdrop').remove();
  };

  $scope.approveUser = (user) => {
    if (!user.message) {
      window.alert('승인 사유를 입력해 주세요');
      return;
    }
    const body = {
      result: 'approval',
      message: user.message,
    };
    $http.post(`/api/v1/users/${user.id}/approve`, body).then(() => {
      window.alert(`${user.name} 승인 완료되었습니다`);
      $scope.closeBuyerApproval();
      $state.reload();
    });
  };

  $scope.rejectUser = (user) => {
    if (!user.message) {
      window.alert('거절 사유를 입력해 주세요');
      return;
    }
    const body = {
      result: 'rejection',
      message: user.message,
    };
    $http.post(`/api/v1/users/${user.id}/approve`, body).then(() => {
      window.alert(`${user.name} 반려 되었습니다`);
      $scope.closeBuyerApproval();
      $state.reload();
    });
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

userModule.controller('UserInfoController', ($scope, $http, $state, $rootScope, $translate, user, boUtils, userUtil, convertUtil) => {
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
    user.lastLoginAt = boUtils.formatDate(user.lastLoginAt);
    $scope.user = user;

    $scope.userFields = [
      {title: 'ID', key: 'id', obj: $scope.user.id, isReadOnly: true, isRequired: true},
      {title: $translate.instant('user.info.emailLabel'), obj: $scope.user.email, key: 'email', isReadOnly: true, isRequired: true},
      {title: $translate.instant('user.info.lastNameLabel'), obj: _.get($scope.user, 'data.lastName'), isReadOnly: true, isRequired: true},
      {title: $translate.instant('user.info.firstNameLabel'), obj: _.get($scope.user, 'data.firstName'), isReadOnly: true, isRequired: true},
      {title: $translate.instant('user.info.userTypeLabel'), obj: userUtil.getRoleName($scope.user), isReadOnly: true, isRequired: false},
      {title: $translate.instant('user.info.telLabel'), obj: _.get($scope.user, 'data.tel'), key: 'data.tel', isRequired: false},
      {title: $translate.instant('user.info.gradeLabel'), obj: _.get($scope.user, 'data.grade'), key: 'data.grade', isRequired: false},
      {title: $translate.instant('user.info.bizNameLabel'), obj: _.get($scope.user, 'data.bizName'), key: 'data.bizName', isRequired: false},
      {title: $translate.instant('user.info.bizNumberLabel'), obj: _.get($scope.user, 'data.bizNumber'), key: 'data.bizNumber', isRequired: false},
      {title: $translate.instant('user.info.vbankCodeLabel'), obj: _.get($scope.user, 'inipay.vbank.bank'), key: 'inipay.vbank.bank', isRequired: false},
      {title: $translate.instant('user.info.vbankAccountLabel'), obj: _.get($scope.user, 'inipay.vbank.vacct'), key: 'inipay.vbank.vacct', isRequired: false},
      {title: $translate.instant('user.info.settlementAliasLabel'), obj: _.get($scope.user, 'data.settlement.alias'), key: 'data.settlement.alias', isRequired: false},
      {title: $translate.instant('user.info.orderNameLabel'), obj: _.get($scope.user, 'data.order.name'), key: 'data.order.name', isRequired: false},
    ];
    const roleType = _.get($scope.user, 'roles[0].type');
    const brand = _.get($scope.user, 'roles[0].brand');
    if ((roleType === 'owner' || roleType === 'staff') && brand) {
      $scope.myBrand = brand;
    }
  };
  init(user);

  $scope.noteType = {
    0: '-',
    100: '승인',
    101: '거절',
  };
  $http.get(`/api/v1/users/${user.id}/logs`).then((res) => {
    res.data.logs.forEach((l) => (l.createdAt = boUtils.formatDate(l.createdAt)));
    $scope.notes = res.data.logs.sort((a, b) => (a.id < b.id));
  });

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

  $scope.addNote = (message) => {
    $http.post(`/api/v1/users/${user.id}/logs`, {
      type: 0,
      data: { message },
    }).then((res) => {
      $state.reload();
    });
  };

  $('#image-upload-button').on('change', function (changeEvent) {
    boUtils.startProgressBar();
    const r = new FileReader();
    r.onload = function(e) {
      boUtils.uploadImage(e.target.result, `user/${$scope.user.id || 'none'}/${new Date().getTime()}`).then((res) => {
        boUtils.stopProgressBar();
        const uploaded = {
          url: res.url.slice(5),
          publicId: res.public_id,
          version: res.version,
        };
        _.set($scope.user, 'data.bizImage', uploaded);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, () => {
        window.alert('image upload fail');
        boUtils.stopProgressBar();
      });
    };
    r.readAsDataURL(changeEvent.target.files[0]);
  });
});
