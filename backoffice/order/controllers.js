// Copyright (C) 2016 Goom Inc. All rights reserved.

const orderModule = require('./module');

orderModule.controller('OrderMainController', ($scope, $rootScope, $http, $state, $translate, boUtils) => {
  $scope.contentTitle = $translate.instant('order.main.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'order.main',
      name: $translate.instant('order.main.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.orderDatatables = {
    field: 'orders',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>'
        },
      },
      {
        data: 'status',
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
      {
        data: 'totalKRW',
      },
      {
        data: 'paymentStatus',
      },
      {
        // edit role button
        data: 'id',
        render: (id) => {
          return `<button class="btn blue" data-ng-click="startProcessing(${id})"><i class="fa fa-play"></i> ${$translate.instant('order.main.startProcessing')}</button>`;
        },
      },
    ],
  };

  $scope.startProcessing = (orderId) => {
    $http.post(`/api/v1/orders/${orderId}/start_processing`).then((res) => {
      // TODO: Update datatables row data.
    });
  };
});

orderModule.controller('OrderListBeforePaymentController', ($scope, $rootScope, $http, $state, $translate) => {
  $scope.contentTitle = $translate.instant('order.beforePayment.title');
  $scope.contentSubTitle = $translate.instant('order.beforePayment.subTitle');
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'order.main',
      name: $translate.instant('order.main.title'),
    },
    {
      sref: 'order.beforePayment',
      name: $translate.instant('order.beforePayment.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);
});

orderModule.controller('OrderDetailController', ($scope, $rootScope, $http, $state, $translate, boUtils, convertUtil, order) => {
  $scope.contentTitle = $translate.instant('order.detail.title');
  $scope.contentSubTitle = 'Order Detail';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'order.main',
      name: $translate.instant('order.main.title'),
    },
    {
      sref: 'order.detail',
      name: $translate.instant('order.detail.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  order.createdAt = boUtils.formatDate(order.createdAt);
  $scope.order = order;
  $scope.user = {};
  $http.get(`/api/v1/users/${order.buyerId}`).then((res) => {
    $scope.user = res.data;
  });

  $scope.popupRefund = (payment) => {
    $scope.refundPayment = payment;
    $('#order_refund_modal').modal();
  };

  $scope.refund = (amount) => {
    const payment = $scope.refundPayment;
    $scope.closePopup();
    $http.post(`/api/v1/orders/${order.id}/refund`, {
      paymentId: payment.id,
      // amount: payment.data.TotPrice, // FIXME: from user input
      amount: +amount,
      msg: 'admin refund',
    }).then((res) => {
      // TODO: refresh order.
      $state.reload();
    });
  };

  $scope.closePopup = () => {
    $('#order_refund_modal').modal('hide');
    $('#order_refund_modal').removeClass('in');
    $('.modal-backdrop').remove();
  };

  if ($scope.order.address) {
    $scope.addressFields = [
      {title: $translate.instant('order.address.nameLabel'), obj: _.get($scope.order.address, 'detail.name'), key: 'name'},
      {title: $translate.instant('order.address.postalCodeLabel'), obj: _.get($scope.order.address, 'detail.postalCode'), key: 'postalCode'},
      {title: $translate.instant('order.address.addressLabel'), obj: _.get($scope.order.address, 'detail.address.base'), key: 'addressBase'},
      {title: $translate.instant('order.address.addressDetailLabel'), obj: _.get($scope.order.address, 'detail.address.detail'), key: 'addressDetail'},
      {title: $translate.instant('order.address.countryCodeLabel'), obj: _.get($scope.order.address, 'countryCode'), key: 'countryCode'},
      {title: $translate.instant('order.address.telLabel'), obj: _.get($scope.order.address, 'detail.tel'), key: 'tel'},
    ];
  }
});

orderModule.controller('OrderUncleController', ($scope, $rootScope, $http, $state, $translate, orderProducts) => {
  $scope.contentTitle = $translate.instant('order.uncle.title');
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'order.main',
      name: $translate.instant('order.main.title'),
    },
    {
      sref: 'order.uncle',
      name: $translate.instant('order.uncle.title'),
    },
  ];
  $scope.orderProducts = orderProducts;
  $scope.download = () => {
    $http.get('/api/v1/uncle/order_products?format=csv').then((res) => {
			var blob = new Blob([res.data]);
			var downloadLink = angular.element('<a></a>');
                        downloadLink.attr('href',window.URL.createObjectURL(blob));
                        downloadLink.attr('download', 'uncle.csv');
			downloadLink[0].click();
    });
  };
  $rootScope.initAll($scope, $state.current.name);
});
