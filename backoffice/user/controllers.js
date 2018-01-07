
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

  boUtils.initDateBetween($('#user_start_date'), $('#user_end_date'), $state, 'state.userMain');
  /*
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
  */

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
        data: (data) => data.email || '',
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
        data: 'lastLoginAt',
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

  $scope.onChangeUserGrade = (e) => {
    console.log(e);
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
        data: (data) => _.get(data, 'userId', ''),
      },
      {
        data: (data) => _.get(data, 'email', ''),
      },
      {
        data: (data) => data.name || '',
      },
      {
        data: (data) => _.get(data, 'data.tel') || '',
      },
      {
        data: (data) =>` ${userUtil.spyderBuyerLevel[userUtil.getBuyerLevel(data)]} ${data.data.as_comb === 'Y' ? '(통합)' : '--' }` || '',
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
    ],
  };
  $scope.adminDatatables = {
    field: 'users',
    storeKey: 'userAdmin',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return `<a ui-sref="user.info({ userId: ${id} })">${id}</a>`;
        },
      },
      {
        data: (data) => _.get(data, 'userId', ''),
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
    ],
  };

  $scope.registerCoupon = () => {
    e.preventDefault();
    console.log('test');
  };

  $scope.couponDatatables = {
    field: 'rows',
    storeKey: 'coupon',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return `<a ui-sref="user.info({ userId: ${id} })">${id}</a>`;
        },
      },
      {
        data: (data) => _.get(data, 'userId', ''),
      },
      {
        data: (data) => _.get(data, 'total', ''),
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
      {
        data: (data) => data,
        render: (data) => {
          return `<input type="text" />`;
        },
      },
      {
        data: (data) => data,
        render: (data) => {
          return `<button class="btn blue" data-ng-click="registerCoupon($event)">쿠폰지급</button>`;
        },
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
  const roles = ['admin', 'buyer', 'team-spyder', 'manager', 'staff'];
  $scope.makeUserRolePopupData = (user) => {
    const res = { admin: false, buyer: false, 'team-spyder': false };
    if (user.roles) {
      for (let i = 0; i < user.roles.length; i++) {
        const role = user.roles[i];
        roles.forEach((item) => {
          if (role.type === item) {
            res[item] = true;
          }
        });
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

  const hasRole = (userId, roleType) => {
    const user = $scope.userIdToData[userId];
    const userRole = user.roles || [];
    for (let i = 0; i < userRole.length; i++) {
      const role = userRole[i];
      if (role.type === roleType) {
        return true;
      }
    }
    return false;
  };

  // 2016. 02. 23. [heekyu] this is very limited since server cannot handle race condition properly
  $scope.saveRole = () => {
    const editRoleToData = () => {
      const arr = [];
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        if ($scope.editRole[role]) {
          const obj = { type: role };
          if (role === 'buyer') {
            obj.grede = '베이직';
          }
          arr.push(obj);
        }
      }
      return arr;
    };
    const newRoleData = editRoleToData();
    if (!newRoleData && !$scope.editRoleUser.roles) {
      return;
    }
    const url = `/api/v1/users/${$scope.editRoleUser.id}/roles`;
    let promise = Promise.resolve('');
    ($scope.editRoleUser.roles || []).forEach((userRole) => {
      let found = false;
      for (let i = 0; i < (newRoleData || []).length; i += 1) {
        const newRole = newRoleData[i];
        if (newRole.type === userRole.type) {
          found = true;
          break;
        }
      }
      if (!found) {
        // delete case
        promise = promise.then(() => (
          $http.delete(url, { data: { type: userRole.type }, headers: {"Content-Type": "application/json;charset=utf-8"} })
        ));
      }
    });
    (newRoleData || []).forEach((newRole) => {
      let found = false;
      for (let i = 0; i < ($scope.editRoleUser.roles || []).length; i += 1) {
        const userRole = $scope.editRoleUser.roles[i];
        if (userRole.type === newRole.type) {
          found = true;
          break;
        }
      }
      if (!found) {
        // add case
        promise = promise.then(() => $http.post(url, { roleType: newRole.type }));
      }
    });
    promise.then(() => {
      $scope.closeRolePopup();
      $state.reload();
    }).catch((err) => {
      window.alert(err.message);
      throw err;
    });
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
      user.data.state = '';
      $http.put(`/api/v1/users/${user.id}`, { isActive: true, data: user.data }).then(() => {
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

  const renderUserInfo = () => {
    $scope.userFields = [
      {title: 'ID', key: 'id', obj: $scope.user.id, isReadOnly: true, isRequired: true},
      {title: '유저 아이디', key: 'userId', obj: $scope.user.userId, isReadOnly: true, isRequired: true},
      {title: '통합여부', key: 'comb', obj: $scope.user.data.as_comb ? '통합' : '--', isReadOnly: true, isRequired: false},
      {title: 'state', key: 'state', obj: $scope.user.data.state, isReadOnly: true },
      {title: $translate.instant('user.info.emailLabel'), obj: $scope.user.email, key: 'email', isReadOnly: true, isRequired: true},
      // {title: $translate.instant('user.info.lastNameLabel'), obj: _.get($scope.user, 'data.lastName'), isReadOnly: true, isRequired: true},
      {title: $translate.instant('user.info.firstNameLabel'), obj: $scope.user.name, key: 'name', isRequired: true},
      {title: '마일리지', obj: _.get($scope.user, 'credit', 0), isReadOnly: true},
      // {title: 'SMS 마케팅 동의', obj: _.get($scope.user, 'data.isAgreeSMS'), isReadOnly: true, isRequired: false },
      {title: $translate.instant('user.info.userTypeLabel'), obj: userUtil.getRoleName($scope.user), isReadOnly: true, isRequired: false},
      {title: $translate.instant('user.info.telLabel'), obj: _.get($scope.user, 'data.tel'), key: 'data.tel', isRequired: false},
      {title: '국가번호', obj: _.get($scope.address, 'countryCode'), isRequired: true, key: 'countryCode'},
      {title: '우편번호', obj: $scope.user.data.as_comb ? _.get($scope.user.erpData, 'zpc1') : _.get($scope.address, 'detail.postalCode'), isRequired: true, isReadOnly: true},
      {title: '주소', obj: $scope.user.data.as_comb ? _.get($scope.user.erpData, 'addr') : _.get($scope.address, 'detail.address1'), isRequired: true, isReadOnly: true},
      {title: '상세주소', obj: $scope.user.data.as_comb ? _.get($scope.user.erpData, 'adrs') : _.get($scope.address, 'detail.address2'), isRequired: true, isReadOnly: true},
      // {title: '생년', },
    ];
  }

  const init = (user) => {
    user.lastLoginAt = boUtils.formatDate(user.lastLoginAt);
    $scope.user = user;

    if ($scope.user.addressId) {
      $http.get(`/api/v1/users/${$scope.user.id}/addresses/${$scope.user.addressId}`).then((res) => {
        $scope.address = res.data;
        renderUserInfo();
      });
    }

    renderUserInfo();

    const level = userUtil.getBuyerLevel($scope.user);
    if (level) {
      $scope.levelObj = level;
    }
    $scope.selectedCouponType = 1;
  };
  init(user);

  $scope.noteType = {
    0: '-',
    100: '승인',
    101: '거절',
    200: '회원탈퇴(비활성)'
  };
  $http.get(`/api/v1/users/${user.id}/logs`).then((res) => {
    res.data.logs.forEach((l) => {
      l.createdAt = boUtils.formatDate(l.createdAt);
      if (l.type === 200 && l.data) {
        l.data.message = `${l.data.reason || ''}${l.data.reason && l.data.text ? ',' : ''}${l.data.text || ''}`;
      }
    });
    $scope.notes = res.data.logs.sort((a, b) => (a.id < b.id));
  });
  $scope.changeGrade = (newLevel) => {
    const data = { level: newLevel };
    $http.post(`/api/v1/users/${$scope.user.id}/level`, data).then(() => {
      window.alert('회원 등급이 변경되었습니다');
      $state.reload();
    }).catch(() => {
      window.alert('[FAIL] 회원 등급 변경 요청이 실패하였습니다');
    });
  };
  $scope.openCreditPopup = () => {
    $scope.creditUser = $scope.user;
    $('#user_credit').modal();
  };
  $scope.closeCreditPopup = () => {
    const node = $('#user_credit');
    node.modal('hide');
    node.removeClass('in');
    $('.modal-backdrop').remove();
  };
  $scope.changeCredit = (amount, type = 20) => {
    const user = $scope.creditUser;
    const url = `/api/v1/users/${user.id}/credits`;
    if (amount > 0) {
      if (!window.confirm(`마일리지 ${amount}점이 추가됩니다.`)) {
        return;
      }
      $http.post(url, { value: amount, type }).then(() => {
        $scope.closeCreditPopup();
        $state.reload();
      }, (err) => {
        window.alert('마일리지 추가 요청이 실패하였습니다.');
        throw err;
      });
    } else if (amount < 0) {
      if (!window.confirm(`마일리지 ${-amount}점을 사용합니다`)) {
        return;
      }
      $http.delete(url, {
        data: { value: -amount },
        headers: {"Content-Type": "application/json;charset=utf-8"}
      }).then(() => {
        $scope.closeCreditPopup();
        $state.reload();
      }, (err) => {
        window.alert('마일리지 사용 요청이 실패하였습니다.');
        throw err;
      });
    }
  };
  $scope.save = () => {
    convertUtil.copyFieldObj($scope.userFields, $scope.user);
    $http.put(`/api/v1/users/${$scope.user.id}`, _.pick($scope.user, 'data', 'inipay', 'name')).then((res) => {
      // init(res.data);
    });

    if ($scope.user.addressId) {
      $http.put(`/api/v1/users/${$scope.user.id}/addresses/${$scope.user.addressId}`, _.pick($scope.user, 'countryCode', 'detail')).then((res) => {
        // init(res.data);
        $state.go('user.manage');
      });
    } else {
      $http.post(`/api/v1/users/${$scope.user.id}/addresses`, _.pick($scope.user, 'countryCode', 'detail')).then((res) => {
        // init(res.data);
        $state.go('user.manage');
      });

    }

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

  $http.get(`/api/v1/coupons`).then((res) => {
    $scope.couponTypes = res.data.coupons;
  });

  $http.get(`/api/v1/users/${user.id}/allCoupons`).then((res) => {
    res.data.userCoupons.forEach((l) => {
      l.createdAt = boUtils.formatDate(l.createdAt, true);
      if (l.status === 1) l.status = '사용가능';
      else if (l.status === 2) l.status = '사용됨';
      else if (l.status === 3) l.status = '만기됨';
    });
    $scope.coupons = res.data.userCoupons.sort((a, b) => (a.id < b.id));
  });

  $scope.addCoupon = () => {
    $http.post(`/api/v1/coupons/${$scope.selectedCouponType}/generateAndRegister`, {
      userId: user.id,
    }).then((res) => {
      $state.reload();
    });
  };

  $scope.removeCoupon = (uid) => {
    window.alert('선택한 쿠폰을 삭제하시겠습니까?');
    $http.delete(`/api/v1/users/${user.id}/coupons/${uid}`).then((res) => {
      $state.reload();
    });
  };

  $scope.grades = Object.keys(userUtil.spyderBuyerLevel).map((level) => (
    { label: userUtil.spyderBuyerLevel[level], value: level }
  ));

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

userModule.controller('UserCommentController', ($scope, $http, $state, $rootScope, $translate, $compile, boUtils) => {
  $scope.contentTitle = $translate.instant('user.info.title');
  $rootScope.initAll($scope, $state.current.name);

  $scope.datatablesLoaded = () => {
    $compile(angular.element($('table')))($scope);
  };

  $scope.deleteComment = (id) => {
    $http.delete(`/api/v1/comments/bo/${id}`).then((res) => {
      $state.reload();
    });
  };

  $scope.commentDatatables = {
    field: 'comments',
    columns: [
      {
        data: 'id',
      },
      {
        data: 'productId',
      },
      {
        data: 'userId',
        render: (userId) => {
          return `<a ui-sref="user.info({ userId: ${userId} })">${userId}</a>`;
        },
      },
      {
        data: (data) => data.data.text || '',
      },
      {
        data: (data) => data,
        render: (comment) => {
          if (comment.data.hide && comment.data.hide === 1) {
            return `<button class="btn red" data-ng-click="deleteComment(${comment.id})">SHOW</button>`;
          } else {
            return `<button class="btn blue" data-ng-click="deleteComment(${comment.id})">HIDE</button>`;
          }
        },
      },
    ],
  };
});
userModule.controller('UserReviewController', ($scope, $http, $state, $rootScope, $translate, $compile, boUtils) => {
  $scope.contentTitle = $translate.instant('user.info.title');
  $rootScope.initAll($scope, $state.current.name);

  $scope.datatablesLoaded = () => {
    $compile(angular.element($('table')))($scope);
  };

  $scope.deleteReview = (id, productId) => {
    $http.delete(`/api/v1/products/{productId}/${id}/reviews`).then((res) => {
      $state.reload();
    });
  };

  $scope.reviewDatatables = {
    field: 'reviews',
    columns: [
      {
        data: 'id',
      },
      {
        data: 'productId',
      },
      {
        data: 'userId',
        render: (userId) => {
          return `<a ui-sref="user.info({ userId: ${userId} })">${userId}</a>`;
        },
      },
      {
        data: (data) => data.data.data.title || '',
      },
      {
        data: (data) => data,
        render: (review) => {
          return `<button class="btn red" data-ng-click="deleteReview(${review.id}, ${review.productId})">삭제</button>`;
        },
      },
    ],
  };
});
