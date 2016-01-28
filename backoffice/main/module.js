
const mainModule = angular.module('backoffice.main', [
    'ui.router',
    'ngCookies',
    require('../directives/module.js').name,
    require('../dashboard/module').name,
    require('../user/module').name,
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
      sref: 'product.main',
      active: false,
      children: [
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
        }
      ],
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
      sref: 'user.manage',
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

  // $http.post('http://localhost:8080/api/v1/users', {email: 'heekyu', password: '1111', data: {singup: 'backoffice'} })
});
