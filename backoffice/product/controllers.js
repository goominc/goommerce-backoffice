
const productModule = require('./module.js');

productModule.controller('ProductMainController', ($scope, $state, $rootScope, $translate) => {
  $scope.contentTitle = $translate.instant('product.main.title');
  $scope.contentSubTitle = $translate.instant('product.main.title');
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
});