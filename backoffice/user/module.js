
const userModule = angular.module('backoffice.user', [
  'ui.router',
  require('../third_party/angular-translate'),
]);

module.exports = userModule;

userModule.config(($translateProvider) => {
  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

userModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('user', {
      abstract: true,
      url: '/user',
      template: '<ui-view/>',
    })
    .state('user.manage', {
      url: '/manage',
      templateUrl: templateRoot + '/user/manage.html',
      controller: 'UserManageController',
    });
});

// BEGIN module require js
require('./controllers.js');
// END module require js
