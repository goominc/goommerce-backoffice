
const mainModule = angular.module('backoffice.main', [
  'ui.router',
  require('../dashboard/module').name,
  require('../product/module').name,
  require('../third_party/angular-translate'),
])
.config(($translateProvider) => {
  $translateProvider
  .registerAvailableLanguageKeys(['en', 'ko'], {
    'en_US': 'en',
    'en_UK': 'en',
    'ko_KR': 'ko',
  })
  .determinePreferredLanguage();

  // TODO sanitize or escape translation strings for security
  // $translateProvider.useSanitizeValueStrategy('sanitize');
});
module.exports = mainModule.name;

mainModule.controller('MainController', ($scope, $rootScope, $compile, $translate) => {
  $rootScope.menus = [
    {
      key: 'product', // TODO get key from router
      name: $translate.instant('product.main.title'),
      sref: 'product.main',
      active: false,
    },
    {
      key: 'order', // TODO get key from router
      name: 'Order',
      sref: 'order.list',
      active: false,
    },
    {
      key: 'user', // TODO get key from router
      name: 'User',
      sref: 'user.main',
      active: false,
    },
    {
      key: 'cms', // TODO get key from router
      name: 'CMS',
      sref: 'cms.main',
      active: false,
      children: [
        {
          name: 'main1',
          sref: 'cms.edit({cms_id: "main1_1"})',
          children: [
            {
              name: 'kk',
              sref: '/',
            },
          ],
        },
        {
          name: 'main2',
          sref: 'cms.edit({cms_id: "main2_1"})',
        },
      ],
    },
  ];

  const pageTitleTemplate = '<div class="page-title"><h1>{{contentTitle}} <small data-ng-if="contentSubTitle">{{contentSubTitle}}</small></h1></div>';
  const initContentTitle = (scope) => {
    const elem = $('#contentTitle');
    if (elem.length === 1 && scope.contentTitle) {
      elem.append($compile(pageTitleTemplate)(scope));
    }
  };

  const breadcrumbTemplate = '<ul class="page-breadcrumb breadcrumb">' +
    '<li data-ng-repeat="path in breadcrumb">' +
    '<a data-ng-if="$index < breadcrumb.length - 1" ui-sref="{{path.sref}}">{{path.name}}</a><i data-ng-if="$index < breadcrumb.length - 1" class="fa fa-circle"></i>' +
    '<span data-ng-if="$index === breadcrumb.length - 1">{{path.name}}</span>' +
    '</li>' +
    '</ul>';
  const initBreadcrumb = (scope) => {
    const elem = $('#breadcrumb');
    if (elem.length === 1 && scope.breadcrumb) {
      elem.append($compile(breadcrumbTemplate)(scope));
    }
  };
  const handleMenus = (stateName) => {
    if (!stateName) {
      return;
    }
    for (let menu of $rootScope.menus) {
      if (stateName.startsWith(menu.key)) {
        menu.active = true;
        break;
      }
    }
  };

  $rootScope.initAll = (scope, stateName) => {
    initContentTitle(scope);
    initBreadcrumb(scope);
    handleMenus(stateName);
  };
});
