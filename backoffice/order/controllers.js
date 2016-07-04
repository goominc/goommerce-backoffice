// Copyright (C) 2016 Goom Inc. All rights reserved.

const orderModule = require('./module');

orderModule.factory('orderCommons', ($rootScope, $compile) => {
  const allStatus = [
    0,
    100,
    101,
    102,
    200,
    201,
    202,
    203,
    300,
    400,
  ];
  const allPaymentStatus = [
    0,
    1,
    100,
    200,
  ];
  return {
    allStatus,
    allPaymentStatus,
    applyFilterSearch: (scope, state, storeKeyPrefix, roleType) => {
      scope.startDate = _.get($rootScope, `${storeKeyPrefix}.startDate`) || '';
      scope.endDate =  _.get($rootScope, `${storeKeyPrefix}.endDate`) || '';
      if (scope.startDate && scope.endDate && new Date(scope.startDate).getTime() > new Date(scope.endDate).getTime()) {
        window.alert('시작 날짜가 종료 날짜와 같거나 더 작아야 합니다');
      }
      const reloadDatatables = () => {
        $('table').DataTable().ajax.reload();
      };

      $('#order_start_date').datepicker({ autoclose: true });
      $('#order_end_date').datepicker({ autoclose: true });
      $('#order_start_date').on('change', (e) => {
        _.set($rootScope, `${storeKeyPrefix}.startDate`, $('#order_start_date').val());
        state.reload();
        // reloadDatatables();
      });
      $('#order_end_date').on('change', (e) => {
        _.set($rootScope, `${storeKeyPrefix}.endDate`, $('#order_end_date').val());
        state.reload();
        // reloadDatatables();
      });

      scope.allStatus = allStatus.slice(1);
      scope.allPaymentStatus = allPaymentStatus;

      scope.setStatusFilter = (s) => {
        _.set($rootScope, `${storeKeyPrefix}.searchOrderStatus`, s);
        reloadDatatables();
      };
      scope.setPaymentStatusFilter = (p) => {
        _.set($rootScope, `${storeKeyPrefix}.searchPaymentStatus`, p);
        reloadDatatables();
      };
      if (!_.get($rootScope, `${storeKeyPrefix}.searchOrderStatus`)) {
        scope.setStatusFilter(-1);
      }
      if (!_.get($rootScope, `${storeKeyPrefix}.searchPaymentStatus`)) {
        scope.setPaymentStatusFilter(-1);
      }

      scope.translateOrderStatus = (status) => {
        if (status === -1) {
          return '모든 주문 상태';
        }
        return $rootScope.getContentsI18nText(`enum.order.status.${status}`);
      };
      scope.translateOrderPaymentStatus = (status) => {
        if (status === -1) {
          return '모든 결제 상태';
        }
        return $rootScope.getContentsI18nText(`enum.order.paymentStatus.${status}`);
      };
      scope.fnUrlParams = (urlParams) => {
        const searchOrderStatus = _.get($rootScope, `${storeKeyPrefix}.searchOrderStatus`);
        const searchPaymentStatus = _.get($rootScope, `${storeKeyPrefix}.searchPaymentStatus`);
        const queryParams = {};
        if (roleType) {
          queryParams.roleType = roleType;
        }
        if (searchOrderStatus >= 0) {
          queryParams.status = searchOrderStatus;
        } else {
          queryParams.status = '!0';
        }
        if (searchPaymentStatus >= 0) {
          queryParams.paymentStatus = searchPaymentStatus;
        }
        if (scope.startDate && scope.endDate) {
          const start = new Date(scope.startDate);
          const end = new Date(scope.endDate);
          const diff = end.getTime() - start.getTime();
          if (diff >= 0) {
            queryParams.orderedAt = `${scope.startDate}~${scope.endDate}`;
          }
        }
        _.merge(urlParams, queryParams);
      };
      scope.datatablesLoaded = () => {
        $('table').css('width', '100%');
        $compile(angular.element($('table')))(scope);
      };
    },
  };
});

orderModule.controller('OrderMainController', ($scope, $rootScope, $http, $state, $translate, $compile, boUtils, orderCommons) => {
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
    storeKey: 'orderMain',
    // disableFilter: true,
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
        data: 'orderedAt',
        render: (data) => data ? boUtils.formatDate(data) : '',
      },
      {
        data: (data) => (+data.totalKRW).format(),
      },
      {
        data: 'paymentStatus',
        render: (status) => $rootScope.getContentsI18nText(`enum.order.paymentStatus.${status}`),
      },
      {
        data: 'buyerId',
        render: (buyerId) => {
          return '<a ui-sref="user.info({userId: ' + buyerId+ '})">' + buyerId + '</a>'
        },
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
        data: (data) => _.get(data, 'data.affiliate.source') || '',
      },
    ],
  };

  orderCommons.applyFilterSearch($scope, $state, 'state.order.main', 'buyer');
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
    storeKey: 'orderBeforePayment',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders?status=0&paymentStatus=200',
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
        data: (data) => (+data.totalKRW).format(),
      },
      {
        data: 'buyerId',
        render: (buyerId) => {
          return '<a ui-sref="user.info({userId: ' + buyerId+ '})">' + buyerId + '</a>'
        },
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
    if (window.confirm('입금 확인하셨습니까?')) {
      $http.post(`/api/v1/orders/${orderId}/start_processing`).then((res) => {
        // TODO: Update datatables row data.
        $state.reload();
      });
    }
  };
});

orderModule.controller('OrderDetailController', ($scope, $rootScope, $http, $state, $translate, boUtils, convertUtil, orderCommons, order) => {
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
  order.orderedAt = boUtils.formatDate(order.orderedAt);
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
  $http.get(`/api/v1/orders/${order.id}/logs`).then((res) => {
    res.data.logs.forEach((l) => (l.createdAt = boUtils.formatDate(l.createdAt)));
    $scope.paymentLogs = _.groupBy(res.data.logs, 'paymentId');
    $scope.notes = _.filter(res.data.logs, { type: 1000 }).sort((a, b) => (a.id < b.id));
  });

  if (_.get(order, 'address.countryCode', 'KR') === 'KR') {
    $scope.newShipment = {
      provider: 0,
      unitKRW: 0,
      weight: 0,
      boxKRW: 3300,
    };
  }

  $scope.allStatus = orderCommons.allStatus;
  $scope.allPaymentStatus = orderCommons.allPaymentStatus;

  $scope.translateOrderStatus = (status) => $rootScope.getContentsI18nText(`enum.order.status.${status}`);
  $scope.translateOrderPaymentStatus = (status) => $rootScope.getContentsI18nText(`enum.order.paymentStatus.${status}`);
  $scope.translateOrderSettlementStatus = (status) => $rootScope.getContentsI18nText(`enum.order.settlementStatus.${status}`);
  $scope.translateOrderProductStatus = (status) => $rootScope.getContentsI18nText(`enum.orderProduct.status.${status}`);
  $scope.translatePaymentStatus = (status) => $rootScope.getContentsI18nText(`enum.payment.status.${status}`);
  $scope.translatePaymentType = (type) => $rootScope.getContentsI18nText(`enum.payment.type.${type}`);
  $scope.paymentAmount = (payment) => {
    if (payment && payment.data) {
      const { TotPrice, amt_input, P_AMT, PRTC_Price, P_KOR_AMT } = payment.data;
      return Number(TotPrice || amt_input || P_KOR_AMT || P_AMT || PRTC_Price || 0);
    }
    return 0;
  }
  $scope.paymentMethod = (payment) => {
    if (payment && payment.data) {
      const { payMethod, paymethod, P_TYPE } = payment.data;
      return (payMethod || paymethod || P_TYPE || 'VBANK').toUpperCase();
    }
  }
  $scope.getParent = (payment) => _.find(order.payments, { id: payment.parentId });

  $scope.refundOrder = () => {
    if (order.finalTotalKRW === undefined) {
      alert('Plese save final order counts');
      return;
    }
    const amount = +order.totalPaid.amount - +order.finalTotalKRW - order.totalRefuned;
    const payments = _.filter(order.payments, (p) => (p.type === 0 && p.status === 0));
    if (payments.length === 1) {
      $scope.refund(payments[0], amount);
    } else {
      alert('multiple payment transaction');
    }
  };

  $scope.addNote = (message) => {
    $http.post(`/api/v1/orders/${order.id}/logs`, {
      type: 1000,
      data: { message },
    }).then((res) => {
      $state.reload();
    });
  };

  $scope.popupRefund = (payment) => {
    $scope.refundPayment = payment;
    $('#order_refund_modal').modal();
  };

  $scope.refund = (payment, amount, accountNumber, accountHolder, bankCode) => {
    $scope.closePopup();
    $http.post(`/api/v1/orders/${order.id}/refund`, {
      paymentId: payment.id,
      // amount: payment.data.TotPrice, // FIXME: from user input
      amount: +amount,
      msg: 'admin refund',
      accountNumber,
      accountHolder,
      bankCode,
    }).then((res) => {
      $state.reload();
    });
  };

  $scope.finalize = () => {
    const data = _.pick(order, 'finalShippingCostKRW');
    data.orderProducts = order.orderProducts.map(
      (o) => _.pick(o, 'id', 'finalQuantity', 'settledKRW'));
    data.adjustments = order.adjustments.map(
      (a) => _.pick(a, 'id', 'settledKRW'));
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
    const data = _.pick(order, 'status', 'paymentStatus', 'settlementStatus');
    $http.put(`/api/v1/orders/${order.id}/status`, data).then((res) => {
      $state.reload();
    }, (err) => alert(err.data.message));
  };

  $scope.deleteOrder = () => {
    if (window.confirm($translate.instant('order.detail.deleteMessage'))) {
      $http.delete(`/api/v1/orders/${order.id}`).then(() => {
        window.history.back();
      }, (err) => alert(err.data.message));
    };
  };

  $scope.getDates = (num) => {
    const today = moment();
    const dates = [];
    for (let i = 0; i < num; i++) {
      dates.push(today.format('YYYY-MM-DD'));
      today.subtract(1, 'd');
    }
    return dates;
  };
  $scope.calcShipmentTotal = (shipment) => {
    const sum = new Decimal((+shipment.unitKRW || 0) * (+shipment.weight || 0) + +shipment.boxKRW);
    return sum.div(10).round().mul(10).toNumber();
  };
  $scope.addShipment = (shipment) => {
    shipment.totalKRW = $scope.calcShipmentTotal(shipment);
    $http.post(`/api/v1/orders/${order.id}/shipments`, shipment).then((res) => {
      $state.reload();
    });
  };
  $scope.shipmentProviderText = (provider) => {
    if (provider === 0) return 'CJ';
    if (provider === 104) return '영통';
    if (provider === 105) return '판다';
    return provider;
  };

  $scope.exportPackingList = () => {
    var CLIENT_ID = '352586701861-20pb7c3qlp7klemfap5qfms0hl0eshrv.apps.googleusercontent.com';

    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

    function checkAuth() {
      gapi.auth.authorize(
        {
          'client_id': CLIENT_ID,
          'scope': SCOPES.join(' '),
          'immediate': true
        }, handleAuthResult);
      }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        loadSheetsApi();
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
      }
    }

    function loadSheetsApi() {
      var discoveryUrl =
          'https://sheets.googleapis.com/$discovery/rest?version=v4';
      gapi.client.load(discoveryUrl).then(run);
    }

    function run() {
      const mergeCells = (sheetId, startColumnIndex, startRowIndex, endColumnIndex, endRowIndex) => ({
        range: {
          sheetId,
          startRowIndex,
          endRowIndex,
          startColumnIndex,
          endColumnIndex,
        },
      });
      gapi.client.sheets.spreadsheets.create({
        properties: { title: `${order.id}-패킹리스트` },
        sheets: [{
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                {
                  userEnteredValue: { stringValue: '패킹리스트' },
                  userEnteredFormat: { horizontalAlignment: 'CENTER' },
                },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: '주문일' } },
                { userEnteredValue: { stringValue: order.orderedAt } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '주문자' } },
                { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '연락처' } },
                { userEnteredValue: { stringValue: _.get(order.address, 'detail.tel', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '국가' } },
                { userEnteredValue: { stringValue: _.get(order.address, 'countryCode', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '주소' } },
                { userEnteredValue: { stringValue: `${_.get(order.address, 'detail.address.base', '')} ${_.get(order.address, 'detail.address.detail', '')}` } },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: '주문번호' } },
                { userEnteredValue: { stringValue: '브랜드' } },
                { userEnteredValue: { stringValue: '상품번호' } },
                { userEnteredValue: { stringValue: '컬러' } },
                { userEnteredValue: { stringValue: '사이즈' } },
                { userEnteredValue: { stringValue: '상품명' } },
                { userEnteredValue: { stringValue: '주문수량' } },
                { userEnteredValue: { stringValue: '최종수량' } },
              ]
            }, ...order.orderProducts.map((op) => ({
              values: [
                { userEnteredValue: { stringValue: op.orderId.toString() } },
                { userEnteredValue: { stringValue: op.brand.name.ko } },
                { userEnteredValue: { stringValue: op.product.shortId.toString() } },
                { userEnteredValue: { stringValue: op.productVariant.data.color } },
                { userEnteredValue: { stringValue: op.productVariant.data.size } },
                { userEnteredValue: { stringValue: op.product.name.ko } },
                { userEnteredValue: { stringValue: op.quantity.toString() } },
                { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } },
              ]
            }))],
          }],
        }],
      }).then(({ result: { spreadsheetId, sheets } }) => {
        const sheetId = sheets[0].properties.sheetId;
        return gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requests: [
            { mergeCells: mergeCells(sheetId, 0, 0, 8, 1) },
            { mergeCells: mergeCells(sheetId, 1, 2, 8, 3) },
            { mergeCells: mergeCells(sheetId, 1, 3, 8, 4) },
            { mergeCells: mergeCells(sheetId, 1, 4, 8, 5) },
            { mergeCells: mergeCells(sheetId, 1, 5, 8, 6) },
            { mergeCells: mergeCells(sheetId, 1, 6, 8, 7) },
          ],
        });
      }).then(({ result: { spreadsheetId }}) => {
        window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
      }).then(undefined, (response) => {
        console.log('Error: ' + response.result.error.message);
      });
    }

    gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
      handleAuthResult);
  };

  $scope.exportOrderList = () => {
    var CLIENT_ID = '352586701861-20pb7c3qlp7klemfap5qfms0hl0eshrv.apps.googleusercontent.com';

    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

    function checkAuth() {
      gapi.auth.authorize(
        {
          'client_id': CLIENT_ID,
          'scope': SCOPES.join(' '),
          'immediate': true
        }, handleAuthResult);
      }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        loadSheetsApi();
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
      }
    }

    function loadSheetsApi() {
      var discoveryUrl =
          'https://sheets.googleapis.com/$discovery/rest?version=v4';
      gapi.client.load(discoveryUrl).then(run);
    }

    function run() {
      const mergeCells = (sheetId, startColumnIndex, startRowIndex, endColumnIndex, endRowIndex) => ({
        range: {
          sheetId,
          startRowIndex,
          endRowIndex,
          startColumnIndex,
          endColumnIndex,
        },
      });
      const rowData = () => {
        const countryCode = _.get(order.address, 'countryCode', 'KR').toUpperCase();
        if (countryCode === 'KR') {
          return [
            {
              values: [
                {
                  userEnteredValue: { stringValue: '주문 리스트' },
                  userEnteredFormat: { horizontalAlignment: 'CENTER' },
                },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: '주문일' } },
                { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '고객명' } },
                { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '이메일' } },
                { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '주문번호' } },
                { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '국가' } },
                { userEnteredValue: { stringValue: '대한민국' } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '배송지' } },
                { userEnteredValue: { stringValue: `${_.get(order.address, 'detail.address.base', '')} ${_.get(order.address, 'detail.address.detail', '')}` } },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: ' *도매 시장의 특성상 주문수량과 상이할 수 있습니다. 최종 수량은 링크샵스 홈페이지 내주문에서 확인해주세요.' } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: 'NO' } },
                { userEnteredValue: { stringValue: '브랜드' } },
                { userEnteredValue: { stringValue: '상품번호' } },
                { userEnteredValue: { stringValue: '상품명' } },
                { userEnteredValue: { stringValue: '컬러' } },
                { userEnteredValue: { stringValue: '사이즈' } },
                { userEnteredValue: { stringValue: '주문수량' } },
                { userEnteredValue: { stringValue: '최종수량' } },
              ]
            }, ...order.orderProducts.map((op, index) => ({
              values: [
                { userEnteredValue: { stringValue: (index + 1).toString() } },
                { userEnteredValue: { stringValue: op.brand.name.ko } },
                { userEnteredValue: { stringValue: op.product.id.toString() } },
                { userEnteredValue: { stringValue: op.product.name.ko } },
                { userEnteredValue: { stringValue: op.productVariant.data.color } },
                { userEnteredValue: { stringValue: op.productVariant.data.size } },
                { userEnteredValue: { stringValue: op.quantity.toString() } },
                { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } },
              ]
            }))
          ];
        } else if (countryCode === 'CN') {
          return [
            {
              values: [
                {
                  userEnteredValue: { stringValue: '订单目录' },
                  userEnteredFormat: { horizontalAlignment: 'CENTER' },
                },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: '订单日期' } },
                { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '姓名' } },
                { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '邮箱' } },
                { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '订单号' } },
                { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '国家' } },
                { userEnteredValue: { stringValue: 'China' } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '地址' } },
                { userEnteredValue: { stringValue: `${_.get(order.address, 'detail.address.base', '')} ${_.get(order.address, 'detail.address.detail', '')}` } },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: '* 由于批发市场的特殊性，不能立刻确认库存情况. 您可以在网站测上面“我的Linkshops-请单详情” 里面确认取货结果。' } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '号码' } },
                { userEnteredValue: { stringValue: '品牌' } },
                { userEnteredValue: { stringValue: '商品编号' } },
                { userEnteredValue: { stringValue: '颜色' } },
                { userEnteredValue: { stringValue: '尺码' } },
                { userEnteredValue: { stringValue: '订货数量' } },
                { userEnteredValue: { stringValue: '取货数量' } },
              ]
            }, ...order.orderProducts.map((op, index) => ({
              values: [
                { userEnteredValue: { stringValue: (index + 1).toString() } },
                { userEnteredValue: { stringValue: op.brand.name.ko } },
                { userEnteredValue: { stringValue: op.product.id.toString() } },
                { userEnteredValue: { stringValue: op.productVariant.data.color } },
                { userEnteredValue: { stringValue: op.productVariant.data.size } },
                { userEnteredValue: { stringValue: op.quantity.toString() } },
                { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } },
              ]
            }))
          ];
        } else if (countryCode === 'TW' || countryCode === 'MO' || countryCode === 'HK') {
          const country = countryCode === 'TW' ? 'Taiwan' : (countryCode === 'MO' ? 'Macau' : 'Hong-Kong');
          return [
            {
              values: [
                {
                  userEnteredValue: { stringValue: '訂單目錄' },
                  userEnteredFormat: { horizontalAlignment: 'CENTER' },
                },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: '訂單日期' } },
                { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '姓名' } },
                { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '郵箱' } },
                { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '訂單號' } },
                { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '國家' } },
                { userEnteredValue: { stringValue: country } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '地址' } },
                { userEnteredValue: { stringValue: `${_.get(order.address, 'detail.address.base', '')} ${_.get(order.address, 'detail.address.detail', '')}` } },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: '* 由於批發市場的特殊性，不能立刻確認庫存情況。您可以在網站右側上面“我的Linkshops-訂單詳情” 裡面確認取貨結果。' } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: '號碼' } },
                { userEnteredValue: { stringValue: '品牌' } },
                { userEnteredValue: { stringValue: '商品編號' } },
                { userEnteredValue: { stringValue: '顏色' } },
                { userEnteredValue: { stringValue: '尺碼' } },
                { userEnteredValue: { stringValue: '訂貨數量' } },
                { userEnteredValue: { stringValue: '取貨數量' } },
              ]
            }, ...order.orderProducts.map((op, index) => ({
              values: [
                { userEnteredValue: { stringValue: (index + 1).toString() } },
                { userEnteredValue: { stringValue: op.brand.name.ko } },
                { userEnteredValue: { stringValue: op.product.id.toString() } },
                { userEnteredValue: { stringValue: op.productVariant.data.color } },
                { userEnteredValue: { stringValue: op.productVariant.data.size } },
                { userEnteredValue: { stringValue: op.quantity.toString() } },
                { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } },
              ]
            }))
          ];
        } else {
          return [
            {
              values: [
                {
                  userEnteredValue: { stringValue: 'ORDER LIST' },
                  userEnteredFormat: { horizontalAlignment: 'CENTER' },
                },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: 'Order date' } },
                { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: 'Name' } },
                { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: 'E-mail' } },
                { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: 'Order No' } },
                { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: 'Country' } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: 'Address' } },
                { userEnteredValue: { stringValue: `${_.get(order.address, 'detail.address.base', '')} ${_.get(order.address, 'detail.address.detail', '')}` } },
              ]
            }, {
              // blank line
            }, {
              values: [
                { userEnteredValue: { stringValue: '* Since we can not check the wholesale market inventory in real time, the number of delivered item can be different than you have ordered. Please check the final quantity @ linkshops.com' } },
              ]
            }, {
              values: [
                { userEnteredValue: { stringValue: 'NO' } },
                { userEnteredValue: { stringValue: 'Brand' } },
                { userEnteredValue: { stringValue: 'Product ID' } },
                { userEnteredValue: { stringValue: 'Color' } },
                { userEnteredValue: { stringValue: 'Size' } },
                { userEnteredValue: { stringValue: 'Order QTY' } },
                { userEnteredValue: { stringValue: 'Final QTY' } },
              ]
            }, ...order.orderProducts.map((op, index) => ({
              values: [
                { userEnteredValue: { stringValue: (index + 1).toString() } },
                { userEnteredValue: { stringValue: op.brand.name.ko } },
                { userEnteredValue: { stringValue: op.product.id.toString() } },
                { userEnteredValue: { stringValue: op.productVariant.data.color } },
                { userEnteredValue: { stringValue: op.productVariant.data.size } },
                { userEnteredValue: { stringValue: op.quantity.toString() } },
                { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } },
              ]
            }))
          ];
        }
      };

      gapi.client.sheets.spreadsheets.create({
        properties: { title: `${order.id}-주문리스트` },
        sheets: [{
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: rowData(),
          }],
        }],
      }).then(({ result: { spreadsheetId, sheets } }) => {
        const sheetId = sheets[0].properties.sheetId;
        return gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requests: [
            { mergeCells: mergeCells(sheetId, 0, 0, 8, 1) },
            { mergeCells: mergeCells(sheetId, 1, 2, 8, 3) },
            { mergeCells: mergeCells(sheetId, 1, 3, 8, 4) },
            { mergeCells: mergeCells(sheetId, 1, 4, 8, 5) },
            { mergeCells: mergeCells(sheetId, 1, 5, 8, 6) },
            { mergeCells: mergeCells(sheetId, 1, 6, 8, 7) },
            { mergeCells: mergeCells(sheetId, 1, 7, 8, 8) },
            { mergeCells: mergeCells(sheetId, 0, 9, 8, 10) },
          ],
        });
      }).then(({ result: { spreadsheetId }}) => {
        window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
      }).then(undefined, (response) => {
        console.log('Error: ' + response.result.error.message);
      });
    }

    gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
      handleAuthResult);
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
    storeKey: 'orderUncle',
    disableFilter: true,
    url: '/api/v1/uncle/order_products',
    order: [],
    columns: [
      {
        data: (data) => _.get(data, 'processedDate', '').substring(2, 10),
        bSortable: false,
      },
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
    ],
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
    storeKey: 'orderCs',
    disableFilter: true,
    url: '/api/v1/order_products',
    order: [],
    columns: [
      {
        data: 'orderId',
        bSortable: false,
      },
      {
        data: (data) => _.get(data, 'brand.id', ''),
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
        data: (data) => (+data.totalKRW).format(),
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

orderModule.controller('OrderListBigBuyerController', ($scope, $http, $state, $rootScope, $translate, boUtils, orderCommons) => {
  $scope.contentTitle = $translate.instant('order.listBigBuyer.title');
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
      sref: 'order.listBigBuyer',
      name: $translate.instant('order.listBigBuyer.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.orderDatatables = {
    field: 'orders',
    storeKey: 'orderBigBuyer',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders/big',
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
        data: (data) => (+data.totalKRW).format(),
      },
      {
        data: 'paymentStatus',
        render: (status) => $rootScope.getContentsI18nText(`enum.order.paymentStatus.${status}`),
      },
      {
        data: 'buyerId',
        render: (buyerId) => {
          return '<a ui-sref="user.info({userId: ' + buyerId+ '})">' + buyerId + '</a>'
        },
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

  orderCommons.applyFilterSearch($scope, $state, 'state.order.bigBuyer');
});

orderModule.controller('OrderSettlementController', ($scope, $http, $state, $rootScope, $translate, boUtils) => {
  $scope.contentTitle = $translate.instant('order.settlement.title');
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
      sref: 'order.settlement',
      name: $translate.instant('order.settlement.title'),
    },
  ];

  $('.date-picker').datepicker({ autoclose: true });
  let isReload = false;
  $('.date-picker').on('change', (e) => {
    // 2016. 06. 29. [heekyu] why event multiple times?
    const value = $('.date-picker input').val();
    if (!value || value === _.get($rootScope.state, 'orderSettlement.activeDate')) {
      $('.date-picker input').val(_.get($rootScope.state, 'orderSettlement.activeDate'));
      return;
    }
    if (!isReload) {
      isReload = true;
      _.set($rootScope.state, 'orderSettlement.activeDate', value);
      $state.reload();
    }
  });
  const today = moment();
  if (!_.get($rootScope.state, 'orderSettlement.activeDate')) {
    _.set($rootScope.state, 'orderSettlement.activeDate', today.format('YYYY-MM-DD'));
  }
  $('.date-picker input').val($rootScope.state.orderSettlement.activeDate);
  // $scope.activeDate = today.format('YYYY-MM-DD');
  $scope.done = () => {
    const activeDate = _.get($rootScope.state, 'orderSettlement.activeDate');
    if (!activeDate) {
      window.alert('날짜를 선택해 주세요');
      return;
    }
    $http.put(`/api/v1/orders/settlement/${activeDate}`).then(
      () => {
        window.alert('정산(출금) 내역이 정상적으로 업데이트 되었습니다.');
        $state.reload();
      }
    );
  };

  function updateDatatables() {
    const activeDate = _.get($rootScope.state, 'orderSettlement.activeDate');
    $scope.orderDatatables = {
      field: 'orders',
      storeKey: 'orderSettlement',
      // disableFilter: true,
      // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
      // url: '/api/v1/orders/settlement/' + $scope.activeDate,
      url: '/api/v1/orders/settlement/' + activeDate,
      columns: [
        {
          data: 'orderId',
          render: (orderId) => {
            return '<a ui-sref="order.detail({orderId: ' + orderId + '})">' + orderId + '</a>'
          },
        },
        {
          data: (data) => _.get(data, 'brand.id', ''),
          render: (brandId) => {
            return '<a ui-sref="brand.edit({brandId: ' + brandId + '})">' + brandId + '</a>'
          },
        },
        {
          data: (data) => _.get(data, 'brand.name.ko', ''),
        },
        {
          data: (data) => _.get(data, 'brand.data.tel', ''),
        },
        {
          data: (data) => _.get(data, 'brand.data.bank.name', ''),
        },
        {
          data: (data) => _.get(data, 'brand.data.bank.accountNumber', ''),
        },
        {
          data: (data) => _.get(data, 'originalPriceKRW', '0'),
        },
        {
          data: (data) => _.get(data, 'finalTotalKRW', '0'),
        },
        {
          data: (data) => _.get(data, 'brand.data.bank.accountHolder', ''),
        },
        {
          data: 'buyerId',
          render: (buyerId) => {
            return '<a ui-sref="user.info({userId: ' + buyerId + '})">' + buyerId + '</a>'
          },
        },
      ],
    };
  }

  updateDatatables();

  $rootScope.initAll($scope, $state.current.name);
});

orderModule.controller('OrderGodoController', ($scope, $http, $state, $rootScope, $translate, boUtils) => {
  $scope.contentTitle = $translate.instant('order.godo.title');
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
      sref: 'order.godo',
      name: $translate.instant('order.godo.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  const today = moment();
  const maxMonths = 12;
  $scope.months = [];
  for (let i = 0; i < maxMonths; i++) {
    $scope.months.push(today.format('YYYY-MM'));
    today.subtract(1, 'months');
  }
  $scope.activeMonth = $scope.months[0];
  $scope.setMonth = (month) => {
    $scope.activeMonth = month;
    updateDatatables();
  };

  function updateDatatables() {
    const start = moment($scope.activeMonth).startOf('month').subtract(7, 'd').format('YYYY-MM-DD');
    const end = moment($scope.activeMonth).endOf('month').subtract(7, 'd').format('YYYY-MM-DD');
    $scope.orderDatatables = {
      field: 'orders',
      storeKey: 'orderGodo',
      // disableFilter: true,
      // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
      url: `/api/v1/affiliate/godo/settlement?start=${start}&end=${end}`,
      columns: [
        {
          data: 'id',
          render: (id) => {
            return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>'
          },
        },
        {
          data: (data) => _.get(data, 'processedDate', '').substring(0, 10),
        },
        {
          data: (data) => _.get(data, 'finalTotalKRW', ''),
        },
        {
          data: (data) => _.get(data, 'finalHandlingFeeKRW', ''),
        },
        {
          data: (data) => _.get(data, 'commissionKRW', ''),
        },
      ],
    };
  }

  updateDatatables();
});

orderModule.controller('OrderVatController', ($scope, $http, $state, $rootScope, $translate, boUtils) => {
  $scope.contentTitle = $translate.instant('order.vat.title');
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
      name: $translate.instant('order.vat.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.month = $state.params.month || '';
  $scope.orderDatatables = {
    field: 'list',
    storeKey: 'orderVat',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: `/api/v1/orders/vat/${$scope.month}`,
    columns: [
      {
        data: (data) => _.get(data, 'brand.id', ''),
        render: (id) => {
          return `<a ui-sref="order.brandVat({brandId:${id},month:'${$scope.month}'})">${id}</a>`;
        },
      },
      {
        data: (data) => data,
        orderable: false,
        render: (data) => {
          const brandId = _.get(data, 'brand.id', '');
          if (!brandId) return '';
          return `<a ui-sref="brand.edit({ brandId: ${_.get(data, 'brand.id', '')}})">${_.get(data, 'brand.name.ko', '')}</a>`;
        },
      },
      {
        data: (data) => +(_.get(data, 'subTotalKRW', 0)),
        orderable: false,
      },
      {
        data: (data) => +(_.get(data, 'vatKRW', 0)),
        orderable: false,
      },
      {
        data: (data) => (+(_.get(data, 'subTotalKRW')) + +(_.get(data, 'vatKRW', 0))),
        orderable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.bank.name') || '',
        orderable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.bank.accountNumber') || '',
        orderable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.bank.accountHolder') || '',
        orderable: false,
      },
      {
        data: (data) => boUtils.getBuildingName(data.brand),
        orderable: false,
      },
      {
        data: (data) => _.get(data, 'brand.data.tel', ''),
        orderable: false,
      },
    ],
  };

  $scope.export = () => {
    var CLIENT_ID = '352586701861-20pb7c3qlp7klemfap5qfms0hl0eshrv.apps.googleusercontent.com';

    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

    function checkAuth() {
      gapi.auth.authorize(
        {
          'client_id': CLIENT_ID,
          'scope': SCOPES.join(' '),
          'immediate': true
        }, handleAuthResult);
      }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        loadSheetsApi();
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
      }
    }

    function loadSheetsApi() {
      var discoveryUrl =
          'https://sheets.googleapis.com/$discovery/rest?version=v4';
      gapi.client.load(discoveryUrl).then(run);
    }

    function run() {
      const mergeCells = (sheetId) => ({
        range: {
          sheetId,
          startRowIndex: 5,
          endRowIndex: 21,
          startColumnIndex: 4,
          endColumnIndex: 8,
        },
      });
      $http.get(`/api/v1/orders/vat/brands/${$scope.month}`).then((res) => {
        const { list } = res.data;
        gapi.client.sheets.spreadsheets.create({
          properties: { title: `VAT-${$scope.month}` },
          sheets: list.map((o) => ({
            properties: { title: o.brand.name.ko },
            data: [{
              startRow: 2,
              startColumn: 1,
              rowData: [{
                values: [
                  { userEnteredValue: { stringValue: '건물' } },
                  { userEnteredValue: { stringValue: '거래처명' } },
                  { userEnteredValue: { stringValue: '층' } },
                  { userEnteredValue: { stringValue: '라인' } },
                  { userEnteredValue: { stringValue: '호' } },
                  { userEnteredValue: { stringValue: '전화번호' } },
                ]
              }, {
                values: [
                  { userEnteredValue: { stringValue: _.get(o.brand, 'data.location.building.name.ko') } },
                  { userEnteredValue: { stringValue: _.get(o.brand, 'name.ko') } },
                  { userEnteredValue: { stringValue: _.get(o.brand, 'data.location.floor') } },
                  { userEnteredValue: { stringValue: '라인' } },
                  { userEnteredValue: { stringValue: _.get(o.brand, 'data.location.flatNumber') } },
                  { userEnteredValue: { stringValue: _.get(o.brand, 'data.tel') } },
                ]
              }, {
                // blank line
              }, {
                values: [
                  { userEnteredValue: { stringValue: '날짜' } },
                  { userEnteredValue: { stringValue: '거래금액' } },
                  {},
                  { userEnteredValue: { formulaValue: '=IMAGE("https://s3.ap-northeast-2.amazonaws.com/linkshops/bo/images/bz.jpg")' } },
                ]
              }, ...o.list.map((l) => ({
                values: [
                  { userEnteredValue: { stringValue: l.processedDate.substring(0, 10) } },
                  { userEnteredValue: { numberValue: l.vatKRW } },
                ]
              })), {
                values: [
                  { userEnteredValue: { stringValue: '합계' } },
                  { userEnteredValue: { formulaValue: `=SUM(C7:C${7 + o.list.length - 1})` } },
                ]
              }],
            }],
          })),
        }).then(({ result: { spreadsheetId, sheets } }) =>
          gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requests: sheets.map((s) => ({
              mergeCells: mergeCells(s.properties.sheetId),
            })),
          })
        ).then(({ result: { spreadsheetId }}) => {
          window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
        }).then(undefined, (response) => {
          console.log('Error: ' + response.result.error.message);
        });
      });
    }

    gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
      handleAuthResult);
  };
});

orderModule.controller('OrderBrandVatController', ($scope, $http, $state, $rootScope, $translate, boUtils) => {
  const { month, brandId } = $state.params;

  $scope.contentTitle = $translate.instant('order.vat.title');
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: `order.vat({month:"${month}"})`,
      name: $translate.instant('order.vat.title'),
    },
    {
      name: $translate.instant('order.brandVat.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  function orderSubTotal(order) {
    let total = new Decimal(0);
    _.forEach(order.orderProducts, (o) => (total = total.add(new Decimal(o.finalTotalKRW))));
    _.forEach(order.adjustments, (o) => (total = total.add(new Decimal(o.finalKRW))));
    return total;
  }
  function orderSettledTotal(order) {
    let total = new Decimal(0);
    _.forEach(order.orderProducts, (o) => (total = total.add(new Decimal(o.settledKRW || 0))));
    _.forEach(order.adjustments, (o) => (total = total.add(new Decimal(o.settledKRW || 0))));
    return total;
  }

  $scope.orderDatatables = {
    field: 'list',
    storeKey: 'orderBrandVat',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: `/api/v1/orders/vat/brands/${brandId}/${month}`,
    columns: [
      {
        data: (data) => moment(data.orderedAt).format('YYYY-MM-DD'),
      },
      {
        data: (data) => _.get(data, 'orderProducts.0.brand.id', ''),
        render: (brandId) => {
          return '<a ui-sref="brand.edit({brandId: ' + brandId + '})">' + brandId + '</a>'
        },
      },
      {
        data: (data) => _.get(data, 'orderProducts.0.brand.name.ko', ''),
      },
      {
        data: (data) => _.get(data, 'buyerName', ''),
      },
      {
        data: (data) => orderSubTotal(data),
      },
      {
        data: (data) => '0',
      },
      {
        data: (data) => orderSubTotal(data),
      },
      {
        data: (data) => orderSubTotal(data).mul(0.1),
      },
      {
        data: (data) => orderSubTotal(data).mul(1.1),
      },
      {
        data: (data) => '',
      },
      {
        data: (data) => orderSettledTotal(data),
      },
      {
        data: (data) => orderSubTotal(data).mul(1.1).sub(orderSettledTotal(data)),
      },
      {
        data: (data) => '',
      },
      {
        data: (data) => _.get(data, 'id', ''),
        render: (id) => {
          return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>'
        }
      },
    ],
  };
});
