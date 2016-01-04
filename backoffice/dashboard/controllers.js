
const dashboardModule = require('./module');

dashboardModule.controller('DashboardController', ($scope, $rootScope, $translate) => {
  $scope.contentTitle = $translate.instant('dashboard.main.title');
  $scope.contentSubTitle = $translate.instant('dashboard.main.subTitle');
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      name: $translate.instant('dashboard.main.title'),
    },
  ];
  $rootScope.initAll($scope);
});
