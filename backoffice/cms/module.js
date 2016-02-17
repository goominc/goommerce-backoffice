// Copyright (C) 2016 Goom Inc. All rights reserved.

const cmsModule = angular.module('backoffice.cms', [
  'ui.router',
  'ui.sortable',
  require('../third_party/angular-translate'),
]);

module.exports = cmsModule;

cmsModule.config(($translateProvider) => {
  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});


cmsModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('cms', {
      abstract: true,
      url: '/cms',
      template: '<ui-view/>',
    })
    .state('cms.simple', {
      url: '/simple/:name',
      templateUrl: templateRoot + '/cms/simple.html',
      controller: 'CmsSimpleController',
    });
});

// BEGIN module require js
require('./controllers');
// END module require js
