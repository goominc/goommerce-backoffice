// Copyright (C) 2016 Goom Inc. All rights reserved.

const brandModule = angular.module('backoffice.brand', [
  'ui.router',
  require('../utils/module').name,
  require('../third_party/angular-translate'),
]);

brandModule.config(($translateProvider) => {
  $translateProvider
    .registerAvailableLanguageKeys(['en', 'ko'], {
      'en_US': 'en',
      'en_UK': 'en',
      'ko_KR': 'ko',
    })
    .determinePreferredLanguage();

  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
});

brandModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';
  $stateProvider
    .state('brand', {
      url: '/brand',
      abstract: 'true',
      template: '<ui-view/>',
    })
    .state('brand.main', {
      url: '/main',
      templateUrl: templateRoot + '/brand/main.html',
      controller: 'BrandMainController',
    })
    .state('brand.add', {
      url: '/add',
      templateUrl: templateRoot + '/brand/edit.html',
      controller: 'BrandEditController',
    })
    .state('brand.edit', {
      url: '/edit/:brandId',
      templateUrl: templateRoot + '/brand/edit.html',
      controller: 'BrandEditController',
    })
    .state('brand.inquiry', {
      url: '/inquiries',
      abstract: 'true',
      template: '<ui-view/>',
    })
    .state('brand.inquiry.list', {
      url: '/list',
      templateUrl: templateRoot + '/brand/inquiry-list.html',
      controller: 'BrandInquiryListController',
    })
    .state('brand.inquiry.info', {
      url: '/info/:inquiryId',
      templateUrl: templateRoot + '/brand/inquiry-info.html',
      controller: 'BrandInquiryInfoController',
    });
});

module.exports = brandModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
