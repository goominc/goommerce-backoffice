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

// http://stackoverflow.com/questions/21714655/reloading-current-state-refresh-data#answer-23198743
mainModule.config(function($provide) {
  $provide.decorator('$state', function($delegate, $stateParams) {
    $delegate.forceReload = function() {
      return $delegate.go($delegate.current, $stateParams, {
        reload: true,
        inherit: false,
        notify: true
      });
    };
    return $delegate;
  });
});

const ACCESS_TOKEN_KEY = 'GOOMMERCE-BO-TOKEN';

mainModule.controller('MainController', ($scope, $http, $q, $rootScope, $compile, $translate, $cookies) => {
  $rootScope.menus = [
    {
      key: 'product', // TODO get key from router
      name: $translate.instant('product.main.title'),
      sref: 'product.main',
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
      sref: 'order.main',
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
      sref: 'user.manage',
      children: [
        {
          key: 'user.main',
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
    },
    {
      key: 'cms', // TODO get key from router
      name: 'CMS',
      sref: 'cms.main_category',
      children: [
        {
          name: $translate.instant('cms.mainCategory'),
          sref: 'cms.main_category',
        },
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
    },
    {
      key: 'text',
      name: $translate.instant('text.title'),
      sref: 'text.main',
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
  // 2016. 02. 15. [heekyu] app-wide state
  $rootScope.state = {
    auth: {},
    batchUploadedProducts: [],
    locales: ['ko', 'en', 'zh-cn', 'zh-tw'],
    editLocale,
  };
  $rootScope.$on('$stateChangeSuccess', (event, toState) => {
    handleMenus(toState.name);
  });

  $rootScope.initAll = (scope, stateName) => {
    initContentTitle(scope);
    initBreadcrumb(scope);
  };

  $rootScope.doLogout = () => {
    // TODO server logout
    $http.delete('/api/v1/login').then(() => {
      $cookies.remove(ACCESS_TOKEN_KEY);
      delete $http.defaults.headers.common.Authorization;
      checkLogin();
    });
  };

  const checkLogin = () => {
    const token = $cookies.get(ACCESS_TOKEN_KEY);
    if (token) {
      $http.defaults.headers.common.Authorization = token;
    }
    $http.get('/api/v1/login').then((res) => {
      $rootScope.state.auth = res.data;
    }, () => {
      if (token) {
        $cookies.remove(ACCESS_TOKEN_KEY);
      }
      $rootScope.modalBox = 'login';
      $('#login_modal').modal({
        backdrop: 'static',
        keyboard: false,
      });
      setTimeout(() => {
        console.log($('.login-form .form-control').eq(0));
        $('.login-form .form-control').eq(0).focus();
      }, 1000); // 1000 is magic number... T.T
    });
  };
  checkLogin();

  const editLocaleKey = 'editLocale';
  let editLocale = 'ko';
  if ($cookies.get(editLocaleKey)) {
    editLocale = $cookies.get(editLocaleKey);
  }

  // 2016. 03. 17. [heekyu] download all texts for order status
  //                        TODO texts module use this contents
  const downloadTexts = () => {
    const promises = [];
    $rootScope.state.locales.forEach((locale) => {
      promises.push($http.get(`/api/v1/i18n/texts/${locale}`).then((res) => res.data));
    });
    $q.all(promises).then((res) => {
      $rootScope.state.texts = [];
      for (let i = 0; i < $rootScope.state.locales.length; i++) {
        $rootScope.state.texts.push(res[i]);
      }
    });
  };
  downloadTexts();

  $rootScope.getContentsI18nText = (key) => {
    for (let i = 0; i < $rootScope.state.locales.length; i++) {
      const locale = $rootScope.state.locales[i];
      if (locale === $rootScope.state.editLocale) {
        return _.get($rootScope.state.texts[i], key);
      }
    }
  };

  // 2016. 02. 29. [heekyu] change locale in each page
  $rootScope.changeEditLocale = (locale) => {
    $rootScope.state.editLocale = locale;
    $cookies.put(editLocaleKey, locale);
  };
});

mainModule.controller('LoginModalController', ($scope, $rootScope, $http, $cookies) => {
  $scope.credential = {};

  $scope.doLogin = () => {
    const data = {email: $scope.credential.email, password: $scope.credential.password};
    $http.post('/api/v1/login', data).then((res) => {
      // TODO better way
      $('#login_modal').modal('hide');
      $scope.credential = {};

      const token = 'Bearer ' + res.data.bearer;
      $http.defaults.headers.common.Authorization = token;
      $rootScope.state.auth = res.data;
      $cookies.put(ACCESS_TOKEN_KEY, token);

      $http.get('/api/v1/login');
    }, (err) => {
      // TODO
      window.alert(err.data);
    });
  };
});
