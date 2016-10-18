// Copyright (C) 2016 Goom Inc. All rights reserved.

const mainModule = angular.module('backoffice.main', [
    'ui.router',
    'ngCookies',
    require('../brand/module').name,
    require('../board/module').name,
    require('../building/module').name,
    require('../cms/module').name,
    require('../currency/module').name,
    require('../dashboard/module').name,
    require('../directives/module.js').name,
    require('../order/module').name,
    require('../product/module').name,
    require('../text/module').name,
    require('../third_party/angular-translate'),
    require('../user/module').name,
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
        /*
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
        {
          key: 'product.smarket',
          name: 'S마켓',
          sref: 'product.smarket',
        },
        */
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
        /*
        {
          key: 'order.listPrice',
          name: $translate.instant('order.listPrice.title'),
          sref: 'order.listPrice',
        },
        {
          key: 'order.uncle',
          name: $translate.instant('order.uncle.title'),
          sref: 'order.uncle',
        },
        {
          key: 'order.settlement',
          name: $translate.instant('order.settlement.title'),
          sref: 'order.settlement',
        },
        {
          key: 'order.vat',
          name: $translate.instant('order.vat.title'),
          sref: `order.vat({month: "${moment().format('YYYY-MM')}"})`,
        },
        {
          key: 'order.listBigBuyer',
          name: $translate.instant('order.listBigBuyer.title'),
          sref: 'order.listBigBuyer',
        },
        {
          key: 'order.godo',
          name: $translate.instant('order.godo.title'),
          sref: 'order.godo',
        },
        */
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
      ],
    },
    /*
    {
      key: 'brand', // TODO get key from router
      name: $translate.instant('brand.title'),
      sref: 'brand.main',
      children: [
        {
          key: 'brand.main', // TODO get key from router
          name: $translate.instant('main.mainMenu'),
          sref: 'brand.main',
        },
        {
          key: 'brand.inquiry.list',
          name: $translate.instant('brand.inquiry.title'),
          sref: 'brand.inquiry.list',
        },
      ],
    },
    {
      key: 'building',
      name: $translate.instant('building.main.title'),
      sref: 'building.main',
    },
    */
    {
      key: 'board',
      name: '게시판',
      sref: 'board.list({boardId:1})', // notice
      children: [
        {
          name: '공지사항',
          sref: 'board.list({boardId:1})', // notice
        },
        {
          name: '매장',
          sref: 'board.list({boardId:3})', // shop
        },
      ],
    },
    {
      key: 'cms', // TODO get key from router
      name: 'CMS',
      sref: 'cms.main_category',
      children: [
        {
          name: 'banners',
          sref: '',
          children: [
            {
              name: $translate.instant('cms.dMainBanner'),
              sref: 'cms.simple({name: "desktop_main_banner"})',
            },
            {
              name: $translate.instant('cms.dMdPick'),
              sref: 'cms.simple({name: "desktop_md_pick"})',
            },
            {
              name: $translate.instant('cms.mMainBanner'),
              sref: 'cms.simple({name: "mobile_main_banner"})',
            },
            {
              name: $translate.instant('cms.mMdPick'),
              sref: 'cms.simple({name: "mobile_md_pick"})'
            },
          ],
        },
      ],
    },
    /*
    {
      key: 'currency', // TODO get key from router
      name: $translate.instant('currency.title'),
      sref: 'currency.main',
    },
    */
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
  const editLocaleKey = 'editLocale';
  let editLocale = 'ko';
  if ($cookies.get(editLocaleKey)) {
    editLocale = $cookies.get(editLocaleKey);
  }
  // 2016. 02. 15. [heekyu] app-wide state
  $rootScope.state = {
    auth: {},
    batchUploadedProducts: [],
    locales: ['ko', 'en', 'zh-cn', 'zh-tw'],
    editLocale,
    datatables: {},
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
      const newToken = 'Bearer ' + res.data.bearer;
      if (token !== newToken) {
        $http.defaults.headers.common.Authorization = newToken;
        $cookies.put(ACCESS_TOKEN_KEY, newToken);
      }
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
    if (!$rootScope.state.texts) {
      // 2016. 05. 10. [heekyu] before download texts
      //                        TODO there is any problems?
      return key;
    }
    for (let i = 0; i < $rootScope.state.locales.length; i++) {
      const locale = $rootScope.state.locales[i];
      if (locale === $rootScope.state.editLocale || 'ko') {
        return _.get($rootScope.state.texts[i], key, key);
      }
    }
  };

  // 2016. 02. 29. [heekyu] change locale in each page
  $rootScope.changeEditLocale = (locale) => {
    $rootScope.state.editLocale = locale;
    $cookies.put(editLocaleKey, locale);
  };

  $rootScope.updateDatatablesSearch = (key, value) => {
    _.set($rootScope.state.datatables, key, value);
  };
});

mainModule.controller('LoginModalController', ($scope, $rootScope, $http, $cookies) => {
  $scope.credential = {};

  $scope.doLogin = () => {
    const data = { userId: $scope.credential.email, password: $scope.credential.password };
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
