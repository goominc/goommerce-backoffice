
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
    .state('user.comment', {
      url: '/comment',
      templateUrl: templateRoot + '/user/comment.html',
      controller: 'UserCommentController',
    })
    .state('user.manage.tab', {
      url: '/:tabName',
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

const spyderBuyerLevel = {
  1: '베이직',
  2: '실버',
  3: '골드',
  4: 'VIP',
};
const buyerNameMap = {
  admin: '어드민',
  buyer: '유저',
  manager: '매니저',
  'team-spyder': '팀스파이더',
  staff: '직원',
};
userModule.factory('userUtil', () => {
  return {
    getRoleName: (user) => (user.roles || [])
      .map((role) => buyerNameMap[role.type] || role.type).join(','),
    getBuyerLevel: (user) => {
      for (let i = 0; i < (user.roles || []).length; i += 1) {
        const role = user.roles[0];
        if (role.type === 'buyer') {
          const level = role.level || 1;
          return level;
        }
      }
      return '';
    },
    spyderBuyerLevel,
  };
});

// BEGIN module require js
require('./controllers.js');
// END module require js
