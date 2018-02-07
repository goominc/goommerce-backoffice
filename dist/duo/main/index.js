(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @api public
   */

  function require(name){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];
    var threw = true;

    try {
      fn.call(m.exports, function(req){
        var dep = modules[id][1][req];
        return require(dep || req);
      }, m, m.exports, outer, modules, cache, entries);
      threw = false;
    } finally {
      if (threw) {
        delete cache[id];
      } else if (name) {
        // expose as 'name'.
        cache[name] = cache[id];
      }
    }

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
'use strict';

var mainModule = require('./module');

mainModule.constant('boConfig', {
  apiUrl: ''
});
}, {"./module":2}],
2: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var mainModule = angular.module('backoffice.main', ['ui.router', 'ngCookies', require('../board/module').name, require('../brand/module').name, require('../building/module').name, require('../cms/module').name, require('../coupon/module').name, require('../currency/module').name, require('../dashboard/module').name, require('../directives/module.js').name, require('../order/module').name, require('../product/module').name, require('../text/module').name, require('../third_party/angular-translate'), require('../user/module').name]).config(function ($translateProvider) {
  $translateProvider.registerAvailableLanguageKeys(['en', 'ko'], {
    'en_US': 'en',
    'en_UK': 'en',
    'ko_KR': 'ko'
  }).determinePreferredLanguage();

  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));

  // TODO sanitize or escape translation strings for security
  // $translateProvider.useSanitizeValueStrategy('sanitize');
});
module.exports = mainModule;

mainModule.config(function ($httpProvider, boConfig) {
  if (boConfig.apiUrl && boConfig.apiUrl !== '') {
    $httpProvider.interceptors.push(function ($q) {
      return {
        'request': function request(config) {
          if (config.url && config.url[0] === '/') {
            config.url = boConfig.apiUrl + config.url;
          }
          return config || $q.when(config);
        }
      };
    });
  }
});

// http://stackoverflow.com/questions/21714655/reloading-current-state-refresh-data#answer-23198743
mainModule.config(function ($provide) {
  $provide.decorator('$state', function ($delegate, $stateParams) {
    $delegate.forceReload = function () {
      return $delegate.go($delegate.current, $stateParams, {
        reload: true,
        inherit: false,
        notify: true
      });
    };
    return $delegate;
  });
});

var ACCESS_TOKEN_KEY = 'GOOMMERCE-BO-TOKEN';

mainModule.controller('MainController', function ($scope, $http, $q, $rootScope, $compile, $translate, $cookies) {
  $rootScope.menus = [{
    key: 'product', // TODO get key from router
    name: $translate.instant('product.main.title'),
    sref: 'product.main',
    children: [{
      key: 'product.main',
      name: $translate.instant('main.mainMenu'),
      sref: 'product.main'
    }, {
      key: 'product.category',
      name: $translate.instant('product.category.title'),
      sref: 'product.category'
    }, {
      key: 'product.add',
      name: $translate.instant('product.edit.createTitle'),
      sref: 'product.add'
    }]
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
  {
    key: 'order', // TODO get key from router
    name: $translate.instant('order.title'),
    sref: 'order.main',
    children: [{
      key: 'order.main',
      name: $translate.instant('main.mainMenu'),
      sref: 'order.main'
    }, {
      key: 'order.beforePayment',
      name: $translate.instant('order.beforePayment.title'),
      sref: 'order.beforePayment'
    }]
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
  {
    key: 'user', // TODO get key from router
    name: $translate.instant('user.manage.title'),
    sref: 'user.manage',
    children: [{
      key: 'user.main',
      name: $translate.instant('main.mainMenu'),
      sref: 'user.manage'
    }, {
      key: 'user.comment',
      name: '코멘트관리',
      sref: 'user.comment'
    }, {
      key: 'user.review',
      name: '메니저리뷰 관리',
      sref: 'user.review'
    }]
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
    children: [{
      name: '공지사항',
      sref: 'board.list({boardId:1})' }, // notice
    {
      name: '매장',
      sref: 'board.list({boardId:3})' }, // shop
    {
      name: '이벤트',
      sref: 'board.list({boardId:4})' }]
  }, // events
  {
    key: 'cms', // TODO get key from router
    name: 'CMS',
    sref: 'cms.main_category',
    children: [{
      name: 'banners',
      sref: '',
      children: [{
        name: $translate.instant('cms.dMainBanner'),
        sref: 'cms.main_banner({name: "desktop_main_banner"})'
      }, {
        name: $translate.instant('cms.dMdPick'),
        sref: 'cms.simple({name: "desktop_md_pick"})'
      }, {
        name: $translate.instant('cms.mMainBanner'),
        sref: 'cms.main_banner({name: "mobile_main_banner"})'
      }, {
        name: $translate.instant('cms.mMdPick'),
        sref: 'cms.simple({name: "mobile_md_pick"})'
      }, {
        name: '이벤트 베너',
        sref: 'cms.event_banner'
      }]
    }, {
      name: '메인페이지 센터 편집',
      sref: 'cms.main_page_center'
    }, {
      name: '커스텀 페이지 편집',
      sref: 'cms.custom_page'
    }]
  }, {
    key: 'coupon',
    name: '쿠폰',
    sref: 'coupon.main',
    children: [{
      name: '쿠폰종류',
      sref: 'coupon.main'
    }]
  },
  /*
  {
    name: '발급쿠폰',
    sref: 'coupon.userCoupons',
  },
  */

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
    sref: 'text.main'
  }];

  var pageTitleTemplate = '<div class="page-title"><h1>{{contentTitle}} <small data-ng-if="contentSubTitle">{{contentSubTitle}}</small></h1></div>';
  var initContentTitle = function initContentTitle(scope) {
    var elem = $('#contentTitle');
    if (elem.length === 1 && scope.contentTitle) {
      elem.append($compile(pageTitleTemplate)(scope));
    }
  };

  var breadcrumbTemplate = '<ul class="page-breadcrumb breadcrumb">' + '<li data-ng-repeat="path in breadcrumb">' + '<a data-ng-if="$index < breadcrumb.length - 1" ui-sref="{{path.sref}}">{{path.name}}</a><i data-ng-if="$index < breadcrumb.length - 1" class="fa fa-circle"></i>' + '<span data-ng-if="$index === breadcrumb.length - 1">{{path.name}}</span>' + '</li>' + '</ul>';
  var initBreadcrumb = function initBreadcrumb(scope) {
    var elem = $('#breadcrumb');
    if (elem.length === 1 && scope.breadcrumb) {
      elem.append($compile(breadcrumbTemplate)(scope));
    }
  };
  var handleMenus = function handleMenus(stateName) {
    if (!stateName) {
      return;
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = $rootScope.menus[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var menu = _step.value;

        if (stateName.startsWith(menu.key)) {
          menu.active = true;
        } else {
          menu.active = false;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };
  var editLocaleKey = 'editLocale';
  var editLocale = 'ko';
  if ($cookies.get(editLocaleKey)) {
    editLocale = $cookies.get(editLocaleKey);
  }
  // 2016. 02. 15. [heekyu] app-wide state
  $rootScope.state = {
    auth: {},
    batchUploadedProducts: [],
    locales: ['ko', 'en', 'zh-cn', 'zh-tw'],
    editLocale: editLocale,
    datatables: {}
  };
  $rootScope.$on('$stateChangeSuccess', function (event, toState) {
    handleMenus(toState.name);
  });

  $rootScope.initAll = function (scope, stateName) {
    initContentTitle(scope);
    initBreadcrumb(scope);
  };

  $rootScope.doLogout = function () {
    // TODO server logout
    $http['delete']('/api/v1/login').then(function () {
      $cookies.remove(ACCESS_TOKEN_KEY);
      delete $http.defaults.headers.common.Authorization;
      checkLogin();
    });
  };

  var checkLogin = function checkLogin() {
    var token = $cookies.get(ACCESS_TOKEN_KEY);
    if (token) {
      $http.defaults.headers.common.Authorization = token;
    }
    $http.get('/api/v1/login').then(function (res) {
      $rootScope.state.auth = res.data;
      var newToken = 'Bearer ' + res.data.bearer;
      if (token !== newToken) {
        $http.defaults.headers.common.Authorization = newToken;
        $cookies.put(ACCESS_TOKEN_KEY, newToken);
      }
    }, function () {
      if (token) {
        $cookies.remove(ACCESS_TOKEN_KEY);
      }
      $rootScope.modalBox = 'login';
      $('#login_modal').modal({
        backdrop: 'static',
        keyboard: false
      });
      setTimeout(function () {
        console.log($('.login-form .form-control').eq(0));
        $('.login-form .form-control').eq(0).focus();
      }, 1000); // 1000 is magic number... T.T
    });
  };
  checkLogin();

  // 2016. 03. 17. [heekyu] download all texts for order status
  //                        TODO texts module use this contents
  var downloadTexts = function downloadTexts() {
    var promises = [];
    $rootScope.state.locales.forEach(function (locale) {
      promises.push($http.get('/api/v1/i18n/texts/' + locale).then(function (res) {
        return res.data;
      }));
    });
    $q.all(promises).then(function (res) {
      $rootScope.state.texts = [];
      for (var i = 0; i < $rootScope.state.locales.length; i++) {
        $rootScope.state.texts.push(res[i]);
      }
    });
  };
  downloadTexts();

  $rootScope.getContentsI18nText = function (key) {
    if (!$rootScope.state.texts) {
      // 2016. 05. 10. [heekyu] before download texts
      //                        TODO there is any problems?
      return key;
    }
    for (var i = 0; i < $rootScope.state.locales.length; i++) {
      var locale = $rootScope.state.locales[i];
      if (locale === $rootScope.state.editLocale || 'ko') {
        return _.get($rootScope.state.texts[i], key, key);
      }
    }
  };

  // 2016. 02. 29. [heekyu] change locale in each page
  $rootScope.changeEditLocale = function (locale) {
    $rootScope.state.editLocale = locale;
    $cookies.put(editLocaleKey, locale);
  };

  $rootScope.updateDatatablesSearch = function (key, value) {
    _.set($rootScope.state.datatables, key, value);
  };
});

mainModule.controller('LoginModalController', function ($scope, $rootScope, $http, $cookies) {
  $scope.credential = {};

  $scope.doLogin = function () {
    var data = { userId: $scope.credential.email, password: $scope.credential.password };
    $http.post('/api/v1/login', data).then(function (res) {
      // TODO better way
      $('#login_modal').modal('hide');
      $scope.credential = {};

      var token = 'Bearer ' + res.data.bearer;
      $http.defaults.headers.common.Authorization = token;
      $rootScope.state.auth = res.data;
      $cookies.put(ACCESS_TOKEN_KEY, token);

      $http.get('/api/v1/login');
    }, function (err) {
      // TODO
      window.alert(err.data);
    });
  };
});
}, {"../board/module":3,"../brand/module":4,"../building/module":5,"../cms/module":6,"../coupon/module":7,"../currency/module":8,"../dashboard/module":9,"../directives/module.js":10,"../order/module":11,"../product/module":12,"../text/module":13,"../third_party/angular-translate":14,"../user/module":15,"./i18n/translations.en.json":16,"./i18n/translations.ko.json":17}],
3: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var boardModule = angular.module('backoffice.board', []);

module.exports = boardModule;

boardModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('board', {
    abstract: true,
    url: '/board',
    template: '<ui-view/>'
  }).state('board.add', {
    url: '/:boardId/add',
    templateUrl: templateRoot + '/board/edit.html',
    controller: 'BoardDetailController'
  }).state('board.edit', {
    url: '/:boardId/:boardItemId',
    templateUrl: templateRoot + '/board/edit.html',
    controller: 'BoardDetailController'
  }).state('board.list', {
    url: '/:boardId',
    templateUrl: templateRoot + '/board/list.html',
    controller: 'BoardListController'
  });
});

// BEGIN module require js
require('./controllers');
// END module require js
}, {"./controllers":18}],
18: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var boardModule = require('./module');

var boardIdToTitle = {
  1: '공지사항',
  3: '매장',
  4: '이벤트'
};

boardModule.controller('BoardListController', function ($scope, $http, $state, $rootScope, $translate, $compile) {
  $scope.name = $state.params.boardType;
  $scope.contentTitle = $scope.boardType;
  $scope.contentSubTitle = '';
  $scope.boardId = $state.params.boardId;
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'board.list({ boardId: ' + $scope.boardId + ' })',
    name: boardIdToTitle[$scope.boardId] || 'Unknown'
  }];
  $rootScope.initAll($scope, $state.current.name);

  $scope.datatablesLoaded = function () {
    $compile(angular.element($('table')))($scope);
  };

  $scope.boardDatatables = {
    field: 'boardItems',
    columns: [{
      data: 'id',
      orderable: false,
      render: function render(id) {
        return '<a ui-sref="board.edit({ boardId: ' + $scope.boardId + ', boardItemId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: function data(_data) {
        var title = _.get(_data, 'data.title');
        if (!title) {
          title = _.get(_data, 'data.name');
        }
        if (!title) {
          title = '제목없음';
        }
        return title;
      },
      orderable: false
    }, {
      data: 'id',
      orderable: false,
      render: function render(id) {
        return '<button class="btn red" data-ng-click="deleteItem(' + id + ')">삭제</button>';
      }
    }]
  };

  $scope.goNewBoard = function () {
    $state.go('board.add', { boardId: $scope.boardId });
  };

  $scope.deleteItem = function (id) {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      $http['delete']('/api/v1/boards/items/' + id).then(function () {
        $state.reload();
      }, function () {
        window.alert('요청이 실패하였습니다');
      });
    }
  };
});

var saveBoardItem = function saveBoardItem(boardId, boardItemId, data, $http, $state) {
  if (!boardItemId) {
    // add
    $http.post('/api/v1/boards/' + boardId, data).then(function () {
      window.alert('저장되었습니다');
      $state.go('board.list', { boardId: boardId });
    }, function () {
      window.alert('실패하였습니다');
    });
  } else {
    // edit
    $http.put('/api/v1/boards/items/' + boardItemId, data).then(function () {
      window.alert('저장되었습니다');
      $state.go('board.list', { boardId: boardId });
    }, function () {
      window.alert('실패하였습니다');
    });
  }
};

boardModule.controller('BoardDetailController', function ($scope, $http, $state, $rootScope, $translate, boUtils) {
  $scope.name = $state.params.boardType;
  $scope.contentTitle = $scope.boardType;
  $scope.contentSubTitle = '';
  $scope.boardId = +$state.params.boardId;
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'board.list({ boardId: ' + $scope.boardId + ' })',
    name: boardIdToTitle[$scope.boardId] || 'Unknown'
  }, {
    sref: 'board.edit',
    name: $scope.name
  }];
  $rootScope.initAll($scope, $state.current.name);

  var contentNode = null;
  var initEditor = function initEditor() {
    contentNode = $('#board-content');
    contentNode.summernote({
      width: 710,
      height: 500,
      onImageUpload: function onImageUpload(files) {
        return boUtils.getSummerNoteImageUpload(files, contentNode);
      }
    });
  };
  var addUploadEventHandler = function addUploadEventHandler(node) {
    var key = arguments.length <= 1 || arguments[1] === undefined ? 'default' : arguments[1];

    node.on('change', function (changeEvent) {
      var file = _.get(changeEvent, 'target.files[0]');
      console.log(file);
      if (!file) {
        return;
      }
      boUtils.startProgressBar();
      node.attr('value', '');
      var r = new FileReader();
      r.onload = function (e) {
        boUtils.uploadImage201607(e.target.result, file, '').then(function (res) {
          boUtils.stopProgressBar();
          $scope.data[key] = res.data.images[0];
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }, function () {
          window.alert('image upload fail');
          boUtils.stopProgressBar();
        });
      };
      r.readAsBinaryString(file);
    });
  };
  if ($scope.boardId === 3) {
    // store
    $scope.boardFields = [{ title: '이름', key: 'name' }, { title: '위치', key: 'location' }, { title: '전화번호', key: 'tel' }, { title: '매장타입', key: 'type' }, { title: '매장정보', key: 'detail' }, { title: '지도URL', key: 'mapUrl' }];
  } else if ($scope.boardId === 4) {
    // events
    $scope.boardFields = [{ title: '타이틀', key: 'title' }, { title: '버튼텍스트', key: 'buttonText' }];
    initEditor();
    setTimeout(function () {
      addUploadEventHandler($('#thumbnail-upload-button'), 'thumbnail');
      addUploadEventHandler($('#main-upload-button'), 'mainImage');
    }, 500);
  } else {
    // default(notice, etc)
    initEditor();
  }

  var boardItemId = $state.params.boardItemId;
  if (boardItemId) {
    $http.get('/api/v1/boards/items/' + boardItemId).then(function (res) {
      $scope.data = res.data.data || {};
      if ($scope.data.content && contentNode) {
        contentNode.code($scope.data.content);
      }
    });
  } else {
    $scope.data = {};
  }

  $scope.save = function () {
    if (contentNode) {
      $scope.data.content = contentNode.code();
    }
    saveBoardItem($scope.boardId, boardItemId, $scope.data, $http, $state);
  };
});
}, {"./module":3}],
4: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var brandModule = angular.module('backoffice.brand', ['ui.router', require('../utils/module').name, require('../third_party/angular-translate')]);

brandModule.config(function ($translateProvider) {
  $translateProvider.registerAvailableLanguageKeys(['en', 'ko'], {
    'en_US': 'en',
    'en_UK': 'en',
    'ko_KR': 'ko'
  }).determinePreferredLanguage();

  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
});

brandModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';
  $stateProvider.state('brand', {
    url: '/brand',
    abstract: 'true',
    template: '<ui-view/>'
  }).state('brand.main', {
    url: '/main',
    templateUrl: templateRoot + '/brand/main.html',
    controller: 'BrandMainController'
  }).state('brand.add', {
    url: '/add',
    templateUrl: templateRoot + '/brand/edit.html',
    controller: 'BrandEditController'
  }).state('brand.edit', {
    url: '/edit/:brandId',
    templateUrl: templateRoot + '/brand/edit.html',
    controller: 'BrandEditController'
  }).state('brand.inquiry', {
    url: '/inquiries',
    abstract: 'true',
    template: '<ui-view/>'
  }).state('brand.inquiry.list', {
    url: '/list',
    templateUrl: templateRoot + '/brand/inquiry-list.html',
    controller: 'BrandInquiryListController'
  }).state('brand.inquiry.info', {
    url: '/info/:inquiryId',
    templateUrl: templateRoot + '/brand/inquiry-info.html',
    controller: 'BrandInquiryInfoController'
  });
});

module.exports = brandModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../utils/module":19,"../third_party/angular-translate":14,"./i18n/translations.en.json":20,"./i18n/translations.ko.json":21,"./controllers.js":22}],
19: [function(require, module, exports) {
'use strict';

var utilModule = angular.module('backoffice.utils', ['ngCookies']);

utilModule.factory('boUtils', function ($http, $rootScope, $cookies, boConfig) {
  var isString = function isString(v) {
    return typeof v === 'string' || v instanceof String;
  };
  var getBuildingName = function getBuildingName(brand) {
    return _.get(brand, 'data.location.building.name.ko', '') + ' ' + _.get(brand, 'data.location.floor', '') + ' ' + _.get(brand, 'data.location.flatNumber', '') + '호';
  };
  var uploadImageFile201607 = function uploadImageFile201607(files) {
    var formData = new FormData();
    formData.append('images', files);
    // return $http.post('/api/v1/upload', formData, {
    return $http.post('/api/v1/upload', formData, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    }).then(function (res) {
      return res;
    }, function (err) {
      return window.alert(err);
    });
  };
  var startProgressBar = function startProgressBar() {
    Metronic.blockUI({ target: '#bo-content-container', boxed: true });
  };
  var stopProgressBar = function stopProgressBar() {
    Metronic.unblockUI('#bo-content-container');
  };
  var uploadImage201607 = function uploadImage201607(imageContent, _ref) {
    var name = _ref.name;
    var type = _ref.type;
    var thumbs = arguments.length <= 2 || arguments[2] === undefined ? '160,320,640' : arguments[2];

    var params = {
      content: imageContent,
      metaData: { name: name, type: type }
    };
    var query = 'thumbs=' + thumbs;
    return $http.post(boConfig.apiUrl + '/api/v1/upload/stream?' + query, params).then(function (res) {
      return res;
    }, function (err) {
      window.alert(err);
      throw err;
    });
  };
  return {
    // http://stackoverflow.com/questions/111529/create-query-parameters-in-javascript
    encodeQueryData: function encodeQueryData(url, data) {
      var ret = [];
      for (var d in data) {
        if (data.hasOwnProperty(d)) {
          ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        }
      }
      return url + '?' + ret.join("&");
    },
    refreshDatatableAjax: function refreshDatatableAjax(url, elem, dataKey) {
      $http.get(url).then(function (res) {
        var table = elem.find('table').dataTable();
        table.fnClearTable();
        if (res.data && res.data[dataKey]) {
          table.fnAddData(res.data[dataKey]);
        }
        table.fnDraw();
      });
    },
    formatDate: function formatDate(date, isDateOnly) {
      var mo = moment(date);
      if (isDateOnly) {
        return mo.format('YYYY-MM-DD');
      }
      return mo.format('YYYY-MM-DD hh:mm:ss');
      /*
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      const yyyy = date.getFullYear().toString();
      function appendLeadingZeroIfNeeded(str) {
        if (str[1]) return str;
        return '0' + str;
      }
      const mm = appendLeadingZeroIfNeeded((date.getMonth() + 1).toString()); // getMonth() is zero-based
      const dd  = appendLeadingZeroIfNeeded(date.getDate().toString());
       const HH = appendLeadingZeroIfNeeded(date.getHours().toString());
      const MM = appendLeadingZeroIfNeeded(date.getMinutes().toString());
      const SS = appendLeadingZeroIfNeeded(date.getSeconds().toString());
      return yyyy + '-' + mm + '-' + dd + ' ' + HH + ':' + MM + ':' + SS;
      */
    },
    autoComplete: function autoComplete(elem, name, data, fnGetDisplay) {
      var Bloodhound = window.Bloodhound;
      var tokenizer = Bloodhound.tokenizers.whitespace;
      if (fnGetDisplay) {
        tokenizer = function (datum) {
          return Bloodhound.tokenizers.whitespace(fnGetDisplay(datum));
        };
      }
      var option1 = {
        datumTokenizer: tokenizer,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: data
      };
      var source = new Bloodhound(option1);
      source.initialize();

      var option2 = {
        hint: false,
        highlight: true,
        minLength: 1
      };
      var option3 = {
        name: name,
        source: source.ttAdapter()
      };
      if (fnGetDisplay) {
        // option3.displayKey = valueKey;
        option3.display = function (d) {
          return fnGetDisplay(d);
        };
      }
      elem.typeahead(option2, option3);
    },
    uploadImage: function uploadImage(imageContent, publicId) {
      return $.ajax({
        url: 'https://api.cloudinary.com/v1_1/linkshops/image/upload',
        type: 'POST',
        // data: {file: imageContent, upload_preset: 'nd9k8295', public_id: `tmp/batch_image/${productId}-${productVariantId}-${i}`},
        data: { file: imageContent, upload_preset: 'nd9k8295', public_id: publicId }
      }).then(function (res) {
        return res;
      }, function (err) {
        return window.alert(err);
      });
    },
    uploadImage201607: uploadImage201607,
    uploadImageFile201607: uploadImageFile201607,
    getBuildingName: getBuildingName,
    getNameWithAllBuildingInfo: function getNameWithAllBuildingInfo(brand) {
      // format: 'Name (Building Floor FlatNumber)'
      var data = brand && brand.data;
      var name = brand && brand.name;
      if (!data || !name || !name.ko) {
        return '';
      }

      return name.ko + ' ( ' + getBuildingName(brand) + ' )'; // eslint-disable-line
    },
    startProgressBar: startProgressBar,
    stopProgressBar: stopProgressBar,
    isString: isString,
    shorten: function shorten(str) {
      var maxLen = arguments.length <= 1 || arguments[1] === undefined ? 15 : arguments[1];

      if (!isString(str)) {
        str = new String(str);
      }
      if (str.length > maxLen) {
        return str.substring(0, maxLen) + '...';
      }
      return str;
    },
    initDateBetween: function initDateBetween(startElem, endElem, state, storeKey) {
      var cookieStartKey = 'date-' + storeKey + '-start';
      var cookieEndKey = 'date-' + storeKey + '-end';
      var startValue = $cookies.get(cookieStartKey);
      var endValue = $cookies.get(cookieEndKey);
      _.set($rootScope, storeKey + '.startDate', startValue || '');
      _.set($rootScope, storeKey + '.endDate', endValue || '');
      startElem.datepicker({ autoclose: true });
      endElem.datepicker({ autoclose: true });
      // 2016. 07. 13. [heekyu] expires in 1 hour
      var cookieOptions = {
        expires: moment().add(1, 'hour').toDate()
      };
      startElem.on('change', function () {
        var newValue = startElem.val();
        $cookies.put(cookieStartKey, newValue, cookieOptions);
        if (newValue && endValue && new Date(newValue).getTime() > new Date(endValue).getTime()) {
          $cookies.put(cookieEndKey, newValue, cookieOptions);
        }
        state.reload();
      });
      endElem.on('change', function () {
        var newValue = endElem.val();
        $cookies.put(cookieEndKey, newValue, cookieOptions);
        if (startValue && newValue && new Date(startValue).getTime() > new Date(newValue).getTime()) {
          $cookies.put(cookieStartKey, newValue, cookieOptions);
        }
        state.reload();
      });
    },
    calcTax: function calcTax(price) {
      price = new Decimal(price);
      var supply = +price.div(1.1).toFixed(0, Decimal.ROUND_CEIL);
      var tax = price.sub(new Decimal(supply)).toNumber();
      return { supply: supply, tax: tax };
    },
    // http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
    post: function post(path, params, method) {
      /* CUSTOM LOGIC */
      if (path.length && path[0] === '/') {
        path = '' + boConfig.apiUrl + path;
      }
      /* CUSTOM LOGIC */
      method = method || "post"; // Set method to post by default if not specified.

      // The rest of this code assumes you are not using a library.
      // It can be made less wordy if you use one.
      var form = document.createElement("form");
      form.setAttribute("method", method);
      form.setAttribute("action", path);

      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);

          form.appendChild(hiddenField);
        }
      }

      document.body.appendChild(form);
      form.submit();
    },
    getSummerNoteImageUpload: function getSummerNoteImageUpload(files, node) {
      var file = files[0];
      var metaData = _.pick(file, ['name', 'type']);
      var r = new FileReader();
      startProgressBar();
      r.onload = function (e) {
        uploadImage201607(e.target.result, metaData, '').then(function (res) {
          stopProgressBar();
          var resultImage = res.data.images[0];
          var elem = $('<img>').attr('src', resultImage.url);
          node.summernote('insertNode', elem[0]);
          // editor.insertImage(welEditable, resultImage.url);
        })['catch'](function (err) {
          stopProgressBar();
          throw err;
        });
      };
      r.readAsBinaryString(file);
    }
  };
});

utilModule.factory('convertUtil', function () {
  return {
    copyFieldObj: function copyFieldObj(fields, origObj) {
      fields.forEach(function (field) {
        if (!field.key) return;
        _.set(origObj, field.key, field.obj);
      });
    }
  };
});

module.exports = utilModule;
}, {}],
14: [function(require, module, exports) {
'use strict';

module.exports = require('angular-translate/bower-angular-translate@2.7.2:angular-translate.min.js');
}, {"angular-translate/bower-angular-translate@2.7.2:angular-translate.min.js":23}],
23: [function(require, module, exports) {
/*!
 * angular-translate - v2.7.2 - 2015-06-01
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
"use strict";

!(function (a, b) {
  "function" == typeof define && define.amd ? define([], function () {
    return b();
  }) : "object" == typeof exports ? module.exports = b() : b();
})(undefined, function () {
  function a(a) {
    "use strict";var b = a.storageKey(),
        c = a.storage(),
        d = function d() {
      var d = a.preferredLanguage();angular.isString(d) ? a.use(d) : c.put(b, a.use());
    };d.displayName = "fallbackFromIncorrectStorageValue", c ? c.get(b) ? a.use(c.get(b))["catch"](d) : d() : angular.isString(a.preferredLanguage()) && a.use(a.preferredLanguage());
  }function b() {
    "use strict";var a,
        b,
        c = null,
        d = !1,
        e = !1;b = { sanitize: function sanitize(a, b) {
        return "text" === b && (a = g(a)), a;
      }, escape: function escape(a, b) {
        return "text" === b && (a = f(a)), a;
      }, sanitizeParameters: function sanitizeParameters(a, b) {
        return "params" === b && (a = h(a, g)), a;
      }, escapeParameters: function escapeParameters(a, b) {
        return "params" === b && (a = h(a, f)), a;
      } }, b.escaped = b.escapeParameters, this.addStrategy = function (a, c) {
      return b[a] = c, this;
    }, this.removeStrategy = function (a) {
      return delete b[a], this;
    }, this.useStrategy = function (a) {
      return d = !0, c = a, this;
    }, this.$get = ["$injector", "$log", function (f, g) {
      var h = function h(a, c, d) {
        return angular.forEach(d, function (d) {
          if (angular.isFunction(d)) a = d(a, c);else {
            if (!angular.isFunction(b[d])) throw new Error("pascalprecht.translate.$translateSanitization: Unknown sanitization strategy: '" + d + "'");a = b[d](a, c);
          }
        }), a;
      },
          i = function i() {
        d || e || (g.warn("pascalprecht.translate.$translateSanitization: No sanitization strategy has been configured. This can have serious security implications. See http://angular-translate.github.io/docs/#/guide/19_security for details."), e = !0);
      };return f.has("$sanitize") && (a = f.get("$sanitize")), { useStrategy: (function (a) {
          return function (b) {
            a.useStrategy(b);
          };
        })(this), sanitize: function sanitize(a, b, d) {
          if ((c || i(), arguments.length < 3 && (d = c), !d)) return a;var e = angular.isArray(d) ? d : [d];return h(a, b, e);
        } };
    }];var f = function f(a) {
      var b = angular.element("<div></div>");return b.text(a), b.html();
    },
        g = function g(b) {
      if (!a) throw new Error("pascalprecht.translate.$translateSanitization: Error cannot find $sanitize service. Either include the ngSanitize module (https://docs.angularjs.org/api/ngSanitize) or use a sanitization strategy which does not depend on $sanitize, such as 'escape'.");return a(b);
    },
        h = function h(a, b) {
      if (angular.isObject(a)) {
        var c = angular.isArray(a) ? [] : {};return angular.forEach(a, function (a, d) {
          c[d] = h(a, b);
        }), c;
      }return angular.isNumber(a) ? a : b(a);
    };
  }function c(a, b, c, d) {
    "use strict";var e,
        f,
        g,
        h,
        i,
        j,
        k,
        l,
        m,
        n,
        o,
        p,
        q,
        r,
        s,
        t = {},
        u = [],
        v = a,
        w = [],
        x = "translate-cloak",
        y = !1,
        z = !1,
        A = ".",
        B = 0,
        C = !0,
        D = "default",
        E = { "default": function _default(a) {
        return (a || "").split("-").join("_");
      }, java: function java(a) {
        var b = (a || "").split("-").join("_"),
            c = b.split("_");return c.length > 1 ? c[0].toLowerCase() + "_" + c[1].toUpperCase() : b;
      }, bcp47: function bcp47(a) {
        var b = (a || "").split("_").join("-"),
            c = b.split("-");return c.length > 1 ? c[0].toLowerCase() + "-" + c[1].toUpperCase() : b;
      } },
        F = "2.7.2",
        G = function G() {
      if (angular.isFunction(d.getLocale)) return d.getLocale();var a,
          c,
          e = b.$get().navigator,
          f = ["language", "browserLanguage", "systemLanguage", "userLanguage"];if (angular.isArray(e.languages)) for (a = 0; a < e.languages.length; a++) if ((c = e.languages[a], c && c.length)) return c;for (a = 0; a < f.length; a++) if ((c = e[f[a]], c && c.length)) return c;return null;
    };G.displayName = "angular-translate/service: getFirstBrowserLanguage";var H = function H() {
      var a = G() || "";return E[D] && (a = E[D](a)), a;
    };H.displayName = "angular-translate/service: getLocale";var I = function I(a, b) {
      for (var c = 0, d = a.length; d > c; c++) if (a[c] === b) return c;return -1;
    },
        J = function J() {
      return this.toString().replace(/^\s+|\s+$/g, "");
    },
        K = function K(a) {
      for (var b = [], c = angular.lowercase(a), d = 0, e = u.length; e > d; d++) b.push(angular.lowercase(u[d]));if (I(b, c) > -1) return a;if (f) {
        var g;for (var h in f) {
          var i = !1,
              j = Object.prototype.hasOwnProperty.call(f, h) && angular.lowercase(h) === angular.lowercase(a);if (("*" === h.slice(-1) && (i = h.slice(0, -1) === a.slice(0, h.length - 1)), (j || i) && (g = f[h], I(b, angular.lowercase(g)) > -1))) return g;
        }
      }if (a) {
        var k = a.split("_");if (k.length > 1 && I(b, angular.lowercase(k[0])) > -1) return k[0];
      }return a;
    },
        L = function L(a, b) {
      if (!a && !b) return t;if (a && !b) {
        if (angular.isString(a)) return t[a];
      } else angular.isObject(t[a]) || (t[a] = {}), angular.extend(t[a], M(b));return this;
    };this.translations = L, this.cloakClassName = function (a) {
      return a ? (x = a, this) : x;
    };var M = function M(a, b, c, d) {
      var e, f, g, h;b || (b = []), c || (c = {});for (e in a) Object.prototype.hasOwnProperty.call(a, e) && (h = a[e], angular.isObject(h) ? M(h, b.concat(e), c, e) : (f = b.length ? "" + b.join(A) + A + e : e, b.length && e === d && (g = "" + b.join(A), c[g] = "@:" + f), c[f] = h));return c;
    };M.displayName = "flatObject", this.addInterpolation = function (a) {
      return w.push(a), this;
    }, this.useMessageFormatInterpolation = function () {
      return this.useInterpolation("$translateMessageFormatInterpolation");
    }, this.useInterpolation = function (a) {
      return n = a, this;
    }, this.useSanitizeValueStrategy = function (a) {
      return c.useStrategy(a), this;
    }, this.preferredLanguage = function (a) {
      return N(a), this;
    };var N = function N(a) {
      return a && (e = a), e;
    };this.translationNotFoundIndicator = function (a) {
      return this.translationNotFoundIndicatorLeft(a), this.translationNotFoundIndicatorRight(a), this;
    }, this.translationNotFoundIndicatorLeft = function (a) {
      return a ? (q = a, this) : q;
    }, this.translationNotFoundIndicatorRight = function (a) {
      return a ? (r = a, this) : r;
    }, this.fallbackLanguage = function (a) {
      return O(a), this;
    };var O = function O(a) {
      return a ? (angular.isString(a) ? (h = !0, g = [a]) : angular.isArray(a) && (h = !1, g = a), angular.isString(e) && I(g, e) < 0 && g.push(e), this) : h ? g[0] : g;
    };this.use = function (a) {
      if (a) {
        if (!t[a] && !o) throw new Error("$translateProvider couldn't find translationTable for langKey: '" + a + "'");return i = a, this;
      }return i;
    };var P = function P(a) {
      return a ? (v = a, this) : l ? l + v : v;
    };this.storageKey = P, this.useUrlLoader = function (a, b) {
      return this.useLoader("$translateUrlLoader", angular.extend({ url: a }, b));
    }, this.useStaticFilesLoader = function (a) {
      return this.useLoader("$translateStaticFilesLoader", a);
    }, this.useLoader = function (a, b) {
      return o = a, p = b || {}, this;
    }, this.useLocalStorage = function () {
      return this.useStorage("$translateLocalStorage");
    }, this.useCookieStorage = function () {
      return this.useStorage("$translateCookieStorage");
    }, this.useStorage = function (a) {
      return k = a, this;
    }, this.storagePrefix = function (a) {
      return a ? (l = a, this) : a;
    }, this.useMissingTranslationHandlerLog = function () {
      return this.useMissingTranslationHandler("$translateMissingTranslationHandlerLog");
    }, this.useMissingTranslationHandler = function (a) {
      return m = a, this;
    }, this.usePostCompiling = function (a) {
      return y = !!a, this;
    }, this.forceAsyncReload = function (a) {
      return z = !!a, this;
    }, this.uniformLanguageTag = function (a) {
      return a ? angular.isString(a) && (a = { standard: a }) : a = {}, D = a.standard, this;
    }, this.determinePreferredLanguage = function (a) {
      var b = a && angular.isFunction(a) ? a() : H();return e = u.length ? K(b) : b, this;
    }, this.registerAvailableLanguageKeys = function (a, b) {
      return a ? (u = a, b && (f = b), this) : u;
    }, this.useLoaderCache = function (a) {
      return a === !1 ? s = void 0 : a === !0 ? s = !0 : "undefined" == typeof a ? s = "$translationCache" : a && (s = a), this;
    }, this.directivePriority = function (a) {
      return void 0 === a ? B : (B = a, this);
    }, this.statefulFilter = function (a) {
      return void 0 === a ? C : (C = a, this);
    }, this.$get = ["$log", "$injector", "$rootScope", "$q", function (a, b, c, d) {
      var f,
          l,
          u,
          A = b.get(n || "$translateDefaultInterpolation"),
          D = !1,
          E = {},
          G = {},
          H = function H(a, b, c, h) {
        if (angular.isArray(a)) {
          var j = function j(a) {
            for (var e = {}, f = [], g = function g(a) {
              var f = d.defer(),
                  g = function g(b) {
                e[a] = b, f.resolve([a, b]);
              };return H(a, b, c, h).then(g, g), f.promise;
            }, i = 0, j = a.length; j > i; i++) f.push(g(a[i]));return d.all(f).then(function () {
              return e;
            });
          };return j(a);
        }var m = d.defer();a && (a = J.apply(a));var n = (function () {
          var a = e ? G[e] : G[i];if ((l = 0, k && !a)) {
            var b = f.get(v);if ((a = G[b], g && g.length)) {
              var c = I(g, b);l = 0 === c ? 1 : 0, I(g, e) < 0 && g.push(e);
            }
          }return a;
        })();if (n) {
          var o = function o() {
            ab(a, b, c, h).then(m.resolve, m.reject);
          };o.displayName = "promiseResolved", n["finally"](o, m.reject);
        } else ab(a, b, c, h).then(m.resolve, m.reject);return m.promise;
      },
          Q = function Q(a) {
        return q && (a = [q, a].join(" ")), r && (a = [a, r].join(" ")), a;
      },
          R = function R(a) {
        i = a, c.$emit("$translateChangeSuccess", { language: a }), k && f.put(H.storageKey(), i), A.setLocale(i);var b = function b(a, _b) {
          E[_b].setLocale(i);
        };b.displayName = "eachInterpolatorLocaleSetter", angular.forEach(E, b), c.$emit("$translateChangeEnd", { language: a });
      },
          S = function S(a) {
        if (!a) throw "No language key specified for loading.";var e = d.defer();c.$emit("$translateLoadingStart", { language: a }), D = !0;var f = s;"string" == typeof f && (f = b.get(f));var g = angular.extend({}, p, { key: a, $http: angular.extend({}, { cache: f }, p.$http) }),
            h = function h(b) {
          var d = {};c.$emit("$translateLoadingSuccess", { language: a }), angular.isArray(b) ? angular.forEach(b, function (a) {
            angular.extend(d, M(a));
          }) : angular.extend(d, M(b)), D = !1, e.resolve({ key: a, table: d }), c.$emit("$translateLoadingEnd", { language: a });
        };h.displayName = "onLoaderSuccess";var i = function i(a) {
          c.$emit("$translateLoadingError", { language: a }), e.reject(a), c.$emit("$translateLoadingEnd", { language: a });
        };return i.displayName = "onLoaderError", b.get(o)(g).then(h, i), e.promise;
      };if (k && (f = b.get(k), !f.get || !f.put)) throw new Error("Couldn't use storage '" + k + "', missing get() or put() method!");if (w.length) {
        var T = function T(a) {
          var c = b.get(a);c.setLocale(e || i), E[c.getInterpolationIdentifier()] = c;
        };T.displayName = "interpolationFactoryAdder", angular.forEach(w, T);
      }var U = function U(a) {
        var b = d.defer();if (Object.prototype.hasOwnProperty.call(t, a)) b.resolve(t[a]);else if (G[a]) {
          var c = function c(a) {
            L(a.key, a.table), b.resolve(a.table);
          };c.displayName = "translationTableResolver", G[a].then(c, b.reject);
        } else b.reject();return b.promise;
      },
          V = function V(a, b, c, e) {
        var f = d.defer(),
            g = function g(d) {
          if (Object.prototype.hasOwnProperty.call(d, b)) {
            e.setLocale(a);var g = d[b];"@:" === g.substr(0, 2) ? V(a, g.substr(2), c, e).then(f.resolve, f.reject) : f.resolve(e.interpolate(d[b], c)), e.setLocale(i);
          } else f.reject();
        };return g.displayName = "fallbackTranslationResolver", U(a).then(g, f.reject), f.promise;
      },
          W = function W(_x, _x2, _x3, _x4) {
        var _again = true;

        _function: while (_again) {
          var a = _x,
              b = _x2,
              c = _x3,
              d = _x4;
          _again = false;
          var e,
              f = t[a];if (f && Object.prototype.hasOwnProperty.call(f, b)) {
            if ((d.setLocale(a), e = d.interpolate(f[b], c), "@:" === e.substr(0, 2))) {
              _x = a;
              _x2 = e.substr(2);
              _x3 = c;
              _x4 = d;
              _again = true;
              e = f = undefined;
              continue _function;
            }d.setLocale(i);
          }return e;
        }
      },
          X = function X(a, c) {
        if (m) {
          var d = b.get(m)(a, i, c);return void 0 !== d ? d : a;
        }return a;
      },
          Y = function Y(a, b, c, e, f) {
        var h = d.defer();if (a < g.length) {
          var i = g[a];V(i, b, c, e).then(h.resolve, function () {
            Y(a + 1, b, c, e, f).then(h.resolve);
          });
        } else h.resolve(f ? f : X(b, c));return h.promise;
      },
          Z = function Z(a, b, c, d) {
        var e;if (a < g.length) {
          var f = g[a];e = W(f, b, c, d), e || (e = Z(a + 1, b, c, d));
        }return e;
      },
          $ = function $(a, b, c, d) {
        return Y(u > 0 ? u : l, a, b, c, d);
      },
          _ = function _(a, b, c) {
        return Z(u > 0 ? u : l, a, b, c);
      },
          ab = function ab(a, b, c, e) {
        var f = d.defer(),
            h = i ? t[i] : t,
            j = c ? E[c] : A;if (h && Object.prototype.hasOwnProperty.call(h, a)) {
          var k = h[a];"@:" === k.substr(0, 2) ? H(k.substr(2), b, c, e).then(f.resolve, f.reject) : f.resolve(j.interpolate(k, b));
        } else {
          var l;m && !D && (l = X(a, b)), i && g && g.length ? $(a, b, j, e).then(function (a) {
            f.resolve(a);
          }, function (a) {
            f.reject(Q(a));
          }) : m && !D && l ? f.resolve(e ? e : l) : e ? f.resolve(e) : f.reject(Q(a));
        }return f.promise;
      },
          bb = function bb(a, b, c) {
        var d,
            e = i ? t[i] : t,
            f = A;if ((E && Object.prototype.hasOwnProperty.call(E, c) && (f = E[c]), e && Object.prototype.hasOwnProperty.call(e, a))) {
          var h = e[a];d = "@:" === h.substr(0, 2) ? bb(h.substr(2), b, c) : f.interpolate(h, b);
        } else {
          var j;m && !D && (j = X(a, b)), i && g && g.length ? (l = 0, d = _(a, b, f)) : d = m && !D && j ? j : Q(a);
        }return d;
      },
          cb = function cb(a) {
        j === a && (j = void 0), G[a] = void 0;
      };if ((H.preferredLanguage = function (a) {
        return a && N(a), e;
      }, H.cloakClassName = function () {
        return x;
      }, H.fallbackLanguage = function (a) {
        if (void 0 !== a && null !== a) {
          if ((O(a), o && g && g.length)) for (var b = 0, c = g.length; c > b; b++) G[g[b]] || (G[g[b]] = S(g[b]));H.use(H.use());
        }return h ? g[0] : g;
      }, H.useFallbackLanguage = function (a) {
        if (void 0 !== a && null !== a) if (a) {
          var b = I(g, a);b > -1 && (u = b);
        } else u = 0;
      }, H.proposedLanguage = function () {
        return j;
      }, H.storage = function () {
        return f;
      }, H.use = function (a) {
        if (!a) return i;var b = d.defer();c.$emit("$translateChangeStart", { language: a });var e = K(a);return e && (a = e), !z && t[a] || !o || G[a] ? j === a && G[a] ? G[a].then(function (a) {
          return b.resolve(a.key), a;
        }, function (a) {
          return b.reject(a), d.reject(a);
        }) : (b.resolve(a), R(a)) : (j = a, G[a] = S(a).then(function (a) {
          return L(a.key, a.table), b.resolve(a.key), R(a.key), a;
        }, function (a) {
          return c.$emit("$translateChangeError", { language: a }), b.reject(a), c.$emit("$translateChangeEnd", { language: a }), d.reject(a);
        }), G[a]["finally"](function () {
          cb(a);
        })), b.promise;
      }, H.storageKey = function () {
        return P();
      }, H.isPostCompilingEnabled = function () {
        return y;
      }, H.isForceAsyncReloadEnabled = function () {
        return z;
      }, H.refresh = function (a) {
        function b() {
          f.resolve(), c.$emit("$translateRefreshEnd", { language: a });
        }function e() {
          f.reject(), c.$emit("$translateRefreshEnd", { language: a });
        }if (!o) throw new Error("Couldn't refresh translation table, no loader registered!");var f = d.defer();if ((c.$emit("$translateRefreshStart", { language: a }), a)) if (t[a]) {
          var h = function h(c) {
            L(c.key, c.table), a === i && R(i), b();
          };h.displayName = "refreshPostProcessor", S(a).then(h, e);
        } else e();else {
          var j = [],
              k = {};if (g && g.length) for (var l = 0, m = g.length; m > l; l++) j.push(S(g[l])), k[g[l]] = !0;i && !k[i] && j.push(S(i));var n = function n(a) {
            t = {}, angular.forEach(a, function (a) {
              L(a.key, a.table);
            }), i && R(i), b();
          };n.displayName = "refreshPostProcessor", d.all(j).then(n, e);
        }return f.promise;
      }, H.instant = function (a, b, c) {
        if (null === a || angular.isUndefined(a)) return a;if (angular.isArray(a)) {
          for (var d = {}, f = 0, h = a.length; h > f; f++) d[a[f]] = H.instant(a[f], b, c);return d;
        }if (angular.isString(a) && a.length < 1) return a;a && (a = J.apply(a));var j,
            k = [];e && k.push(e), i && k.push(i), g && g.length && (k = k.concat(g));for (var l = 0, n = k.length; n > l; l++) {
          var o = k[l];if ((t[o] && ("undefined" != typeof t[o][a] ? j = bb(a, b, c) : (q || r) && (j = Q(a))), "undefined" != typeof j)) break;
        }return j || "" === j || (j = A.interpolate(a, b), m && !D && (j = X(a, b))), j;
      }, H.versionInfo = function () {
        return F;
      }, H.loaderCache = function () {
        return s;
      }, H.directivePriority = function () {
        return B;
      }, H.statefulFilter = function () {
        return C;
      }, o && (angular.equals(t, {}) && H.use(H.use()), g && g.length))) for (var db = function db(a) {
        return L(a.key, a.table), c.$emit("$translateChangeEnd", { language: a.key }), a;
      }, eb = 0, fb = g.length; fb > eb; eb++) {
        var gb = g[eb];(z || !t[gb]) && (G[gb] = S(gb).then(db));
      }return H;
    }];
  }function d(a, b) {
    "use strict";var c,
        d = {},
        e = "default";return d.setLocale = function (a) {
      c = a;
    }, d.getInterpolationIdentifier = function () {
      return e;
    }, d.useSanitizeValueStrategy = function (a) {
      return b.useStrategy(a), this;
    }, d.interpolate = function (c, d) {
      d = d || {}, d = b.sanitize(d, "params");var e = a(c)(d);return e = b.sanitize(e, "text");
    }, d;
  }function e(a, b, c, d, e, f) {
    "use strict";var g = function g() {
      return this.toString().replace(/^\s+|\s+$/g, "");
    };return { restrict: "AE", scope: !0, priority: a.directivePriority(), compile: function compile(b, h) {
        var i = h.translateValues ? h.translateValues : void 0,
            j = h.translateInterpolation ? h.translateInterpolation : void 0,
            k = b[0].outerHTML.match(/translate-value-+/i),
            l = "^(.*)(" + c.startSymbol() + ".*" + c.endSymbol() + ")(.*)",
            m = "^(.*)" + c.startSymbol() + "(.*)" + c.endSymbol() + "(.*)";return function (b, n, o) {
          b.interpolateParams = {}, b.preText = "", b.postText = "";var p = {},
              q = function q(a, c, d) {
            if ((c.translateValues && angular.extend(a, e(c.translateValues)(b.$parent)), k)) for (var f in d) if (Object.prototype.hasOwnProperty.call(c, f) && "translateValue" === f.substr(0, 14) && "translateValues" !== f) {
              var g = angular.lowercase(f.substr(14, 1)) + f.substr(15);a[g] = d[f];
            }
          },
              r = function r(a) {
            if ((angular.isFunction(r._unwatchOld) && (r._unwatchOld(), r._unwatchOld = void 0), angular.equals(a, "") || !angular.isDefined(a))) {
              var d = g.apply(n.text()).match(l);if (angular.isArray(d)) {
                b.preText = d[1], b.postText = d[3], p.translate = c(d[2])(b.$parent);var e = n.text().match(m);angular.isArray(e) && e[2] && e[2].length && (r._unwatchOld = b.$watch(e[2], function (a) {
                  p.translate = a, x();
                }));
              } else p.translate = n.text().replace(/^\s+|\s+$/g, "");
            } else p.translate = a;x();
          },
              s = function s(a) {
            o.$observe(a, function (b) {
              p[a] = b, x();
            });
          };q(b.interpolateParams, o, h);var t = !0;o.$observe("translate", function (a) {
            "undefined" == typeof a ? r("") : "" === a && t || (p.translate = a, x()), t = !1;
          });for (var u in o) o.hasOwnProperty(u) && "translateAttr" === u.substr(0, 13) && s(u);if ((o.$observe("translateDefault", function (a) {
            b.defaultText = a;
          }), i && o.$observe("translateValues", function (a) {
            a && b.$parent.$watch(function () {
              angular.extend(b.interpolateParams, e(a)(b.$parent));
            });
          }), k)) {
            var v = function v(a) {
              o.$observe(a, function (c) {
                var d = angular.lowercase(a.substr(14, 1)) + a.substr(15);b.interpolateParams[d] = c;
              });
            };for (var w in o) Object.prototype.hasOwnProperty.call(o, w) && "translateValue" === w.substr(0, 14) && "translateValues" !== w && v(w);
          }var x = function x() {
            for (var a in p) p.hasOwnProperty(a) && void 0 !== p[a] && y(a, p[a], b, b.interpolateParams, b.defaultText);
          },
              y = function y(b, c, d, e, f) {
            c ? a(c, e, j, f).then(function (a) {
              z(a, d, !0, b);
            }, function (a) {
              z(a, d, !1, b);
            }) : z(c, d, !1, b);
          },
              z = function z(b, c, e, f) {
            if ("translate" === f) {
              e || "undefined" == typeof c.defaultText || (b = c.defaultText), n.html(c.preText + b + c.postText);var g = a.isPostCompilingEnabled(),
                  i = "undefined" != typeof h.translateCompile,
                  j = i && "false" !== h.translateCompile;(g && !i || j) && d(n.contents())(c);
            } else {
              e || "undefined" == typeof c.defaultText || (b = c.defaultText);var k = o.$attr[f];"data-" === k.substr(0, 5) && (k = k.substr(5)), k = k.substr(15), n.attr(k, b);
            }
          };(i || k || o.translateDefault) && b.$watch("interpolateParams", x, !0);var A = f.$on("$translateChangeSuccess", x);n.text().length ? r(o.translate ? o.translate : "") : o.translate && r(o.translate), x(), b.$on("$destroy", A);
        };
      } };
  }function f(a, b) {
    "use strict";return { compile: function compile(c) {
        var d = function d() {
          c.addClass(b.cloakClassName());
        },
            e = function e() {
          c.removeClass(b.cloakClassName());
        },
            f = a.$on("$translateChangeEnd", function () {
          e(), f(), f = null;
        });return d(), function (a, c, f) {
          f.translateCloak && f.translateCloak.length && f.$observe("translateCloak", function (a) {
            b(a).then(e, d);
          });
        };
      } };
  }function g(a, b) {
    "use strict";var c = function c(_c, d, e) {
      return angular.isObject(d) || (d = a(d)(this)), b.instant(_c, d, e);
    };return b.statefulFilter() && (c.$stateful = !0), c;
  }function h(a) {
    "use strict";return a("translations");
  }return angular.module("pascalprecht.translate", ["ng"]).run(a), a.$inject = ["$translate"], a.displayName = "runTranslate", angular.module("pascalprecht.translate").provider("$translateSanitization", b), angular.module("pascalprecht.translate").constant("pascalprechtTranslateOverrider", {}).provider("$translate", c), c.$inject = ["$STORAGE_KEY", "$windowProvider", "$translateSanitizationProvider", "pascalprechtTranslateOverrider"], c.displayName = "displayName", angular.module("pascalprecht.translate").factory("$translateDefaultInterpolation", d), d.$inject = ["$interpolate", "$translateSanitization"], d.displayName = "$translateDefaultInterpolation", angular.module("pascalprecht.translate").constant("$STORAGE_KEY", "NG_TRANSLATE_LANG_KEY"), angular.module("pascalprecht.translate").directive("translate", e), e.$inject = ["$translate", "$q", "$interpolate", "$compile", "$parse", "$rootScope"], e.displayName = "translateDirective", angular.module("pascalprecht.translate").directive("translateCloak", f), f.$inject = ["$rootScope", "$translate"], f.displayName = "translateCloakDirective", angular.module("pascalprecht.translate").filter("translate", g), g.$inject = ["$parse", "$translate"], g.displayName = "translateFilterFactory", angular.module("pascalprecht.translate").factory("$translationCache", h), h.$inject = ["$cacheFactory"], h.displayName = "$translationCache", "pascalprecht.translate";
});
}, {}],
20: [function(require, module, exports) {
module.exports = {

};
}, {}],
21: [function(require, module, exports) {
module.exports = {
  "brand": {
    "title": "브랜드",
    "createButton": "브랜드 생성",
    "main": {
      "createBrandTitle": "브랜드 생성"
    },
    "edit": {
      "nameLabel": "브랜드명",
      "pathnameLabel": "브랜드 페이지 주소",
      "bizNameLabel": "사업자명",
      "bizNumberLabel": "사업자 번호",
      "accountBankLabel": "은행",
      "accountOwnerLabel": "예금주",
      "accountNumberLabel": "계좌번호",
      "buildingLabel": "빌딩",
      "buildingFloorLabel": "빌딩 층",
      "buildingFlatNumberLabel": "빌딩 호수",
      "telLabel": "전화 번호",
      "mobileLabel": "핸드폰 번호",
      "aliasLabel": "약어",
      "selectUser": "유저 선택"
    },
    "inquiry": {
      "title": "입점신청",
      "info": {
        "title": "신청정보",
        "nameLabel": "업체명",
        "contactNameLabel": "연락처",
        "telLabel": "연락처",
        "emailLabel": "이메일",
        "buildingLabel": "판매상가",
        "floorLabel": "층",
        "flatNumberLabel": "호수",
        "productTypeLabel": "판매물품"
      }
    }
  }
}
;
}, {}],
22: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var brandModule = require('./module');

brandModule.factory('brandCommons', function ($http) {
  return {
    saveBrand: function saveBrand(brand) {
      var brandsUrl = '/api/v1/brands';
      var promise = null;
      var brandFields = ['pathname', 'name'];
      if (brand.id) {
        promise = $http.put('brandsUrl/' + brand.id, _.pick(brand, brandFields));
      } else {
        promise = $http.post(brandsUrl, _.pick(brand, brandFields));
      }
      return promise.then(function (res) {
        $http.put('/api/v1/brands/' + res.data.id + '/index').then(function () {
          // ignore
        });
        return res;
      });
    }
  };
});

brandModule.controller('BrandMainController', function ($scope, $http, $element, $compile, brandCommons, boUtils) {
  var brandsUrl = '/api/v1/brands';
  var fieldName = 'brands';
  $scope.brandDatatables = {
    field: fieldName,
    storeKey: 'brandMain',
    url: brandsUrl,
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="brand.edit({brandId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: 'name.ko',
      orderable: false
    }, {
      data: function data(_data) {
        return _.get(_data, 'data.tel') || '';
      },
      orderable: false
    }, {
      data: function data(_data2) {
        return _.get(_data2, 'data.location.building.name.ko') || '';
      },
      orderable: false
    }, {
      data: function data(_data3) {
        return _.get(_data3, 'data.location.floor') || '';
      },
      orderable: false
    }, {
      data: function data(_data4) {
        return _.get(_data4, 'data.location.flatNumber') || '';
      },
      orderable: false
    }, {
      data: function data(_data5) {
        return _.get(_data5, 'data.bank.name') || '';
      },
      orderable: false
    }, {
      data: function data(_data6) {
        return _.get(_data6, 'data.bank.accountNumber') || '';
      },
      orderable: false
    }, {
      data: function data(_data7) {
        return _.get(_data7, 'data.bank.accountHolder') || '';
      },
      orderable: false
    }, {
      data: function data(_data8) {
        return _data8;
      },
      render: function render(data) {
        var users = _.get(data, 'summary.users');
        if (users && users.length) {
          for (var i = 0; i < users.length; i++) {
            var user = users[i];
            for (var j = 0; j < (user.roles || []).length; j++) {
              var role = user.roles[j];
              if (role.type === 'owner' && _.get(role, 'brand.id') === data.id) {
                return '<a ui-sref="user.info({userId: ' + user.id + '})">' + user.email + '</a>';
              }
            }
          }
        }
        return '';
      },
      orderable: false
    }, {
      data: function data(_data9) {
        return _data9;
      },
      render: function render(data) {
        var productSummary = _.get(data, 'summary.product');
        if (!productSummary) {
          return '';
        }
        return '\n            총 ' + productSummary.cnt + ' 개 상품<br />\n            ' + boUtils.formatDate(productSummary.lastProductCreatedAt) + '<br/>\n            <a ui-sref="product.edit({productId: ' + productSummary.lastProductId + '})">' + productSummary.lastProductId + '</a>\n          ';
      },
      orderable: false
    }]
  };

  $scope.createBrand = function (brand) {
    brandCommons.saveBrand(brand).then(function () {
      $scope.closeBrandPopup();
      $scope.newBrand.name = {};
      boUtils.refreshDatatableAjax(brandsUrl, $($element), fieldName);
    })['catch'](function (err) {
      var message = err.data.message;
      if (!message) {
        message = 'ERROR Occurred';
      }
      window.alert(message);
    });
  };

  $scope.newBrand = {
    name: {}
  };

  $scope.closeBrandPopup = function () {
    $('#new_brand_modal').modal('hide');
  };

  $scope.datatablesLoaded = function () {};
});

brandModule.controller('BrandEditController', function ($scope, $http, $q, $state, $rootScope, $translate, $compile, boUtils, convertUtil, userUtil) {
  var initFields = function initFields() {
    if (!$scope.brand.data) {
      $scope.brand.data = {};
    }
    $scope.contentTitle = $translate.instant('brand.title');
    $scope.contentSubTitle = '';
    $scope.breadcrumb = [{
      sref: 'dashboard',
      name: $translate.instant('dashboard.home')
    }, {
      sref: 'brand.main',
      name: $translate.instant('brand.title')
    }, {
      name: _.get($scope.brand, 'name.ko')
    }];
    $rootScope.initAll($scope, $state.current.name);

    $scope.brandFields1 = [{ title: 'ID', key: 'id', obj: $scope.brand.id, isReadOnly: true }, { title: $translate.instant('brand.edit.nameLabel'), obj: _.get($scope.brand, 'name.ko'), key: 'name.ko' }];
    $scope.brandFields2 = [{ title: $translate.instant('brand.edit.buildingFloorLabel'), obj: _.get($scope.brand, 'data.location.floor'), key: 'data.location.floor' }, { title: $translate.instant('brand.edit.buildingFlatNumberLabel'), obj: _.get($scope.brand, 'data.location.flatNumber'), key: 'data.location.flatNumber' }, { title: $translate.instant('brand.edit.bizNameLabel'), obj: _.get($scope.brand, 'data.businessRegistration.name'), key: 'data.businessRegistration.name' }, { title: $translate.instant('brand.edit.bizNumberLabel'), obj: _.get($scope.brand, 'data.businessRegistration.number'), key: 'data.businessRegistration.number' }, { title: $translate.instant('brand.edit.accountBankLabel'), obj: _.get($scope.brand, 'data.bank.name'), key: 'data.bank.name' }, { title: $translate.instant('brand.edit.accountOwnerLabel'), obj: _.get($scope.brand, 'data.bank.accountHolder'), key: 'data.bank.accountHolder' }, { title: $translate.instant('brand.edit.accountNumberLabel'), obj: _.get($scope.brand, 'data.bank.accountNumber'), key: 'data.bank.accountNumber' }, { title: $translate.instant('brand.edit.telLabel'), obj: _.get($scope.brand, 'data.tel'), key: 'data.tel' }, { title: $translate.instant('brand.edit.mobileLabel'), obj: _.get($scope.brand, 'data.mobile'), key: 'data.mobile' }];

    $scope.buildingMap = {};
    $scope.buildings = [];
    $scope.buildingId = (_.get($scope.brand, 'data.location.building.id') || "0").toString();
    $http.get('/api/v1/buildings').then(function (res) {
      $scope.buildings = res.data.buildings || [];
      $scope.buildings.forEach(function (building) {
        building.id = +building.id;
        $scope.buildingMap[building.id] = building;
      });
    });
  };

  $scope.owners = [];
  $scope.staffs = [];

  var initMembers = function initMembers() {
    $http.get('/api/v1/brands/' + $scope.brand.id + '/members').then(function (res) {
      (res.data || []).forEach(function (user) {
        for (var i = 0; i < (user.roles || []).length; i++) {
          var role = user.roles[i];
          if (+_.get(role, 'brand.id') !== +$scope.brand.id) {
            continue;
          }
          if (role.type === 'owner') {
            $scope.owners.push(user);
            break;
          } else if (role.type === 'staff') {
            $scope.staffs.push(user);
            break;
          }
        }
      });
    });

    $scope.openUserPopup = function () {
      $('#user_list_popup').modal();
    };
    $scope.closeUserPopup = function () {
      $('#user_list_popup').modal('hide');
      $('#user_list_popup').removeClass('in');
      $('.modal-backdrop').remove();
    };
    $scope.userDatatables = {
      field: 'users',
      pageLength: 10,
      columns: [{
        data: 'id',
        render: function render(id) {
          return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
        }
      }, {
        data: 'email'
      }, {
        data: function data(_data10) {
          return _data10;
        },
        render: function render(user) {
          return userUtil.getRoleName(user);
        }
      }, {
        data: 'id',
        render: function render(id) {
          return '<button class="btn blue" data-ng-click="addMember(' + id + ', \'owner\')">Owner추가</button>';
        }
      }, {
        data: 'id',
        render: function render(id) {
          return '<button class="btn blue" data-ng-click="addMember(' + id + ', \'staff\')">Staff추가</button>';
        }
      }]
    };
    $scope.userDatatablesRendered = function () {
      $compile(angular.element($('table')))($scope);
    };
    $scope.addMember = function (userId, roleType) {
      boUtils.startProgressBar();
      $http.post('/api/v1/users/' + userId + '/roles', { roleType: roleType, brandId: $scope.brand.id }).then(function () {
        boUtils.stopProgressBar();
        $scope.closeUserPopup();
        // 2016. 05. 16. [heekyu] modal does not hide correcly on state reload
        $state.reload();
      }, function () {
        boUtils.stopProgressBar();
        window.alert('failed to update ' + roleType);
      });
    };
    $scope.removeMember = function (user, roleType) {
      for (var i = 0; i < user.roles.length; i++) {
        var role = user.roles[i];
        if (role.type === roleType && +_.get(role, 'brand.id') === +$scope.brand.id) {
          var url = '/api/v1/users/' + user.id + '/roles';
          $http['delete'](url, { data: role, headers: { "Content-Type": "application/json;charset=utf-8" } }).then(function () {
            $state.reload();
          });
          break;
        }
      }
    };
  };

  if ($state.params.brandId) {
    boUtils.startProgressBar();
    $http.get('/api/v1/brands/' + $state.params.brandId + '/unmodified').then(function (res) {
      $scope.brand = res.data;
      initFields();
      initMembers();
      boUtils.stopProgressBar();
    }, function () {
      window.alert('failed to get brand (' + $state.params.brandId + ')');
      boUtils.stopProgressBar();
    });
  } else {
    $scope.brand = { id: 'NEW', name: {}, data: {} };
    initFields();
  }
  $scope.save = function () {
    boUtils.startProgressBar();
    convertUtil.copyFieldObj($scope.brandFields1, $scope.brand);
    convertUtil.copyFieldObj($scope.brandFields2, $scope.brand);
    $rootScope.state.locales.forEach(function (locale) {
      $scope.brand.name[locale] = $scope.brand.name.ko;
    });
    if ($scope.buildingMap && $scope.buildingMap[$scope.buildingId]) {
      _.set($scope.brand, 'data.location.building', _.pick($scope.buildingMap[$scope.buildingId], ['id', 'name']));
    }
    var requestBrand = _.pick($scope.brand, ['name', 'data', 'pathname']);
    var promise = undefined;
    if ($state.params.brandId) {
      promise = $http.put('/api/v1/brands/' + $scope.brand.id, requestBrand);
    } else {
      // create brand
      promise = $http.post('/api/v1/brands', requestBrand);
    }
    promise.then(function (res) {
      boUtils.stopProgressBar();
      return $q.all([$http.put('/api/v1/brands/' + res.data.id + '/index'), $http.put('/api/v1/buildings/cache')]);
    }, function () {
      window.alert('failed to save brand');
      boUtils.stopProgressBar();
    }).then(function () {
      boUtils.startProgressBar();
      setTimeout(function () {
        boUtils.stopProgressBar();
        $state.go('brand.main');
      }, 1000);
    });
  };

  $scope.removeAlias = function (idx) {
    $scope.brand.data.alias.splice(idx, 1);
  };
  $scope.onAliasInput = function (e) {
    var keyCode = e.keyCode;
    if (keyCode === 13 || keyCode === 32) {
      // Enter
      e.preventDefault();
      var newAlias = e.target.value;
      for (var i = 0; i < ($scope.brand.data.alias || []).length; i++) {
        if ($scope.brand.data.alias[i] === newAlias) {
          return;
        }
      }
      if (!$scope.brand.data.alias) {
        $scope.brand.data.alias = [];
      }
      $scope.brand.data.alias.push(newAlias);
      $(e.target).val('');
    }
  };
  $scope.installedApp = function (user) {
    return _.isEmpty(_.get(user.devices, 'onesignal')) ? 'X' : 'O';
  };
});

brandModule.controller('BrandInquiryListController', function ($scope, $http, $rootScope, $state, $translate) {
  $scope.contentTitle = $translate.instant('brand.inquiry.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'brand.inquiry',
    name: $translate.instant('brand.inquiry.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  $scope.brandInquiryDatatables = {
    field: 'inquiries',
    url: '/api/v1/brands/inquiries',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="brand.inquiry.info({inquiryId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: function data(_data11) {
        return _.get(_data11, 'data.name') || '';
      }
    }, {
      data: function data(_data12) {
        return _.get(_data12, 'data.contactName') || '';
      }
    }, {
      data: function data(_data13) {
        return _.get(_data13, 'data.tel') || '';
      }
    }, {
      data: 'id',
      render: function render(id) {
        return '<button class="btn red" data-ng-click="deleteInquiryItem(' + id + ')"><i class="fa fa-remove"></i> ' + $translate.instant('main.deleteButton') + '</button>';
      }
    }]
  };
  $scope.deleteInquiryItem = function (id) {
    $http.put('/api/v1/brands/inquiries/' + id, { isActive: false }).then(function () {
      window.alert('Item Deleted Successfully');
      $state.reload();
    });
  };
});

brandModule.controller('BrandInquiryInfoController', function ($scope, $rootScope, $state, $http, $translate) {
  $scope.contentTitle = $translate.instant('brand.inquiry.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'brand.inquiry.list',
    name: $translate.instant('brand.inquiry.title')
  }, {
    sref: 'brand.inquiry.info',
    name: $translate.instant('brand.inquiry.info.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  var init = function init(inquiry) {
    $scope.inquiry = inquiry;
    if (!$scope.inquiry || !$scope.inquiry.data) {
      window.alert('Empty Inquiry Data');
      return;
    }

    $scope.inquiryFields = [{ title: 'ID', key: 'id', obj: $scope.inquiry.id, isReadOnly: true }, { title: $translate.instant('brand.inquiry.info.nameLabel'), obj: $scope.inquiry.data.name, key: 'name', isReadOnly: true }, { title: $translate.instant('brand.inquiry.info.contactNameLabel'), obj: $scope.inquiry.data.contactName, key: 'contactName', isReadOnly: true }, { title: $translate.instant('brand.inquiry.info.emailLabel'), obj: $scope.inquiry.data.email, key: 'email', isReadOnly: true }, { title: $translate.instant('brand.inquiry.info.telLabel'), obj: $scope.inquiry.data.tel, key: 'tel', isReadOnly: true }, { title: $translate.instant('brand.inquiry.info.buildingLabel'), obj: $scope.inquiry.data.building, key: 'building', isReadOnly: true }, { title: $translate.instant('brand.inquiry.info.floorLabel'), obj: $scope.inquiry.data.floor, key: 'floor', isReadOnly: true }, { title: $translate.instant('brand.inquiry.info.flatNumberLabel'), obj: $scope.inquiry.data.flatNumber, key: 'flatNumber', isReadOnly: true }, { title: $translate.instant('brand.inquiry.info.productTypeLabel'), obj: $scope.inquiry.data.productType, key: 'productType', isReadOnly: true }];
  };

  $http.get('/api/v1/brands/inquiries/' + $state.params.inquiryId).then(function (res) {
    init(res.data);
  });
});
}, {"./module":4}],
5: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var buildingModule = angular.module('backoffice.building', ['ui.router', require('../utils/module').name, require('../third_party/angular-translate')]);

buildingModule.config(function ($translateProvider) {
  $translateProvider.registerAvailableLanguageKeys(['en', 'ko'], {
    'en_US': 'en',
    'en_UK': 'en',
    'ko_KR': 'ko'
  }).determinePreferredLanguage();

  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
});

buildingModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';
  $stateProvider.state('building', {
    url: '/building',
    abstract: 'true',
    template: '<ui-view/>'
  }).state('building.main', {
    url: '/main',
    templateUrl: templateRoot + '/building/main.html',
    controller: 'BuildingMainController'
  }).state('building.info', {
    url: '/info/:buildingId',
    templateUrl: templateRoot + '/building/info.html',
    controller: 'BuildingInfoController'
  });
});

module.exports = buildingModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../utils/module":19,"../third_party/angular-translate":14,"./i18n/translations.en.json":24,"./i18n/translations.ko.json":25,"./controllers.js":26}],
24: [function(require, module, exports) {
module.exports = {

};
}, {}],
25: [function(require, module, exports) {
module.exports = {
  "building": {
    "main": {
      "title": "빌딩",
      "newBuildingPopup": "새 건물 추가"
    },
    "info": {
      "title": "빌딩",
      "addressLabel": "주소",
      "businessHourLabel": "영업시간",
      "holidayLabel": "휴무일",
      "telLabel": "연락처",
      "descriptionLabel": "소개",
      "floorInfoLabel": "층별소개"
    }
  }
}
;
}, {}],
26: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var buildingModule = require('./module');

buildingModule.controller('BuildingMainController', function ($scope, $http, $state, $rootScope, boUtils) {
  $scope.buildingDatatables = {
    field: 'buildings',
    url: '/api/v1/buildings',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="building.info({buildingId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: 'name.ko',
      orderable: false
    }]
  };
  $scope.createBuilding = function (building) {
    var data = { name: {} };
    $rootScope.state.locales.forEach(function (locale) {
      data.name[locale] = building.name;
    });
    boUtils.startProgressBar();
    $http.post('/api/v1/buildings', data).then(function () {
      boUtils.stopProgressBar();
      $scope.closePopup();
      $state.reload();
    }, function () {
      boUtils.stopProgressBar();
      window.alert('error');
    });
  };
  $scope.closePopup = function () {
    $('#new_building').modal('hide');
    $('#new_building').removeClass('in');
    $('.modal-backdrop').remove();
  };
});

buildingModule.controller('BuildingInfoController', function ($scope, $http, $state, $rootScope, $translate, convertUtil) {
  var url = '/api/v1/buildings/' + $state.params.buildingId;

  var init = function init(building) {
    $scope.contentTitle = $translate.instant('building.info.title');
    $scope.contentSubTitle = '';
    $scope.breadcrumb = [{
      sref: 'dashboard',
      name: $translate.instant('dashboard.home')
    }, {
      sref: 'building.main',
      name: $translate.instant('building.main.title')
    }, {
      sref: 'building.info',
      name: building.name.ko
    }];
    $rootScope.initAll($scope, $state.current.name);

    $scope.building = building;
    if (!$scope.building.data) {
      $scope.building.data = {};
    }
    $scope.buildingFields = [{ title: $translate.instant('building.info.addressLabel'), obj: _.get($scope.building, 'data.address'), key: 'data.address' }, { title: $translate.instant('building.info.businessHourLabel'), obj: _.get($scope.building, 'data.businessHour'), key: 'data.businessHour' }, { title: $translate.instant('building.info.holidayLabel'), obj: _.get($scope.building, 'data.holiday'), key: 'data.holiday' }, { title: $translate.instant('building.info.telLabel'), obj: _.get($scope.building, 'data.tel'), key: 'data.tel' }, { title: $translate.instant('building.info.floorInfoLabel'), obj: _.get($scope.building, 'data.floorInfo'), key: 'data.floorInfo' }, { title: $translate.instant('building.info.descriptionLabel'), obj: _.get($scope.building, 'data.description'), key: 'data.description', isMultiLine: true }];
  };
  $http.get(url).then(function (res) {
    init(res.data);
  });

  $scope.save = function () {
    convertUtil.copyFieldObj($scope.buildingFields, $scope.building);
    $http.put(url, _.pick($scope.building, 'data')).then(function () {
      $http.put('/api/v1/buildings/cache');
      $state.go('building.main');
    });
  };
});
}, {"./module":5}],
6: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var cmsModule = angular.module('backoffice.cms', ['ui.router', 'ui.sortable', require('../third_party/angular-translate')]);

module.exports = cmsModule;

cmsModule.config(function ($translateProvider) {
  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

cmsModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('cms', {
    abstract: true,
    url: '/cms',
    template: '<ui-view/>'
  }).state('cms.simple', {
    url: '/simple/:name',
    templateUrl: templateRoot + '/cms/simple.html',
    controller: 'CmsSimpleController'
  }).state('cms.main_banner', {
    url: '/main_banner/:name',
    templateUrl: templateRoot + '/cms/main-banner.html',
    controller: 'CmsMainBannerController'
  }).state('cms.main_category', {
    url: '/main_category',
    templateUrl: templateRoot + '/cms/main-category.html',
    controller: 'CmsMainCategoryController'
  }).state('cms.main_page_center', {
    url: '/main_page_center/:name',
    templateUrl: templateRoot + '/cms/main-page-center.html',
    controller: 'CmsMainCenterController'
  }).state('cms.custom_page', {
    url: '/custom_page/:name',
    templateUrl: templateRoot + '/cms/custom-page.html',
    controller: 'CmsCustomPageController'
  }).state('cms.event_banner', {
    url: '/event_banner/:name',
    templateUrl: templateRoot + '/cms/event_banner.html',
    controller: 'CmsEventBannerController'
  }).state('cms.pureHtml', {
    url: '/pure/:name',
    templateUrl: templateRoot + '/cms/pure.html',
    controller: 'CmsPureHtmlController'
  });
});

// BEGIN module require js
require('./controllers');
// END module require js
}, {"../third_party/angular-translate":14,"./i18n/translations.en.json":27,"./i18n/translations.ko.json":28,"./controllers":29}],
27: [function(require, module, exports) {
module.exports = {

};
}, {}],
28: [function(require, module, exports) {
module.exports = {
  "cms": {
    "mainCategory": "메인페이지 카테고리",
    "dMainBanner": "데스크탑 메인 배너",
    "dMdPick": "데스크탑 MD PICK",
    "dRightBanner": "데스크탑 우측 배너",
    "mMainBanner": "모바일 메인 배너",
    "mMdPick": "모바일 MD PICK",
    "dShippingPolicy": "데스크탑 사입비 배송비 정책",
    "mShippingPolicy": "모바일 사입비 배송비 정책",
    "dSiteKeywords": "데스크탑 사이트 키워드",
    "dTopBanner": "데스크탑 탑 띠배너"
  }
}
;
}, {}],
29: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var cmsModule = require('./module');

cmsModule.controller('CmsSimpleController', function ($scope, $http, $state, $rootScope, $translate, boUtils) {
  $scope.cms = {
    ko: { rows: [] },
    en: { rows: [] },
    'zh-cn': { rows: [] },
    'zh-tw': { rows: [] }
  };
  $http.get('/api/v1/cms/' + $state.params.name).then(function (res) {
    if (res.data) {
      $scope.cms = res.data;
    }
  })['catch'](function () {
    // ignore
  });

  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'cms.simple',
    name: $scope.name
  }];
  $rootScope.initAll($scope, $state.current.name);

  $scope.newObject = {};
  $scope.imageUploaded = function (result, obj) {
    obj.image = { url: result.url.substring(5), publicId: result.public_id, version: result.version };
  };

  $scope.addRow = function () {
    if (!$scope.newObject.link) {
      $scope.newObject.link = '';
    }
    // if (!$scope.newObject.data.movieUrl || !$scope.newObject.image || !$scope.newObject.image.url) {
    //   window.alert('add image'  );
    //   return;
    // }
    $scope.cms[$rootScope.state.editLocale].rows.push($scope.newObject);
    $scope.newObject = {};
  };

  $scope.removeRow = function (index) {
    $scope.cms[$rootScope.state.editLocale].rows.splice(index, 1)[0];
  };

  $scope.save = function () {
    $http.post('/api/v1/cms', { name: $scope.name, data: $scope.cms }).then(function (res) {
      console.log(res);
      window.alert('Saved Successfully');
    });
  };

  $scope.rowSortable = {
    handle: '.cms-simple-sortable-pointer',
    placeholder: 'ui-state-highlight'
  };

  $('#image-upload-button').on('change', function (changeEvent) {
    var file = _.get(changeEvent, 'target.files[0]');
    if (!file) {
      return;
    }
    boUtils.startProgressBar();
    $('#image-upload-button').attr('value', '');
    var r = new FileReader();
    r.onload = function (e) {
      boUtils.uploadImage201607(e.target.result, file, '').then(function (res) {
        boUtils.stopProgressBar();
        $scope.newObject.image = res.data.images[0];
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, function () {
        window.alert('image upload fail');
        boUtils.stopProgressBar();
      });
    };
    r.readAsBinaryString(file);
  });
});

cmsModule.controller('CmsMainCategoryController', function ($scope, $rootScope, $http, $state, boUtils) {
  var cmsName = 'main_categories';
  $scope.displayLocale = 'en';
  var jstreeNode = $('#categoryTree');
  var autoCompleteNode = $('#selectCategory');
  var initAutoComplete = function initAutoComplete(root) {
    // TODO locale
    // const locale = $rootScope.state.editLocale;
    $scope.allCategories = [];
    $scope.categoryIdMap = {};
    $scope.categoryNameMap = {};
    var dfs = function dfs(root) {
      var name = root.name[$scope.displayLocale];
      var searchName = name;
      if (root.parentId && $scope.categoryIdMap[root.parentId]) {
        searchName += '(<-' + $scope.categoryIdMap[root.parentId].name[$scope.displayLocale] + ')';
      }
      $scope.allCategories.push(searchName);
      $scope.categoryIdMap[root.id] = root;
      $scope.categoryNameMap[searchName] = root;
      (root.children || []).forEach(function (child) {
        return dfs(child);
      });
      delete root.children;
    };
    dfs(root);

    boUtils.autoComplete(autoCompleteNode, cmsName, $scope.allCategories);
    autoCompleteNode.on('typeahead:selected', function (obj, datum) {
      var idx = datum.indexOf('(<-');
      var text = datum;
      if (idx > 0) {
        text = datum.substring(0, idx);
      }
      autoCompleteNode.typeahead('val', text);
      var tree = jstreeNode.jstree(true);
      var selected = tree.get_selected();
      if (!selected || selected.length < 1) {
        return;
      }
      var newCategory = $scope.categoryNameMap[datum];
      if (tree.get_node(newCategory.id)) {
        window.alert('category already in menu');
        return;
      }
      tree.set_id(selected[0], newCategory.id);
      tree.set_text(newCategory.id, text);
      $scope.selectedNodeName = newCategory.name[$scope.displayLocale];
      autoCompleteNode.blur();
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  };
  $http.get('/api/v1/categories').then(function (res) {
    $scope.allCategories = [];
    var root = res.data;
    initAutoComplete(root);
  });
  var jstreeDataToCmsData = function jstreeDataToCmsData() {
    var jstreeData = jstreeNode.jstree(true).get_json('#');
    var dfs = function dfs(root) {
      var res = $scope.categoryIdMap[root.id];
      if (!res) {
        window.alert('created node does not select category');
        return null;
      }
      if (root.children && root.children.length > 0) {
        res.children = root.children.map(function (child) {
          return dfs(child);
        }).filter(function (value) {
          return !!value;
        });
      }
      return res;
    };
    return jstreeData.map(function (data) {
      return dfs(data);
    });
  };
  var cmsDataToJstreeData = function cmsDataToJstreeData(cmsData) {
    var dfs = function dfs(root) {
      var res = {
        id: root.id,
        text: root.name ? root.name[$scope.displayLocale] : '카테고리 고르세요',
        data: { id: root.id }
      };
      if (root.children) {
        res.children = root.children.map(dfs);
      }
      return res;
    };
    return cmsData.map(function (data) {
      return dfs(data);
    });
  };
  var nextNodeId = 10000;
  var initJsTree = function initJsTree(cmsData) {
    jstreeNode.jstree({
      core: {
        themes: {
          responsive: false
        },
        check_callback: true,
        data: cmsDataToJstreeData(cmsData),
        multiple: false
      },
      plugins: ['types', 'contextmenu'],
      types: {
        'default': {
          max_depth: 2,
          icon: 'fa fa-folder icon-state-warning icon-lg'
        }
      },
      contextmenu: {
        items: function items($node) {
          var tree = jstreeNode.jstree(true);
          return {
            Create: {
              label: 'Create',
              action: function action() {
                var newNodeId = tree.create_node($node, 'NewMenu');
                tree.set_id(newNodeId, nextNodeId);
                tree.deselect_all();
                tree.select_node(nextNodeId++);
                autoCompleteNode.typeahead('val', '');
                $scope.selectedNodeName = null;
                if (!$scope.$$phase) {
                  $scope.$apply();
                }
                autoCompleteNode.focus();
              }
            },
            Delete: {
              label: 'Delete',
              action: function action() {
                tree.delete_node($node);
              }
            }
          };
        }
      }
    });
    jstreeNode.on('select_node.jstree', function (e, data) {
      var category = $scope.categoryIdMap[data.node.id];
      if (!category) {
        $scope.selectedNodeName = null;
        return;
      }
      $scope.selectedNodeName = category.name[$scope.displayLocale];
      autoCompleteNode.typeahead('val', $scope.selectedNodeName);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    jstreeNode.on('deselect_node.jstree', function () {
      $scope.selectedNodeName = null;
    });
  };

  $http.get('/api/v1/cms/' + cmsName).then(function (res) {
    initJsTree(res.data);
  });
  $scope.save = function () {
    $http.post('/api/v1/cms', { name: cmsName, data: jstreeDataToCmsData() }).then(function () {
      window.alert('saved successfully');
      $state.reload();
    }, function () {
      window.alert('fail. check your admin permission');
    });
  };
});

cmsModule.controller('CmsMainCenterController', function ($scope, $http, $rootScope, $state, boUtils) {
  $('#summernote-desktop').summernote({
    width: 1200,
    height: 700,
    onImageUpload: function onImageUpload(files) {
      return boUtils.getSummerNoteImageUpload(files, $('#summernote-desktop'));
    }
  });
  var name = 'desktop_main_center';
  $http.get('/api/v1/cms/' + name).then(function (res) {
    $scope.cmsData = res.data;
    var data = res.data.data;
    $('#summernote-desktop').code('' + data);
  }, function () {
    window.alert('failed to load data');
  });

  $scope.save = function () {
    var data = $('#summernote-desktop').code();
    $http.post('/api/v1/cms', { name: name, data: { name: name, data: data } }).then(function () {
      window.alert('saved successfully');
    }, function () {
      window.alert('fail. check your admin permission');
    });
  };
});

cmsModule.controller('CmsCustomPageController', function ($scope, $http, $rootScope, $state, boUtils) {
  $('#summernote-desktop').summernote({
    width: 1200,
    height: 700,
    onImageUpload: function onImageUpload(files) {
      return boUtils.getSummerNoteImageUpload(files, $('#summernote-desktop'));
    }
  });
  var name = 'desktop_custom_page';
  $http.get('/api/v1/cms/' + name).then(function (res) {
    $scope.cmsData = res.data;
    var data = res.data.data;
    $('#summernote-desktop').code('' + data);
  }, function () {
    window.alert('failed to load data');
  });

  $scope.save = function () {
    var data = $('#summernote-desktop').code();
    $http.post('/api/v1/cms', { name: name, data: { name: name, data: data } }).then(function () {
      window.alert('saved successfully');
    }, function () {
      window.alert('fail. check your admin permission');
    });
  };
});

cmsModule.controller('CmsPureHtmlController', function ($scope, $http, $rootScope, $state) {
  $('#summernote').summernote({ height: 400 });
  var name = $state.params.name;
  $http.get('/api/v1/cms/' + name).then(function (res) {
    $scope.cmsData = res.data;
    var data = res.data.data;
    $('#summernote').code('' + data);
  }, function () {
    window.alert('failed to load data');
  });

  $scope.save = function () {
    var data = $('#summernote').code();
    $http.post('/api/v1/cms', { name: name, data: { name: name, data: data } }).then(function () {
      window.alert('saved successfully');
    }, function () {
      window.alert('fail. check your admin permission');
    });
  };
});

cmsModule.controller('CmsEventBannerController', function ($scope, $http, $state, $rootScope, $translate, boUtils) {
  $scope.cms = {
    ko: { rows: [] },
    en: { rows: [] },
    'zh-cn': { rows: [] },
    'zh-tw': { rows: [] }
  };
  var name = 'event_banner';
  $http.get('/api/v1/cms/' + name).then(function (res) {
    if (res.data) {
      $scope.cms = res.data;
    }
  })['catch'](function () {
    // ignore
  });

  $scope.contentTitle = name;
  $scope.contentSubTitle = '';
  $rootScope.initAll($scope, $state.current.name);

  $scope.newObject = {};

  $scope.addRow = function () {
    $scope.cms[$rootScope.state.editLocale].rows.push($scope.newObject);
    $scope.newObject = {};
  };

  $scope.removeRow = function (index) {
    $scope.cms[$rootScope.state.editLocale].rows.splice(index, 1)[0];
  };

  $scope.save = function () {
    $http.post('/api/v1/cms', { name: name, data: $scope.cms }).then(function (res) {
      console.log(res);
      window.alert('Saved Successfully');
    });
  };
});

cmsModule.controller('CmsMainBannerController', function ($scope, $http, $state, $rootScope, $translate, boUtils) {
  $scope.cms = {
    ko: { rows: [] },
    en: { rows: [] },
    'zh-cn': { rows: [] },
    'zh-tw': { rows: [] }
  };
  $http.get('/api/v1/cms/' + $state.params.name).then(function (res) {
    if (res.data) {
      $scope.cms = res.data;
    }
  })['catch'](function () {
    // ignore
  });

  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'cms.main_banner',
    name: $scope.name
  }];
  $rootScope.initAll($scope, $state.current.name);

  $scope.newObject = {};
  $scope.imageUploaded = function (result, obj) {
    obj.image = { url: result.url.substring(5), publicId: result.public_id, version: result.version };
  };

  $scope.addRow = function () {
    if (!$scope.newObject.link) {
      $scope.newObject.link = '';
    }
    // if (!$scope.newObject.data.movieUrl || !$scope.newObject.image || !$scope.newObject.image.url) {
    //   window.alert('add image'  );
    //   return;
    // }
    $scope.cms[$rootScope.state.editLocale].rows.push($scope.newObject);
    $scope.newObject = {};
  };

  $scope.removeRow = function (index) {
    $scope.cms[$rootScope.state.editLocale].rows.splice(index, 1)[0];
  };

  $scope.save = function () {
    $http.post('/api/v1/cms', { name: $scope.name, data: $scope.cms }).then(function (res) {
      console.log(res);
      window.alert('Saved Successfully');
    });
  };

  $scope.rowSortable = {
    handle: '.cms-simple-sortable-pointer',
    placeholder: 'ui-state-highlight'
  };

  $('#image-upload-button').on('change', function (changeEvent) {
    var file = _.get(changeEvent, 'target.files[0]');
    if (!file) {
      return;
    }
    boUtils.startProgressBar();
    $('#image-upload-button').attr('value', '');
    var r = new FileReader();
    r.onload = function (e) {
      boUtils.uploadImage201607(e.target.result, file, '').then(function (res) {
        boUtils.stopProgressBar();
        $scope.newObject.image = res.data.images[0];
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, function () {
        window.alert('image upload fail');
        boUtils.stopProgressBar();
      });
    };
    r.readAsBinaryString(file);
  });
});
}, {"./module":6}],
7: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var couponModule = angular.module('backoffice.coupon', []);

module.exports = couponModule;

couponModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('coupon', {
    abstract: true,
    url: '/coupon',
    template: '<ui-view/>'
  }).state('coupon.main', {
    url: '/main',
    templateUrl: templateRoot + '/coupon/main.html',
    controller: 'CouponMainController'
  }).state('coupon.userCoupons', {
    url: '/userCoupons',
    templateUrl: templateRoot + '/coupon/user-coupons.html',
    controller: 'CouponUserCouponController'
  }).state('coupon.add', {
    url: '/add',
    templateUrl: templateRoot + '/coupon/edit.html',
    controller: 'CouponEditController'
  }).state('coupon.edit', {
    url: '/:couponId',
    templateUrl: templateRoot + '/coupon/edit.html',
    controller: 'CouponEditController'
  });
});

// BEGIN module require js
require('./controllers');
// END module require js
}, {"./controllers":30}],
30: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var couponModule = require('./module');

couponModule.controller('CouponMainController', function ($scope, $http, $state, $rootScope, $translate, $compile, boUtils) {
  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'coupon.main',
    name: $scope.name
  }];
  $rootScope.initAll($scope, $state.current.name);

  var couponType = {
    1: '가격할인',
    2: '비율할인',
    3: '상품증정(중복사용불가)'
  };

  $scope.couponDatatables = {
    field: 'coupons',
    columns: [{
      data: function data(_data) {
        return _data;
      },
      render: function render(coupon) {
        return '<a ui-sref="coupon.edit({ couponId: ' + coupon.id + ' })">' + coupon.id + '</a>';
      },
      orderable: false
    }, {
      data: function data(_data2) {
        return _data2;
      },
      render: function render(coupon) {
        return '<a ui-sref="coupon.edit({ couponId: ' + coupon.id + ' })">' + coupon.name + '</a>';
      },
      orderable: false
    }, {
      data: function data(_data3) {
        return boUtils.formatDate(_data3.createdAt);
      },
      orderable: false
    }, {
      data: function data(_data4) {
        return couponType[_data4.type] || '';
      },
      orderable: false
    }, {
      data: function data(_data5) {
        return _data5.value || '';
      },
      orderable: false
    }, {
      data: function data(_data6) {
        return _data6.minValue || '';
      },
      orderable: false
    }, {
      data: 'id',
      render: function render(id) {
        return '<button class="btn red" ng-click="deleteCoupon(' + id + ')"><i class="fa fa-remove" /> 쿠폰삭제</button>';
      }
    }]
  };

  $scope.goNewCoupon = function () {
    $state.go('coupon.add');
  };

  $scope.deleteCoupon = function (couponId) {
    console.log(couponId);
    if (window.confirm('삭제하시겠습니까?')) {
      $http['delete']('/api/v1/coupons/' + couponId).then(function (res) {
        $state.reload();
      })['catch'](function () {
        window.alert('삭제 실패하였습니다');
      });
    }
  };

  $scope.datatablesLoaded = function () {
    $compile(angular.element($('table')))($scope);
  };
});

couponModule.controller('CouponEditController', function ($scope, $http, $state, $rootScope, $translate, boUtils) {
  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'coupon.main',
    name: '쿠폰'
  }, {
    sref: 'coupon.edit',
    name: $scope.name
  }];
  $rootScope.initAll($scope, $state.current.name);

  var couponId = $state.params.couponId;
  if (couponId) {
    $http.get('/api/v1/coupons/' + couponId).then(function (res) {
      if (res.data.begin) {
        res.data.begin = boUtils.formatDate(res.data.begin, true);
      }
      if (res.data.end) {
        res.data.end = boUtils.formatDate(res.data.end, true);
      }
      $scope.coupon = res.data;
      $scope.coupon.users.forEach(function (l) {
        l.uid = formatUid(l.uid);
        l.createdAt = boUtils.formatDate(l.createdAt, true);
        l.updatedAt = boUtils.formatDate(l.updatedAt, true);
        if (l.status === 1) l.status = '사용가능';else if (l.status === 2) l.status = '사용됨';else if (l.status === 3) l.status = '만기됨';
      });
      $scope.coupon.notusedCoupons.forEach(function (c) {
        c.uid = formatUid(c.uid);
      });
    });
  } else {
    $scope.coupon = {};
  }

  // Coupon.setRequired(['name', 'type', 'target', 'value', 'expirationType']);
  $scope.fields = [{ name: '쿠폰명', key: 'name' }, { name: '시작날짜', key: 'begin', placeholder: 'YYYY-MM-DD' }, { name: '종료날짜', key: 'end', placeholder: 'YYYY-MM-DD' }, { name: '할인 타입', key: 'type', enums: [{ title: '가격', value: 1 }, { title: '비율(%)', value: 2 }, { title: '상품증정(중복사용불가)', value: 3 }] }, { name: '할인 값', key: 'value' }, { name: '최소금액', key: 'minValue' }];

  // { name: '최대값', key: '' },
  $scope.save = function () {
    if (!couponId) {
      $scope.coupon.target = 2; // Cart
      $scope.coupon.expirationType = 1;
      $http.post('/api/v1/coupons', $scope.coupon).then(function () {
        window.alert('생성 완료');
        $state.go('coupon.main');
      });
    }
  };

  var formatUid = function formatUid(uid) {
    if (uid.length === 16) {
      var res = '';
      for (var i = 0; i < 16; i += 1) {
        res += uid[i].toUpperCase();
        if (i % 4 === 3 && i < 15) {
          res += '-';
        }
      }
      return res;
    }
    return uid;
  };

  $scope.generateCoupon = function (count) {
    if (count > 500) {
      count = 500;
    }
    var coupon = $scope.coupon;
    if (count >= 1 && window.confirm(count + ' 개 쿠폰을 발급하시겠습니까?')) {
      var promises = [];
      for (var i = 0; i < count; i += 1) {
        promises.push($http.post('/api/v1/coupons/' + coupon.id + '/generate', { count: count }));
      }
      Promise.all(promises).then(function (res) {
        window.alert('쿠폰 발행되었습니다.');
        $scope.userCoupons = res.map(function (r) {
          r.data.uid = formatUid(r.data.uid);
          return r.data;
        });
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });
    }
  };
});

couponModule.controller('CouponUserCouponController', function ($scope) {
  $scope.userCouponDatatables = {
    field: 'userCoupons',
    columns: [{
      data: ''
    }]
  };
});
}, {"./module":7}],
8: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var currencyModule = angular.module('backoffice.currency', ['ui.router', require('../third_party/angular-translate')]);

currencyModule.config(function ($translateProvider) {
  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

currencyModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('currency', {
    abstract: true,
    url: '/currency',
    template: '<ui-view/>'
  }).state('currency.main', {
    url: '/main',
    templateUrl: templateRoot + '/currency/main.html',
    controller: 'CurrencyMainController'
  });
});

module.exports = currencyModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../third_party/angular-translate":14,"./i18n/translations.en.json":31,"./i18n/translations.ko.json":32,"./controllers.js":33}],
31: [function(require, module, exports) {
module.exports = {

}
;
}, {}],
32: [function(require, module, exports) {
module.exports = {
  "currency": {
    "title": "환율"
  }
}
;
}, {}],
33: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var currencyModule = require('./module');

currencyModule.controller('CurrencyMainController', function ($scope, $http) {
  $scope.rates = {
    USD: 0,
    CNY: 0
  };
  $http.get('/api/v1/currency').then(function (res) {
    if (res.data.USD) {
      $scope.rates.USD = res.data.USD;
    }
    if (res.data.CNY) {
      $scope.rates.CNY = res.data.CNY;
    }
  });
  $scope.save = function () {
    $http.post('/api/v1/currency', $scope.rates).then(function () {})['catch'](function (res) {
      window.alert(res);
      console.log(res);
    });
  };
});
}, {"./module":8}],
9: [function(require, module, exports) {
'use strict';

var dashboardModule = angular.module('backoffice.dashboard', ['ui.router', require('../third_party/angular-translate')]);

dashboardModule.config(function ($translateProvider) {
  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

dashboardModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('dashboard', {
    url: '/dashboard',
    templateUrl: templateRoot + '/dashboard/main.html',
    controller: 'DashboardController'
  });
});

module.exports = dashboardModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../third_party/angular-translate":14,"./i18n/translations.en.json":34,"./i18n/translations.ko.json":35,"./controllers.js":36}],
34: [function(require, module, exports) {
module.exports = {
  "dashboard": {
    "home": "홈"
  }
};
}, {}],
35: [function(require, module, exports) {
module.exports = {
  "dashboard": {
    "home": "홈",
    "main": {
      "title": "대시보드",
      "subTitle": "판매 현황"
    }
  }
};
}, {}],
36: [function(require, module, exports) {
'use strict';

var dashboardModule = require('./module');

dashboardModule.controller('DashboardController', function ($scope, $rootScope, $translate) {
  $scope.contentTitle = $translate.instant('dashboard.main.title');
  $scope.contentSubTitle = $translate.instant('dashboard.main.subTitle');
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    name: $translate.instant('dashboard.main.title')
  }];
  $rootScope.initAll($scope);
});
}, {"./module":9}],
10: [function(require, module, exports) {
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var directiveModule = angular.module('backoffice.directives', [require('../utils/module').name]);

module.exports = directiveModule;

directiveModule.factory('datatableCommons', function ($compile, $rootScope) {
  return {
    getOptions: function getOptions(scope, dataTables) {
      var options = _extends({
        lengthMenu: [[10, 20, 50, 100, 150], [10, 20, 50, 100, 150]]
      }, _.pick(dataTables, ['columns', 'data', 'order', 'oSearch', 'pageLength', 'createdRow']), {
        fnCreatedRow: function fnCreatedRow(nRow, aData, iDataIndex) {
          $compile(nRow)(scope);
          if (dataTables.fnCreatedRow) {
            dataTables.fnCreatedRow(nRow, aData, iDataIndex);
          }
        },
        fnRowCallback: function fnRowCallback(nRow, aData) {
          $(nRow).attr("id", aData.id);
        },
        orderCellsTop: true
      });
      _.defaults(options, { order: [0, 'desc'], pageLength: 50 });
      if (dataTables.disableFilter) {
        options.bFilter = false;
      }
      // options.columns.forEach((option) => option.bSortable = !!option.bSortable);
      if (dataTables.storeKey) {
        var searchValue = _.get($rootScope.state, 'datatables.' + dataTables.storeKey + '.searchValue');
        var pageStart = _.get($rootScope.state, 'datatables.' + dataTables.storeKey + '.pageStart');
        if (searchValue) {
          options.oSearch = { sSearch: searchValue };
        }
        if (pageStart) {
          options.displayStart = pageStart;
        }
      }
      return options;
    },
    saveSearchParams: function saveSearchParams(dataTables, searchValue, pageStart) {
      if (dataTables.storeKey) {
        var storeData = {
          searchValue: searchValue,
          pageStart: pageStart
        };
        $rootScope.updateDatatablesSearch(dataTables.storeKey, storeData);
      }
    }
  };
});

directiveModule.directive('boDatatables', function ($http, $compile, $parse, datatableCommons) {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    link: function link(scope, elem, attr) {
      var init = function init(dataTables, realData) {
        if (realData) {
          realData.forEach(function (elem, index) {
            elem._index = index;
          });
        }
        dataTables.data = realData;
        var options = datatableCommons.getOptions(scope, dataTables);
        if (dataTables.hasOwnProperty('bSort')) {
          options.bSort = dataTables.bSort;
        }
        var table = elem.find('table');
        table.dataTable(options);
        if (dataTables.rowReorder) {
          table.rowReordering();
        }
        table.on('search.dt', function (e, settings) {
          // 2016. 06. 08. [heekyu] FIXME if multiple datatables in a page?
          var searchValue = $('.dataTables_filter input').val();
          var pageStart = table.DataTable().page.info().start;
          datatableCommons.saveSearchParams(dataTables, searchValue, pageStart);
        });
        if (attr.directiveLoad && scope[attr.directiveLoad]) {
          scope[attr.directiveLoad]();
        }
      };
      scope.$watch(attr.boDatatables, function (dataTables) {
        if (!dataTables) {
          return;
        }
        var table = new $.fn.dataTable.Api(elem.find('table'));
        table.destroy();
        if (dataTables.data) {
          init(dataTables, dataTables.data);
        } else {
          $http.get(dataTables.url).then(function (res) {
            if (dataTables.field && dataTables.field !== '') {
              init(dataTables, res.data[dataTables.field]);
            } else {
              init(dataTables, res.data);
            }
          });
        }
      });
    }
  };
});

directiveModule.directive('boServerDatatables', function ($http, $compile, datatableCommons, boUtils) {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    scope: {
      boServerDatatables: '=',
      tableRender: '&',
      url: '@',
      urlParams: '=',
      fnUrlParams: '&'
    },
    link: function link(scope, elem) {
      var urlBase = scope.url;

      var dataTables = scope.boServerDatatables;
      var options = datatableCommons.getOptions(scope, dataTables);
      options.serverSide = true;
      options.ajax = function (data, callback, settings) {
        var urlParams = _extends({}, scope.urlParams);
        if (scope.fnUrlParams) {
          scope.fnUrlParams({ urlParams: urlParams, storeKey: dataTables.storeKey });
        }
        urlParams.offset = data.start;
        urlParams.limit = data.length;
        if (data.search.value) {
          urlParams.q = data.search.value;
        }
        datatableCommons.saveSearchParams(dataTables, data.search.value, data.start);
        var order = _.get(data, 'order[0]');
        if (order) {
          var column = options.columns[order.column].data;
          if (_.isString(column)) {
            urlParams.sorts = order.dir === 'desc' ? '-' + column : column;
          } else {
            console.log('column is not String. cannot sort');
          }
        }
        var url = boUtils.encodeQueryData(urlBase, urlParams);
        $http.get(url).then(function (value) {
          var serverData = value.data;
          var data = serverData;
          if (dataTables['field']) {
            serverData = serverData[dataTables['field']];
          }
          if (!serverData) {
            serverData = [];
          }
          var pageInfo = { data: serverData, draw: data.draw };
          pageInfo.recordsTotal = _.get(value, 'data.pagination.total') || 0;
          // TODO really filtered data
          pageInfo.recordsFiltered = pageInfo.recordsTotal;
          callback(pageInfo);
          if (scope.tableRender) {
            scope.tableRender({ data: data });
          }
          // 2016. 03. 30. [heekyu] THIS DOES NOT WORK
          // $compile(angular.element(elem.find('table')))(scope);
        });
      };
      elem.find('table').dataTable(options);
    }
  };
});

directiveModule.directive('clUploadWidget', function () {
  return {
    restrict: 'A',
    scope: {
      callback: '&callback'
    },
    link: function link(scope, elem) {
      elem.click(function () {
        cloudinary.openUploadWidget({
          cloud_name: 'linkshops',
          upload_preset: 'nd9k8295',
          multiple: false
        }, function (error, result) {
          if (!error) {
            if (scope.callback) {
              scope.callback({ result: result[0] });
            }
            scope.$apply();
          }
        });
      });
    }
  };
});

directiveModule.directive('boFileReader', function () {
  return {
    restrict: 'A',
    scope: {
      onRead: '&onRead'
    },
    link: function link(scope, element) {
      $(element).on('change', function (changeEvent) {
        var files = changeEvent.target.files;
        if (files.length) {
          var r = new FileReader();
          r.onload = function (e) {
            var contents = e.target.result;
            if (scope.onRead) {
              scope.onRead({ contents: contents });
            }
            scope.$apply();
          };

          r.readAsText(files[0], 'EUC-KR'); // 2016. 01. 28. [heekyu] april send me EUC-KR encoded files
        }
      });
    }
  };
});

directiveModule.directive('convertToNumber', function () {
  return {
    require: 'ngModel',
    link: function link(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function (val) {
        return parseInt(val, 10);
      });
      ngModel.$formatters.push(function (val) {
        return '' + val;
      });
    }
  };
});

directiveModule.directive('stringToNumber', function () {
  return {
    require: 'ngModel',
    link: function link(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function (value) {
        return _.isNull(value) || _.isUndefined(value) ? undefined : '' + value;
      });
      ngModel.$formatters.push(function (value) {
        return parseFloat(value, 10);
      });
    }
  };
});
// change per page values here
// data: realData, need implement
}, {"../utils/module":19}],
11: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var orderModule = angular.module('backoffice.order', ['ui.router', 'ui.bootstrap', require('../third_party/angular-translate')]);

orderModule.config(function ($translateProvider) {
  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

orderModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('order', {
    url: '/order',
    abstract: true,
    template: '<ui-view/>'
  }).state('order.main', {
    url: '/main',
    templateUrl: templateRoot + '/order/main.html',
    controller: 'OrderMainController'
  }).state('order.listBigBuyer', {
    url: '/listBigBuyer',
    templateUrl: templateRoot + '/order/listBigBuyer.html',
    controller: 'OrderListBigBuyerController'
  }).state('order.listPrice', {
    url: '/listPrice',
    templateUrl: templateRoot + '/order/listPrice.html',
    controller: 'OrderListPriceController'
  }).state('order.beforePayment', {
    url: '/before_payment',
    templateUrl: templateRoot + '/order/step0-before-payment.html',
    controller: 'OrderListBeforePaymentController'
  }).state('order.uncle', {
    url: '/uncle',
    templateUrl: templateRoot + '/order/uncle.html',
    controller: 'OrderUncleController'
  }).state('order.settlement', {
    url: '/settlement',
    templateUrl: templateRoot + '/order/settlement.html',
    controller: 'OrderSettlementController'
  }).state('order.vat', {
    url: '/vat/:month',
    templateUrl: templateRoot + '/order/vat.html',
    controller: 'OrderVatController'
  }).state('order.brandVat', {
    url: '/brandVat/:brandId/:month',
    templateUrl: templateRoot + '/order/brandVat.html',
    controller: 'OrderBrandVatController',
    resolve: {
      brand: function brand($http, $rootScope, $stateParams) {
        return $http.get('/api/v1/brands/' + $stateParams.brandId).then(function (res) {
          return res.data;
        });
      }
    }
  }).state('order.cs', {
    url: '/cs',
    templateUrl: templateRoot + '/order/cs.html',
    controller: 'OrderCsController'
  }).state('order.godo', {
    url: '/godo',
    templateUrl: templateRoot + '/order/godo.html',
    controller: 'OrderGodoController'
  }).state('order.detail', {
    url: '/detail/:orderId',
    templateUrl: templateRoot + '/order/detail.html',
    controller: 'OrderDetailController',
    resolve: {
      order: function order($http, $rootScope, $stateParams) {
        return $http.get('/api/v1/orders/' + $stateParams.orderId).then(function (res) {
          return res.data;
        });
      }
    }
  });
});

module.exports = orderModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../third_party/angular-translate":14,"./i18n/translations.en.json":37,"./i18n/translations.ko.json":38,"./controllers.js":39}],
37: [function(require, module, exports) {
module.exports = {
  "order": {

  }
};
}, {}],
38: [function(require, module, exports) {
module.exports = {
  "order": {
    "title": "주문",
    "common": {
      "orderId": "주문번호",
      "processedDate": "주문 날짜",
      "total": "합계",
      "handlingFee": "사입비",
      "shippingCost": "운송료",
      "commission": "수수료",
      "brandName": "브랜드명",
      "productPrice": "상품가격",
      "vat": "부가세"
    },
    "main": {
      "buyerIdColumn": "주문자 ID",
      "buyerEmailColumn": "주문자 이메일",
      "buyerNameColumn": "주문자 이름",
      "buyerTelColumn": "주문자 전화번호",
      "createdAtColumn": "주문 생성 시각",
      "orderedAtColumn": "주문 시작 시각",
      "paymentStatusColumn": "결제 상태",
      "settlementStatusColumn": "정산 상태",
      "priceColumn": "주문가격",
      "startProcessing": "주문처리",
      "statusColumn": "주문 상태",
      "sourceColumn": "가입경로",
      "paymethodColumn": "결제수단",
      "title": "주문현황"
    },
    "detail": {
      "closeOrderButton": "구매 확정",
      "deleteButton": "주문 삭제",
      "deleteMessage": "정말로 삭제하시겠습니까?",
      "title": "주문상세",
      "refundTitle": "환불",
      "saveButton": "저장",
      "logisticsButton": "물류팀",
      "orderListButton": "고객용 패킹리스트"
    },
    "beforePayment": {
      "title": "무통장 입금 대기",
      "subTitle": "또는 결제 전"
    },
    "address": {
      "nameLabel": "이름",
      "addressLabel": "주소",
      "addressDetailLabel": "상세주소",
      "telLabel": "T",
      "postalCodeLabel": "우편번호",
      "countryCodeLabel": "국가",
      "streetLabel": "도로명"
    },
    "orderProduct": {
      "orderIdColumn": "주문번호",
      "brandIdColumn": "브랜드번호",
      "brandNameColumn": "브랜드명",
      "buildingNameColumn": "건물",
      "floorColumn": "층",
      "flatNumberColumn": "호수",
      "telColumn": "전화번호",
      "productIdColumn": "상품번호",
      "productNameColumn": "상품약어",
      "colorColumn": "색상",
      "sizeColumn": "사이즈",
      "quantityColumn": "주문수량",
      "bank": {
        "name": "은행",
        "accountHolder": "예금주",
        "accountNumber": "계좌번호"
      },
      "totalColumn": "금액",
      "totalSaledColumn": "매출금액",
      "totalPaidColumn": "출금된금액",
      "totalWillPayColumn": "출금예정금액",
      "dateColumn": "주문날짜",
      "buyerIdColumn": "바이어ID"
    },
    "uncle": {
      "title": "삼촌주문목록",
      "download": "CSV 다운로드"
    },
    "cs": {
      "title": "운영팀주문목록"
    },
    "settlement": {
      "title": "회계팀 대량이체",
      "done": "대량이체 완료",
      "csvAll": "전체 CSV 다운로드",
      "csvSelected": "선택 CSV 다운로드"
    },
    "listBigBuyer": {
      "title": "빅바이어주문목록"
    },
    "listPrice": {
      "title": "기장",
      "finalTotalColumn": "최종 가격"
    },
    "godo": {
      "title": "고도몰"
    },
    "vat": {
      "title": "부가세"
    },
    "brandVat": {
      "title": "브랜드 부가세 내역"
    }
  }
}
;
}, {}],
39: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var orderModule = require('./module');

orderModule.factory('orderCommons', function ($rootScope, $compile, boUtils) {
  var allStatus = [0, 10, 100, 102, 200, 203, 302, 400, 300, 303, 304];
  var allPaymentStatus = [0, 1, 100, 200];
  var allPaymentMethods = [0, 1, 2, 3, 4, 5];
  var allSettlementStatus = [0, 100];
  return {
    allStatus: allStatus,
    allPaymentStatus: allPaymentStatus,
    allPaymentMethods: allPaymentMethods,
    allSettlementStatus: allSettlementStatus,
    applyFilterSearch: function applyFilterSearch(scope, state, storeKeyPrefix, getRoleType) {
      var reloadDatatables = function reloadDatatables() {
        $('table').DataTable().ajax.reload();
      };

      boUtils.initDateBetween($('#order_start_date'), $('#order_end_date'), state, storeKeyPrefix);

      scope.startDate = _.get($rootScope, storeKeyPrefix + '.startDate') || '';
      scope.endDate = _.get($rootScope, storeKeyPrefix + '.endDate') || '';
      if (scope.startDate && scope.endDate && new Date(scope.startDate).getTime() > new Date(scope.endDate).getTime()) {
        window.alert('시작 날짜가 종료 날짜와 같거나 더 작아야 합니다');
      }

      /*
      $('#order_start_date').datepicker({ autoclose: true });
      $('#order_end_date').datepicker({ autoclose: true });
      $('#order_start_date').on('change', (e) => {
        _.set($rootScope, `${storeKeyPrefix}.startDate`, $('#order_start_date').val());
        state.reload();
        // reloadDatatables();
      });
      $('#order_end_date').on('change', (e) => {
        _.set($rootScope, `${storeKeyPrefix}.endDate`, $('#order_end_date').val());
        state.reload();
        // reloadDatatables();
      });
      */

      scope.allStatus = allStatus.slice(1);
      scope.allPaymentStatus = allPaymentStatus;
      scope.allPaymentMethods = allPaymentMethods;
      scope.allSettlementStatus = allSettlementStatus;

      scope.setStatusFilter = function (s) {
        _.set($rootScope, storeKeyPrefix + '.searchOrderStatus', s);
        reloadDatatables();
      };
      scope.setPaymentStatusFilter = function (p) {
        _.set($rootScope, storeKeyPrefix + '.searchPaymentStatus', p);
        reloadDatatables();
      };
      scope.setPaymentMethodFilter = function (p) {
        _.set($rootScope, storeKeyPrefix + '.searchPaymentMethod', p);
        reloadDatatables();
      };
      scope.setSettlementStatusFilter = function (p) {
        _.set($rootScope, storeKeyPrefix + '.searchSettlementStatus', p);
        reloadDatatables();
      };
      if (!_.get($rootScope, storeKeyPrefix + '.searchOrderStatus')) {
        scope.setStatusFilter(-1);
      }
      if (!_.get($rootScope, storeKeyPrefix + '.searchPaymentStatus')) {
        scope.setPaymentStatusFilter(-1);
      }
      if (!_.get($rootScope, storeKeyPrefix + '.searchPaymentMethod')) {
        scope.setPaymentMethodFilter(-1);
      }
      if (!_.get($rootScope, storeKeyPrefix + '.searchSettlementStatus')) {
        scope.setSettlementStatusFilter(-1);
      }

      scope.translateOrderStatus = function (status) {
        if (status === -1) {
          return '모든 주문 상태';
        }
        return $rootScope.getContentsI18nText('enum.order.status.' + status);
      };
      scope.translateOrderPaymentStatus = function (status) {
        if (status === -1) {
          return '모든 결제 상태';
        }
        return $rootScope.getContentsI18nText('enum.order.paymentStatus.' + status);
      };
      scope.translateOrderPaymentMethod = function (method) {
        if (method === -1) {
          return '모든 결제 방법';
        }
        return $rootScope.getContentsI18nText('enum.payment.method.' + method);
      };
      scope.translateOrderSettlementStatus = function (status) {
        if (status === -1) {
          return '모든 정산 상태';
        }
        return $rootScope.getContentsI18nText('enum.order.settlementStatus.' + status);
      };
      scope.fnUrlParams = function (urlParams) {
        var searchOrderStatus = _.get($rootScope, storeKeyPrefix + '.searchOrderStatus');
        var searchPaymentStatus = _.get($rootScope, storeKeyPrefix + '.searchPaymentStatus');
        var searchPaymentMethod = _.get($rootScope, storeKeyPrefix + '.searchPaymentMethod');
        var searchSettlementStatus = _.get($rootScope, storeKeyPrefix + '.searchSettlementStatus');
        var queryParams = {};
        var roleType = getRoleType();
        if (roleType) {
          queryParams.roleType = roleType;
        }
        if (searchOrderStatus >= 0) {
          queryParams.status = searchOrderStatus;
        } else {
          queryParams.status = '!0';
        }
        if (searchPaymentStatus >= 0) {
          queryParams.paymentStatus = searchPaymentStatus;
        }
        if (searchPaymentMethod >= 0) {
          queryParams.method = searchPaymentMethod;
        }
        if (searchSettlementStatus >= 0) {
          queryParams.settlementStatus = searchSettlementStatus;
        }
        if (scope.startDate && scope.endDate) {
          var start = new Date(scope.startDate);
          var end = new Date(scope.endDate);
          var diff = end.getTime() - start.getTime();
          if (diff >= 0) {
            queryParams.orderedAt = scope.startDate + '~' + scope.endDate;
          }
        }
        _.merge(urlParams, queryParams);
      };
      scope.datatablesLoaded = function (data) {
        $('table').css('width', '100%');
        scope.ajaxData = data;
        $compile(angular.element($('table')))(scope);
      };
    }
  };
});

orderModule.controller('OrderMainController', function ($scope, $rootScope, $http, $state, $translate, $compile, boUtils, orderCommons) {
  $scope.contentTitle = $translate.instant('order.main.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  $scope.orderDatatables = {
    field: 'orders',
    storeKey: 'orderMain',
    // disableFilter: true,
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: 'status',
      render: function render(status) {
        return $rootScope.getContentsI18nText('enum.order.status.' + status);
      }
    }, {
      data: 'orderedAt',
      render: function render(data) {
        return data ? boUtils.formatDate(data) : '';
      }
    }, {
      data: function data(_data) {
        return _data.method || 0;
      },
      render: function render(method) {
        return $rootScope.getContentsI18nText('enum.payment.method.' + method);
      }
    }, {
      data: function data(_data2) {
        return (+_data2.totalKRW).format();
      }
    }, {
      data: function data(_data3) {
        return (-_data3.couponKRW || 0).format();
      }
    }, {
      data: function data(_data4) {
        return (-_data4.credit || 0).format();
      }
    }, {
      data: 'paymentStatus',
      render: function render(status) {
        return $rootScope.getContentsI18nText('enum.order.paymentStatus.' + status);
      }
    }, {
      data: 'buyerId',
      render: function render(buyerId) {
        return '<a ui-sref="user.info({userId: ' + buyerId + '})">' + buyerId + '</a>';
      }
    }, {
      data: function data(_data5) {
        return _.get(_data5, 'name') || '';
      }
    }, {
      data: function data(_data6) {
        return _.get(_data6, 'data.tel') || '';
      }
    }, {
      data: function data(_data7) {
        return _data7.email || _data7.userId || '';
      }
    }],
    fnCreatedRow: function fnCreatedRow(nRow, aData, iDataIndex) {
      if (aData.status === 10) {} else if (aData.status === 100) {} else if (aData.status === 101) {
        $(nRow).css('background-color', 'rgb(219,219,219)');
      } else if (aData.status === 102) {
        $(nRow).css('background-color', 'rgb(126, 172, 163)');
      } else if (aData.status === 200) {
        $(nRow).css('background-color', 'rgb(198,190,250)');
      } else if (aData.status === 201) {
        $(nRow).css('background-color', 'rgb(208,216,232)');
      } else if (aData.status === 202) {
        $(nRow).css('background-color', 'rgb(211,147,227)');
      } else if (aData.status === 203) {
        $(nRow).css('background-color', 'rgb(179,102,255)');
      } else if (aData.status === 300) {
        $(nRow).css('background-color', 'rgb(255,185,187)');
      } else if (aData.status === 301) {
        $(nRow).css('background-color', 'rgba(255, 128, 0, 0.4)');
      } else if (aData.status === 302) {
        $(nRow).css('background-color', 'rgba(255, 255, 0, 0.4)');
      } else if (aData.status === 400) {
        $(nRow).css('background-color', 'rgba(59, 59, 78, 0.27)');
      }
    }
  };

  orderCommons.applyFilterSearch($scope, $state, 'state.order.main', function () {
    return 'buyer';
  });
});

orderModule.controller('OrderListBeforePaymentController', function ($scope, $rootScope, $http, $state, $translate, boUtils) {
  $scope.contentTitle = $translate.instant('order.beforePayment.title');
  $scope.contentSubTitle = $translate.instant('order.beforePayment.subTitle');
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }, {
    sref: 'order.beforePayment',
    name: $translate.instant('order.beforePayment.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  // $scope.orderDatatables = OrderCommons.getDatatables('/api/v1/orders?q=status:!0,paymentStatus:0');
  $scope.orderDatatables = {
    field: 'orders',
    storeKey: 'orderBeforePayment',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders?status=0&paymentStatus=200',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }, {
      data: function data(_data8) {
        return (+_data8.totalKRW).format();
      }
    }, {
      data: 'buyerId',
      render: function render(buyerId) {
        return '<a ui-sref="user.info({userId: ' + buyerId + '})">' + buyerId + '</a>';
      }
    }, {
      data: function data(_data9) {
        return _.get(_data9, 'name') || '';
      }
    }, {
      data: function data(_data10) {
        return _.get(_data10, 'data.tel') || '';
      }
    }, {
      data: function data(_data11) {
        return _data11.email || _data11.userId || '';
      }
    }, {
      data: 'id',
      render: function render(id) {
        return '<button class="btn blue" data-ng-click="startProcessing(' + id + ')"><i class="fa fa-play"></i> ' + $translate.instant('order.main.startProcessing') + '</button>';
      }
    }, {
      data: 'id',
      render: function render(id) {
        return '\n            <button class="btn red" data-ng-click="cancelOrder(' + id + ')">\n              <i class="fa fa-remove"></i> 주문취소\n            </button>\n          ';
      }
    }]
  };
  $scope.startProcessing = function (orderId) {
    if (window.confirm('입금 확인하셨습니까?')) {
      $http.post('/api/v1/orders/' + orderId + '/start_processing').then(function (res) {
        // TODO: Update datatables row data.
        $state.reload();
      });
    }
  };
  $scope.cancelOrder = function (orderId) {
    if (window.confirm('입금대기 상태를 취소하시겠습니까?')) {
      $http.put('/api/v1/orders/' + orderId + '/cancel').then(function (res) {
        $state.reload();
      });
    }
  };
});

orderModule.controller('OrderDetailController', function ($scope, $rootScope, $http, $state, $translate, boUtils, convertUtil, orderCommons, order) {
  $scope.contentTitle = $translate.instant('order.detail.title');
  $scope.contentSubTitle = 'Order Detail';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }, {
    sref: 'order.detail',
    name: $translate.instant('order.detail.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  order.createdAt = boUtils.formatDate(order.createdAt);
  order.orderedAt = boUtils.formatDate(order.orderedAt);
  order.finalShippingCostKRW = order.finalShippingCostKRW && Number(order.finalShippingCostKRW);
  (order.orderProducts || []).forEach(function (p) {
    p.imageUrl = _.get(p, 'productVariant.appImages.default[0].thumbnails.640', '');
    if (boUtils.isString(p.product.id)) {
      p.product.shortId = boUtils.shorten(p.product.id, 8);
    } else {
      p.product.shortId = p.id;
    }
  });
  order.totalRefuned = 0;
  (order.payments || []).forEach(function (p) {
    if (p.type === 2 && p.status === 0) {
      order.totalRefuned += +p.data.PRTC_Price;
    }
  });
  $scope.order = order;
  $scope.user = {};
  $http.get('/api/v1/users/' + order.buyerId).then(function (res) {
    $scope.user = res.data;
  });
  $http.get('/api/v1/orders/' + order.id + '/logs').then(function (res) {
    res.data.logs.forEach(function (l) {
      return l.createdAt = boUtils.formatDate(l.createdAt);
    });
    $scope.paymentLogs = _.groupBy(res.data.logs, 'paymentId');
    $scope.notes = _.filter(res.data.logs, { type: 1000 }).sort(function (a, b) {
      return a.id < b.id;
    });
  });

  if (_.get(order, 'address.countryCode', 'KR') === 'KR') {
    $scope.newShipment = {
      provider: 1,
      unitKRW: 0,
      weight: 0,
      boxKRW: 2500
    };
  }

  var orderProcess = [100, 102, 200, 201, 202, 400];
  var makeOrderSummary = function makeOrderSummary() {
    if (order.status < 100) {
      return '주문 처리 중 입니다.';
    } else if (order.status === 300) {
      return '주문 취소되었습니다.';
    } else if (order.status === 301) {
      return '반품 중입니다.';
    }
  };

  $scope.allStatus = orderCommons.allStatus;
  $scope.allPaymentStatus = orderCommons.allPaymentStatus;

  $scope.translateOrderStatus = function (status) {
    return $rootScope.getContentsI18nText('enum.order.status.' + status);
  };
  $scope.translateOrderPaymentStatus = function (status) {
    return $rootScope.getContentsI18nText('enum.order.paymentStatus.' + status);
  };
  $scope.translateOrderSettlementStatus = function (status) {
    return $rootScope.getContentsI18nText('enum.order.settlementStatus.' + status);
  };
  $scope.translateOrderProductStatus = function (status) {
    return $rootScope.getContentsI18nText('enum.orderProduct.status.' + status);
  };
  $scope.translatePaymentStatus = function (status) {
    return $rootScope.getContentsI18nText('enum.payment.status.' + status);
  };
  $scope.translatePaymentType = function (type) {
    return $rootScope.getContentsI18nText('enum.payment.type.' + type);
  };
  $scope.translatePaymentMethod = function (method) {
    return $rootScope.getContentsI18nText('enum.payment.method.' + method);
  };
  $scope.paymentAmount = function (payment) {
    if (payment && payment.data) {
      var _payment$data = payment.data;
      var TotPrice = _payment$data.TotPrice;
      var amt_input = _payment$data.amt_input;
      var P_AMT = _payment$data.P_AMT;
      var PRTC_Price = _payment$data.PRTC_Price;
      var P_KOR_AMT = _payment$data.P_KOR_AMT;

      return Number(TotPrice || amt_input || P_KOR_AMT || P_AMT || PRTC_Price || 0);
    }
    return 0;
  };
  $scope.refundedAmount = function (payment) {
    var total = 0;
    (order.payments || []).forEach(function (p) {
      if (p.type === 2 && p.status === 0 && p.parentId === payment.id) {
        total += +p.data.PRTC_Price;
      }
    });
    return total;
  };
  $scope.paymentMethod = function (payment) {
    if (payment && payment.data) {
      var _payment$data2 = payment.data;
      var payMethod = _payment$data2.payMethod;
      var paymethod = _payment$data2.paymethod;
      var P_TYPE = _payment$data2.P_TYPE;

      return (payMethod || paymethod || P_TYPE || 'VBANK').toUpperCase();
    }
  };
  $scope.getParent = function (payment) {
    return _.find(order.payments, { id: payment.parentId });
  };

  $scope.refundOrder = function () {
    if (order.finalTotalKRW === undefined) {
      alert('Plese save final order counts');
      return;
    }
    var amount = +order.totalPaid.amount - +order.finalTotalKRW - order.totalRefuned;
    var payments = _.filter(order.payments, function (p) {
      return p.type === 0 && p.status === 0;
    });
    if (payments.length === 1) {
      $scope.refund(payments[0], amount);
    } else {
      alert('multiple payment transaction');
    }
  };

  $scope.addNote = function (message) {
    $http.post('/api/v1/orders/' + order.id + '/logs', {
      type: 1000,
      data: { message: message }
    }).then(function (res) {
      $state.reload();
    });
  };

  $scope.popupRefund = function (payment) {
    $scope.refundPayment = payment;
    $('#order_refund_modal').modal();
  };

  $scope.refund = function (payment, amount, accountNumber, accountHolder, bankCode) {
    $scope.closePopup();
    $http.post('/api/v1/orders/' + order.id + '/refund', {
      paymentId: payment.id,
      // amount: payment.data.TotPrice, // FIXME: from user input
      amount: +amount,
      msg: 'admin refund',
      accountNumber: accountNumber,
      accountHolder: accountHolder,
      bankCode: bankCode
    }).then(function (res) {
      $state.reload();
    });
  };

  $scope.finalize = function () {
    var data = _.pick(order, 'finalShippingCostKRW');
    data.orderProducts = order.orderProducts.map(function (o) {
      return _.pick(o, 'id', 'finalQuantity', 'settledKRW', 'data');
    });
    return $http.put('/api/v1/orders/' + order.id + '/finalize', data).then(function (res) {
      $state.reload();
    }, function (err) {
      return alert(err.data.message);
    });
  };

  $scope.closePopup = function () {
    $('#order_refund_modal').modal('hide');
    $('#order_refund_modal').removeClass('in');
    $('.modal-backdrop').remove();
  };

  $scope.saveStatus = function () {
    var data = _.pick(order, 'status', 'paymentStatus', 'settlementStatus');
    $http.put('/api/v1/orders/' + order.id + '/status', data).then(function (res) {
      $state.reload();
    }, function (err) {
      return alert(err.data.message);
    });
  };

  $scope.readyShipment = function () {
    if (!window.confirm('상품 확인 및 배송 준비 완료되었습니까?')) {
      return;
    }
    Promise.all([$http.put('/api/v1/orders/' + order.id + '/status', { status: 102 }), $scope.finalize()]).then(function () {
      window.alert('저장되었습니다');
      $state.reload();
    });
  };

  $scope.beginShipment = function () {
    var trackingNumber = $scope.newShipment.trackingNumber;
    if (!trackingNumber) {
      window.alert('송장번호를 입력해 주세요');
      return;
    }
    if (!window.confirm(trackingNumber + ' 번에 대한 배송 정보가 추가됩니다.')) {
      return;
    }
    Promise.all([$http.put('/api/v1/orders/' + order.id + '/status', { status: 200 }), $scope.addShipment($scope.newShipment)]).then(function () {
      window.alert('저장되었습니다');
      $state.reload();
    });
  };

  $scope.endShipment = function () {
    $http.put('/api/v1/orders/' + order.id + '/status', { status: 203 }).then(function () {
      window.alert('저장되었습니다');
      $state.reload();
    });
  };

  $scope.closeOrder = function () {
    if (window.confirm('구매 확정됩니다. 사용자에게 마일리지가 적립됩니다.')) {
      $http.put('/api/v1/orders/' + order.id + '/close').then(function () {
        window.alert('완료되었습니다');
        $state.go('order.main');
      })['catch'](function () {
        window.alert('구매 확정 처리가 이전에 수행된 적이 있을 수 있습니다. 주문 처리 이력을 확인해 주세요');
      });
    }
  };

  $scope.deleteOrder = function () {
    if (window.confirm($translate.instant('order.detail.deleteMessage'))) {
      $http['delete']('/api/v1/orders/' + order.id).then(function () {
        window.history.back();
      }, function (err) {
        return alert(err.data.message);
      });
    };
  };

  $scope.getDates = function (num) {
    var today = moment();
    var dates = [];
    for (var i = 0; i < num; i++) {
      dates.push(today.format('YYYY-MM-DD'));
      today.subtract(1, 'd');
    }
    return dates;
  };
  $scope.calcShipmentTotal = function (shipment) {
    var sum = new Decimal((+shipment.unitKRW || 0) * (+shipment.weight || 0) + +shipment.boxKRW);
    return sum.div(10).round().mul(10).toNumber();
  };
  $scope.addShipment = function (shipment) {
    shipment.totalKRW = $scope.calcShipmentTotal(shipment);
    $http.post('/api/v1/orders/' + order.id + '/shipments', shipment).then(function (res) {
      $state.reload();
    });
  };
  var shipmentProvidersMap = {
    0: 'CJ대한통운', // TODO remove
    1: '로젠택배', // TODO 우체국 택배
    4: 'CJ대한통운',
    5: '한진택배',
    // 6: '로젠택배',
    8: '현대택배',
    10: 'KGB택배',
    11: '일양로지스',
    12: 'EMS',
    13: 'DHL',
    14: 'UPS',
    15: 'GTX로지스',
    16: '한의사랑택배',
    17: '천일택배',
    18: '건영택배',
    21: 'Fedex',
    22: '대신택배',
    23: '경동택배',
    24: 'CVSnet 편의점택배',
    25: 'TNT Express',
    26: 'USPS',
    28: 'GSMNtoN(인로스)',
    29: '에어보이익스프레스',
    32: '합동택배',
    33: 'DHL Global Mail',
    34: 'i-Parcel',
    36: '쿠팡 로켓배송',
    37: '범한판토스',
    38: 'APEX(ECMS Express)',
    39: 'KG로지스택배(통합)',
    40: '굿투럭(신규)',
    41: '롯데택배',
    100: '미등록'
  };
  $scope.shipmentProviders = Object.keys(shipmentProvidersMap).map(function (p) {
    return { label: shipmentProvidersMap[p], value: p };
  });
  $scope.shipmentProviderText = function (provider) {
    return shipmentProvidersMap[provider] || provider;
    /*
    if (provider === 0) return 'CJ';
    if (provider === 1) return '로젠택배';
    if (provider === 104) return '영통';
    if (provider === 105) return '판다';
    return provider;
    */
  };

  $scope.exportPackingList = function () {
    var CLIENT_ID = '352586701861-20pb7c3qlp7klemfap5qfms0hl0eshrv.apps.googleusercontent.com';

    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

    function checkAuth() {
      gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, handleAuthResult);
    }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        loadSheetsApi();
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
      }
    }

    function loadSheetsApi() {
      var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
      gapi.client.load(discoveryUrl).then(run);
    }

    function run() {
      var mergeCells = function mergeCells(sheetId, startColumnIndex, startRowIndex, endColumnIndex, endRowIndex) {
        return {
          range: {
            sheetId: sheetId,
            startRowIndex: startRowIndex,
            endRowIndex: endRowIndex,
            startColumnIndex: startColumnIndex,
            endColumnIndex: endColumnIndex
          }
        };
      };
      gapi.client.sheets.spreadsheets.create({
        properties: { title: order.id + '-패킹리스트' },
        sheets: [{
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [{
                userEnteredValue: { stringValue: '패킹리스트' },
                userEnteredFormat: { horizontalAlignment: 'CENTER' }
              }]
            }, {
              // blank line
            }, {
              values: [{ userEnteredValue: { stringValue: '주문일' } }, { userEnteredValue: { stringValue: order.orderedAt } }]
            }, {
              values: [{ userEnteredValue: { stringValue: '주문자' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } }]
            }, {
              values: [{ userEnteredValue: { stringValue: '연락처' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.tel', '') } }]
            }, {
              values: [{ userEnteredValue: { stringValue: '국가' } }, { userEnteredValue: { stringValue: _.get(order.address, 'countryCode', '') } }]
            }, {
              values: [{ userEnteredValue: { stringValue: '주소' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.address.base', '') + ' ' + _.get(order.address, 'detail.address.detail', '') } }]
            }, {
              // blank line
            }, {
              values: [{ userEnteredValue: { stringValue: '주문번호' } }, { userEnteredValue: { stringValue: '브랜드' } }, { userEnteredValue: { stringValue: '상품번호' } }, { userEnteredValue: { stringValue: '컬러' } }, { userEnteredValue: { stringValue: '사이즈' } }, { userEnteredValue: { stringValue: '상품명' } }, { userEnteredValue: { stringValue: '주문수량' } }, { userEnteredValue: { stringValue: '최종수량' } }]
            }].concat(_toConsumableArray(order.orderProducts.map(function (op) {
              return {
                values: [{ userEnteredValue: { stringValue: op.orderId.toString() } }, { userEnteredValue: { stringValue: op.brand.name.ko } }, { userEnteredValue: { stringValue: op.product.shortId.toString() } }, { userEnteredValue: { stringValue: op.productVariant.data.color } }, { userEnteredValue: { stringValue: op.productVariant.data.size } }, { userEnteredValue: { stringValue: op.product.name.ko } }, { userEnteredValue: { stringValue: op.quantity.toString() } }, { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } }]
              };
            })))
          }]
        }]
      }).then(function (_ref) {
        var _ref$result = _ref.result;
        var spreadsheetId = _ref$result.spreadsheetId;
        var sheets = _ref$result.sheets;

        var sheetId = sheets[0].properties.sheetId;
        return gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          requests: [{ mergeCells: mergeCells(sheetId, 0, 0, 8, 1) }, { mergeCells: mergeCells(sheetId, 1, 2, 8, 3) }, { mergeCells: mergeCells(sheetId, 1, 3, 8, 4) }, { mergeCells: mergeCells(sheetId, 1, 4, 8, 5) }, { mergeCells: mergeCells(sheetId, 1, 5, 8, 6) }, { mergeCells: mergeCells(sheetId, 1, 6, 8, 7) }]
        });
      }).then(function (_ref2) {
        var spreadsheetId = _ref2.result.spreadsheetId;

        window.open('https://docs.google.com/spreadsheets/d/' + spreadsheetId);
      }).then(undefined, function (response) {
        console.log('Error: ' + response.result.error.message);
      });
    }

    gapi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: false }, handleAuthResult);
  };

  $scope.exportOrderList = function () {
    var CLIENT_ID = '352586701861-20pb7c3qlp7klemfap5qfms0hl0eshrv.apps.googleusercontent.com';

    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

    function checkAuth() {
      gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, handleAuthResult);
    }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        loadSheetsApi();
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
      }
    }

    function loadSheetsApi() {
      var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
      gapi.client.load(discoveryUrl).then(run);
    }

    function run() {
      var mergeCells = function mergeCells(sheetId, startColumnIndex, startRowIndex, endColumnIndex, endRowIndex) {
        return {
          range: {
            sheetId: sheetId,
            startRowIndex: startRowIndex,
            endRowIndex: endRowIndex,
            startColumnIndex: startColumnIndex,
            endColumnIndex: endColumnIndex
          }
        };
      };
      var rowData = function rowData() {
        var countryCode = _.get(order.address, 'countryCode', 'KR').toUpperCase();
        if (countryCode === 'KR') {
          return [{
            values: [{
              userEnteredValue: { stringValue: '주문 리스트' },
              userEnteredFormat: { horizontalAlignment: 'CENTER' }
            }]
          }, {
            // blank line
          }, {
            values: [{ userEnteredValue: { stringValue: '주문일' } }, { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '고객명' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '이메일' } }, { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '주문번호' } }, { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '국가' } }, { userEnteredValue: { stringValue: '대한민국' } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '배송지' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.address.base', '') + ' ' + _.get(order.address, 'detail.address.detail', '') } }]
          }, {
            // blank line
          }, {
            values: [{ userEnteredValue: { stringValue: ' *도매 시장의 특성상 주문수량과 상이할 수 있습니다. 최종 수량은 링크샵스 홈페이지 내주문에서 확인해주세요.' } }]
          }, {
            values: [{ userEnteredValue: { stringValue: 'NO' } }, { userEnteredValue: { stringValue: '브랜드' } }, { userEnteredValue: { stringValue: '상품번호' } }, { userEnteredValue: { stringValue: '상품명' } }, { userEnteredValue: { stringValue: '컬러' } }, { userEnteredValue: { stringValue: '사이즈' } }, { userEnteredValue: { stringValue: '주문수량' } }, { userEnteredValue: { stringValue: '최종수량' } }]
          }].concat(_toConsumableArray(order.orderProducts.map(function (op, index) {
            return {
              values: [{ userEnteredValue: { stringValue: (index + 1).toString() } }, { userEnteredValue: { stringValue: op.brand.name.ko } }, { userEnteredValue: { stringValue: op.product.id.toString() } }, { userEnteredValue: { stringValue: op.product.name.ko } }, { userEnteredValue: { stringValue: op.productVariant.data.color } }, { userEnteredValue: { stringValue: op.productVariant.data.size } }, { userEnteredValue: { stringValue: op.quantity.toString() } }, { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } }]
            };
          })));
        } else if (countryCode === 'CN') {
          return [{
            values: [{
              userEnteredValue: { stringValue: '订单目录' },
              userEnteredFormat: { horizontalAlignment: 'CENTER' }
            }]
          }, {
            // blank line
          }, {
            values: [{ userEnteredValue: { stringValue: '订单日期' } }, { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '姓名' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '邮箱' } }, { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '订单号' } }, { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '国家' } }, { userEnteredValue: { stringValue: 'China' } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '地址' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.address.base', '') + ' ' + _.get(order.address, 'detail.address.detail', '') } }]
          }, {
            // blank line
          }, {
            values: [{ userEnteredValue: { stringValue: '* 由于批发市场的特殊性，不能立刻确认库存情况. 您可以在网站测上面“我的Linkshops-请单详情” 里面确认取货结果。' } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '号码' } }, { userEnteredValue: { stringValue: '品牌' } }, { userEnteredValue: { stringValue: '商品编号' } }, { userEnteredValue: { stringValue: '颜色' } }, { userEnteredValue: { stringValue: '尺码' } }, { userEnteredValue: { stringValue: '订货数量' } }, { userEnteredValue: { stringValue: '取货数量' } }]
          }].concat(_toConsumableArray(order.orderProducts.map(function (op, index) {
            return {
              values: [{ userEnteredValue: { stringValue: (index + 1).toString() } }, { userEnteredValue: { stringValue: op.brand.name.ko } }, { userEnteredValue: { stringValue: op.product.id.toString() } }, { userEnteredValue: { stringValue: op.productVariant.data.color } }, { userEnteredValue: { stringValue: op.productVariant.data.size } }, { userEnteredValue: { stringValue: op.quantity.toString() } }, { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } }]
            };
          })));
        } else if (countryCode === 'TW' || countryCode === 'MO' || countryCode === 'HK') {
          var country = countryCode === 'TW' ? 'Taiwan' : countryCode === 'MO' ? 'Macau' : 'Hong-Kong';
          return [{
            values: [{
              userEnteredValue: { stringValue: '訂單目錄' },
              userEnteredFormat: { horizontalAlignment: 'CENTER' }
            }]
          }, {
            // blank line
          }, {
            values: [{ userEnteredValue: { stringValue: '訂單日期' } }, { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '姓名' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '郵箱' } }, { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '訂單號' } }, { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '國家' } }, { userEnteredValue: { stringValue: country } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '地址' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.address.base', '') + ' ' + _.get(order.address, 'detail.address.detail', '') } }]
          }, {
            // blank line
          }, {
            values: [{ userEnteredValue: { stringValue: '* 由於批發市場的特殊性，不能立刻確認庫存情況。您可以在網站右側上面“我的Linkshops-訂單詳情” 裡面確認取貨結果。' } }]
          }, {
            values: [{ userEnteredValue: { stringValue: '號碼' } }, { userEnteredValue: { stringValue: '品牌' } }, { userEnteredValue: { stringValue: '商品編號' } }, { userEnteredValue: { stringValue: '顏色' } }, { userEnteredValue: { stringValue: '尺碼' } }, { userEnteredValue: { stringValue: '訂貨數量' } }, { userEnteredValue: { stringValue: '取貨數量' } }]
          }].concat(_toConsumableArray(order.orderProducts.map(function (op, index) {
            return {
              values: [{ userEnteredValue: { stringValue: (index + 1).toString() } }, { userEnteredValue: { stringValue: op.brand.name.ko } }, { userEnteredValue: { stringValue: op.product.id.toString() } }, { userEnteredValue: { stringValue: op.productVariant.data.color } }, { userEnteredValue: { stringValue: op.productVariant.data.size } }, { userEnteredValue: { stringValue: op.quantity.toString() } }, { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } }]
            };
          })));
        } else {
          return [{
            values: [{
              userEnteredValue: { stringValue: 'ORDER LIST' },
              userEnteredFormat: { horizontalAlignment: 'CENTER' }
            }]
          }, {
            // blank line
          }, {
            values: [{ userEnteredValue: { stringValue: 'Order date' } }, { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } }]
          }, {
            values: [{ userEnteredValue: { stringValue: 'Name' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } }]
          }, {
            values: [{ userEnteredValue: { stringValue: 'E-mail' } }, { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } }]
          }, {
            values: [{ userEnteredValue: { stringValue: 'Order No' } }, { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } }]
          }, {
            values: [{ userEnteredValue: { stringValue: 'Country' } }]
          }, {
            values: [{ userEnteredValue: { stringValue: 'Address' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.address.base', '') + ' ' + _.get(order.address, 'detail.address.detail', '') } }]
          }, {
            // blank line
          }, {
            values: [{ userEnteredValue: { stringValue: '* Since we can not check the wholesale market inventory in real time, the number of delivered item can be different than you have ordered. Please check the final quantity @ linkshops.com' } }]
          }, {
            values: [{ userEnteredValue: { stringValue: 'NO' } }, { userEnteredValue: { stringValue: 'Brand' } }, { userEnteredValue: { stringValue: 'Product ID' } }, { userEnteredValue: { stringValue: 'Color' } }, { userEnteredValue: { stringValue: 'Size' } }, { userEnteredValue: { stringValue: 'Order QTY' } }, { userEnteredValue: { stringValue: 'Final QTY' } }]
          }].concat(_toConsumableArray(order.orderProducts.map(function (op, index) {
            return {
              values: [{ userEnteredValue: { stringValue: (index + 1).toString() } }, { userEnteredValue: { stringValue: op.brand.name.ko } }, { userEnteredValue: { stringValue: op.product.id.toString() } }, { userEnteredValue: { stringValue: op.productVariant.data.color } }, { userEnteredValue: { stringValue: op.productVariant.data.size } }, { userEnteredValue: { stringValue: op.quantity.toString() } }, { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } }]
            };
          })));
        }
      };

      gapi.client.sheets.spreadsheets.create({
        properties: { title: order.id + '-주문리스트' },
        sheets: [{
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: rowData()
          }]
        }]
      }).then(function (_ref3) {
        var _ref3$result = _ref3.result;
        var spreadsheetId = _ref3$result.spreadsheetId;
        var sheets = _ref3$result.sheets;

        var sheetId = sheets[0].properties.sheetId;
        return gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          requests: [{ mergeCells: mergeCells(sheetId, 0, 0, 8, 1) }, { mergeCells: mergeCells(sheetId, 1, 2, 8, 3) }, { mergeCells: mergeCells(sheetId, 1, 3, 8, 4) }, { mergeCells: mergeCells(sheetId, 1, 4, 8, 5) }, { mergeCells: mergeCells(sheetId, 1, 5, 8, 6) }, { mergeCells: mergeCells(sheetId, 1, 6, 8, 7) }, { mergeCells: mergeCells(sheetId, 1, 7, 8, 8) }, { mergeCells: mergeCells(sheetId, 0, 9, 8, 10) }]
        });
      }).then(function (_ref4) {
        var spreadsheetId = _ref4.result.spreadsheetId;

        window.open('https://docs.google.com/spreadsheets/d/' + spreadsheetId);
      }).then(undefined, function (response) {
        console.log('Error: ' + response.result.error.message);
      });
    }

    gapi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: false }, handleAuthResult);
  };

  $scope.exportOrderForAccountTeam = function () {
    var CLIENT_ID = '352586701861-20pb7c3qlp7klemfap5qfms0hl0eshrv.apps.googleusercontent.com';

    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

    function checkAuth() {
      gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, handleAuthResult);
    }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        loadSheetsApi();
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
      }
    }

    function loadSheetsApi() {
      var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
      gapi.client.load(discoveryUrl).then(run);
    }

    function run() {
      var mergeCells = function mergeCells(sheetId, startColumnIndex, startRowIndex, endColumnIndex, endRowIndex) {
        return {
          range: {
            sheetId: sheetId,
            startRowIndex: startRowIndex,
            endRowIndex: endRowIndex,
            startColumnIndex: startColumnIndex,
            endColumnIndex: endColumnIndex
          }
        };
      };
      var rowData = function rowData() {
        return [{
          values: [{
            userEnteredValue: { stringValue: '주문 리스트' },
            userEnteredFormat: { horizontalAlignment: 'CENTER' }
          }]
        }, {
          // blank line
        }, {
          values: [{ userEnteredValue: { stringValue: '주문일' } }, { userEnteredValue: { stringValue: order.orderedAt.substr(0, 10) } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '고객명' } }, { userEnteredValue: { stringValue: _.get(order.address, 'detail.name', '') } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '이메일' } }, { userEnteredValue: { stringValue: _.get($scope.user, 'email', '') } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '주문번호' } }, { userEnteredValue: { stringValue: _.get(order, 'id', '').toString() } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '국가' } }, { userEnteredValue: { stringValue: '대한민국' } }]
        }, {
          // blank line
        }, {
          values: [{ userEnteredValue: { stringValue: 'NO' } }, { userEnteredValue: { stringValue: '브랜드' } },
          // { userEnteredValue: { stringValue: '상품번호' } },
          { userEnteredValue: { stringValue: '상품명' } }, { userEnteredValue: { stringValue: '컬러' } }, { userEnteredValue: { stringValue: '사이즈' } }, { userEnteredValue: { stringValue: '주문수량' } }, { userEnteredValue: { stringValue: '최종수량' } }, { userEnteredValue: { stringValue: '금액' } }]
        }].concat(_toConsumableArray(order.orderProducts.map(function (op, index) {
          return {
            values: [{ userEnteredValue: { stringValue: (index + 1).toString() } }, { userEnteredValue: { stringValue: op.brand.name.ko } },
            // { userEnteredValue: { stringValue: op.product.id.toString() } },
            { userEnteredValue: { stringValue: op.product.name.ko } }, { userEnteredValue: { stringValue: op.productVariant.data.color } }, { userEnteredValue: { stringValue: op.productVariant.data.size } }, { userEnteredValue: { stringValue: op.quantity.toString() } }, { userEnteredValue: { stringValue: _.get(op, 'finalQuantity', '').toString() } }, { userEnteredValue: { stringValue: (+_.get(op, 'finalTotalKRW', 0)).format(0, 3) } }]
          };
        })), [{
          // blank line
        }, {
          values: [{ userEnteredValue: { stringValue: '' } }, { userEnteredValue: { stringValue: '주문' } }, { userEnteredValue: { stringValue: '최종' } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '상품가격' } }, { userEnteredValue: { stringValue: (+_.get(order, 'subtotalKRW', 0)).format(0, 3) } }, { userEnteredValue: { stringValue: (+_.get(order, 'finalSubtotalKRW', 0)).format(0, 3) } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '세금' } }, { userEnteredValue: { stringValue: (+_.get(order, 'taxKRW', 0)).format(0, 3) } }, { userEnteredValue: { stringValue: (+_.get(order, 'finalTaxKRW', 0)).format(0, 3) } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '사입비' } }, { userEnteredValue: { stringValue: (+_.get(order, 'handlingFeeKRW', 0)).format(0, 3) } }, { userEnteredValue: { stringValue: (+_.get(order, 'finalHandlingFeeKRW', 0)).format(0, 3) } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '운송비' } }, { userEnteredValue: { stringValue: (+_.get(order, 'shippingCostKRW', 0)).format(0, 3) } }, { userEnteredValue: { stringValue: (+_.get(order, 'finalShippingCostKRW', 0)).format(0, 3) } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '가격조정' } }, { userEnteredValue: { stringValue: (+_.get(order, 'adjustmentTotalKRW', 0)).format(0, 3) } }, { userEnteredValue: { stringValue: (+_.get(order, 'finalAdjustmentTotalKRW', 0)).format(0, 3) } }]
        }, {
          values: [{ userEnteredValue: { stringValue: '전체금액' } }, { userEnteredValue: { stringValue: (+_.get(order, 'totalKRW', 0)).format(0, 3) } }, { userEnteredValue: { stringValue: (+_.get(order, 'finalTotalKRW', 0)).format(0, 3) } }]
        }, {
          // blank line
        }, {
          values: [{ userEnteredValue: { stringValue: 'ID' } }, { userEnteredValue: { stringValue: 'TID' } }, { userEnteredValue: { stringValue: 'TYPE' } }, { userEnteredValue: { stringValue: '가격' } }, { userEnteredValue: { stringValue: '결제수단' } }, { userEnteredValue: { stringValue: '상태' } }]
        }], _toConsumableArray(order.payments.map(function (p, index) {
          return {
            values: [{ userEnteredValue: { stringValue: p.id.toString() } }, { userEnteredValue: { stringValue: p.tid } }, { userEnteredValue: { stringValue: $scope.translatePaymentType(p.type) } }, { userEnteredValue: { stringValue: (+$scope.paymentAmount(p)).format(0, 3) } }, { userEnteredValue: { stringValue: p.type === 0 ? $scope.translatePaymentMethod(p.method) : '' } }, { userEnteredValue: { stringValue: $scope.translatePaymentStatus(p.status) } }]
          };
        })));
      };

      gapi.client.sheets.spreadsheets.create({
        properties: { title: order.id + '-주문리스트' },
        sheets: [{
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: rowData()
          }]
        }]
      }).then(function (_ref5) {
        var _ref5$result = _ref5.result;
        var spreadsheetId = _ref5$result.spreadsheetId;
        var sheets = _ref5$result.sheets;

        var sheetId = sheets[0].properties.sheetId;
        return gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          requests: [{ mergeCells: mergeCells(sheetId, 0, 0, 8, 1) }, { mergeCells: mergeCells(sheetId, 1, 2, 8, 3) }, { mergeCells: mergeCells(sheetId, 1, 3, 8, 4) }, { mergeCells: mergeCells(sheetId, 1, 4, 8, 5) }, { mergeCells: mergeCells(sheetId, 1, 5, 8, 6) }, { mergeCells: mergeCells(sheetId, 1, 6, 8, 7) }]
        });
      }).then(function (_ref6) {
        var spreadsheetId = _ref6.result.spreadsheetId;

        window.open('https://docs.google.com/spreadsheets/d/' + spreadsheetId);
      }).then(undefined, function (response) {
        console.log('Error: ' + response.result.error.message);
      });
    }

    gapi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: false }, handleAuthResult);
  };

  if ($scope.order.address) {
    $scope.addressFields = [{ title: $translate.instant('order.address.nameLabel'), obj: _.get($scope.order.address, 'detail.name'), key: 'name' }, { title: $translate.instant('order.address.postalCodeLabel'), obj: _.get($scope.order.address, 'detail.postalCode'), key: 'postalCode' }, { title: $translate.instant('order.address.addressLabel'), obj: _.get($scope.order.address, 'detail.address1'), key: 'address1' }, { title: $translate.instant('order.address.addressDetailLabel'), obj: _.get($scope.order.address, 'detail.address2'), key: 'address2' }, { title: $translate.instant('order.address.countryCodeLabel'), obj: _.get($scope.order.address, 'countryCode'), key: 'countryCode' }, { title: $translate.instant('order.address.telLabel'), obj: _.get($scope.order.address, 'detail.tel'), key: 'tel' }];
  }
});

orderModule.controller('OrderUncleController', function ($scope, $rootScope, $http, $state, $translate) {
  $scope.contentTitle = $translate.instant('order.uncle.title');
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }, {
    sref: 'order.uncle',
    name: $translate.instant('order.uncle.title')
  }];

  $scope.orderDatatables = {
    field: 'orderProducts',
    storeKey: 'orderUncle',
    disableFilter: true,
    url: '/api/v1/uncle/order_products',
    order: [],
    columns: [{
      data: function data(_data12) {
        return _.get(_data12, 'processedDate', '').substring(2, 10);
      },
      bSortable: false
    }, {
      data: 'orderId',
      bSortable: false
    }, {
      data: function data(_data13) {
        return _.get(_data13, 'brand.name.ko', '');
      },
      bSortable: false
    }, {
      data: function data(_data14) {
        return _.get(_data14, 'brand.data.location.building.name.ko', '');
      },
      bSortable: false
    }, {
      data: function data(_data15) {
        return _.get(_data15, 'brand.data.location.floor', '');
      },
      bSortable: false
    }, {
      data: function data(_data16) {
        return _.get(_data16, 'brand.data.location.flatNumber', '');
      },
      bSortable: false
    }, {
      data: function data(_data17) {
        return _.get(_data17, 'brand.data.tel', '');
      },
      bSortable: false
    }, {
      data: function data(_data18) {
        return _.get(_data18, 'product.id', '');
      },
      bSortable: false
    }, {
      data: function data(_data19) {
        return _.get(_data19, 'product.name.ko', '');
      },
      bSortable: false
    }, {
      data: function data(_data20) {
        return _.get(_data20, 'productVariant.data.color', '');
      },
      bSortable: false
    }, {
      data: function data(_data21) {
        return _.get(_data21, 'productVariant.data.size', '');
      },
      bSortable: false
    }, {
      data: 'quantity',
      bSortable: false
    }]
  };

  $rootScope.initAll($scope, $state.current.name);
});

orderModule.controller('OrderCsController', function ($scope, $rootScope, $http, $state, $translate) {
  $scope.contentTitle = $translate.instant('order.cs.title');
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }, {
    sref: 'order.cs',
    name: $translate.instant('order.cs.title')
  }];

  $scope.orderDatatables = {
    field: 'orderProducts',
    storeKey: 'orderCs',
    disableFilter: true,
    url: '/api/v1/order_products',
    order: [],
    columns: [{
      data: 'orderId',
      bSortable: false
    }, {
      data: function data(_data22) {
        return _.get(_data22, 'brand.id', '');
      },
      bSortable: false
    }, {
      data: function data(_data23) {
        return _.get(_data23, 'brand.name.ko', '');
      },
      bSortable: false
    }, {
      data: function data(_data24) {
        return _.get(_data24, 'brand.data.tel', '');
      },
      bSortable: false
    }, {
      data: function data(_data25) {
        return _.get(_data25, 'brand.data.bank.name', '');
      },
      bSortable: false
    }, {
      data: function data(_data26) {
        return _.get(_data26, 'brand.data.bank.accountHolder', '');
      },
      bSortable: false
    }, {
      data: function data(_data27) {
        return _.get(_data27, 'brand.data.bank.accountNumber', '');
      },
      bSortable: false
    }, {
      data: function data(_data28) {
        return _.get(_data28, 'product.id', '');
      },
      bSortable: false
    }, {
      data: function data(_data29) {
        return _.get(_data29, 'product.name.ko', '');
      },
      bSortable: false
    }, {
      data: function data(_data30) {
        return _.get(_data30, 'productVariant.data.color', '');
      },
      bSortable: false
    }, {
      data: function data(_data31) {
        return _.get(_data31, 'productVariant.data.size', '');
      },
      bSortable: false
    }, {
      data: 'quantity',
      bSortable: false
    }, {
      data: function data(_data32) {
        return (+_data32.totalKRW).format();
      },
      bSortable: false
    }, {
      data: function data(_data33) {
        return _.get(_data33, 'processedDate', '').substr(0, 10);
      },
      bSortable: false
    }, {
      data: 'buyerId',
      bSortable: false
    }]
  };

  $rootScope.initAll($scope, $state.current.name);
});
/*
orderModule.controller('OrderListBigBuyerController', ($scope, $http, $state, $rootScope, $translate, boUtils, orderCommons) => {
  $scope.contentTitle = $translate.instant('order.listBigBuyer.title');
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'order.main',
      name: $translate.instant('order.main.title'),
    },
    {
      sref: 'order.listBigBuyer',
      name: $translate.instant('order.listBigBuyer.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.orderDatatables = {
    field: 'orders',
    storeKey: 'orderBigBuyer',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    columns: [
      {
        data: 'id',
        render: (id) => {
          return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>'
        },
      },
      {
        data: 'status',
        render: (status) => $rootScope.getContentsI18nText(`enum.order.status.${status}`),
      },
      {
        data: 'createdAt',
        render: (data) => boUtils.formatDate(data),
      },
      {
        data: (data) => (+data.totalKRW).format(),
      },
      {
        data: 'paymentStatus',
        render: (status) => $rootScope.getContentsI18nText(`enum.order.paymentStatus.${status}`),
      },
      {
        data: 'settlementStatus',
        render: (status) => $rootScope.getContentsI18nText(`enum.order.settlementStatus.${status}`),
      },
      {
        data: 'buyerId',
        render: (buyerId) => {
          return '<a ui-sref="user.info({userId: ' + buyerId+ '})">' + buyerId + '</a>'
        },
      },
      {
        data: (data) => _.get(data, 'name') || '',
      },
      {
        data: (data) => _.get(data, 'data.tel') || '',
      },
      {
        data: (data) => data.email || data.userId || '',
      },
    ],
    fnCreatedRow(nRow, aData, iDataIndex) {
      if (aData.status === 100) {
      } else if (aData.status === 101) {
        $(nRow).css('background-color', 'rgb(219,219,219)')
      } else if (aData.status === 102) {
        $(nRow).css('background-color', 'rgb(255,185,185)')
      } else if (aData.status === 200) {
        $(nRow).css('background-color', 'rgb(198,190,250)')
      } else if (aData.status === 201) {
        $(nRow).css('background-color', 'rgb(208,216,232)')
      } else if (aData.status === 202) {
        $(nRow).css('background-color', 'rgb(211,147,227)')
      } else if (aData.status === 203) {
        $(nRow).css('background-color', 'rgb(179,102,255)')
      } else if (aData.status === 300) {
        $(nRow).css('background-color', 'rgb(255,185,187)')
      }
    }
  };

  orderCommons.applyFilterSearch($scope, $state, 'state.order.bigBuyer', () => 'bigBuyer');
});

orderModule.controller('OrderListPriceController', ($scope, $http, $state, $rootScope, $translate, boUtils, orderCommons) => {
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'order.main',
      name: $translate.instant('order.main.title'),
    },
    {
      sref: 'order.listPrice',
      name: $translate.instant('order.listPrice.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.roles = {
    all: { name: null, displayName: '모든 바이어' },
    buyer: { name: 'buyer', displayName: '바이어' },
    bigBuyer: { name: 'bigBuyer', displayName: '빅바이어' },
  };
  $scope.roleTypes = Object.keys($scope.roles);
  if (!_.get($rootScope.state, 'order.listPrice.roleType')) {
    // 2016. 07. 13. [heekyu] default is buyer
    _.set($rootScope.state, 'order.listPrice.roleType', 'buyer');
  }
  $scope.changeRoleType = (role) => {
    _.set($rootScope.state, 'order.listPrice.roleType', role);
    $('table').DataTable().ajax.reload();
  };

  $scope.orderDatatables = {
    field: 'orders',
    storeKey: 'orderListPrice',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>'
        },
      },
      {
        data: 'status',
        render: (status) => $rootScope.getContentsI18nText(`enum.order.status.${status}`),
      },
      {
        data: (data) => data.orderedAt || data.createdAt,
        render: (data) => boUtils.formatDate(data),
      },
      {
        data: (data) => _.get(data, 'method', ''),
        render: (method) => method !== '' ? $rootScope.getContentsI18nText(`enum.payment.method.${method}`) : '-',
      },
      {
        data: 'buyerId',
        render: (buyerId) => {
          return '<a ui-sref="user.info({userId: ' + buyerId+ '})">' + buyerId + '</a>'
        },
      },
      {
        data: (data) => _.get(data, 'name') || '',
      },
      {
        data: (data) => (+(data.finalSubtotalKRW || data.subtotalKRW || 0)).format(),
      },
      {
        data: (data) => {
          const handlingFee = +(data.finalHandlingFeeKRW || data.handlingFeeKRW || 0);
          if (!handlingFee) {
            return 0;
          }
          let tax = +(data.finalTaxKRW || data.taxKRW || 0);
          if (!tax) {
            return handlingFee.format();
          }
          return boUtils.calcTax(handlingFee).supply.format();
        },
      },
      {
        data: (data) => {
          let shippingCost = +(data.finalShippingCostKRW || data.shippingCostKRW || 0);
          if (!shippingCost) {
            return 0;
          }
          let tax = +(data.finalTaxKRW || data.taxKRW || 0);
          if (!tax) {
            return shippingCost.format();
          }
          return boUtils.calcTax(shippingCost).supply.format();
        },
      },
      {
        data: (data) => {
          let handlingFee = +(data.finalHandlingFeeKRW || data.handlingFeeKRW || 0);
          let shippingCost = +(data.finalShippingCostKRW || data.shippingCostKRW || 0);
          let tax = +(data.finalTaxKRW || data.taxKRW || 0);
          if (!tax) {
            return 0;
          }
          tax = new Decimal(tax).add(new Decimal(boUtils.calcTax(handlingFee).tax)).add(new Decimal(boUtils.calcTax(shippingCost).tax));
          return tax.toNumber().format();
        },
      },
      {
        data: (data) => (+(data.finalTotalKRW || data.totalKRW || 0)).format(),
      },
    ],
    fnCreatedRow(nRow, aData, iDataIndex) {
        console.log(aData.status);
      if (aData.status === 100) {
      } else if (aData.status === 101) {
        $(nRow).css('background-color', 'rgb(219,219,219)');
      } else if (aData.status === 102) {
        $(nRow).css('background-color', 'rgb(255,185,185)');
      } else if (aData.status === 200) {
        $(nRow).css('background-color', 'rgb(198,190,250)');
      } else if (aData.status === 201) {
        $(nRow).css('background-color', 'rgb(208,216,232)');
      } else if (aData.status === 202) {
        $(nRow).css('background-color', 'rgb(211,147,227)');
      } else if (aData.status === 203) {
        $(nRow).css('background-color', 'rgb(179,102,255)');
      } else if (aData.status === 300) {
        $(nRow).css('background-color', 'rgb(255,185,187)');
      } else if (aData.status === 301) {
        $(nRow).css('background-color', 'rgba(255, 255, 0, 0.3)');
      } else if (aData.status === 302) {
        $(nRow).css('background-color', 'rgb(255,185,187)');
      } else if (aData.status === 400) {
        $(nRow).css('background-color', 'rgba(59, 59, 78, 0.27)');
      }
    }
  };

  const getRoleType = () => $scope.roles[$rootScope.state.order.listPrice.roleType].name;
  orderCommons.applyFilterSearch($scope, $state, 'state.order.listPrice', getRoleType);
});
*/
orderModule.controller('OrderSettlementController', function ($scope, $http, $state, $rootScope, $translate, boUtils) {
  $scope.contentTitle = $translate.instant('order.settlement.title');
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }, {
    sref: 'order.settlement',
    name: $translate.instant('order.settlement.title')
  }];

  var today = moment();
  if (!_.get($rootScope.state, 'orderSettlement.activeDate')) {
    _.set($rootScope.state, 'orderSettlement.activeDate', today.format('YYYY-MM-DD'));
  }
  var isReload = false;
  $('.date-picker').datepicker({ autoclose: true });
  $('.date-picker').datepicker('setDate', $rootScope.state.orderSettlement.activeDate);
  // $('.date-picker input').val($rootScope.state.orderSettlement.activeDate);
  $('.date-picker').on('change', function (e) {
    // 2016. 06. 29. [heekyu] why event multiple times?
    var value = $('.date-picker input').val();
    if (!value || value === _.get($rootScope.state, 'orderSettlement.activeDate')) {
      $('.date-picker input').val(_.get($rootScope.state, 'orderSettlement.activeDate'));
      return;
    }
    if (!isReload) {
      isReload = true;
      _.set($rootScope.state, 'orderSettlement.activeDate', value);
      $state.reload();
    }
  });
  $scope.done = function () {
    var activeDate = _.get($rootScope.state, 'orderSettlement.activeDate');
    if (!activeDate) {
      window.alert('날짜를 선택해 주세요');
      return;
    }
    var totalPrice = 0;
    var totalCount = 0;
    var allDatas = $('table').dataTable().fnGetData();
    allDatas.forEach(function (data) {
      var price = +data.finalTotalKRW || 0;
      if (price !== 0) {
        totalPrice += price;
        totalCount++;
      }
    });
    if (totalCount === 0) {
      window.alert('더 이상 출금할 내역이 없습니다.');
      return;
    }
    if (window.confirm(totalCount + ' 개의 내역, ' + totalPrice.format() + '원 에 대한 출금 완료 처리를 하시겠습니까?')) {
      $http.put('/api/v1/orders/settlement/' + activeDate).then(function () {
        window.alert('정산(출금) 내역이 정상적으로 업데이트 되었습니다.');
        $state.reload();
      });
    }
  };

  $scope.doneByItem = function (idx) {
    var activeDate = _.get($rootScope.state, 'orderSettlement.activeDate');
    if (!activeDate) {
      window.alert('날짜를 선택해 주세요');
      return;
    }
    var data = $scope.items[idx];
    var body = { orderProductIds: data.order_product_ids };
    $http.put('/api/v1/orders/settlement/' + activeDate, body).then(function () {
      window.alert('정산(출금) 내역이 정상적으로 업데이트 되었습니다.');
      $state.reload();
    });
  };

  var downloadCsv = function downloadCsv(items) {
    var url = '/api/v1/orders/settlement/' + $rootScope.state.orderSettlement.activeDate + '/csv?access_token=' + $rootScope.state.auth.bearer;
    var body = {};
    if (items) {
      body.items = JSON.stringify(items);
    }
    boUtils.post(url, body);
  };

  $scope.downloadCsvAll = function () {
    downloadCsv();
  };

  $scope.downloadCsvSelected = function () {
    var items = [];
    var keys = Object.keys($scope.items);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var item = $scope.items[key];
      if ($('#order_product_' + key).is(':checked')) {
        items.push({
          orderId: item.orderId,
          brandId: item.brand.id
        });
      }
    }
    if (!items.length) {
      window.alert('선택한 내용이 없습니다.');
      return;
    }
    downloadCsv(items);
  };

  $scope.toggleAll = function (e) {
    e.preventDefault();
    var isChecked = $('#order_product_checkall').is(':checked');
    $('[id^=order_product_]').prop('checked', !isChecked);
  };

  function updateDatatables() {
    var activeDate = _.get($rootScope.state, 'orderSettlement.activeDate');
    $scope.items = {};
    $scope.orderDatatables = {
      field: 'orders',
      storeKey: 'orderSettlement',
      order: [1, 'desc'],
      // disableFilter: true,
      url: '/api/v1/orders/settlement/' + activeDate,
      columns: [{
        data: function data(_data34) {
          return _data34;
        },
        className: 'dt-center',
        orderable: false,
        render: function render(data) {
          $scope.items[data._index] = data;
          return '\n              <input type="checkbox" id="order_product_' + data._index + '" checked />\n              <label for="order_product_' + data._index + '"></label>\n            ';
        }
      }, {
        data: 'orderId',
        render: function render(orderId) {
          return '<a ui-sref="order.detail({orderId: ' + orderId + '})">' + orderId + '</a>';
        }
      }, {
        data: function data(_data35) {
          return _.get(_data35, 'brand.id', '');
        },
        render: function render(brandId) {
          return '<a ui-sref="brand.edit({brandId: ' + brandId + '})">' + brandId + '</a>';
        }
      }, {
        data: function data(_data36) {
          return _.get(_data36, 'brand.name.ko', '');
        }
      }, {
        data: function data(_data37) {
          return _.get(_data37, 'brand.data.tel', '');
        }
      }, {
        data: function data(_data38) {
          return _.get(_data38, 'brand.data.bank.name', '');
        }
      }, {
        data: function data(_data39) {
          return _.get(_data39, 'brand.data.bank.accountNumber', '');
        }
      }, {
        data: function data(_data40) {
          return (+_.get(_data40, 'originalPriceKRW', 0)).format();
        }
      }, {
        data: function data(_data41) {
          return (+_.get(_data41, 'settledPriceKRW', 0)).format();
        }
      }, {
        data: function data(_data42) {
          return (+_.get(_data42, 'finalTotalKRW', '0')).format();
        }
      }, {
        data: function data(_data43) {
          return _.get(_data43, 'brand.data.bank.accountHolder', '');
        }
      }, {
        data: 'buyerId',
        render: function render(buyerId) {
          return '<a ui-sref="user.info({userId: ' + buyerId + '})">' + buyerId + '</a>';
        }
      }]
    };
  }

  /*
  {
    data: (data) => data,
    orderable: false,
    render: (data) => {
      return `<button class="btn blue" data-ng-click="doneByItem(${$scope.items.length - 1})">출금완료</button>`;
    },
  },
  */
  updateDatatables();

  $rootScope.initAll($scope, $state.current.name);
});

orderModule.controller('OrderGodoController', function ($scope, $http, $state, $rootScope, $translate, boUtils) {
  $scope.contentTitle = $translate.instant('order.godo.title');
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }, {
    sref: 'order.godo',
    name: $translate.instant('order.godo.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  var today = moment();
  var maxMonths = 12;
  $scope.months = [];
  for (var i = 0; i < maxMonths; i++) {
    $scope.months.push(today.format('YYYY-MM'));
    today.subtract(1, 'months');
  }
  $scope.activeMonth = $scope.months[0];
  $scope.setMonth = function (month) {
    $scope.activeMonth = month;
    updateDatatables();
  };

  function updateDatatables() {
    var start = moment($scope.activeMonth).startOf('month').subtract(7, 'd').format('YYYY-MM-DD');
    var end = moment($scope.activeMonth).endOf('month').subtract(7, 'd').format('YYYY-MM-DD');
    $scope.orderDatatables = {
      field: 'orders',
      storeKey: 'orderGodo',
      // disableFilter: true,
      // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
      url: '/api/v1/affiliate/godo/settlement?start=' + start + '&end=' + end,
      columns: [{
        data: 'id',
        render: function render(id) {
          return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>';
        }
      }, {
        data: function data(_data44) {
          return _.get(_data44, 'processedDate', '').substring(0, 10);
        }
      }, {
        data: function data(_data45) {
          return _.get(_data45, 'finalTotalKRW', '');
        }
      }, {
        data: function data(_data46) {
          return _.get(_data46, 'finalHandlingFeeKRW', '');
        }
      }, {
        data: function data(_data47) {
          return _.get(_data47, 'commissionKRW', '');
        }
      }]
    };
  }

  updateDatatables();
});

orderModule.controller('OrderVatController', function ($scope, $http, $state, $rootScope, $translate, boUtils) {
  $scope.contentTitle = $translate.instant('order.vat.title');
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }, {
    name: $translate.instant('order.vat.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  $scope.month = $state.params.month || '';
  $scope.orderDatatables = {
    field: 'list',
    storeKey: 'orderVat',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders/vat/' + $scope.month,
    columns: [{
      data: function data(_data48) {
        return _.get(_data48, 'brand.id', '');
      },
      render: function render(id) {
        return '<a ui-sref="order.brandVat({brandId:' + id + ',month:\'' + $scope.month + '\'})">' + id + '</a>';
      }
    }, {
      data: function data(_data49) {
        return _data49;
      },
      orderable: false,
      render: function render(data) {
        var brandId = _.get(data, 'brand.id', '');
        if (!brandId) return '';
        return '<a ui-sref="brand.edit({ brandId: ' + _.get(data, 'brand.id', '') + '})">' + _.get(data, 'brand.name.ko', '') + '</a>';
      }
    }, {
      data: function data(_data50) {
        return _.sum([_data50.subTotalKRW, _data50.adjustmentKRW]);
      },
      orderable: false
    }, {
      data: function data(_data51) {
        return +_.get(_data51, 'vatKRW', 0);
      },
      orderable: false
    }, {
      data: function data(_data52) {
        return _.sum([_data52.subTotalKRW, _data52.adjustmentKRW, _data52.vatKRW]);
      },
      orderable: false
    }, {
      data: function data(_data53) {
        return _.get(_data53, 'brand.data.bank.name') || '';
      },
      orderable: false
    }, {
      data: function data(_data54) {
        return _.get(_data54, 'brand.data.bank.accountNumber') || '';
      },
      orderable: false
    }, {
      data: function data(_data55) {
        return _.get(_data55, 'brand.data.bank.accountHolder') || '';
      },
      orderable: false
    }, {
      data: function data(_data56) {
        return boUtils.getBuildingName(_data56.brand);
      },
      orderable: false
    }, {
      data: function data(_data57) {
        return _.get(_data57, 'brand.data.tel', '');
      },
      orderable: false
    }]
  };

  $scope['export'] = function () {
    var CLIENT_ID = '352586701861-20pb7c3qlp7klemfap5qfms0hl0eshrv.apps.googleusercontent.com';

    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

    function checkAuth() {
      gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, handleAuthResult);
    }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        loadSheetsApi();
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
      }
    }

    function loadSheetsApi() {
      var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
      gapi.client.load(discoveryUrl).then(run);
    }

    function run() {
      var mergeCells = function mergeCells(sheetId) {
        return {
          range: {
            sheetId: sheetId,
            startRowIndex: 5,
            endRowIndex: 21,
            startColumnIndex: 4,
            endColumnIndex: 8
          }
        };
      };
      $http.get('/api/v1/orders/vat/brands/' + $scope.month).then(function (res) {
        var list = res.data.list;

        gapi.client.sheets.spreadsheets.create({
          properties: { title: 'VAT-' + $scope.month },
          sheets: list.map(function (o) {
            return {
              properties: { title: o.brand.name.ko },
              data: [{
                startRow: 2,
                startColumn: 1,
                rowData: [{
                  values: [{ userEnteredValue: { stringValue: '건물' } }, { userEnteredValue: { stringValue: '거래처명' } }, { userEnteredValue: { stringValue: '층' } }, { userEnteredValue: { stringValue: '라인' } }, { userEnteredValue: { stringValue: '호' } }, { userEnteredValue: { stringValue: '전화번호' } }]
                }, {
                  values: [{ userEnteredValue: { stringValue: _.get(o.brand, 'data.location.building.name.ko') } }, { userEnteredValue: { stringValue: _.get(o.brand, 'name.ko') } }, { userEnteredValue: { stringValue: _.get(o.brand, 'data.location.floor') } }, { userEnteredValue: { stringValue: '라인' } }, { userEnteredValue: { stringValue: _.get(o.brand, 'data.location.flatNumber') } }, { userEnteredValue: { stringValue: _.get(o.brand, 'data.tel') } }]
                }, {
                  // blank line
                }, {
                  values: [{ userEnteredValue: { stringValue: '날짜' } }, { userEnteredValue: { stringValue: '거래금액' } }, {}, { userEnteredValue: { formulaValue: '=IMAGE("https://s3.ap-northeast-2.amazonaws.com/linkshops/bo/images/bz.jpg")' } }]
                }].concat(_toConsumableArray(o.list.map(function (l) {
                  return {
                    values: [{ userEnteredValue: { stringValue: l.processedDate.substring(0, 10) } }, { userEnteredValue: { numberValue: l.vatKRW } }]
                  };
                })), [{
                  values: [{ userEnteredValue: { stringValue: '합계' } }, { userEnteredValue: { formulaValue: '=SUM(C7:C' + (7 + o.list.length - 1) + ')' } }]
                }])
              }]
            };
          })
        }).then(function (_ref7) {
          var _ref7$result = _ref7.result;
          var spreadsheetId = _ref7$result.spreadsheetId;
          var sheets = _ref7$result.sheets;
          return gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            requests: sheets.map(function (s) {
              return {
                mergeCells: mergeCells(s.properties.sheetId)
              };
            })
          });
        }).then(function (_ref8) {
          var spreadsheetId = _ref8.result.spreadsheetId;

          window.open('https://docs.google.com/spreadsheets/d/' + spreadsheetId);
        }).then(undefined, function (response) {
          console.log('Error: ' + response.result.error.message);
        });
      });
    }

    gapi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: false }, handleAuthResult);
  };
});

orderModule.controller('OrderBrandVatController', function ($scope, $http, $state, $rootScope, $translate, boUtils, brand) {
  var _$state$params = $state.params;
  var month = _$state$params.month;
  var brandId = _$state$params.brandId;

  $scope.contentTitle = $translate.instant('order.vat.title');
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'order.main',
    name: $translate.instant('order.main.title')
  }, {
    sref: 'order.vat({month:"' + month + '"})',
    name: $translate.instant('order.vat.title')
  }, {
    name: $translate.instant('order.brandVat.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  function orderSubTotal(order) {
    var total = new Decimal(0);
    _.forEach(order.orderProducts, function (o) {
      return total = total.add(new Decimal(o.finalTotalKRW));
    });
    return total;
  }
  function orderSettledTotal(order) {
    var total = new Decimal(0);
    _.forEach(order.orderProducts, function (o) {
      return total = total.add(new Decimal(o.settledKRW || 0));
    });
    return total;
  }

  $scope.orderDatatables = {
    field: 'list',
    storeKey: 'orderBrandVat',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders/vat/brands/' + brandId + '/' + month,
    columns: [{
      data: function data(_data58) {
        return moment(_data58.orderedAt).format('YYYY-MM-DD');
      }
    }, {
      render: function render() {
        return '<a ui-sref="brand.edit({brandId: ' + brandId + '})">' + brandId + '</a>';
      }
    }, {
      data: function data() {
        return _.get(brand, 'name.ko', '');
      }
    }, {
      data: function data(_data59) {
        return _.get(_data59, 'buyerName', '');
      }
    }, {
      data: function data(_data60) {
        return orderSubTotal(_data60);
      }
    }, {
      data: function data(_data61) {
        return '0';
      }
    }, {
      data: function data(_data62) {
        return orderSubTotal(_data62);
      }
    }, {
      data: function data(_data63) {
        return orderSubTotal(_data63).mul(0.1);
      }
    }, {
      data: function data(_data64) {
        return orderSubTotal(_data64).mul(1.1);
      }
    }, {
      data: function data(_data65) {
        return '';
      }
    }, {
      data: function data(_data66) {
        return orderSettledTotal(_data66);
      }
    }, {
      data: function data(_data67) {
        return orderSubTotal(_data67).mul(1.1).sub(orderSettledTotal(_data67));
      }
    }, {
      data: function data(_data68) {
        return '';
      }
    }, {
      data: function data(_data69) {
        return _.get(_data69, 'id', '');
      },
      render: function render(id) {
        return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>';
      }
    }]
  };
});
}, {"./module":11}],
12: [function(require, module, exports) {
'use strict';

var productModule = angular.module('backoffice.product', ['ui.router', 'ui.bootstrap', require('../third_party/angular-translate')]);

productModule.config(function ($translateProvider) {
  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

productModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('product', {
    abstract: true,
    url: '/product',
    template: '<ui-view/>'
  }).state('product.main', {
    url: '/main?start,end',
    templateUrl: templateRoot + '/product/main.html',
    controller: 'ProductMainController'
  }).state('product.add', {
    url: '/add?brandId',
    templateUrl: templateRoot + '/product/edit.html',
    controller: 'ProductEditController',
    resolve: {
      product: function product() {
        return null;
      },
      categories: function categories($http) {
        return $http.get('/api/v1/categories').then(function (res) {
          return res.data;
        });
      }
    }
  }).state('product.edit', {
    url: '/edit/:productId',
    templateUrl: templateRoot + '/product/edit.html',
    controller: 'ProductEditController',
    resolve: {
      product: function product($http, $stateParams, productUtil) {
        return $http.get('/api/v1/products/' + $stateParams.productId).then(function (res) {
          var product = productUtil.narrowProduct(res.data);
          product.productVariants = res.data.productVariants.map(function (variant) {
            return productUtil.narrowProductVariant(variant);
          });
          return product;
        });
      },
      categories: function categories($http) {
        return $http.get('/api/v1/categories').then(function (res) {
          return res.data;
        });
      }
    }
  }).state('product.category', {
    url: '/category',
    templateUrl: templateRoot + '/product/category.html',
    controller: 'CategoryEditController',
    resolve: {
      categories: function categories($http) {
        return $http.get('/api/v1/categories').then(function (res) {
          return res.data;
        });
      }
    }
  }).state('product.category.child', {
    url: '/:categoryId'
  }).state('product.batchUpload', {
    url: '/batch-upload',
    templateUrl: templateRoot + '/product/batch-upload.html',
    controller: 'ProductBatchUploadController'
  }).state('product.imageUpload', {
    url: '/image-upload',
    templateUrl: templateRoot + '/product/image-upload.html',
    controller: 'ProductImageUploadController'
  }).state('product.smarket', {
    url: '/smarket',
    templateUrl: templateRoot + '/product/smarket.html',
    controller: 'SMarketController'
  });
});

module.exports = productModule;

productModule.factory('productUtil', function ($http, $q) {
  return {
    createProduct: function createProduct(product, productVariants) {
      var url = '/api/v1/products';

      return $http.post(url, product).then(function (res) {
        if (!product.id) {
          product.id = res.data.id; // need if create
          // $state.go('product.edit', {productId: $scope.product.id});
        }
        var pvUrl = '/api/v1/products/' + product.id + '/product_variants';
        var promise = $q.when();
        var result = { product: res.data, productVariants: [] };
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          var _loop = function () {
            var productVariant = _step.value;

            promise = promise.then(function () {
              return $http.post(pvUrl, productVariant).then(function (res2) {
                result.productVariants.push(res2.data);
              });
            });
          };

          for (var _iterator = productVariants[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return promise.then(function () {
          return result;
        }, function (err) {
          window.alert(_.get(err, 'data.message', 'error'));
          throw err;
        });
      }, function (err) {
        window.alert(_.get(err, 'data.message', 'error'));
        throw err;
      });
    },
    updateProduct: function updateProduct(product, productVariants, oldProductVariants) {
      var url = '/api/v1/products/' + product.id;

      return $http.put(url, _.omit(product, ['id', 'productVariants'])).then(function (res) {
        var promise = $q.when();
        var result = { product: res.data, productVariants: [] };
        var pvUrl = '/api/v1/products/' + product.id + '/product_variants';
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          var _loop2 = function () {
            var productVariant = _step2.value;

            oldProductVariants['delete'](productVariant.id);
            if (!productVariant.id) {
              promise = promise.then(function () {
                return $http.post(pvUrl, productVariant).then(function (res2) {
                  result.productVariants.push(res2.data);
                });
              });
            } else {
              promise = promise.then(function () {
                return $http.put(pvUrl + '/' + productVariant.id, _.omit(productVariant, 'id')).then(function (res2) {
                  result.productVariants.push(res2.data);
                });
              });
            }
          };

          for (var _iterator2 = productVariants[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            _loop2();
          }
          // 2016. 01. 18. [heekyu] delete removed variants
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        if (oldProductVariants.size > 0) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            var _loop3 = function () {
              var deletedVariant = _step3.value;

              promise = promise.then(function () {
                return $http({ method: 'DELETE', url: pvUrl + '/' + deletedVariant });
              });
            };

            for (var _iterator3 = oldProductVariants.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              _loop3();
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                _iterator3['return']();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }

        return promise.then(function () {
          return result;
        }, function (err) {
          window.alert(err.data);
          throw err;
        });
      }, function (err) {
        window.alert(err.data);
        throw err;
      });
    },
    setObjectValue: function setObjectValue(obj, key, value, convert) {
      if (convert) {
        value = convert(value);
      }
      var paths = key.split('.');
      var curObj = obj;
      paths.forEach(function (path, index) {
        if (index === paths.length - 1) {
          curObj[path] = value;
        } else {
          if (!curObj[path]) {
            curObj[path] = {};
          }
          curObj = curObj[path];
        }
      });
    },
    narrowProduct: function narrowProduct(product) {
      return _.pick(product, ['id', 'sku', 'KRW', 'categories', 'isActive', 'brand', 'data', 'contents', 'appImages', 'name']);
    },
    narrowProductVariant: function narrowProductVariant(variant) {
      return _.pick(variant, ['id', 'productId', 'sku', 'stock', 'KRW', 'data', 'appImages', 'status']);
    }
  };
});

// BEGIN module require js
require('./controllers/ProductMainController');
require('./controllers/ProductEditController');
require('./controllers/CategoryEditController');
require('./controllers/ProductBatchUploadController');
require('./controllers/ProductImageUploadController');
require('./controllers/SMarketController');
// END module require js
}, {"../third_party/angular-translate":14,"./i18n/translations.en.json":40,"./i18n/translations.ko.json":41,"./controllers/ProductMainController":42,"./controllers/ProductEditController":43,"./controllers/CategoryEditController":44,"./controllers/ProductBatchUploadController":45,"./controllers/ProductImageUploadController":46,"./controllers/SMarketController":47}],
40: [function(require, module, exports) {
module.exports = {
  "product": {
    "main": {
      "title": "상품"
    },
    "edit": {

    }
  }
};
}, {}],
41: [function(require, module, exports) {
module.exports = {
  "product": {
    "saveAndNewButton": "저장하고 새 상품 만들기",
    "main": {
      "title": "상품",
      "skuColumn": "품번",
      "nameColumn": "이름",
      "brandColumn": "브랜드"
    },
    "list": {
      "columnName": "상품명"
    },
    "edit": {
      "createTitle": "상품 생성",
      "updateTitle": "상품 변경",
      "tabInfo": "상품 정보",
      "tabImage": "이미지",
      "tabCategory": "카테고리",
      "tabRecommendProduct": "추천상품",
      "tabDesktopEditor": "데스크탑 정보 입력",
      "tabMobileEditor": "모바일 정보 입력",
      "labelName": {
        "KO": "상품명(한국어)",
        "EN": "상품명(영어)",
        "ZH_CN": "상품명(중국어)",
        "ZH_TW": "상품명(대만어)"
      },
      "labelPrice": {
        "KRW": "가격(원)"
      },
      "labelActive": "활성화",
      "labelCombination": "상품 속성",
      "labelVariant": "상품 규격",
      "labelFavoriteCategories": "자주쓰는 카테고리",
      "addVariantKind": "종류 추가",
      "removeVariantKind": "종류 삭제"
    },
    "category": {
      "title": "상품 카테고리",
      "rootName": "전체",
      "nameNewCategory": "새 카테고리",
      "labelNewCategory": "카테고리 생성",
      "labelDeleteCategory": "삭제",
      "reindexButton": "검색 업데이트"
    },
    "batchUpload": {
      "title": "상품 일괄 등록",
      "upload": "업로드"
    },
    "imageUpload": {
      "title": "이미지 일괄 등록"
    }
  }
}
;
}, {}],
42: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

productModule.controller('ProductMainController', function ($scope, $http, $state, $rootScope, $translate, $compile, boUtils) {
  $scope.contentTitle = $translate.instant('product.main.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'product.main',
    name: $translate.instant('product.main.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  var cookieKey = 'state.product.main';
  boUtils.initDateBetween($('#product_createdAt_start'), $('#product_createdAt_end'), $state, cookieKey);

  $scope.startDate = _.get($rootScope, cookieKey + '.startDate') || '';
  $scope.endDate = _.get($rootScope, cookieKey + '.endDate') || '';
  if ($scope.startDate && $scope.endDate && new Date($scope.startDate).getTime() > new Date($scope.endDate).getTime()) {
    window.alert('시작 날짜가 종료 날짜와 같거나 더 작아야 합니다');
  }

  $scope.productIdMap = {};

  $scope.productDatatables = {
    field: 'products',
    storeKey: 'products', // 2016. 05. 24. [heekyu] Case 262
    // disableFilter: true,
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="product.edit({productId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: function data(product) {
        return product.sku || '';
      }
    }, {
      data: function data(product) {
        return _.get(product, 'name.ko') || '';
      },
      orderable: false
    }, {
      data: function data(product) {
        return boUtils.formatDate(product.createdAt);
      },
      orderable: false
    }, {
      data: function data(product) {
        return product;
      },
      orderable: false,
      render: function render(product) {
        $scope.productIdMap[product.id] = product;
        return '\n            <input type="checkbox" id="product_main_isActive_' + product.id + '"\n              data-ng-checked="' + product.isActive + '"\n              data-ng-click="toggleIsActive(productIdMap[' + product.id + '])"\n            />\n            <label for="product_main_isActive_' + product.id + '"></label>\n          ';
      }
    }, {
      data: function data(product) {
        return product;
      },
      orderable: false,
      render: function render(product) {
        $scope.productIdMap[product.id] = product;
        return '\n            <input type="checkbox" id="product_main_bigDisplay_' + product.id + '"\n              data-ng-checked="' + product.data.bigDisplay + '"\n              data-ng-click="toggleBigDisplay(productIdMap[' + product.id + '])"\n            />\n            <label for="product_main_bigDisplay_' + product.id + '"></label>\n          ';
      }
    }, {
      data: 'id',
      orderable: false,
      render: function render(id) {
        return '<button data-ng-click="deleteProduct(' + id + ')" class="btn red"><i class="fa fa-remove"></i> ' + $translate.instant('main.deleteButton') + '</button>';
      }
    }]
  };
  $scope.toggleIsActive = function (product) {
    $http.put('/api/v1/products/' + product.id, { isActive: !product.isActive }).then(function () {
      product.isActive = !product.isActive;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      $http.put('/api/v1/products/' + product.id + '/index');
    }, function () {
      window.alert('failed to update isActive');
    });
  };
  $scope.toggleBigDisplay = function (product) {
    if (product.data.bigDisplay === undefined || !product.data.bigDisplay) {
      product.data.bigDisplay = true;
    } else {
      product.data.bigDisplay = false;
    }
    $http.put('/api/v1/products/' + product.id, { data: product.data }).then(function () {
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      $http.put('/api/v1/products/' + product.id + '/index');
    }, function () {
      window.alert('failed to update bigDisplay');
    });
  };
  $scope.datatablesLoaded = function () {
    $compile(angular.element($('table')))($scope);
  };
  $scope.fileContents = 'before';

  $scope.deleteProduct = function (productId) {
    if (window.confirm('Really delete product (' + productId + ')?')) {
      $http['delete']('/api/v1/products/' + productId).then(function () {
        $http.put('/api/v1/products/' + productId + '/index').then(function () {
          setTimeout(function () {
            $state.reload();
          }, 1000); // wait 1 sec for elasticsearch update
        });
      })['catch'](function (err) {
        window.alert(err);
      });
    }
  };

  $scope.fnUrlParams = function (urlParams) {
    if (!$scope.startDate || !$scope.endDate) {
      return;
    }
    var start = new Date($scope.startDate);
    var end = new Date($scope.endDate);
    var diff = end.getTime() - start.getTime();
    if (diff >= 0) {
      urlParams.start = $scope.startDate;
      urlParams.end = $scope.endDate;
    }
  };
});
}, {"../module.js":12}],
43: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

productModule.controller('ProductEditController', function ($scope, $http, $state, $rootScope, $translate, product, categories, productUtil, boUtils) {
  $scope.allColors = {
    BLUE: ['RBL', 'BLU', 'VBL', 'NVY', 'MNT', 'CBL', 'DNV', 'CBT', 'LBL', 'DBR', 'DBL', 'TBL', 'PUR', 'MBL', 'PBL', 'NNW', 'PPL'],
    GREEN: ['GRN', 'AGN', 'KHA', 'BGN', 'DGN', 'LIM', 'LMT', 'LKH'],
    RED: ['RED', 'PNK', 'WNE', 'LOG', 'ORG', 'POR', 'BGD', 'DRD', 'LRD', 'BNR', 'HPK', 'COR', 'RNW', 'ORD'],
    GRAY: ['GRY', 'LGR', 'CGR', 'MGR', 'CMG', 'DGR'],
    WHITE: ['WHT', 'OWH', 'IVY', 'BEG', 'LBI', 'LBE', 'OWT'],
    OTHERS: ['BLK', 'SLV', 'CMF', 'PBK', 'PWH', 'PTN', 'SLM', 'NYE', 'YEL', 'AWT', 'ABL', 'BWR', 'WNB', 'BRW', 'BNW', 'BNG', 'BNS', 'SDB']
  };
  $scope.colorKeys = Object.keys($scope.allColors);
  var getFeetSizes = function getFeetSizes(start, step, end) {
    var current = start;
    var res = [];
    while (current <= end) {
      res.push(current.toString());
      current += step;
    }
    return res;
  };
  $scope.allSizes = {
    'M-Top': ['090 (S)', '095 (M)', '100 (L)', '105 (XL)', '110 (XXL)'],
    'M-PANTS': ['085 (M)', '090 (L)', '095 (XL)', '100 (XXL)'],
    'M-PTHP': ['029', '031', '033', '035'],
    'W-Top': ['080 (XS)', '085 (S)', '090 (M)', '095 (L)'],
    'W-PANTS': ['060 (XS)', '065 (S)', '070 (M)', '075 (L)', '080(XL)'],
    'W-PTHP': ['024', '026', '027', '028'],
    '신발': getFeetSizes(220, 5, 300),
    'KIDS': ['상의(110)', '상의(120)', '상의(130)', '상의(140)', '상의(150)', '하의(110)', '하의(120)', '하의(130)', '하의(140)', '하의(150)'],
    '액세서리': ['L', 'M', 'Free'],
    '장갑': ['S', 'M', 'L']
  };
  $scope.variantKinds = [{ name: '색상', key: 'color', groups: Object.keys($scope.allColors), groupMap: $scope.allColors }, { name: '크기', key: 'size', groups: Object.keys($scope.allSizes), groupMap: $scope.allSizes }];
  $scope.favoriteCategories = [
    /*
    { name: '여성', categories: [{ name: '티셔츠', id: 53 }, { name: '원피스', id: 109 }, { name: '니트웨어', id: 77 }, { name: '스커트', id: 47 }, { name: '코트', id: 58 }] },
    { name: '남성', categories: [{ name: '티셔츠', id: 184 }, { name: '셔츠', id: 185 }, { name: '바지', id: 187 }, { name: '자켓', id: 196 }, { name: '점퍼', id: 197 }] },
    */
  ];
  var kindsFromProductVariants = function kindsFromProductVariants(productVariants) {
    $scope.variantKinds.forEach(function (kind) {
      return kind.selected = new Set();
    });
    productVariants.forEach(function (variant) {
      /*
      if (!variant.sku) {
        return;
      }
      const split = variant.sku.split('-');
      if (split.length < 2) {
        return;
      }
      */
      var split = variant.sku ? variant.sku.split('-').slice(-2) : [];
      for (var i = 0; i < $scope.variantKinds.length; i++) {
        var kind = $scope.variantKinds[i];
        var value = _.get(variant, 'data.' + kind.key);
        if (value) {
          kind.selected.add(value.toString());
        } else if (split.length == 2) {
          kind.selected.add(split[1]);
        }
      }
    });
    $scope.variantKinds.forEach(function (kind) {
      return kind.kinds = Array.from(kind.selected);
    });
  };
  var initFromProduct = function initFromProduct() {
    var titleKey = 'product.edit.createTitle';
    var currencies = ['KRW', 'USD', 'CNY'];
    if (!product) {
      $scope.product = { sku: 'autogen', KRW: 0, data: {} };
      $scope.variantKinds[0].kinds = [];
      $scope.variantKinds[1].kinds = ['Free'];
      $scope.variantKinds.forEach(function (kind) {
        return kind.selected = new Set(kind.kinds);
      });
    } else {
      $scope.product = product;
      currencies.forEach(function (currency) {
        return $scope.product[currency] = Number($scope.product[currency]);
      });
      ($scope.product.productVariants || []).forEach(function (variant) {
        currencies.forEach(function (currency) {
          return variant[currency] = Number(variant[currency]);
        });
      });
      kindsFromProductVariants($scope.product.productVariants || []);
      titleKey = 'product.edit.updateTitle';
    }

    var initAutoComplete = function initAutoComplete() {
      var autoCompleteNode = $('#brand_search_input');
      boUtils.autoComplete(autoCompleteNode, 'product-brand-search', $scope.allBrands, boUtils.getNameWithAllBuildingInfo);
      autoCompleteNode.on('typeahead:selected', function (obj, datum) {
        $scope.product.brand = datum;
      });
      if ($scope.product.brand) {
        autoCompleteNode.val(boUtils.getNameWithAllBuildingInfo($scope.product.brand));
      }
    };
    $scope.fieldIdPrefix = 'ProductField';
    $http.get('/api/v1/brands').then(function (res) {
      $scope.allBrands = res.data.brands || [];
      if ($state.params.brandId) {
        for (var i = 0; i < $scope.allBrands.length; i++) {
          var brand = $scope.allBrands[i];
          if (+brand.id === +$state.params.brandId) {
            $scope.product.brand = brand;
            $('#ProductFieldname').focus();
            break;
          }
        }
      }
      initAutoComplete();
    });
    $scope.handleBrandKeyPress = function (e) {
      if (e.which === 13) {
        // Enter key
        e.preventDefault();
        // http://stackoverflow.com/questions/26785109/select-first-suggestion-from-typeahead-js-when-hit-enter-key-in-the-field#answer-26785802
        $(".tt-suggestion:first-child", undefined).trigger('click');
      }
    };

    $scope.tmpObj = {};
    $scope.productVariantsMap = {};
    $scope.origVariants = new Set();
    if ($scope.product.productVariants) {
      $scope.productVariants = $scope.product.productVariants;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = $scope.productVariants[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var productVariant = _step.value;

          $scope.productVariantsMap[productVariant.sku] = productVariant;
          $scope.origVariants.add(productVariant.id);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      $scope.productVariants = [];
    }
    // 2016. 01. 21. [heekyu] products' categories
    $scope.productCategorySet = new Set();
    if (!$scope.product.categories) {
      $scope.product.categories = [];
    }
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = $scope.product.categories[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var productCategory = _step2.value;

        if ($scope.productCategorySet.has(productCategory)) {
          window.alert('[DATA ERROR] (' + productCategory + ') is contained multiple');
          continue;
        }
        $scope.productCategorySet.add(productCategory);
      }
      // 2016. 01. 21. [heekyu] products' categories
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return { titleKey: titleKey };
  };

  var initObj = initFromProduct();
  $scope.allCategories = categories;
  $scope.categoryIdMap = {};
  var dfs = function dfs(category) {
    if ($scope.categoryIdMap[category.id]) {
      window.alert('category tree detect a circle');
      return;
    }
    $scope.categoryIdMap[category.id] = category;
    (category.children || []).forEach(dfs);
  };
  dfs(categories);

  $scope.contentTitle = $translate.instant(initObj.titleKey);
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'product.main',
    name: $translate.instant('product.main.title')
  }, {
    sref: 'product.edit',
    name: $translate.instant(initObj.titleKey)
  }];
  $rootScope.initAll($scope, $state.current.name);
  $scope.inputFields = [{ title: '품번', key: 'sku', tmpKey: 'sku', placeholder: 'ABCDEFGHIJK', isRequired: true }, { title: '상품명', key: 'name.ko', tmpKey: 'name', isRequired: true }, { title: '상품설명', key: 'data.description', tmpKey: 'description', isRequired: true }, { title: '짧은설명', key: 'data.shortDescription', tmpKey: 'shortDescription', isRequired: true }];
  $scope.moreFields = [
    /*
    { title: '구분', enums: ['상의', '원피스', '바지', '치마', '기타'], key: 'data.detail.kind', tmpKey: 'detailKind' },
    { title: '사이즈1', type: 'number', key: 'data.detail.size1', tmpKey: 'detailSize1' },
    { title: '사이즈2', type: 'number', key: 'data.detail.size2', tmpKey: 'detailSize2' },
    { title: '사이즈3', type: 'number', key: 'data.detail.size3', tmpKey: 'detailSize3' },
    { title: '사이즈4', type: 'number', key: 'data.detail.size4', tmpKey: 'detailSize4' },
    { title: '사이즈5', type: 'number', key: 'data.detail.size5', tmpKey: 'detailSize5' },
    { title: '사이즈6', type: 'number', key: 'data.detail.size6', tmpKey: 'detailSize6' },
    { title: '촬영모델', enums: ['이은지', '임소리', '유영석'], key: 'data.detail.modelName', tmpKey: 'detailModelName' },
    { title: '모델착용사이즈', key: 'data.detail.modelSize', tmpKey: 'detailModelSize' },
    { title: '원산지', enums: ['없음', '한국', '중국'], key: 'data.detail.origin', tmpKey: 'detailOrigin' },
    { title: '촉감', enums: ['까슬함', '적당함', '부드러움'], key: 'data.detail.touch', tmpKey: 'detailTouch' },
    { title: '신축성', enums: ['좋음', '약간', '없음'], key: 'data.detail.flexibility', tmpKey: 'detailFlexibility' },
    { title: '비침', enums: ['많이비침', '약간비침', '비침없음'], key: 'data.detail.transparency', tmpKey: 'detailTransparency' },
    { title: '광택감', enums: ['광택있음', '약간있음', '광택없음'], key: 'data.detail.gloss', tmpKey: 'detailGloss' },
    { title: '두께감', enums: ['두꺼움', '적당함', '얇음'], key: 'data.detail.thickness', tmpKey: 'detailThickness' },
    { title: '안감', enums: ['전체안감', '부분안감', '안감없음'], key: 'data.detail.lining', tmpKey: 'detailLining' },
    */
  ];

  $scope.onEnumClick = function (event, tmpKey, val) {
    var current = _.get($scope.tmpObj, tmpKey);
    if (current === val) {
      _.set($scope.tmpObj, tmpKey, '');
      $(event.target).blur();
    } else {
      _.set($scope.tmpObj, tmpKey, val);
    }
  };

  var allFields = $scope.inputFields.concat($scope.moreFields);
  $scope.tmpObjToProduct = function () {
    for (var i = 0; i < allFields.length; i++) {
      var field = allFields[i];
      _.set($scope.product, field.key, $scope.tmpObj[field.tmpKey]);
    }
  };
  $scope.productToTmpObj = function () {
    for (var i = 0; i < allFields.length; i++) {
      var field = allFields[i];
      $scope.tmpObj[field.tmpKey] = _.get($scope.product, field.key);
    }
  };
  if ($scope.product.id) {
    $scope.productToTmpObj();
  }
  if (!$scope.tmpObj.detailModelSize) {
    $scope.tmpObj.detailModelSize = 'Free';
  }

  $scope.productPriceChanged = function (oldKRW, newKRW) {
    $scope.productVariants.forEach(function (variant) {
      if (!variant.KRW || Number(variant.KRW) === Number(oldKRW)) {
        variant.KRW = newKRW;
      }
    });
  };

  // 2016. 03. 01. [heekyu] change method for handling variant attributes
  // BEGIN Manipluate Variant attributes
  $scope.clickGroupButton = function (index, group) {
    if ($scope.variantKinds[index].currentGroup === group) {
      $scope.variantKinds[index].currentGroup = null;
      return;
    }
    $scope.variantKinds[index].currentGroup = group;
  };
  $scope.clickVariantAttribute = function (event, index, attr) {
    var variantKind = $scope.variantKinds[index];
    var selected = variantKind.selected;
    if (selected.has(attr)) {
      for (var i = 0; i < variantKind.kinds.length; i++) {
        if (variantKind.kinds[i] === attr) {
          $scope.removeVariantKindItem(index, i);
          return;
        }
      }
    } else {
      selected.add(attr);
      variantKind.kinds = Array.from(selected);

      $scope.generateProductVariants();
      $scope.initImages();
    }
  };
  $scope.removeVariantKindItem = function (kindIndex, itemIndex) {
    var variantKind = $scope.variantKinds[kindIndex];
    var removed = variantKind.kinds.splice(itemIndex, 1);
    variantKind.selected['delete'](removed[0]);
    variantKind.kinds = Array.from(variantKind.selected);
    var newVariants = [];
    ($scope.productVariants || []).forEach(function (variant) {
      if (variant.data[variantKind.key] !== removed[0]) {
        newVariants.push(variant);
      } else {
        delete $scope.productVariantsMap[variant.sku];
      }
    });
    $scope.productVariants = newVariants;
    $scope.initImages();
  };
  // END Manipluate Variant attributes

  var defaultQuantity = 20;

  // BEGIN Manipulate Variants
  $scope.generateProductVariants = function () {
    $scope.tmpObjToProduct();
    var newVariantSKUs = [];
    var idx = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = $scope.variantKinds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var variantKind = _step3.value;

        if (variantKind.kinds.length < 1) {
          // 2016. 04. 05. [heekyu] there is no combinations
          return;
        }
        if (newVariantSKUs.length < 1) {
          newVariantSKUs.push($scope.product.sku);
        }
        var start = idx;
        idx = newVariantSKUs.length;
        for (var i = start; i < idx; i++) {
          var newVariantSKU = newVariantSKUs[i];
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = variantKind.kinds[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var kind = _step4.value;

              newVariantSKUs.push(newVariantSKU + '-' + kind);
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                _iterator4['return']();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
          _iterator3['return']();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var newVariants = [];
    var newVariantsMap = {};
    for (var i = idx; i < newVariantSKUs.length; i++) {
      var newVariantSKU = newVariantSKUs[i];
      var alreadyIn = $scope.productVariantsMap[newVariantSKU];
      if (alreadyIn) {
        delete $scope.productVariantsMap[newVariantSKU];
        newVariants.push(alreadyIn);
        newVariantsMap[newVariantSKU] = alreadyIn;
      } else {
        var newVariant = { sku: newVariantSKU, KRW: $scope.product.KRW, stock: defaultQuantity, data: {} };
        var split = newVariantSKU.split('-');
        var kindPos = split.length - 1;
        for (var _i = $scope.variantKinds.length - 1; _i >= 0; _i--) {
          newVariant.data[$scope.variantKinds[_i].key] = split[kindPos--];
        }
        newVariants.push(newVariant);
        newVariantsMap[newVariantSKU] = newVariant;
      }
    }
    for (var key in $scope.productVariantsMap) {
      if ($scope.productVariantsMap.hasOwnProperty(key)) {
        newVariants.push($scope.productVariantsMap[key]);
        newVariantsMap[key] = $scope.productVariantsMap[key];
      }
    }
    $scope.productVariants = newVariants;
    $scope.productVariantsMap = newVariantsMap;
  };
  // END Manipulate Variants

  $scope.generateProductVariants();

  var afterSaveProduct = function afterSaveProduct(product) {
    return $http.put('/api/v1/products/' + product.id + '/index').then(function (res) {
      // ignore
    });
  };

  $scope.saveAndContinue = function () {
    var isNewProduct = !$scope.product.id;
    $scope.doSave().then(function (product) {
      afterSaveProduct(product);
      if (isNewProduct) {
        $state.go('product.edit', { productId: product.id });
      } else {
        // 2016. 02. 29. [heekyu] update product variant id for deny multiple create
        $state.reload();
      }
    });
  };

  $scope.doSave = function () {
    // 2016. 01. 18. [heekyu] save images
    /*
    if (!_.get($scope.product, 'brand.id')) {
      window.alert('select brand!');
      return new Promise((resolve, reject) => {});
    }
    */
    boUtils.startProgressBar();

    $scope.tmpObjToProduct();
    // $scope.imageToProduct();
    $scope.imageRowsToVariant();

    $scope.saveEditorContents();
    $scope.updateCategoryPath();
    if (!$scope.product.id) {
      return productUtil.createProduct($scope.product, $scope.productVariants).then(function (res) {
        boUtils.stopProgressBar();
        return res.product;
      }, function (err) {
        boUtils.stopProgressBar();
        throw err;
      });
    } else {
      return productUtil.updateProduct($scope.product, $scope.productVariants, $scope.origVariants).then(function (res) {
        boUtils.stopProgressBar();
        $scope.origVariants.clear();
        return res.product;
      }, function (err) {
        boUtils.stopProgressBar();
        $scope.origVariants.clear();
        throw err;
      });
    }
  };

  $scope.save = function () {
    $scope.doSave().then(function (product) {
      afterSaveProduct(product).then(function () {
        if (product && product.id) {
          // 2016. 04. 04. [heekyu] elasticsearch does not return newly updated product
          boUtils.startProgressBar();
          setTimeout(function () {
            boUtils.stopProgressBar();
            $state.go('product.main');
          }, 1000);
        }
      });
    });
  };

  $scope.saveAndNew = function () {
    $scope.doSave().then(function (product) {
      afterSaveProduct(product).then(function () {
        if (!product.brand || !product.brand.id) {
          // Code Error
          console.log('code error. newly created product does not have brand');
          console.log(product);
          return;
        }
        $state.go('product.add', { brandId: product.brand.id }, { reload: true });
      });
    });
  };

  var makeImageRows = function makeImageRows() {
    $scope.imageRows = [];
    // 2016. 05. 27. [heekyu] product image
    var mainImages = _.get($scope.product, 'appImages.default') || [];
    /*
    $scope.imageRows.push({
      sku: '메인 상품 이미지',
      color: '-',
      rowspan: 1,
      imagespan: 1,
      slotCount: mainImages.length,
      images: mainImages,
    });
    */
    var colors = Object.keys($scope.variantsByColor);
    var firstVariant = true;
    colors.forEach(function (color) {
      var item = $scope.variantsByColor[color];

      var _loop = function (i) {
        var variant = item.variants[i];
        var rowspan = i === 0 ? item.variants.length : 0;
        var imagespan = item.share ? rowspan : 1;
        var row = {
          sku: variant.sku,
          color: color,
          rowspan: rowspan,
          imagespan: imagespan,
          mainProduct: firstVariant,
          slotCount: 2, // TODO,
          images: []
        };
        firstVariant = false;
        if (imagespan === 1) {
          row.images = _.get(variant, 'appImages.default') || [];
        } else if (imagespan > 1) {
          (function () {
            var imageSet = new Set();
            for (var j = 0; j < row.imagespan; j++) {
              var imgVariant = item.variants[i + j];
              (_.get(imgVariant, 'appImages.default') || []).forEach(function (image) {
                if (!imageSet.has(image.url)) {
                  imageSet.add(image.url);
                  row.images.push(image);
                }
              });
            }
          })();
        }
        if (row.images.length > 0) {
          row.slotCount = row.images.length;
        }
        $scope.imageRows.push(row);
      };

      for (var i = 0; i < item.variants.length; i++) {
        _loop(i);
      }
    });
  };
  var isImageShared = function isImageShared(variants) {
    if (variants.length < 2) return true;
    var imgCount = -1;
    for (var i = 0; i < variants.length; i++) {
      var images = _.get(variants[i], 'appImages.default');
      if (!images) {
        return false;
      }
      if (i === 0) {
        imgCount = images.length;
      } else if (imgCount !== images.length) {
        return false;
      }
    }

    for (var i = 0; i < imgCount; i++) {
      var url = variants[0].appImages['default'][i].url;
      for (var j = 1; j < variants.length; j++) {
        if (variants[j].appImages['default'][i].url !== url) {
          return false;
        }
      }
    }
    return true;
  };
  var collectByColor = function collectByColor() {
    $scope.variantsByColor = {};
    var imageUrls = new Set();
    $scope.productVariants.forEach(function (variant) {
      var color = _.get(variant, 'data.color');
      if (!color) {
        color = '-';
      }
      if (!$scope.variantsByColor[color]) {
        $scope.variantsByColor[color] = { variants: [] };
      }
      $scope.variantsByColor[color].variants.push(variant);
    });
    var colors = Object.keys($scope.variantsByColor);
    for (var i = 0; i < colors.length; i++) {
      var color = colors[i];
      // $scope.variantsByColor[color].share = isImageShared($scope.variantsByColor[color].variants);
      $scope.variantsByColor[color].share = true;
    }
  };
  $scope.initImages = function () {
    collectByColor();
    makeImageRows();
  };
  $scope.initImages();
  $scope.toggleShare = function () {
    makeImageRows();
  };
  $scope.deleteImage = function (row, index) {
    row.images.splice(index, 1);
  };
  $scope.imageSortable = {
    connectWith: '.image-container'
  };
  $scope.setProductMainImage = function () {
    if (!_.get($scope.product, 'appImages.default[0]') && _.get($scope, 'imageRows[0].images[0]')) {
      // TODO
      $scope.product.appImages = { 'default': [_.get($scope, 'imageRows[0].images[0]')] };
    }
  };
  $scope.imageRowsToVariant = function () {
    if (!$scope.imageRows || !$scope.imageRows.length) {
      return;
    }
    if ($scope.imageRows[0].images.length) {
      _.set($scope.product, 'appImages.default', $scope.imageRows[0].images);
    }
    $scope.setProductMainImage(); // TODO
    var i = 0;
    while (i < $scope.imageRows.length) {
      var row = $scope.imageRows[i];
      for (var j = 0; j < row.imagespan; j++) {
        var variant = $scope.productVariantsMap[$scope.imageRows[i].sku];
        variant.appImages = { 'default': row.images };
        i++;
      }
    }
  };
  var insertImages = function insertImages(images) {
    var used = 0;
    for (var i = 0; i < $scope.imageRows.length; i++) {
      var row = $scope.imageRows[i];
      if (row.rowspan < 1) continue;
      if (row.slotCount > row.images.length) {
        var count = Math.min(row.slotCount - row.images.length, images.length - used);
        for (var j = 0; j < count; j++) {
          row.images.push(images[used++]);
        }
        if (used === images.length) {
          $scope.imageRowsToVariant();
          window.alert('(' + used + ') images uploaded');
          return;
        }
      }
    }
    $scope.imageRowsToVariant();
    window.alert('(' + used + ') images uploaded');
  };
  $scope.imageUploaded = function (result) {
    insertImages([{
      url: result.url.slice(5),
      publicId: result.public_id,
      version: result.version,
      mainImage: false,
      thumbnail: false
    }]);
  };

  // 2016. 03. 09. [heekyu] $('#image-upload-button') does not load on controller init or document ready
  var addMultipleUploadListener = function addMultipleUploadListener() {
    var imgExt = new Set(['jpg', 'jpeg', 'png']);
    $('#image-upload-button').on('change', function (changeEvent) {
      if (!$scope.imageRows || !$scope.imageRows.length) {
        window.alert('이미지 업로드 전 상품 색상/사이즈 설정해 주세요');
        return;
      }
      var imageFiles = [];
      for (var i = 0; i < changeEvent.target.files.length; i++) {
        var file = changeEvent.target.files[i];
        var split = file.webkitRelativePath.split('.');
        var ext = split[split.length - 1];
        if (imgExt.has(ext)) {
          imageFiles.push(file);
        }
      }
      var len = imageFiles.length;
      if (len < 1) {
        return;
      }
      if (!window.confirm(len + ' 개의 이미지가 있습니다. 업로드 할까요?')) {
        return;
      }
      boUtils.startProgressBar();
      var imageContents = new Array(len);
      var uploaded = new Array(len);
      var done = 0;

      var _loop2 = function (i) {
        var r = new FileReader();
        var file = imageFiles[i];
        var metaData = _.pick(file, ['name', 'type']);
        r.onload = function (e) {
          imageContents[i] = e.target.result;
          // boUtils.uploadImage(e.target.result, `tmp/product/P(${$scope.product.id || 'add'})-${i}-${Date.now()}`).then((res) => {
          boUtils.uploadImage201607(e.target.result, metaData).then(function (res) {
            var resultImage = res.data.images[0];
            uploaded[i] = {
              url: resultImage.url.substring(resultImage.url.indexOf(':') + 1),
              mainImage: false,
              thumbnail: false
            };
            if (resultImage.thumbnails) {
              uploaded[i].thumbnails = resultImage.thumbnails;
            }
            done++;
            if (done === len) {
              insertImages(uploaded);
              if (!$scope.$$phase) {
                $scope.$apply();
              }
              $('#image-upload-button').attr('value', '');
              boUtils.stopProgressBar();
            }
          });
        };
        r.readAsBinaryString(file);
      };

      for (var i = 0; i < len; i++) {
        _loop2(i);
      }
    });
  };

  setTimeout(function () {
    addMultipleUploadListener();
  }, 1000);

  $scope.newProductVariant = { data: {}, stock: defaultQuantity };
  $scope.addProductVariant = function (newProductVariant) {
    if (!newProductVariant.data || !newProductVariant.data.color || !newProductVariant.data.size) {
      window.alert('insert color and/or size');
      return;
    }
    if (!newProductVariant.sku || newProductVariant.sku === '') {
      newProductVariant.sku = 'autogen-' + newProductVariant.data.color + '-' + newProductVariant.data.size;
    }
    if ($scope.productVariantsMap[newProductVariant.sku]) {
      window.alert(newProductVariant.sku + ' already exists');
      return;
    }
    /*
    if (newProductVariant.stock < 0) {
      window.alert('Stock >= 0');
      return;
    }
    */
    $scope.productVariants.push(newProductVariant);
    $scope.productVariantsMap[newProductVariant.sku] = newProductVariant;
    $scope.initImages();
  };
  $scope.removeProductVariant = function (index) {
    var removed = $scope.productVariants.splice(index, 1);
    delete $scope.productVariantsMap[removed[0].sku];
    $scope.initImages();
  };

  $scope.toggleCategory = function (categoryId) {
    if (categoryId === $scope.allCategories.id) {
      return;
    }
    if ($scope.productCategorySet.has(categoryId)) {
      $scope.productCategorySet['delete'](categoryId);
      for (var i = 0; i < $scope.product.categories.length; i++) {
        var _category = $scope.product.categories[i];
        if (_category === categoryId) {
          $scope.product.categories.splice(i, 1);
          break;
        }
      }
      var category = $scope.categoryIdMap[categoryId];
      category.isChecked = false;
      (category.children || []).forEach(function (child) {
        if ($scope.productCategorySet.has(child.id)) {
          $scope.toggleCategory(child.id);
        }
      });
    } else {
      $scope.productCategorySet.add(categoryId);
      $scope.product.categories.push(categoryId);
      while (true) {
        var category = $scope.categoryIdMap[categoryId];
        category.isChecked = true;
        if (!category || !category.parentId || category.parentId < 1) {
          break;
        }
        if (!$scope.productCategorySet.has(category.parentId)) {
          $scope.toggleCategory(category.parentId);
          break;
        }
        categoryId = category.parentId;
      }
    }
  };
  // 2016. 02. 03. [heekyu] TODO this logic must be in server side
  $scope.updateCategoryPath = function () {
    if ($scope.product.categories.length < 1) {
      return true;
    }
    var paths = [];
    var getPathObject = function getPathObject(path) {
      var res = {};
      var root = path[0];
      var langKeys = [];
      for (var k in root.name) {
        if (root.name.hasOwnProperty(k)) {
          res[k] = [root.name[k]];
          langKeys.push(k);
        }
      }
      for (var i = 1; i < path.length; i++) {
        var categoryName = path[i].name;
        for (var j = 0; j < langKeys.length; j++) {
          res[langKeys[j]].push(categoryName[langKeys[j]]);
        }
      }
      return res;
    };
    var dfs = function dfs(root, path) {
      if (!root.children) {
        return false;
      }
      var exist = false;
      for (var i = 0; i < root.children.length; i++) {
        var child = root.children[i];
        if ($scope.productCategorySet.has(child.id)) {
          path.push(child);
          if (!dfs(child, path)) {
            paths.push(getPathObject(path));
          }
          path.length--;
          exist = true;
        } else {
          path.push(child);
          exist = exist | dfs(child, path);
          path.length--;
        }
      }
      return exist;
    };
    dfs($scope.allCategories, []);
    if (!$scope.product.data) {
      $scope.product.data = {};
    }
    $scope.product.data.categoryPath = paths;
  };

  $scope.translateStatus = function (status) {
    return $rootScope.getContentsI18nText('enum.productVariant.status.' + status);
  };

  $scope.isEditorInitialized = false;
  var descriptions = ['desktop-desc1', 'desktop-desc2', 'desktop-desc3', 'mobile-desc1', 'mobile-desc2', 'mobile-desc3'];
  var getSummernoteConfig = function getSummernoteConfig(node, name) {
    var options = {
      fontNames: ['Noto Sans KR', 'Open Sans', 'Arial'],
      onImageUpload: function onImageUpload(files) {
        return boUtils.getSummerNoteImageUpload(files, node);
      }
    };
    if (name.startsWith('mobile')) {
      options.width = 320;
      options.height = 500;
    } else {
      options.width = 980;
      options.height = 700;
    }
    return options;
  };
  $scope.initEditor = function () {
    if (!$scope.isEditorInitialized) {
      $scope.isEditorInitialized = true;
      var initDesc = function initDesc(name) {
        var node = $('#' + name);
        node.summernote(getSummernoteConfig(node, name));
        /*
        node.on('summernote.paste', (e) => {
          setTimeout(() => {
            const images = $(`#${name} + .note-editor`).find('img') || [];
            for (let i = 0; i < images.length; i++) {
              const image = images[0];
              const imgSrc = $(image).attr('src');
              const dataType = imgSrc.substring(0, 10);
              const trapdoor = 1000; // TODO set trapdoor value
              if (dataType === 'data:image' && imgSrc.length > trapdoor) {
                let contentType = '';
                let i = 11;
                for (; i < trapdoor; i++) {
                  if (imgSrc[i] === ';') {
                    break;
                  }
                  contentType += imgSrc[i];
                }
                let encoding = '';
                i += 1;
                for (; i < trapdoor; i++) {
                  if (imgSrc[i] === ',') {
                    break;
                  }
                  encoding += imgSrc[i];
                }
                if (encoding === 'base64') {
                  boUtils.startProgressBar();
                  const imageContent = Base64.decode(imgSrc.substring(i + 1));
                  const name = `summernote-${new Date().getTime()}`;
                  boUtils.uploadImage201607(imageContent, { name, type: contentType })
                    .then((res) => {
                      boUtils.stopProgressBar();
                      const resultImage = res.data.images[0];
                      $(image).attr('src', resultImage.url);
                    }).catch((err) => {
                      boUtils.stopProgressBar();
                      throw err;
                    })
                }
              }
            }
          }, 1000);
        });
        */
        var data = _.get($scope.product, 'contents.' + name);
        if (data) {
          node.code('' + data);
        }
      };
      descriptions.forEach(initDesc);
    }
  };
  $scope.saveEditorContents = function () {
    var saveDesc = function saveDesc(name) {
      var node = $('#' + name);
      var data = node.code();
      if (data) {
        _.set($scope.product, 'contents.' + name, data);
      }
    };
    descriptions.forEach(saveDesc);
  };

  $scope.getImageUrl = function (variant) {
    return _.get(variant, 'appImages.default[0].thumbnails.320') || _.get(variant, 'appImages.default[0].image.url', '');
  };

  var initVariantDatatables = function initVariantDatatables(productVariants) {
    $scope.variantDatatables = {
      data: productVariants,
      columns: [{
        data: function data(_data) {
          return _.get(_data, 'product.name.ko', '');
        },
        orderable: false
      }, {
        data: function data(_data2) {
          return _.get(_data2, 'data.color', '');
        },
        orderable: false
      }, {
        data: function data(_data3) {
          return _data3;
        },
        render: function render(variant) {
          return '<img width="80px" src="' + $scope.getImageUrl(variant) + '" />';
        },
        orderable: false
      }, {
        data: 'id',
        render: function render(id) {
          return '<button class="btn blue" data-ng-click="addRecommendVariant(' + id + ')"><i class="fa fa-plus"></i> 추천</button>';
        },
        orderable: false
      }]
    };
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  };

  var removeCircularRecommendVariants = function removeCircularRecommendVariants(variant) {
    var nestedRecommendVariants = _.get(variant, 'product.data.recommendVariants');
    if (nestedRecommendVariants) {
      var newVariant = Object.assign({}, variant);
      _.set(newVariant, 'product.data', Object.assign({}, newVariant.product.data, { recommendVariants: null }));
      return newVariant;
    }
    return variant;
  };

  var loadRecommentProducts = function loadRecommentProducts() {
    $http.get('/api/v1/products?isActive=true&limit=500').then(function (res) {
      $scope.recommentProductVariants = [];
      var products = res.data.products || [];
      $scope.variantIdMap = {};

      var getColorId = function getColorId(product, variant) {
        return product.id + '-' + _.get(variant, 'data.color');
      };
      var colors = {};
      ($scope.product.data.recommendVariants || []).forEach(function (variant) {
        var color = getColorId(variant.product, variant);
        colors[color] = variant;
      });
      console.log(Object.keys(colors));
      products.forEach(function (product) {
        if (+product.id === +$scope.product.id) {
          return;
        }
        (product.productVariants || []).forEach(function (variant) {
          if ($scope.variantIdMap[variant.id]) {
            return;
          }
          variant.product = _.omit(product, 'productVariants');
          variant = removeCircularRecommendVariants(variant);
          var color = getColorId(product, variant);
          if (!colors[color]) {
            colors[color] = variant;
            $scope.variantIdMap[variant.id] = variant;
            $scope.recommentProductVariants.push(variant);
          }
        });
      });
      initVariantDatatables($scope.recommentProductVariants);
    });
  };

  $scope.addRecommendVariant = function (id) {
    if (!_.get($scope.product, 'data.recommendVariants')) {
      _.set($scope.product, 'data.recommendVariants', []);
    }
    var variant = removeCircularRecommendVariants($scope.variantIdMap[id]);
    $scope.product.data.recommendVariants.push(variant);
    loadRecommentProducts();
  };

  $scope.deleteRecommendVariant = function (index) {
    $scope.product.data.recommendVariants.splice(index, 1);
    loadRecommentProducts();
  };

  $scope.initRecommend = function () {
    if ($scope.recommentProductVariants) {
      return;
    }
    loadRecommentProducts();
  };
});
}, {"../module.js":12}],
44: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

productModule.controller('CategoryEditController', function ($scope, $rootScope, $http, $state, categories, $translate, boUtils) {
  $scope.contentTitle = $translate.instant('product.category.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'product.main',
    name: $translate.instant('product.main.title')
  }, {
    sref: 'product.category',
    name: $translate.instant('product.category.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  var editLocale = $rootScope.state.editLocale;

  $scope.root = categories;
  var categoryIdMap = {};
  var currentCategoryId = $state.params.categoryId;
  if (!currentCategoryId) {
    currentCategoryId = $scope.root.id;
  }
  $scope.root.name[editLocale] = $translate.instant('product.category.rootName'); // TODO root name i18n

  var devices = ['desktop', 'mobile'];
  $('#category-ui-desktop').summernote({
    width: 1200,
    height: 700,
    onImageUpload: function onImageUpload(files) {
      return boUtils.getSummerNoteImageUpload(files, $('#category-ui-desktop'));
    }
  });
  $('#category-ui-mobile').summernote({
    width: 320,
    height: 500,
    onImageUpload: function onImageUpload(files) {
      return boUtils.getSummerNoteImageUpload(files, $('#category-ui-mobile'));
    }
  });
  var getNode = function getNode(device) {
    return $('#category-ui-' + device);
  };
  $scope.setCategory = function (category) {
    $scope.category = category;
    devices.forEach(function (device) {
      var editorData = _.get(category, 'contents.customUI-' + device, '');
      getNode(device).code(editorData);
    });
  };

  var getTreeData = function getTreeData(root, currentCategoryId, opened) {
    var json = {
      id: root.id,
      text: root.name ? root.name[editLocale] + '(' + root.id + ')' : 'NoName',
      data: { id: root.id },
      state: { selected: false, opened: opened } };
    /* TODO disabled: !root.isActive, */
    categoryIdMap[root.id] = root;
    if (currentCategoryId && +root.id === +currentCategoryId) {
      $scope.setCategory(root);
      json.state.selected = true;
    }

    if (root.children) {
      json.children = root.children.map(function (child) {
        return getTreeData(child, $state.params.categoryId, false);
      });
    }
    return json;
  };

  var jstreeData = getTreeData($scope.root, currentCategoryId, true);
  var jstreeNode = $('#categoryTree');
  jstreeNode.jstree({
    core: {
      themes: {
        responsive: false
      },
      check_callback: function check_callback(operation, node, node_parent, node_position, more) {
        if (operation === 'move_node') {
          if (node.parent === '#') {
            // root node cannot be moved
            return false;
          }
          if (more && more.ref && more.ref.parent === '#') {
            // cannot move to root
            return false;
          }
          return true;
        }
        if (operation === 'rename_node') {
          return false;
        }
        return true;
      },
      data: jstreeData,
      multiple: false
    },
    types: {
      'default': {
        // 2016. 05. 10. [heekyu] max_depth yields 'move_node' restriction
        // max_depth: 3,
        icon: 'fa fa-folder icon-state-warning icon-lg'
      }
    },
    plugins: ['dnd', 'types', 'contextmenu'],
    contextmenu: {
      items: function items($node) {
        var tree = jstreeNode.jstree(true);
        var newNodeName = $translate.instant('product.category.nameNewCategory');
        return {
          Create: {
            label: $translate.instant('product.category.labelNewCategory'),
            action: function action() {
              var newCategory = {
                name: {},
                isActive: false,
                parentId: $node.id
              };
              newCategory.name[editLocale] = 'NewNode';
              $http.post('/api/v1/categories', newCategory).then(function (res) {
                categoryIdMap[res.data.id] = res.data;
                var newNodeId = tree.create_node($node, res.data.name[editLocale]);
                jstreeNode.jstree('set_id', newNodeId, res.data.id);
                selectNode(res.data.id);
              }, function (err) {
                window.alert(err.data);
              });
            }
          },
          Delete: {
            label: $translate.instant('product.category.labelDeleteCategory'),
            action: function action(obj) {
              var categoryId = $node.id;
              $http['delete']('/api/v1/categories/' + categoryId).then(function () {
                delete categoryIdMap[categoryId];
                jstreeNode.jstree('delete_node', categoryId);
              }, function (err) {
                window.alert(err.data);
              });
            }
          }
        };
      }
    }
  });

  $scope.getImageUrl = function (variant) {
    return _.get(variant, 'appImages.default[0].thumbnails.320') || _.get(variant, 'appImages.default[0].image.url', '');
  };

  var initVariantDatatables = function initVariantDatatables(productVariants) {
    $scope.variantDatatables = {
      data: productVariants,
      columns: [{
        data: function data(_data) {
          return _.get(_data, 'product.name.ko', '');
        },
        orderable: false
      }, {
        data: function data(_data2) {
          return _.get(_data2, 'product.sku', '');
        },
        orderable: false
      }, {
        data: function data(_data3) {
          return _.get(_data3, 'data.color', '');
        },
        orderable: false
      }, {
        data: function data(_data4) {
          return _.get(_data4, 'data.size', '');
        },
        orderable: false
      }, {
        data: function data(_data5) {
          return _data5;
        },
        render: function render(variant) {
          return '<img width="80px" src="' + $scope.getImageUrl(variant) + '" />';
        },
        orderable: false
      }, {
        data: 'id',
        render: function render(id) {
          return '<button class="btn blue" data-ng-click="addBestVariant(' + id + ')"><i class="fa fa-plus"></i> 베스트</button>';
        },
        orderable: false
      }]
    };
  };

  var loadProducts = function loadProducts() {
    var categoryId = _.get($scope, 'category.id');
    if (!categoryId) {
      return;
    }
    _.defaults($scope.category, { data: { bestVariants: [] } });
    var bestVariantIds = new Set();
    $scope.category.data.bestVariants.forEach(function (v) {
      return bestVariantIds.add(v.id);
    });
    $scope.variantIdMap = {};
    $http.get('/api/v1/products?categoryId=' + categoryId + '&limit=500').then(function (res) {
      var products = res.data.products || [];
      var productVariants = [];
      products.forEach(function (product) {
        (product.productVariants || []).forEach(function (variant) {
          var isHide = _.get(variant, 'data.isHide');
          variant.product = product;
          if (!isHide && !bestVariantIds.has(variant.id)) {
            productVariants.push(variant);
            $scope.variantIdMap[variant.id] = variant;
          } else {
            for (var i = 0; i < $scope.category.data.bestVariants.length; i++) {
              // 2016. 09. 08. [heekyu] update variant data
              var variantId = $scope.category.data.bestVariants[i].id;
              if (variant.id === variantId) {
                $scope.category.data.bestVariants[i] = variant;
                break;
              }
            }
          }
        });
      });
      initVariantDatatables(productVariants);
    });
  };

  $scope.addBestVariant = function (id) {
    var variant = $scope.variantIdMap[id];
    $scope.category.data.bestVariants.push(variant);
    loadProducts();
  };

  $scope.deleteBestVariant = function (index) {
    $scope.category.data.bestVariants.splice(index, 1);
    loadProducts();
  };

  // 2016. 01. 20. [heekyu] refer to https://www.jstree.com/api
  jstreeNode.on('move_node.jstree', function (e, data) {
    var old_parent = data.old_parent;
    var parent = data.parent;

    $http.put('/api/v1/categories/' + data.node.id, { parentId: data.parent }).then(function (res) {
      console.log(res);
    });
    var saveChildIds = function saveChildIds(categoryId) {
      var childIds = jstreeNode.jstree('get_node', categoryId).children;
      $http.put('/api/v1/categories/' + categoryId, { childIds: childIds }).then(function (res) {
        console.log(res);
      });
    };
    saveChildIds(parent);
    if (old_parent !== parent) {
      saveChildIds(old_parent);
    }
  });
  jstreeNode.on('select_node.jstree', function (e, data) {
    if (+data.node.id === +_.get($scope, 'category.id')) {
      return;
    }
    $scope.setCategory(categoryIdMap[data.node.id]);
    loadProducts();
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $state.go('product.category.child', { categoryId: data.node.id });
  });
  loadProducts();

  var selectNode = function selectNode(categoryId) {
    jstreeNode.jstree('select_node', categoryId);
    var selected = jstreeNode.jstree('get_selected');
    selected.map(function (id) {
      if (id != categoryId) {
        jstreeNode.jstree('deselect_node', id);
      }
    });
  };

  $scope.names = [{ title: 'ko', key: 'ko' }, { title: 'en', key: 'en' }, { title: 'zh-cn', key: 'zh-cn' }, { title: 'zh-tw', key: 'zh-tw' }];

  $scope.save = function () {
    if (!$scope.category) {
      window.alert('[ERROR] Category is NULL');
      return false;
    }
    devices.forEach(function (device) {
      var editorData = getNode(device).code();
      if (editorData) {
        _.set($scope.category, 'contents.customUI-' + device, editorData);
      }
    });
    $scope.category.data.bestVariants.forEach(function (v) {
      v.product = _.pick(v.product, 'name', 'KRW', 'data', 'id');
      if (v.product.data) {
        v.product.data = _.pick(v.product.data, 'description', 'shortDescription', 'bigDisplay');
      }
    });
    $http.put('/api/v1/categories/' + $scope.category.id, _.omit($scope.category, ['id', 'children'])).then(function (res) {
      var category = res.data;
      categoryIdMap[category.id] = category;
      jstreeNode.jstree('set_text', category.id, category.name[editLocale]);
      $scope.setCategory(category);
      window.alert(_.get(category, 'name.ko', category.id) + '가 성공적으로 저장되었습니다');
    }, function (err) {
      window.alert(err.data);
    });
  };

  $scope.reindex = function () {
    $http.put('/api/v1/products/reindex').then(function (res) {
      window.alert(res.data.message);
    }, function (err) {
      window.alert(err.data);
    });
  };

  $scope.changeCategoryEditLocale = function (locale) {
    $rootScope.changeEditLocale(locale);
    $state.reload();
  };

  setTimeout(function () {
    $('#banner-upload-button').on('change', function (changeEvent) {
      var file = _.get(changeEvent, 'target.files[0]');
      if (!file) {
        return;
      }
      boUtils.startProgressBar();
      $('#banner-upload-button').attr('value', '');
      var r = new FileReader();
      r.onload = function (e) {
        boUtils.uploadImage201607(e.target.result, file, '').then(function (res) {
          boUtils.stopProgressBar();
          _.set($scope.category, 'data.banner', res.data.images[0]);
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }, function () {
          window.alert('image upload fail');
          boUtils.stopProgressBar();
        });
      };
      r.readAsBinaryString(file);
    });
  }, 500);
  setTimeout(function () {
    $('#mobile-banner-upload-button').on('change', function (changeEvent) {
      var file = _.get(changeEvent, 'target.files[0]');
      if (!file) {
        return;
      }
      boUtils.startProgressBar();
      $('#mobile-banner-upload-button').attr('value', '');
      var r = new FileReader();
      r.onload = function (e) {
        boUtils.uploadImage201607(e.target.result, file, '').then(function (res) {
          boUtils.stopProgressBar();
          _.set($scope.category, 'data.banner.mobile', res.data.images[0]);
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }, function () {
          window.alert('image upload fail');
          boUtils.stopProgressBar();
        });
      };
      r.readAsBinaryString(file);
    });
  }, 500);
});
}, {"../module.js":12}],
45: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

/**
 * CSV File Rule
 *   1. product variants must be just after it's product
 */
productModule.controller('ProductBatchUploadController', function ($scope, $http, $state, $rootScope, $translate, productUtil) {
  $scope.contentTitle = $translate.instant('product.batchUpload.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'product.main',
    name: $translate.instant('product.main.title')
  }, {
    sref: '-',
    name: $translate.instant('product.batchUpload.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  var fields = [{ columnName: 'sku', apiName: 'sku' }, { columnName: 'price', apiName: 'KRW', onlyProductVariant: true, convert: function convert(value) {
      return Number(value);
    } }, { columnName: 'qty', apiName: 'stock', onlyProductVariant: true }, { columnName: 'name', apiName: 'name' }, { columnName: 'category_ids', apiName: 'categories', onlyProduct: true, convert: function convert(value) {
      return value.split(',').map(function (v) {
        return Number(v);
      });
    } }, { columnName: 'seller', apiName: 'data.seller', onlyProduct: true, convert: function convert(value) {
      return Number(value);
    } }, { columnName: 'size', apiName: 'data.size', onlyProductVariant: true }, { columnName: 'color', apiName: 'data.color', onlyProductVariant: true }];
  $scope.rowCount = 0;
  $scope.productCount = $rootScope.state.batchUploadedProducts.length;
  $scope.productVariantCount = 0;

  for (var i = 0; i < $rootScope.state.batchUploadedProducts.length; i++) {
    var product = $rootScope.state.batchUploadedProducts[i];
    $scope.productVariantCount += product.productVariants ? product.productVariants.length : 0;
  }

  $scope.onFileLoad = function (contents) {
    var rows = contents.split('\n');
    if (rows.length < 2) {
      window.alert('There is no data');
      return;
    }
    $scope.resetUploaded();

    var columns = $.csv.toArray(rows[0]);
    var columnCount = columns.length;
    for (var idx = 0; idx < columnCount; idx++) {
      var column = columns[idx].trim();
      for (var i = 0; i < fields.length; i++) {
        if (fields[i].columnName === column) {
          console.log(fields[i].apiName + ' is in ' + idx);
          fields[i].idx = idx;
          break;
        }
      }
    }
    $scope.rowCount = rows.length - 1;
    $scope.productCount = 0;
    $scope.productVariantCount = 0;

    var requestCount = 0;
    var currentProduct = { sku: '\\-x*;:/' };

    var startCreate = function startCreate(product, productVariants) {
      requestCount++;
      console.log('Start Request.' + requestCount);
      productUtil.createProduct(product, productVariants).then(function (res) {
        requestCount--;
        console.log('End Request.' + requestCount);
        if (!res || !res.product) {
          return;
        }
        $scope.productCount++;
        $scope.productVariantCount += productVariants.length;
        $rootScope.state.batchUploadedProducts.push(_.assign({}, product, { productVariants: productVariants }));
        $http.put('/api/v1/products/' + product.id + '/index').then(function (res) {
          // ignore
        });
      });
    };
    var productVariants = [];
    for (var _i = 1; _i < rows.length; _i++) {
      var _columns = $.csv.toArray(rows[_i]);
      if (_columns.length < 2) {
        console.log('skip');
        continue;
      } else if (_columns.length < columnCount) {
        window.alert('lack columns : ' + _columns);
        continue;
      }
      if (_columns[fields[0].idx].startsWith(currentProduct.sku)) {
        // product variant
        var productVariant = {};
        for (var j = 0; j < fields.length; j++) {
          if (fields[j].onlyProduct) {
            continue;
          }
          productUtil.setObjectValue(productVariant, fields[j].apiName, _columns[fields[j].idx], fields[j].convert);
        }
        productVariants.push(productVariant);
      } else {
        // product
        // if (productVariants.length > 0) {
        // can product without product variants?
        if (_i > 1) {
          startCreate(currentProduct, productVariants);
        }
        productVariants = [];
        currentProduct = {};
        for (var j = 0; j < fields.length; j++) {
          if (fields[j].onlyProductVariant) {
            continue;
          }
          productUtil.setObjectValue(currentProduct, fields[j].apiName, _columns[fields[j].idx], fields[j].convert);
        }
      }
    }
    // if (productVariants.length > 0) {
    startCreate(currentProduct, productVariants);
  };

  $scope.resetUploaded = function () {
    $rootScope.state.batchUploadedProducts.length = 0;
  };

  $scope.onDirLoad = function (contents) {
    console.log(contents);
  };
});
}, {"../module.js":12}],
46: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module');

productModule.controller('ProductImageUploadController', function ($scope, $http, $q, productUtil, boUtils) {
  var today = moment();
  var maxDays = 10;
  $scope.dates = [];
  for (var i = 0; i < maxDays; i++) {
    $scope.dates.push(today.format('YYYY-MM-DD'));
    today.subtract(1, 'd');
  }
  $scope.activeDate = $scope.dates[0];
  var initializeDate = function initializeDate() {
    var reverse = function reverse(arr) {
      for (var i = 0; i < arr.length / 2; i++) {
        var tmp = arr[i];
        arr[i] = arr[arr.length - 1 - i];
        arr[arr.length - 1 - i] = tmp;
      }
      return arr;
    };
    boUtils.startProgressBar();
    var collectByBrand = function collectByBrand(products) {
      var brandMap = {};
      var brandIds = [];
      products.forEach(function (product) {
        var brandId = _.get(product, 'brand.id');
        if (!brandId) return;
        if (!brandMap[brandId]) {
          brandMap[brandId] = { brand: product.brand, products: [] };
          brandIds.push(brandId);
        }
        brandMap[brandId].products.push(product);
      });
      return reverse(brandIds).map(function (key) {
        return brandMap[key];
      });
    };
    $http.get('/api/v1/products?start=' + $scope.activeDate + '&end=' + $scope.activeDate + '&limit=100').then(function (res) {
      var products = res.data.products.map(productUtil.narrowProduct);
      if (products.length < 1) {
        window.alert('There is no products on ' + $scope.activeDate);
        $scope.activeBrand = {};
        $scope.brands = [];
        productsToRows([]);
        return;
      }
      // 2016. 04. 04. [heekyu] older product is former
      // Array.reverse(products); why Array.reverse does not exist?
      products = reverse(products);
      $scope.brands = collectByBrand(products);
      $scope.brands.forEach(function (brand) {
        brand.brand.displayName = boUtils.getNameWithAllBuildingInfo(brand.brand);
      });
      $scope.setActiveBrand($scope.brands[0]);
    }, function () {
      window.alert('Failed to get products before Image Upload');
    }).then(function () {
      boUtils.stopProgressBar();
    });
  };
  $scope.setDate = function (date) {
    $scope.activeDate = date;
    initializeDate();
  };
  initializeDate();

  var extractDataFromVariant = function extractDataFromVariant(variant) {
    var color = _.get(variant, 'data.color');
    var size = _.get(variant, 'data.size');
    if (color && size) {
      return { color: color, size: size };
    }
    var splits = variant.sku.split('-');
    if (splits.length === 3) {
      return {
        color: splits[1],
        size: splits[2]
      };
    }
    return {};
  };
  var productToTableData = function productToTableData(product) {
    var colorMap = {};
    var mainColor = null;
    for (var i = 0; i < product.productVariants.length; i++) {
      var productVariant = product.productVariants[i];
      var color = productVariant.data.color;
      var size = productVariant.data.size;
      if (!color) {
        var parsed = extractDataFromVariant(productVariant);
        color = parsed.color;
        if (!size) size = productVariant.data.size;
      }
      if (!color) {
        console.log('cannot detect color name for variant ' + productVariant.sku);
        window.alert('cannot extract \'color\' and/or \'size\' from ' + productVariant.sku);
        continue;
      }
      if (!colorMap[color]) {
        colorMap[color] = [];
        if (mainColor) mainColor = color;
      }
      colorMap[color].push(productVariant);
    }
    var rows = [];
    var colors = Object.keys(colorMap);
    for (var i = 0; i < colors.length; i++) {
      var variants = colorMap[colors[i]];
      for (var j = 0; j < variants.length; j++) {
        var variant = variants[j];
        var images = _.get(variant, 'appImages.default') || [];
        var slotCount = images.length;
        var mainProduct = false;
        if (!slotCount) {
          if (i === 0 && !$scope.uploadTypes[$scope.uploadTypeIndex].productHasImage) {
            mainProduct = true;
            slotCount = 6;
          } else {
            slotCount = 2;
          }
        }
        rows.push({
          color: colors[i],
          images: images || [],
          mainProduct: mainProduct,
          rowspan: j === 0 ? variants.length : 0,
          sku: variant.sku,
          slotCount: slotCount,
          variantId: variant.id
        });
      }
    }
    if ($scope.uploadTypes[$scope.uploadTypeIndex].productHasImage) {
      rows.push({
        color: 'Main',
        images: _.get(product, 'appImages.default') || [],
        mainProduct: false, // TODO
        rowspan: 1,
        sku: _.get(product, 'name.ko'),
        slotCount: 5,
        variantId: null
      });
    }
    return { rows: rows, product: product };
  };
  var productsToRows = function productsToRows(products) {
    $scope.items = [];
    var len = products.length;
    for (var i = 0; i < len; i++) {
      var product = products[i];
      product.hasImage = true;
      $scope.items.push(productToTableData(product));
    }
  };

  $scope.setActiveBrand = function (brand) {
    var products = brand.products;
    var len = products.length;
    var promises = [];

    var _loop = function (i) {
      var product = products[i];
      if (!product.productVariants) {
        promises.push($http.get('/api/v1/products/' + product.id + '/product_variants').then(function (res2) {
          product.productVariants = res2.data.productVariants.map(productUtil.narrowProductVariant);
        }));
      }
    };

    for (var i = 0; i < len; i++) {
      _loop(i);
    }
    return $q.all(promises).then(function () {
      $scope.activeBrand = brand;
      productsToRows($scope.activeBrand.products);
    });
  };

  var imgExt = new Set(['jpg', 'jpeg', 'png']);
  $('#image-upload-button').on('change', function (changeEvent) {
    boUtils.startProgressBar();
    var images = [];
    for (var i = 0; i < changeEvent.target.files.length; i++) {
      var file = changeEvent.target.files[i];
      var split = file.webkitRelativePath.split('.');
      var ext = split[split.length - 1];
      if (imgExt.has(ext)) {
        images.push(file);
      }
    }

    var imgIdx = 0;
    var promise = $q.when();
    var loadImages = function loadImages(item) {
      return new Promise(function (resolve, reject) {
        var rows = item.rows;
        var loadPromises = [];

        var _loop2 = function (k) {
          var row = rows[k];
          if (row.rowspan < 1) {
            return 'continue';
          }
          // 2016. 04. 06. [heekyu] do not override existing images
          var current = row.images.length;
          var more = row.slotCount - current;
          if (more < 1) {
            return 'continue';
          }

          var _loop3 = function (_k) {
            if (imgIdx == images.length) {
              window.alert('이미지 개수가 부족합니다');
              row.images.length = _k;
              return 'break';
            }
            loadPromises.push(new Promise(function (resolve2, reject2) {
              var r = new FileReader();
              r.onload = function (e) {
                row.images[current + _k] = { url: e.target.result };
                resolve2();
              };
              r.readAsDataURL(images[imgIdx++]);
            }));
          };

          for (var _k = 0; _k < more; _k++) {
            var _ret3 = _loop3(_k);

            if (_ret3 === 'break') break;
          }
          $q.all(loadPromises).then(resolve);
        };

        for (var k = 0; k < rows.length; k++) {
          var _ret2 = _loop2(k);

          if (_ret2 === 'continue') continue;
        }
      });
    };
    for (var j = 0; j < $scope.items.length; j++) {
      promise = promise.then(loadImages($scope.items[j]));
      if (imgIdx == images.length) break;
    }
    promise.then(function () {
      boUtils.stopProgressBar();
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  });
  $scope.deleteImage = function (row, index) {
    row.images.splice(index, 1);
  };
  $scope.imageSortable = {
    connectWith: '.image-container',
    placeholder: 'ui-state-highlight'
  };
  $scope.saveImages = function () {
    boUtils.startProgressBar();
    var changedProducts = new Set();
    var isAddProductImage = !$scope.uploadTypes[$scope.uploadTypeIndex].productHasImage;
    var uploadRowImages = function uploadRowImages(productId, productVariantIds, images, isSaveProduct) {
      changedProducts.add(productId);
      var appImages = new Array(images.length);
      var promises = [];

      var _loop4 = function (i) {
        var imageUrl = images[i].url;
        if (imageUrl.length > 2 && imageUrl.substring(0, 2) === '//') {
          appImages[i] = images[i];
        } else {
          promises.push(new Promise(function (resolve, reject) {
            $.ajax({
              url: 'https://api.cloudinary.com/v1_1/linkshops/image/upload',
              type: 'POST',
              data: { file: imageUrl, upload_preset: 'nd9k8295' },
              success: function success(res) {
                appImages[i] = {
                  url: res.url.substring(5),
                  publicId: res.public_id,
                  version: res.version,
                  mainImage: isSaveProduct
                };
                resolve(res);
                if (res) return res;
              },
              error: function error(res) {
                window.alert(res);
                appImages[i] = {};
                reject(Error(res));
              }
            });
          }));
        }
      };

      for (var i = 0; i < images.length; i++) {
        _loop4(i);
      }
      var saveProductVariant = function saveProductVariant() {
        var promises = [];
        var data = {
          appImages: { 'default': appImages }
        };
        if (productVariantIds && productVariantIds.length) {
          productVariantIds.forEach(function (productVariantId) {
            promises.push($http.put('/api/v1/products/' + productId + '/product_variants/' + productVariantId, data));
          });
          if (isSaveProduct) {
            promises.push($http.put('/api/v1/products/' + productId, data));
          }
        } else {
          promises.push($http.put('/api/v1/products/' + productId, data));
        }
        return $q.all(promises);
      };
      return $q.all(promises).then(function () {
        return saveProductVariant();
      });
    };
    var promise = $q.when();

    var _loop5 = function (j) {
      var item = $scope.items[j];
      var r = 0;

      var _loop7 = function () {
        var sameColor = item.rows[r].rowspan;
        var images = item.rows[r].images;
        var variantIds = [];
        var isUploadProduct = false;
        for (var k = 0; k < sameColor; k++) {
          var row = item.rows[r++];
          if (row.variantId) {
            variantIds.push(row.variantId);
            if (row.mainProduct && images.length) {
              isUploadProduct = true;
            }
          }
        }
        promise = promise.then(function () {
          return uploadRowImages(item.product.id, variantIds, images, isAddProductImage && isUploadProduct);
        });
      };

      while (r < item.rows.length) {
        _loop7();
      }
    };

    for (var j = 0; j < $scope.items.length; j++) {
      _loop5(j);
    }
    promise.then(function () {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop6 = function () {
          var changedProduct = _step.value;

          // silently indexing
          $http.put('/api/v1/products/' + changedProduct, { isActive: true }).then(function () {
            // 2016. 04. 26. [heekyu] index after isActive updated
            $http.put('/api/v1/products/' + changedProduct + '/index');
          });
        };

        for (var _iterator = changedProducts.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop6();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      window.alert('all images uploaded and product informations saved');
      boUtils.stopProgressBar();
    });
  };

  $scope.clearImages = function () {
    ($scope.items || []).forEach(function (item) {
      (item.rows || []).forEach(function (row) {
        row.images = [];
      });
    });
  };

  $scope.uploadTypes = [{ name: '기본 업로드', productHasImage: true }, { name: '잡화 업로드', productHasImage: false }];
  $scope.uploadTypeIndex = 0;
  $scope.changeUploadType = function (index) {
    $scope.uploadTypeIndex = index;
    productsToRows($scope.activeBrand.products);
    $scope.clearImages();
  };
});
}, {"../module":12}],
47: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

productModule.controller('SMarketController', function ($scope, $http) {
  $scope.smarketDatatables = {
    field: 'products',
    storeKey: 'smarket',
    columns: [{
      data: 'gid'
    }, {
      data: 'storeName'
    }, {
      data: function data(_data) {
        return _.get(_data, 'data.goodsName', '');
      }
    }, {
      data: function data(_data2) {
        return _.get(_data2, 'data.goodsPrice', '');
      }
    }, {
      data: function data(_data3) {
        return _.get(_data3, 'data.color', '');
      }
    }, {
      data: function data(_data4) {
        var images = (_.get(_data4, 'data.goodsImages') || []).map(function (img) {
          return '' + (img.imageUrl || '') + (img.filename || '');
        });
        return images;
      },
      render: function render(images) {
        return images.map(function (image) {
          return '<img width="100" src=' + image + ' />';
        }).join('');
      }
    }]
  };
});
}, {"../module.js":12}],
13: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var textModule = angular.module('backoffice.text', ['ui.router', require('../third_party/angular-translate')]);

textModule.config(function ($translateProvider) {
  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

textModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('text', {
    abstract: true,
    url: '/text',
    template: '<ui-view/>'
  }).state('text.main', {
    url: '/main',
    templateUrl: templateRoot + '/text/main.html',
    controller: 'TextMainController'
  });
});

module.exports = textModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../third_party/angular-translate":14,"./i18n/translations.en.json":48,"./i18n/translations.ko.json":49,"./controllers.js":50}],
48: [function(require, module, exports) {
module.exports = {

}
;
}, {}],
49: [function(require, module, exports) {
module.exports = {
  "text": {
    "title": "국제화"
  }
}
;
}, {}],
50: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var textModule = require('./module');

textModule.controller('TextMainController', function ($scope, $http, $q, $state, $rootScope) {
  $scope.activeNode = null;
  var jstreeNode = $('#textTree');

  var nodeToKey = {};
  var nodeNum = 0;
  var getTreeData = function getTreeData(key, obj, fullPath) {
    nodeNum++;
    nodeToKey[nodeNum] = key;
    if (obj.ko || obj.en) {
      var _res = {
        id: nodeNum,
        text: obj[$rootScope.state.editLocale],
        data: obj
      };
      if ($scope.activeKey && $scope.activeKey === fullPath) {
        (function () {
          var activeNodeNum = nodeNum;
          setTimeout(function () {
            jstreeNode.jstree('select_node', activeNodeNum);
          }, 100);
        })();
      }
      return _res;
    }
    var keys = Object.keys(obj);
    var res = {
      id: nodeNum,
      text: key,
      data: obj,
      children: [],
      state: { selected: false, opened: false, disabled: true }
    };
    for (var i = 0; i < keys.length; i++) {
      var child = obj[keys[i]];
      res.children.push(getTreeData(keys[i], child, key + '.' + keys[i]));
    }
    return res;
  };
  var jsTreeData = function jsTreeData(origData) {
    var res = [];
    var keys = Object.keys(origData);
    keys.forEach(function (key) {
      res.push(getTreeData(key, origData[key], key));
    });
    return res;
  };

  var initJsTree = function initJsTree(origData) {
    nodeNum = 0;
    var jstreeData = jsTreeData(origData);

    jstreeNode.jstree({
      core: {
        themes: {
          responsive: false
        },
        data: jstreeData,
        multiple: false
      }
    });
    jstreeNode.on('select_node.jstree', function (e, data) {
      $scope.activeNode = data.node;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  };

  var redraw = function redraw() {
    var treeData = jsTreeData($scope.origData);
    jstreeNode.jstree(true).settings.core.data = treeData;

    jstreeNode.jstree('refresh');
  };

  $scope.origData = null;
  var getTextsAndDrawTree = function getTextsAndDrawTree(func) {
    return $http.get('/api/v1/i18n/texts').then(function (res) {
      $scope.origData = res.data;
      func($scope.origData);
    })['catch'](function (err) {
      window.alert(err);
    });
  };
  getTextsAndDrawTree(initJsTree);

  var jstreeToJson = function jstreeToJson() {
    var tops = $('#textTree').jstree('get_json', '#');
    var dfs = function dfs(root) {
      if (root.children.length === 0) {
        // this is leaf
        return root.data;
      }
      var res = {};
      root.children.forEach(function (child) {
        res[nodeToKey[child.id]] = dfs(child);
      });
      return res;
    };
    return dfs({ children: tops });
  };
  $scope.save = function () {
    // 2016. 05. 31. [heekyu] do not update all but only activeNode
    var nodeFullPath = '';
    var node = $scope.activeNode;
    while (node.id !== '#') {
      nodeFullPath = '' + nodeToKey[node.id] + (nodeFullPath ? '.' : '') + nodeFullPath;
      node = jstreeNode.jstree('get_node', node.parent);
    }
    $http.put('/api/v1/i18n/texts', {
      path: nodeFullPath,
      data: $scope.activeNode.data
    }).then(function () {
      $scope.activeKey = nodeFullPath;
      $scope.activeNode = null;
      getTextsAndDrawTree(redraw).then(function () {
        jstreeNode.jstree('select_node');
      });
    });
    /*
    const data = jstreeToJson();
    const keys = Object.keys(data);
    const promises = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      promises.push($http.put('/api/v1/i18n/texts', { path: key, data: data[key] }));
    }
    $q.all(promises).then(() => {
      getTextsAndDrawTree(redraw);
      // 2016. 02. 29. [heekyu] activeNode is changed when redraw
      //                TODO maintain activeNode
      $scope.activeNode = null;
    });
    */
  };

  $scope.changeTextEditLocale = function (locale) {
    $rootScope.changeEditLocale(locale);
    redraw();
  };

  $scope.searchNode = function (text) {
    var selectIfMatch = function selectIfMatch(nodeId) {
      var node = jstreeNode.jstree('get_node', nodeId);
      for (var j = 0; j < $rootScope.state.locales.length; j++) {
        var locale = $rootScope.state.locales[j];
        if (node.data[locale] === text) {
          jstreeNode.jstree('deselect_all');
          jstreeNode.jstree('select_node', nodeId);
          $('body').stop();
          $('body').animate({ scrollTop: $('#' + nodeId).offset().top }, 500);
          return true;
        }
      }
      return false;
    };
    var nodeIds = Object.keys(nodeToKey);
    for (var i = 0; i < nodeIds.length; i++) {
      var nodeId = nodeIds[i];
      if (!$scope.activeNode || $scope.activeNode.id < nodeId) {
        if (selectIfMatch(nodeId)) {
          return;
        }
      }
    }
    if ($scope.activeNode) {
      for (var i = 0; i < nodeIds.length; i++) {
        var nodeId = nodeIds[i];
        if ($scope.activeNode.id > nodeId) {
          if (selectIfMatch(nodeId)) {
            return;
          }
        }
      }
    }
  };
  $scope.onSearchKeyPress = function (event, searchText) {
    if (event.keyCode === 13) {
      $scope.searchNode(searchText);
    }
  };
});
}, {"./module":13}],
15: [function(require, module, exports) {
'use strict';

var userModule = angular.module('backoffice.user', ['ui.router', require('../third_party/angular-translate')]);

module.exports = userModule;

userModule.config(function ($translateProvider) {
  $translateProvider.translations('en', require('./i18n/translations.en.json')).translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

userModule.config(function ($stateProvider) {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  var templateRoot = 'templates/metronic';

  $stateProvider.state('user', {
    abstract: true,
    url: '/user',
    template: '<ui-view/>'
  }).state('user.manage', {
    url: '/manage',
    templateUrl: templateRoot + '/user/manage.html',
    controller: 'UserManageController'
  }).state('user.comment', {
    url: '/comment',
    templateUrl: templateRoot + '/user/comment.html',
    controller: 'UserCommentController'
  }).state('user.review', {
    url: '/review',
    templateUrl: templateRoot + '/user/review.html',
    controller: 'UserReviewController'
  }).state('user.manage.tab', {
    url: '/:tabName',
    templateUrl: templateRoot + '/user/manage.html',
    controller: 'UserManageController'
  }).state('user.info', {
    url: '/info/:userId',
    templateUrl: templateRoot + '/user/info.html',
    controller: 'UserInfoController',
    resolve: {
      user: function user($http, $stateParams) {
        return $http.get('/api/v1/users/' + $stateParams.userId).then(function (res) {
          return res.data;
        });
      }
    }
  }).state('user.waitConfirm', {
    url: '/wait_confirm',
    templateUrl: templateRoot + '/user/wait-confirm.html',
    controller: 'UserWaitConfirmController'
  });
});

var spyderBuyerLevel = {
  1: '베이직',
  2: '실버',
  3: '골드',
  4: 'VIP'
};
var buyerNameMap = {
  admin: '어드민',
  buyer: '유저',
  manager: '매니저',
  'team-spyder': '팀스파이더',
  staff: '직원'
};
userModule.factory('userUtil', function () {
  return {
    getRoleName: function getRoleName(user) {
      return (user.roles || []).map(function (role) {
        return buyerNameMap[role.type] || role.type;
      }).join(',');
    },
    getBuyerLevel: function getBuyerLevel(user) {
      for (var i = 0; i < (user.roles || []).length; i += 1) {
        var role = user.roles[0];
        if (role.type === 'buyer') {
          var level = role.level || 1;
          return level;
        }
      }
      return '';
    },
    spyderBuyerLevel: spyderBuyerLevel
  };
});

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../third_party/angular-translate":14,"./i18n/translations.en.json":51,"./i18n/translations.ko.json":52,"./controllers.js":53}],
51: [function(require, module, exports) {
module.exports = {

};
}, {}],
52: [function(require, module, exports) {
module.exports = {
  "user": {
    "createUser": {
      "admin": "어드민 생성",
      "user": "유저 생성",
      "seller": "셀러 생성"
    },
    "manage": {
      "adminTab": "어드민",
      "bigBuyerTab": "빅바이어",
      "buyerTab": "바이어",
      "noRoleTab": "미인증",
      "sellerTab": "셀러",
      "godoTab": "고도몰",
      "inactiveTab": "비활성",
      "title": "사용자"
    },
    "info": {
      "bizNameLabel": "사업자명",
      "bizNumberLabel": "사업자 번호",
      "emailLabel": "이메일",
      "firstNameLabel": "이름",
      "lastNameLabel": "성",
      "gradeLabel": "회원 등급",
      "creditLabel": "마일리지",
      "vbankCodeLabel": "은행코드",
      "vbankAccountLabel": "가상계좌번호",
      "changePasswordButton": "비밀번호 변경",
      "isConfirmed": "인증 여부",
      "title": "유저 정보",
      "telLabel": "전화번호",
      "userTypeLabel": "유저 종류",
      "editRoleButton": "권한 변경",
      "userDetailButton": "유저 상세 정보",
      "settlementAliasLabel": "회계팀 약어",
      "signupMemoLabel": "중국 가입자 메모",
      "orderNameLabel": "주문명"
    },
    "waitConfirm": {
      "title": "바이어 인증 대기"
    },
    "role": {
      "changeTitle": "유저 권한 변경"
    }
  }
}
;
}, {}],
53: [function(require, module, exports) {
'use strict';

var userModule = require('./module');

userModule.controller('UserManageController', function ($scope, $http, $q, $state, $rootScope, $translate, $compile, userUtil, boUtils) {
  $scope.contentTitle = $translate.instant('user.manage.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'user.manage',
    name: $translate.instant('user.manage.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  boUtils.initDateBetween($('#user_start_date'), $('#user_end_date'), $state, 'state.userMain');
  /*
  $('#user_start_date').datepicker({ autoclose: true });
  $('#user_end_date').datepicker({ autoclose: true });
  $('#user_start_date').on('change', (e) => {
    _.set($rootScope, 'state.userMain.startDate', $('#user_start_date').val());
    $state.reload();
    // reloadDatatables();
  });
  $('#user_end_date').on('change', (e) => {
    _.set($rootScope, 'state.userMain.endDate', $('#user_end_date').val());
    $state.reload();
    // reloadDatatables();
  });
  */

  $scope.fnUrlParams = function (urlParams) {
    var queryParams = {};
    // 2016. 06. 22. [heekyu] start, end is common for all datatables
    var startDate = _.get($rootScope.state, 'userMain.startDate');
    var endDate = _.get($rootScope.state, 'userMain.endDate');
    if (startDate && endDate) {
      var start = new Date(startDate);
      var end = new Date(endDate);
      var diff = end.getTime() - start.getTime();
      if (diff >= 0) {
        queryParams.start = startDate;
        queryParams.end = endDate;
      } else {
        window.alert('시작 날짜가 종료 날짜와 같거나 더 작아야 합니다');
      }
    }
    _.merge(urlParams, queryParams);
  };

  $scope.tabName = $state.params.tabName || '';
  $scope.changeTab = function (tabName) {
    if (!tabName) {
      $state.go('user.manage', {}, { reload: true });
      return;
    }
    $state.go('user.manage.tab', { tabName: tabName }, { reload: true });
  };
  $scope.userIdMap = {};

  $scope.userDatatables = {
    field: 'users',
    storeKey: 'userMain',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: function data(_data) {
        return _data.email || '';
      }
    }, {
      data: function data(_data2) {
        return _data2;
      },
      render: function render(user) {
        return userUtil.getRoleName(user);
      }
    }, {
      // edit role button
      data: 'id',
      render: function render(id) {
        return '<button class="btn blue" data-ng-click="openRolePopup(' + id + ')"><i class="fa fa-wrench"></i> ' + $translate.instant('user.info.editRoleButton') + '</button>';
      }
    }, {
      // show user info button
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })"><button class="btn blue"><i class="fa fa-info"></i> ' + $translate.instant('user.info.userDetailButton') + '</button></a>';
      }
    }, {
      data: 'id',
      render: function render(id) {
        return '<button class="btn blue" data-ng-click="openPasswordPopup(' + id + ')"><i class="fa fa-password"></i> ' + $translate.instant('user.info.changePasswordButton') + '</button>';
      }
    }, {
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }, {
      data: 'lastLoginAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }, {
      data: function data(_data3) {
        return _data3;
      },
      render: function render(user) {
        $scope.userIdMap[user.id] = user;
        return '<button class="btn red" data-ng-click="inactivateUser($event, ' + user.id + ')">비활성화</button>';
      }
    }]
  };

  $scope.onChangeUserGrade = function (e) {
    console.log(e);
  };

  $scope.buyerDatatables = {
    field: 'users',
    storeKey: 'userBuyer',
    // ID, Email, Name, tel, bizName, bizNumber
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: function data(_data4) {
        return _.get(_data4, 'userId', '');
      }
    }, {
      data: function data(_data5) {
        return _.get(_data5, 'email', '');
      }
    }, {
      data: function data(_data6) {
        return _data6.name || '';
      }
    }, {
      data: function data(_data7) {
        return _.get(_data7, 'data.tel') || '';
      }
    }, {
      data: function data(_data8) {
        return ' ' + userUtil.spyderBuyerLevel[userUtil.getBuyerLevel(_data8)] + ' ' + (_data8.data.as_comb === 'Y' ? '(통합)' : '--') || '';
      }
    }, {
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }]
  };
  $scope.adminDatatables = {
    field: 'users',
    storeKey: 'userAdmin',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: function data(_data9) {
        return _.get(_data9, 'userId', '');
      }
    }, {
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }]
  };

  $scope.registerCoupon = function () {
    e.preventDefault();
    console.log('test');
  };

  $scope.couponDatatables = {
    field: 'rows',
    storeKey: 'coupon',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: function data(_data10) {
        return _.get(_data10, 'userId', '');
      }
    }, {
      data: function data(_data11) {
        return _.get(_data11, 'total', '');
      }
    }, {
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }, {
      data: function data(_data12) {
        return _data12;
      },
      render: function render(data) {
        return '<input type="text" />';
      }
    }, {
      data: function data(_data13) {
        return _data13;
      },
      render: function render(data) {
        return '<button class="btn blue" data-ng-click="registerCoupon($event)">쿠폰지급</button>';
      }
    }]
  };

  $scope.sellerDatatables = {
    field: 'users',
    storeKey: 'userSeller',
    // ID, Email, Name, tel
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: function data(_data14) {
        return _.get(_data14, 'roles[0].brand.id') || '';
      },
      render: function render(brandId) {
        return '<a ui-sref="brand.edit({ brandId: ' + brandId + ' })">' + brandId + '</a>';
      }
    }, {
      data: 'email'
    }, {
      data: function data(_data15) {
        return _data15.name || '';
      }
    }, {
      data: function data(_data16) {
        return _.get(_data16, 'data.tel') || '';
      }
    }, {
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }]
  };

  $scope.noRoleDatatables = {
    field: 'users',
    storeKey: 'userNoRole',
    // ID, Email, Name, tel, bizName, bizNumber, bizImage, changeToBuyer(action)
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: 'email'
    }, {
      data: function data(_data17) {
        return _data17.name || '';
      }
    }, {
      data: function data(_data18) {
        return _.get(_data18, 'data.tel') || '';
      }
    }, {
      data: function data(_data19) {
        return _.get(_data19, 'data.bizName') || '';
      }
    }, {
      data: function data(_data20) {
        return _.get(_data20, 'data.bizNumber') || '';
      }
    }, {
      data: function data(_data21) {
        return _data21;
      },
      render: function render(user) {
        return _.get(user, 'data.bizImage') ? '<button class="btn blue" data-ng-click="openBizImage(' + user.id + ')">사업자 등록증 보기</button>' : '';
      }
    }, {
      data: function data(_data22) {
        return _data22;
      },
      // render: (user) => `<button class="btn blue" data-ng-click="changeToBuyer(${user.id})">바이어 인증</button>`,
      render: function render(user) {
        return '<button class="btn blue" data-ng-click="openBuyerApproval(' + user.id + ')">바이어 인증</button>';
      }
    }, {
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }]
  };

  $scope.inactiveDatatables = {
    field: 'users',
    storeKey: 'userInactive',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: 'email'
    }, {
      data: function data(_data23) {
        return _data23.name || '';
      }
    }, {
      data: function data(_data24) {
        return _.get(_data24, 'data.tel') || '';
      }
    }, {
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }, {
      data: function data(_data25) {
        return _data25;
      },
      render: function render(user) {
        $scope.userIdMap[user.id] = user;
        return '<button class="btn blue" data-ng-click="activateUser($event, ' + user.id + ')">활성화</button>';
      }
    }]
  };

  $scope.openBizImage = function (userId) {
    $scope.activeUser = $scope.userIdToData[userId];
    $('#user_biz_image').modal();
  };

  $scope.changeToBuyer = function (userId) {
    $http.post('/api/v1/users/' + userId + '/roles', { roleType: 'buyer' }).then(function () {
      window.alert('바이어 인증이 완료되었습니다');
      $state.reload();
    });
  };

  $scope.newUser = {};
  $scope.createUser = function (user) {
    $http.post('/api/v1/users', user).then(function (res) {
      ($scope.newUserRole ? $http.post('/api/v1/users/' + res.data.id + '/roles', $scope.newUserRole) : $q.when(true)).then(function () {
        $scope.closeUserPopup();
        $state.reload();
      })['catch'](function (err) {
        window.alert(err.data.message);
      });
    }, function (err) {
      window.alert(err.data.message);
    });
  };
  $scope.closeUserPopup = function () {
    // 2016. 02. 23. [heekyu] modal hide is not work on page reload
    $('#user_manage_create_user').modal('hide');
    $('#user_manage_create_user').removeClass('in');
    $('.modal-backdrop').remove();
  };

  $scope.editRole = { admin: false, buyer: false, bigBuyer: false, seller: false };
  // former item has more priority
  var roles = ['admin', 'buyer', 'team-spyder', 'manager', 'staff'];
  $scope.makeUserRolePopupData = function (user) {
    var res = { admin: false, buyer: false, 'team-spyder': false };
    if (user.roles) {
      var _loop = function (i) {
        var role = user.roles[i];
        roles.forEach(function (item) {
          if (role.type === item) {
            res[item] = true;
          }
        });
      };

      for (var i = 0; i < user.roles.length; i++) {
        _loop(i);
      };
    }
    $scope.editRole = res;
  };
  $scope.closeRolePopup = function () {
    $('#user_change_role').modal('hide');
    $('#user_change_role').removeClass('in');
    $('.modal-backdrop').remove();
  };
  $scope.newUserPopup = {};
  $scope.newUseris = function (role) {
    $scope.newUserPopup.name = $translate.instant('user.createUser.' + (role || 'user'));
    if (role) {
      $scope.newUserRole = { roleType: role };
    } else {
      $scope.newUserRole = null;
    }
  };

  $scope.openRolePopup = function (userId) {
    var user = $scope.userIdToData[userId];
    $scope.editRoleUser = user;
    $scope.makeUserRolePopupData(user);
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $('#user_change_role').modal();
  };

  $scope.changePasswordUser = null;
  $scope.openPasswordPopup = function (userId) {
    var user = $scope.userIdToData[userId];
    $scope.changePasswordUser = user;
    $('#user_change_password').modal();
  };
  $scope.closePasswordPopup = function () {
    $('#user_change_password').modal('hide');
  };
  $scope.savePassword = function () {
    var user = $scope.changePasswordUser;
    if (!user.password) {
      window.alert('비밀번호를 입력하세요');
      return;
    }
    var password = user.password;
    delete user.password;
    $http.put('/api/v1/users/' + user.id + '/reset_password', { password: password }).then(function () {
      window.alert('비밀번호 저장되었습니다');
      $scope.closePasswordPopup();
    }, function () {
      window.alert('비밀번호 저장이 실패하였습니다.');
    });
  };
  $scope.datatablesLoaded = function () {
    var datas = $('.tabbable-bordered').find('table').DataTable().rows().data();
    if (!$scope.userIdToData) {
      $scope.userIdToData = {};
    }
    for (var i = 0; i < datas.length; i++) {
      var data = datas[i];
      $scope.userIdToData[data.id] = data;
    }
    $compile(angular.element($('table')))($scope);
  };

  var hasRole = function hasRole(userId, roleType) {
    var user = $scope.userIdToData[userId];
    var userRole = user.roles || [];
    for (var i = 0; i < userRole.length; i++) {
      var role = userRole[i];
      if (role.type === roleType) {
        return true;
      }
    }
    return false;
  };

  // 2016. 02. 23. [heekyu] this is very limited since server cannot handle race condition properly
  $scope.saveRole = function () {
    var editRoleToData = function editRoleToData() {
      var arr = [];
      for (var i = 0; i < roles.length; i++) {
        var role = roles[i];
        if ($scope.editRole[role]) {
          var obj = { type: role };
          if (role === 'buyer') {
            obj.grede = '베이직';
          }
          arr.push(obj);
        }
      }
      return arr;
    };
    var newRoleData = editRoleToData();
    if (!newRoleData && !$scope.editRoleUser.roles) {
      return;
    }
    var url = '/api/v1/users/' + $scope.editRoleUser.id + '/roles';
    var promise = Promise.resolve('');
    ($scope.editRoleUser.roles || []).forEach(function (userRole) {
      var found = false;
      for (var i = 0; i < (newRoleData || []).length; i += 1) {
        var newRole = newRoleData[i];
        if (newRole.type === userRole.type) {
          found = true;
          break;
        }
      }
      if (!found) {
        // delete case
        promise = promise.then(function () {
          return $http['delete'](url, { data: { type: userRole.type }, headers: { "Content-Type": "application/json;charset=utf-8" } });
        });
      }
    });
    (newRoleData || []).forEach(function (newRole) {
      var found = false;
      for (var i = 0; i < ($scope.editRoleUser.roles || []).length; i += 1) {
        var userRole = $scope.editRoleUser.roles[i];
        if (userRole.type === newRole.type) {
          found = true;
          break;
        }
      }
      if (!found) {
        // add case
        promise = promise.then(function () {
          return $http.post(url, { roleType: newRole.type });
        });
      }
    });
    promise.then(function () {
      $scope.closeRolePopup();
      $state.reload();
    })['catch'](function (err) {
      window.alert(err.message);
      throw err;
    });
  };

  $scope.inactivateUser = function (e, userId) {
    e.preventDefault();
    var user = $scope.userIdMap[userId];
    if (window.confirm('유저 ' + (user.name || '') + ' 비활성화 하시겠습니까?')) {
      $http['delete']('/api/v1/users/' + user.id + '/inactivate').then(function () {
        user.isActive = !user.isActive;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        $('.tabbable-bordered').find('table').DataTable().ajax.reload();
      }, function () {
        window.alert('fail');
      });
    }
  };

  $scope.activateUser = function (e, userId) {
    e.preventDefault();
    var user = $scope.userIdMap[userId];
    if (window.confirm('유저 ' + (user.name || '') + ' 다시 활성화 하시겠습니까?')) {
      user.data.state = '';
      $http.put('/api/v1/users/' + user.id, { isActive: true, data: user.data }).then(function () {
        /*
        user.isActive = !user.isActive;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        */
        $('.tabbable-bordered').find('table').DataTable().ajax.reload();
      }, function () {
        window.alert('fail');
      });
    }
  };

  $scope.openBuyerApproval = function (userId) {
    $scope.buyerApprovalUser = $scope.userIdToData[userId];
    $('#user_buyer_approval').modal();
  };
  $scope.closeBuyerApproval = function () {
    // 2016. 02. 23. [heekyu] modal hide is not work on page reload
    $('#user_buyer_approval').modal('hide');
    $('#user_buyer_approval').removeClass('in');
    $('.modal-backdrop').remove();
  };

  $scope.approveUser = function (user) {
    if (!user.message) {
      window.alert('승인 사유를 입력해 주세요');
      return;
    }
    var body = {
      result: 'approval',
      message: user.message
    };
    $http.post('/api/v1/users/' + user.id + '/approve', body).then(function () {
      window.alert(user.name + ' 승인 완료되었습니다');
      $scope.closeBuyerApproval();
      $state.reload();
    });
  };

  $scope.rejectUser = function (user) {
    if (!user.message) {
      window.alert('거절 사유를 입력해 주세요');
      return;
    }
    var body = {
      result: 'rejection',
      message: user.message
    };
    $http.post('/api/v1/users/' + user.id + '/approve', body).then(function () {
      window.alert(user.name + ' 반려 되었습니다');
      $scope.closeBuyerApproval();
      $state.reload();
    });
  };
});

userModule.controller('UserWaitConfirmController', function ($scope, $state, $rootScope, $translate) {
  $scope.contentTitle = $translate.instant('user.waitConfirm.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'user.manage',
    name: $translate.instant('user.manage.title')
  }, {
    sref: 'user.waitConfirm',
    name: $translate.instant('user.waitConfirm.title')
  }];
  $rootScope.initAll($scope, $state.current.name);
});

userModule.controller('UserInfoController', function ($scope, $http, $state, $rootScope, $translate, user, boUtils, userUtil, convertUtil) {
  $scope.contentTitle = $translate.instant('user.info.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'user.manage',
    name: $translate.instant('user.manage.title')
  }, {
    sref: 'user.waitConfirm',
    name: $translate.instant('user.info.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  var renderUserInfo = function renderUserInfo() {
    $scope.userFields = [{ title: 'ID', key: 'id', obj: $scope.user.id, isReadOnly: true, isRequired: true }, { title: '유저 아이디', key: 'userId', obj: $scope.user.userId, isReadOnly: true, isRequired: true }, { title: '통합여부', key: 'comb', obj: $scope.user.data.as_comb ? '통합' : '--', isReadOnly: true, isRequired: false }, { title: 'state', key: 'state', obj: $scope.user.data.state, isReadOnly: true }, { title: $translate.instant('user.info.emailLabel'), obj: $scope.user.email, key: 'email', isReadOnly: true, isRequired: true },
    // {title: $translate.instant('user.info.lastNameLabel'), obj: _.get($scope.user, 'data.lastName'), isReadOnly: true, isRequired: true},
    { title: $translate.instant('user.info.firstNameLabel'), obj: $scope.user.name, key: 'name', isRequired: true }, { title: '마일리지', obj: _.get($scope.user, 'credit', 0), isReadOnly: true },
    // {title: 'SMS 마케팅 동의', obj: _.get($scope.user, 'data.isAgreeSMS'), isReadOnly: true, isRequired: false },
    { title: $translate.instant('user.info.userTypeLabel'), obj: userUtil.getRoleName($scope.user), isReadOnly: true, isRequired: false }, { title: $translate.instant('user.info.telLabel'), obj: _.get($scope.user, 'data.tel'), key: 'data.tel', isRequired: false }, { title: '국가번호', obj: _.get($scope.address, 'countryCode'), isRequired: true, key: 'countryCode' }, { title: '우편번호', obj: $scope.user.data.as_comb ? _.get($scope.user.erpData, 'zpc1') : _.get($scope.address, 'detail.postalCode'), isRequired: true, isReadOnly: true }, { title: '주소', obj: $scope.user.data.as_comb ? _.get($scope.user.erpData, 'addr') : _.get($scope.address, 'detail.address1'), isRequired: true, isReadOnly: true }, { title: '상세주소', obj: $scope.user.data.as_comb ? _.get($scope.user.erpData, 'adrs') : _.get($scope.address, 'detail.address2'), isRequired: true, isReadOnly: true }];
  };

  // {title: '생년', },
  var init = function init(user) {
    user.lastLoginAt = boUtils.formatDate(user.lastLoginAt);
    $scope.user = user;

    if ($scope.user.addressId) {
      $http.get('/api/v1/users/' + $scope.user.id + '/addresses/' + $scope.user.addressId).then(function (res) {
        $scope.address = res.data;
        renderUserInfo();
      });
    }

    renderUserInfo();

    var level = userUtil.getBuyerLevel($scope.user);
    if (level) {
      $scope.levelObj = level;
    }
    $scope.selectedCouponType = 1;
  };
  init(user);

  $scope.noteType = {
    0: '-',
    100: '승인',
    101: '거절',
    200: '회원탈퇴(비활성)'
  };
  $http.get('/api/v1/users/' + user.id + '/logs').then(function (res) {
    res.data.logs.forEach(function (l) {
      l.createdAt = boUtils.formatDate(l.createdAt);
      if (l.type === 200 && l.data) {
        l.data.message = '' + (l.data.reason || '') + (l.data.reason && l.data.text ? ',' : '') + (l.data.text || '');
      }
    });
    $scope.notes = res.data.logs.sort(function (a, b) {
      return a.id < b.id;
    });
  });
  $scope.changeGrade = function (newLevel) {
    var data = { level: newLevel };
    $http.post('/api/v1/users/' + $scope.user.id + '/level', data).then(function () {
      window.alert('회원 등급이 변경되었습니다');
      $state.reload();
    })['catch'](function () {
      window.alert('[FAIL] 회원 등급 변경 요청이 실패하였습니다');
    });
  };
  $scope.forceIntegrate = function () {
    $http.post('/api/v1/users/' + $scope.user.id + '/erp').then(function () {
      window.alert('통합되었습니다.');
      $state.reload();
    })['catch'](function () {
      window.alert('통합실패하였습니다.');
    });
  };
  $scope.openCreditPopup = function () {
    $scope.creditUser = $scope.user;
    $('#user_credit').modal();
  };
  $scope.closeCreditPopup = function () {
    var node = $('#user_credit');
    node.modal('hide');
    node.removeClass('in');
    $('.modal-backdrop').remove();
  };
  $scope.changeCredit = function (amount) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];

    var user = $scope.creditUser;
    var url = '/api/v1/users/' + user.id + '/credits';
    if (amount > 0) {
      if (!window.confirm('마일리지 ' + amount + '점이 추가됩니다.')) {
        return;
      }
      $http.post(url, { value: amount, type: type }).then(function () {
        $scope.closeCreditPopup();
        $state.reload();
      }, function (err) {
        window.alert('마일리지 추가 요청이 실패하였습니다.');
        throw err;
      });
    } else if (amount < 0) {
      if (!window.confirm('마일리지 ' + -amount + '점을 사용합니다')) {
        return;
      }
      $http['delete'](url, {
        data: { value: -amount },
        headers: { "Content-Type": "application/json;charset=utf-8" }
      }).then(function () {
        $scope.closeCreditPopup();
        $state.reload();
      }, function (err) {
        window.alert('마일리지 사용 요청이 실패하였습니다.');
        throw err;
      });
    }
  };
  $scope.save = function () {
    convertUtil.copyFieldObj($scope.userFields, $scope.user);
    $http.put('/api/v1/users/' + $scope.user.id, _.pick($scope.user, 'data', 'inipay', 'name')).then(function (res) {
      // init(res.data);
    });

    if ($scope.user.addressId) {
      $http.put('/api/v1/users/' + $scope.user.id + '/addresses/' + $scope.user.addressId, _.pick($scope.user, 'countryCode', 'detail')).then(function (res) {
        // init(res.data);
        $state.go('user.manage');
      });
    } else {
      $http.post('/api/v1/users/' + $scope.user.id + '/addresses', _.pick($scope.user, 'countryCode', 'detail')).then(function (res) {
        // init(res.data);
        $state.go('user.manage');
      });
    }
  };

  $scope.openBizImage = function () {
    $('#user_biz_image').modal();
  };

  $scope.addNote = function (message) {
    $http.post('/api/v1/users/' + user.id + '/logs', {
      type: 0,
      data: { message: message }
    }).then(function (res) {
      $state.reload();
    });
  };

  $http.get('/api/v1/coupons').then(function (res) {
    $scope.couponTypes = res.data.coupons;
  });

  $http.get('/api/v1/users/' + user.id + '/allCoupons').then(function (res) {
    res.data.userCoupons.forEach(function (l) {
      l.createdAt = boUtils.formatDate(l.createdAt, true);
      if (l.status === 1) l.status = '사용가능';else if (l.status === 2) l.status = '사용됨';else if (l.status === 3) l.status = '만기됨';
    });
    $scope.coupons = res.data.userCoupons.sort(function (a, b) {
      return a.id < b.id;
    });
  });

  $scope.addCoupon = function () {
    $http.post('/api/v1/coupons/' + $scope.selectedCouponType + '/generateAndRegister', {
      userId: user.id
    }).then(function (res) {
      $state.reload();
    });
  };

  $scope.removeCoupon = function (uid) {
    window.alert('선택한 쿠폰을 삭제하시겠습니까?');
    $http['delete']('/api/v1/users/' + user.id + '/coupons/' + uid).then(function (res) {
      $state.reload();
    });
  };

  $scope.grades = Object.keys(userUtil.spyderBuyerLevel).map(function (level) {
    return { label: userUtil.spyderBuyerLevel[level], value: level };
  });

  $('#image-upload-button').on('change', function (changeEvent) {
    boUtils.startProgressBar();
    var r = new FileReader();
    r.onload = function (e) {
      boUtils.uploadImage(e.target.result, 'user/' + ($scope.user.id || 'none') + '/' + new Date().getTime()).then(function (res) {
        boUtils.stopProgressBar();
        var uploaded = {
          url: res.url.slice(5),
          publicId: res.public_id,
          version: res.version
        };
        _.set($scope.user, 'data.bizImage', uploaded);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, function () {
        window.alert('image upload fail');
        boUtils.stopProgressBar();
      });
    };
    r.readAsDataURL(changeEvent.target.files[0]);
  });
});

userModule.controller('UserCommentController', function ($scope, $http, $state, $rootScope, $translate, $compile, boUtils) {
  $scope.contentTitle = $translate.instant('user.info.title');
  $rootScope.initAll($scope, $state.current.name);

  $scope.datatablesLoaded = function () {
    $compile(angular.element($('table')))($scope);
  };

  $scope.deleteComment = function (id) {
    $http['delete']('/api/v1/comments/bo/' + id).then(function (res) {
      $state.reload();
    });
  };

  $scope.commentDatatables = {
    field: 'comments',
    columns: [{
      data: 'id'
    }, {
      data: 'productId'
    }, {
      data: 'userId',
      render: function render(userId) {
        return '<a ui-sref="user.info({ userId: ' + userId + ' })">' + userId + '</a>';
      }
    }, {
      data: function data(_data26) {
        return _data26.data.text || '';
      }
    }, {
      data: function data(_data27) {
        return _data27;
      },
      render: function render(comment) {
        if (comment.data.hide && comment.data.hide === 1) {
          return '<button class="btn red" data-ng-click="deleteComment(' + comment.id + ')">SHOW</button>';
        } else {
          return '<button class="btn blue" data-ng-click="deleteComment(' + comment.id + ')">HIDE</button>';
        }
      }
    }]
  };
});
userModule.controller('UserReviewController', function ($scope, $http, $state, $rootScope, $translate, $compile, boUtils) {
  $scope.contentTitle = $translate.instant('user.info.title');
  $rootScope.initAll($scope, $state.current.name);

  $scope.datatablesLoaded = function () {
    $compile(angular.element($('table')))($scope);
  };

  $scope.deleteReview = function (id, productId) {
    $http['delete']('/api/v1/products/{productId}/' + id + '/reviews').then(function (res) {
      $state.reload();
    });
  };

  $scope.reviewDatatables = {
    field: 'reviews',
    columns: [{
      data: 'id'
    }, {
      data: 'productId'
    }, {
      data: 'userId',
      render: function render(userId) {
        return '<a ui-sref="user.info({ userId: ' + userId + ' })">' + userId + '</a>';
      }
    }, {
      data: function data(_data28) {
        return _data28.data.data.title || '';
      }
    }, {
      data: function data(_data29) {
        return _data29;
      },
      render: function render(review) {
        return '<button class="btn red" data-ng-click="deleteReview(' + review.id + ', ' + review.productId + ')">삭제</button>';
      }
    }]
  };
});
}, {"./module":15}],
16: [function(require, module, exports) {
module.exports = {

};
}, {}],
17: [function(require, module, exports) {
module.exports = {
  "main": {
    "mainMenu": "메인",
    "createButton": "추가",
    "closeButton": "닫기",
    "deleteButton": "삭제",
    "saveButton": "저장",
    "saveAndMainButton": "저장하고 메인으로 이동",
    "addImageButton": "이미지 추가",
    "login": {
      "title": "로그인",
      "backBtn": "뒤로",
      "forgetPasswordBtn": "비밀번호를 잊으셨나요?",
      "resetPasswordTitle": "비밀번호 재설정",
      "resetPasswordBtn": "비밀번호 재설정 이메일 발송"
    },
    "word": {
      "all": "전체",
      "createdAt": "생성일자",
      "email": "이메일",
      "name": "이름",
      "tel": "전화번호",
      "approval": "승인",
      "rejection": "거절"
    }
  }
};
}, {}]}, {}, {"1":""})