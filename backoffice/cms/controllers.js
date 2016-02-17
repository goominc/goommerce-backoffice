// Copyright (C) 2016 Goom Inc. All rights reserved.

const cmsModule = require('./module');

cmsModule.controller('CmsSimpleController', ($scope, $http, $state, $rootScope, $translate) => {
  $scope.cms = {
    title: {
      ko: '',
      en: '',
      zn_ch: '',
      zn_tw: '',
    },
    children: [],
  };
  $http.get(`/api/v1/cms/${$state.params.name}`).then((res) => {
    console.log(res);
    if (res.data) {
      $scope.cms = res.data;
    }
  }).catch(() => {
    // ignore
  });

  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'cms.simple',
      name: $scope.name,
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.newObject = {};
  $scope.imageUploaded = (result, obj) => {
    obj.image = { url: result.url.substring(5), publicId: result.public_id, version: result.version };
  };

  $scope.addRow = () => {
    if (!$scope.newObject.link || $scope.newObject.link === '') {
      window.alert('type link');
      return;
    }
    if (!$scope.newObject.image || !$scope.newObject.image.url) {
      window.alert('add image');
      return;
    }
    $scope.cms.children.push($scope.newObject);
    $scope.newObject = {};
  };

  $scope.save = () => {
    $http.post(`/api/v1/cms`, { name: $scope.name, data: $scope.cms }).then((res) => {
      console.log(res);
    });
  };
});
