// Copyright (C) 2016 Goom Inc. All rights reserved.

const mainModule = angular.module('backoffice.main', [
    'ui.router',
    'ngCookies',
    require('../directives/module.js').name,
    require('../dashboard/module').name,
    require('../user/module').name,
    require('../product/module').name,
    require('../order/module').name,
    require('../brand/module').name,
    require('../currency/module').name,
    require('../cms/module').name,
    require('../text/module').name,
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

    $translateProvider
      .translations('en', require('./i18n/translations.en.json'))
      .translations('ko', require('./i18n/translations.ko.json'));

    // TODO sanitize or escape translation strings for security
    // $translateProvider.useSanitizeValueStrategy('sanitize');
  });
module.exports = mainModule;

mainModule.config(($httpProvider, boConfig) => {
  if (boConfig.apiUrl && boConfig.apiUrl !== '') {
    $httpProvider.interceptors.push(($q) => {
      return {
        'request': function(config) {
          if (config.url && config.url[0] === '/') {
            config.url = boConfig.apiUrl + config.url;
          }
          return config || $q.when(config);
        }
      }
    });
  }
});

const ACCESS_TOKEN_KEY = 'GOOMMERCE-BO-TOKEN';

mainModule.controller('MainController', ($scope, $http, $rootScope, $compile, $translate, $cookies) => {
  $rootScope.menus = [
    {
      key: 'product', // TODO get key from router
      name: $translate.instant('product.main.title'),
      active: false,
      children: [
        {
          key: 'product.main',
          name: $translate.instant('main.mainMenu'),
          sref: 'product.main',
        },
        {
          key: 'product.category',
          name: $translate.instant('product.category.title'),
          sref: 'product.category',
        },
        {
          key: 'product.add',
          name: $translate.instant('product.edit.createTitle'),
          sref: 'product.add',
        },
        {
          key: 'product.batchUpload',
          name: $translate.instant('product.batchUpload.title'),
          sref: 'product.batchUpload',
        },
        {
          key: 'product.imageUpload',
          name: $translate.instant('product.imageUpload.title'),
          sref: 'product.imageUpload',
        },
      ],
    },
    {
      key: 'order', // TODO get key from router
      name: $translate.instant('order.title'),
      active: false,
      children: [
        {
          key: 'order.main',
          name: $translate.instant('main.mainMenu'),
          sref: 'order.main',
        },
        {
          key: 'order.beforePayment',
          name: $translate.instant('order.beforePayment.title'),
          sref: 'order.beforePayment',
        },
      ],
    },
    {
      key: 'user', // TODO get key from router
      name: $translate.instant('user.manage.title'),
      active: false,
      children: [
        {
          key: 'order.main',
          name: $translate.instant('main.mainMenu'),
          sref: 'user.manage',
        },
        {
          key: 'user.waitConfirm',
          name: $translate.instant('user.waitConfirm.title'),
          sref: 'user.waitConfirm',
        },
      ],
    },
    {
      key: 'brand', // TODO get key from router
      name: $translate.instant('brand.title'),
      sref: 'brand.main',
      active: false,
    },
    {
      key: 'cms', // TODO get key from router
      name: 'CMS',
      active: false,
      children: [
        {
          name: $translate.instant('cms.mainBanner'),
          sref: 'cms.simple({name: "pc_main_banner1"})',
        },
        {
          name: $translate.instant('cms.subBanner'),
          sref: 'cms.simple({name: "pc_main_banner2"})',
        },
      ],
    },
    {
      key: 'currency', // TODO get key from router
      name: $translate.instant('currency.title'),
      sref: 'currency.main',
      active: false,
    },
    {
      key: 'text',
      name: $translate.instant('text.title'),
      sref: 'text.main',
      active: false,
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
      } else {
        menu.active = false;
      }
    }
  };

  $rootScope.initAll = (scope, stateName) => {
    initContentTitle(scope);
    initBreadcrumb(scope);
    handleMenus(stateName);
  };

  $rootScope.doLogout = () => {
    // TODO server logout
    $cookies.remove(ACCESS_TOKEN_KEY);
    checkLogin();
  };

  const checkLogin = () => {
    const token = $cookies.get(ACCESS_TOKEN_KEY);
    // TODO check if token is valid
    if (!token) {
      $rootScope.modalBox = 'login';
      $('#login_modal').modal({
        backdrop: 'static',
        keyboard: false,
      });
    } else {
      $http.defaults.headers.common.Authorization = token;
    }
  };
  checkLogin();

  // 2016. 02. 15. [heekyu] app-wide state
  $rootScope.state = {
    batchUploadedProducts: [],
    locales: ['ko', 'en', 'zh_cn', 'zh_tw'],
    editLocale: 'ko',
  };

  // 2016. 02. 29. [heekyu] change locale in each page
  $rootScope.changeEditLocale = (locale) => {
    $rootScope.state.editLocale = locale;
  };
});

mainModule.controller('LoginModalController', ($scope, $http, $cookies) => {
  $scope.credential = {};

  $scope.doLogin = () => {
    const data = {email: $scope.credential.email, password: $scope.credential.password};
    $http.post('/api/v1/login', data).then((res) => {
      // TODO better way
      $('#login_modal').modal('hide');

      const token = 'Bearer ' + res.data.bearer;
      $http.defaults.headers.common.Authorization = token;
      $cookies.put(ACCESS_TOKEN_KEY, token);

      $http.get('/api/v1/login');
    }, (err) => {
      // TODO
      window.alert(err.data);
    });
  };
});
