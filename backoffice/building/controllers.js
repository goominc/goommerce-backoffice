// Copyright (C) 2016 Goom Inc. All rights reserved.

const buildingModule = require('./module');

buildingModule.controller('BuildingMainController', ($scope) => {
  $scope.buildingDatatables = {
    field: 'buildings',
    url: '/api/v1/buildings',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return `<a ui-sref="building.info({buildingId: ${id}})">${id}</a>`;
        },
      },
      {
        data: 'name.ko',
        orderable: false,
      },
    ],
  };
});

buildingModule.controller('BuildingInfoController', ($scope, $http, $state, $rootScope, $translate, convertUtil) => {
  const url = `/api/v1/buildings/${$state.params.buildingId}`;

  const init = (building) => {
    $scope.contentTitle = $translate.instant('building.info.title');
    $scope.contentSubTitle = '';
    $scope.breadcrumb = [
      {
        sref: 'dashboard',
        name: $translate.instant('dashboard.home'),
      },
      {
        sref: 'building.main',
        name: $translate.instant('building.main.title'),
      },
      {
        sref: 'building.info',
        name: building.name.ko,
      },
    ];
    $rootScope.initAll($scope, $state.current.name);

    $scope.building = building;
    if (!$scope.building.data) {
      $scope.building.data = {};
    }
    $scope.buildingFields = [
      { title: $translate.instant('building.info.addressLabel'), obj: _.get($scope.building, 'data.address'), key: 'data.address' },
      { title: $translate.instant('building.info.businessHourLabel'), obj: _.get($scope.building, 'data.businessHour'), key: 'data.businessHour' },
      { title: $translate.instant('building.info.holidayLabel'), obj: _.get($scope.building, 'data.holiday'), key: 'data.holiday' },
      { title: $translate.instant('building.info.telLabel'), obj: _.get($scope.building, 'data.tel'), key: 'data.tel' },
      { title: $translate.instant('building.info.floorInfoLabel'), obj: _.get($scope.building, 'data.floorInfo'), key: 'data.floorInfo' },
      { title: $translate.instant('building.info.descriptionLabel'), obj: _.get($scope.building, 'data.description'), key: 'data.description', isMultiLine: true },
    ];
  };
  $http.get(url).then((res) => {
    init(res.data);
  });

  $scope.save = () => {
    convertUtil.copyFieldObj($scope.buildingFields, $scope.building);
    $http.put(url, _.pick($scope.building, 'data')).then(() => {
      $http.put('/api/v1/buildings/cache');
      $state.go('building.main');
    });
  };
});
