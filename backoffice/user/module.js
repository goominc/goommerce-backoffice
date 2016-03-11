
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
    })
    .state('user.info', {
      url: '/info/:userId',
      templateUrl: templateRoot + '/user/info.html',
      controller: 'UserInfoController',
      resolve: {
        user: ($http, $stateParams) => {
          return $http.get(`/api/v1/users/${$stateParams.userId}`).then((res) => res.data);
        },
      },
    })
    .state('user.waitConfirm', {
      url: '/wait_confirm',
      templateUrl: templateRoot + '/user/wait-confirm.html',
      controller: 'UserWaitConfirmController',
    });
});

userModule.factory('userUtil', () => {
  return {
    getRoleName: (user) => {
      const role = _.get(user, 'roles[0]');
      return role ? role.type : '';
    },
  };
});

// BEGIN module require js
require('./controllers.js');
// END module require js
