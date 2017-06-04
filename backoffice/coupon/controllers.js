// Copyright (C) 2016 Goom Inc. All rights reserved.

const couponModule = require('./module');

couponModule.controller('CouponMainController', ($scope, $http, $state, $rootScope, $translate, $compile, boUtils) => {
  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'coupon.main',
      name: $scope.name,
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  const couponType = {
    1: '가격할인',
    2: '비율할인',
    3: '상품증정',
  };

  $scope.couponDatatables = {
    field: 'coupons',
    columns: [
      {
        data: data => data,
        render: (coupon) =>
          `<a ui-sref="coupon.edit({ couponId: ${coupon.id} })">${coupon.id}</a>`,
        orderable: false,
      },
      {
        data: data => data,
        render: (coupon) =>
          `<a ui-sref="coupon.edit({ couponId: ${coupon.id} })">${coupon.name}</a>`,
        orderable: false,
      },
      {
        data: (data) => boUtils.formatDate(data.createdAt),
        orderable: false,
      },
      {
        data: (data) => couponType[data.type] || '',
        orderable: false,
      },
      {
        data: (data) => data.value || '',
        orderable: false,
      },
      {
        data: (data) => data.minValue || '',
        orderable: false,
      },
      {
        data: 'id',
        render: id =>
          `<button class="btn red" ng-click="deleteCoupon(${id})"><i class="fa fa-remove" /> 쿠폰삭제</button>`,
      },
    ],
  };

  $scope.goNewCoupon = () => {
    $state.go('coupon.add');
  };

  $scope.deleteCoupon = (couponId) => {
    console.log(couponId);
    if (window.confirm('삭제하시겠습니까?')) {
      $http.delete(`/api/v1/coupons/${couponId}`).then((res) => {
        $state.reload();
      }).catch(() => {
        window.alert('삭제 실패하였습니다');
      });
    }
  };

  $scope.datatablesLoaded = () => {
    $compile(angular.element($('table')))($scope);
  };
});

couponModule.controller('CouponEditController', ($scope, $http, $state, $rootScope, $translate, boUtils) => {
  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'coupon.main',
      name: '쿠폰',
    },
    {
      sref: 'coupon.edit',
      name: $scope.name,
    }
  ];
  $rootScope.initAll($scope, $state.current.name);

  const couponId = $state.params.couponId;
  if (couponId) {
    $http.get(`/api/v1/coupons/${couponId}`).then((res) => {
      if (res.data.begin) {
        res.data.begin = boUtils.formatDate(res.data.begin, true);
      }
      if (res.data.end) {
        res.data.end = boUtils.formatDate(res.data.end, true);
      }
      $scope.coupon = res.data;
      $scope.coupon.users.forEach((l) => {
        l.createdAt = boUtils.formatDate(l.createdAt, true);
        if (l.status === 1) l.status = '사용가능';
        else if (l.status === 2) l.status = '사용됨';
        else if (l.status === 3) l.status = '만기됨';
      });
    });
  } else {
    $scope.coupon = {};
  }

  // Coupon.setRequired(['name', 'type', 'target', 'value', 'expirationType']);
  $scope.fields = [
    { name: '쿠폰명', key: 'name' },
    { name: '시작날짜', key: 'begin', placeholder: 'YYYY-MM-DD' },
    { name: '종료날짜', key: 'end', placeholder: 'YYYY-MM-DD' },
    { name: '할인 타입', key: 'type', enums: [{ title: '가격', value: 1 }, { title: '비율(%)', value: 2 }, { title: '상품증정', value: 3 }] },
    { name: '할인 값', key: 'value' },
    { name: '최소금액', key: 'minValue' },
    // { name: '최대값', key: '' },
  ];
  $scope.save = () => {
    if (!couponId) {
      $scope.coupon.target = 2; // Cart
      $scope.coupon.expirationType = 1;
      $http.post('/api/v1/coupons', $scope.coupon).then(() => {
        window.alert('생성 완료');
        $state.go('coupon.main');
      });
    }
  };

  const formatUid = (uid) => {
    if (uid.length === 16) {
      let res = '';
      for (let i = 0; i < 16; i += 1) {
        res += uid[i].toUpperCase();
        if (i % 4 === 3 && i < 15) {
          res += '-';
        }
      }
      return res;
    }
    return uid;
  };

  $scope.generateCoupon = (count) => {
    if (count > 500) {
      count = 500;
    }
    const coupon = $scope.coupon;
    if (count >= 1 && window.confirm(`${count} 개 쿠폰을 발급하시겠습니까?`)) {
      const promises = [];
      for (let i = 0; i < count; i += 1) {
        promises.push($http.post(`/api/v1/coupons/${coupon.id}/generate`, { count }));
      }
      Promise.all(promises).then((res) => {
        window.alert('쿠폰 발행되었습니다.');
        $scope.userCoupons = res.map(r => {
          r.data.uid = formatUid(r.data.uid);
          return r.data;
        });
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });
    }
  };
});

couponModule.controller('CouponUserCouponController', ($scope) => {
  $scope.userCouponDatatables = {
    field: 'userCoupons',
    columns: [
      {
        data: '',
      },
    ],
  };
});
