
const productModule = require('./module.js');

productModule.controller('ProductMainController', ($scope, $state, $rootScope, $translate) => {
  $scope.contentTitle = $translate.instant('product.main.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'product.main',
      name: $translate.instant('product.main.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);


  // GET
});

productModule.controller('ProductEditController', ($scope, $http, $state, $rootScope, $translate, product) => {
  let titleKey = 'product.edit.createTitle';
  $scope.product = product;
  if ($scope.product.id) {
    titleKey = 'product.edit.updateTitle';
  }
  $scope.contentTitle = $translate.instant(titleKey);
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'product.main',
      name: $translate.instant('product.main.title'),
    },
    {
      sref: 'product.edit',
      name: $translate.instant(titleKey),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.names = [
    {title: $translate.instant('product.edit.labelName.KO'), key: 'ko'},
    {title: $translate.instant('product.edit.labelName.EN'), key: 'en'},
    {title: $translate.instant('product.edit.labelName.ZH_CN'), key: 'zh_cn'},
    {title: $translate.instant('product.edit.labelName.ZH_TW'), key: 'zh_tw'},
  ];
  $scope.prices = [
    {title: $translate.instant('product.edit.labelPrice.KRW'), key: 'krw'},
  ];

  $scope.inputFields = [
  ];

  $scope.save = () => {
    console.log($scope.product);
    let method = "POST";
    let url = '/api/v1/products';
    if ($scope.product.id) {
      method = "PUT";
      url += '/' + $scope.product.id;
    }
    $http({method: method, url: url, data: $scope.product, contentType: 'application/json;charset=UTF-8'}).then((result) => {
      console.log(result);
    });
  };
});
