
const dashboardModule = angular.module('backoffice.dashboard', [
  'ui.router',
  require('../third_party/angular-translate'),
]);

dashboardModule.config(($translateProvider) => {
  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

dashboardModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: templateRoot + '/dashboard/main.html',
      controller: 'DashboardController',
    });
});

module.exports = dashboardModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
