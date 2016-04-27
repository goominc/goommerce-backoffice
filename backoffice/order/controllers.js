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
    url: '/api/v1/orders?q=status:!0,paymentStatus:!0',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>'
        },
      },
      {
        data: 'status',
        render: (status) => $rootScope.getContentsI18nText(`enum.order.status.${status}`),
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
        render: (status) => $rootScope.getContentsI18nText(`enum.order.paymentStatus.${status}`),
      },
      {
        data: (data) => _.get(data, 'name') || '',
      },
      {
        data: (data) => _.get(data, 'data.tel') || '',
      },
      {
        data: 'email',
      },
    ],
  };
});

orderModule.controller('OrderListBeforePaymentController', ($scope, $rootScope, $http, $state, $translate, boUtils) => {
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

  // $scope.orderDatatables = OrderCommons.getDatatables('/api/v1/orders?q=status:!0,paymentStatus:0');
  $scope.orderDatatables = {
    field: 'orders',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders?q=status:0,paymentStatus:200',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>'
        },
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
      {
        data: 'totalKRW',
      },
      {
        data: (data) => _.get(data, 'name') || '',
      },
      {
        data: (data) => _.get(data, 'data.tel') || '',
      },
      {
        data: 'email',
      },
      {
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
  order.finalShippingCostKRW = order.finalShippingCostKRW && Number(order.finalShippingCostKRW);
  (order.orderProducts || []).forEach((p) => {
    if (boUtils.isString(p.product.id)) {
      p.product.shortId = boUtils.shorten(p.product.id, 8);
    } else {
      p.product.shortId = p.id;
    }
  });
  order.totalRefuned = 0;
  (order.payments || []).forEach((p) => {
    if (p.type === 2 && p.status === 0) {
      order.totalRefuned += +p.data.PRTC_Price;
    }
  });
  $scope.order = order;
  $scope.user = {};
  $http.get(`/api/v1/users/${order.buyerId}`).then((res) => {
    $scope.user = res.data;
  });

  $scope.translateOrderStatus = (status) => $rootScope.getContentsI18nText(`enum.order.status.${status}`);
  $scope.translateOrderPaymentStatus = (status) => $rootScope.getContentsI18nText(`enum.order.paymentStatus.${status}`);
  $scope.translateOrderProductStatus = (status) => $rootScope.getContentsI18nText(`enum.orderProduct.status.${status}`);
  $scope.translatePaymentStatus = (status) => $rootScope.getContentsI18nText(`enum.payment.status.${status}`);
  $scope.translatePaymentType = (type) => $rootScope.getContentsI18nText(`enum.payment.type.${type}`);

  $scope.refundOrder = () => {
    if (order.finalTotalKRW === undefined) {
      alert('Plese save final order counts');
      return;
    }
    const amount = +order.totalPaid.amount - +order.finalTotalKRW - order.totalRefuned;
    console.log(amount);
    const payments = _.filter(order.payments, (p) => (p.type === 0 && p.status === 0));
    if (payments.length === 1) {
      $scope.refund(payments[0], amount);
    } else {
      alert('multiple payment transaction');
    }
  };

  $scope.popupRefund = (payment) => {
    $scope.refundPayment = payment;
    $('#order_refund_modal').modal();
  };

  $scope.refund = (payment, amount) => {
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

  $scope.finalize = () => {
    const data = _.pick(order, 'finalShippingCostKRW');
    data.orderProducts = order.orderProducts.map(
      (o) => _.pick(o, 'id', 'finalQuantity'));
    $http.put(`/api/v1/orders/${order.id}/finalize`, data).then((res) => {
      $state.reload();
    }, (err) => alert(err.data.message));
  };

  $scope.closePopup = () => {
    $('#order_refund_modal').modal('hide');
    $('#order_refund_modal').removeClass('in');
    $('.modal-backdrop').remove();
  };

  $scope.saveStatus = () => {
    const data = _.pick(order, 'status');
    $http.put(`/api/v1/orders/${order.id}/status`, data).then((res) => {
      $state.reload();
    }, (err) => alert(err.data.message));
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

orderModule.controller('OrderUncleController', ($scope, $rootScope, $http, $state, $translate) => {
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

  $scope.orderDatatables = {
    field: 'orderProducts',
    disableFilter: true,
    url: '/api/v1/uncle/order_products',
    order: [],
    columns: [
      {
        data: 'orderId',
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.name.ko', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.location.building.name.ko', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.location.floor', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.location.flatNumber', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.tel', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'product.name.ko', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'productVariant.data.color', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'productVariant.data.size', ''),
        bSortable: false,
      },
      {
        data: 'quantity',
        bSortable: false,
      },
    ],
  };

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

orderModule.controller('OrderCsController', ($scope, $rootScope, $http, $state, $translate) => {
  $scope.contentTitle = $translate.instant('order.cs.title');
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
      sref: 'order.cs',
      name: $translate.instant('order.cs.title'),
    },
  ];

  $scope.orderDatatables = {
    field: 'orderProducts',
    disableFilter: true,
    url: '/api/v1/order_products',
    order: [],
    columns: [
      {
        data: 'orderId',
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.name.id', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.name.ko', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.tel', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.bank.name', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.bank.accountHolder', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.bank.accountNumber', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'product.id', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'product.name.ko', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'productVariant.data.color', ''),
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'productVariant.data.size', ''),
        bSortable: false,
      },
      {
        data: 'quantity',
        bSortable: false,
      },
      {
        data: 'totalKRW',
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'processedDate', '').substr(0, 10),
        bSortable: false,
      },
      {
        data: 'buyerId',
        bSortable: false,
      },
    ],
  };

  $rootScope.initAll($scope, $state.current.name);
});
