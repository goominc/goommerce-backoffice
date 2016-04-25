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

var mainModule = angular.module('backoffice.main', ['ui.router', 'ngCookies', require('../directives/module.js').name, require('../dashboard/module').name, require('../user/module').name, require('../product/module').name, require('../order/module').name, require('../brand/module').name, require('../currency/module').name, require('../cms/module').name, require('../text/module').name, require('../third_party/angular-translate')]).config(function ($translateProvider) {
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
    }, {
      key: 'product.batchUpload',
      name: $translate.instant('product.batchUpload.title'),
      sref: 'product.batchUpload'
    }, {
      key: 'product.imageUpload',
      name: $translate.instant('product.imageUpload.title'),
      sref: 'product.imageUpload'
    }]
  }, {
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
    }, {
      key: 'order.uncle',
      name: $translate.instant('order.uncle.title'),
      sref: 'order.uncle'
    }, {
      key: 'order.cs',
      name: $translate.instant('order.cs.title'),
      sref: 'order.cs'
    }]
  }, {
    key: 'user', // TODO get key from router
    name: $translate.instant('user.manage.title'),
    sref: 'user.manage',
    children: [{
      key: 'user.main',
      name: $translate.instant('main.mainMenu'),
      sref: 'user.manage'
    }, {
      key: 'user.waitConfirm',
      name: $translate.instant('user.waitConfirm.title'),
      sref: 'user.waitConfirm'
    }]
  }, {
    key: 'brand', // TODO get key from router
    name: $translate.instant('brand.title'),
    sref: 'brand.main'
  }, {
    key: 'cms', // TODO get key from router
    name: 'CMS',
    sref: 'cms.main_category',
    children: [{
      name: $translate.instant('cms.mainCategory'),
      sref: 'cms.main_category'
    }, {
      name: $translate.instant('cms.mainBanner'),
      sref: 'cms.simple({name: "pc_main_banner1"})'
    }, {
      name: $translate.instant('cms.subBanner'),
      sref: 'cms.simple({name: "pc_main_banner2"})'
    }]
  }, {
    key: 'currency', // TODO get key from router
    name: $translate.instant('currency.title'),
    sref: 'currency.main'
  }, {
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
  // 2016. 02. 15. [heekyu] app-wide state
  $rootScope.state = {
    auth: {},
    batchUploadedProducts: [],
    locales: ['ko', 'en', 'zh-cn', 'zh-tw'],
    editLocale: editLocale
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

  var editLocaleKey = 'editLocale';
  var editLocale = 'ko';
  if ($cookies.get(editLocaleKey)) {
    editLocale = $cookies.get(editLocaleKey);
  }

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
    for (var i = 0; i < $rootScope.state.locales.length; i++) {
      var locale = $rootScope.state.locales[i];
      if (locale === $rootScope.state.editLocale || 'ko') {
        return _.get($rootScope.state.texts[i], key);
      }
    }
  };

  // 2016. 02. 29. [heekyu] change locale in each page
  $rootScope.changeEditLocale = function (locale) {
    $rootScope.state.editLocale = locale;
    $cookies.put(editLocaleKey, locale);
  };
});

mainModule.controller('LoginModalController', function ($scope, $rootScope, $http, $cookies) {
  $scope.credential = {};

  $scope.doLogin = function () {
    var data = { email: $scope.credential.email, password: $scope.credential.password };
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
}, {"../directives/module.js":3,"../dashboard/module":4,"../user/module":5,"../product/module":6,"../order/module":7,"../brand/module":8,"../currency/module":9,"../cms/module":10,"../text/module":11,"../third_party/angular-translate":12,"./i18n/translations.en.json":13,"./i18n/translations.ko.json":14}],
3: [function(require, module, exports) {
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var directiveModule = angular.module('backoffice.directives', [require('../utils/module').name]);

module.exports = directiveModule;

directiveModule.factory('datatableCommons', function ($compile) {
  return {
    getOptions: function getOptions(scope, dataTables) {
      var options = {
        lengthMenu: [[10, 20, 50, 100, 150], [10, 20, 50, 100, 150]],
        // change per page values here
        pageLength: 50, // default record count per page
        // data: realData, need implement
        columns: dataTables.columns,
        order: dataTables.order || [[0, 'desc']], // set first column as a default sort by desc
        fnCreatedRow: function fnCreatedRow(nRow) {
          $compile(nRow)(scope);
        },
        fnRowCallback: function fnRowCallback(nRow, aData) {
          $(nRow).attr("id", aData.id);
        },
        orderCellsTop: true
      };
      if (dataTables.data) {
        options.data = dataTables.data;
      }
      if (dataTables.disableFilter) {
        options.bFilter = false;
      }
      return options;
    }
  };
});

directiveModule.directive('boDatatables', function ($http, $compile, $parse, datatableCommons) {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    link: function link(scope, elem, attr) {
      var dataTables = $parse(attr.boDatatables)(scope);
      var handleData = function handleData(realData) {
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
        elem.find('table').dataTable(options);
        if (dataTables.rowReorder) {
          table.rowReordering();
        }
        if (attr.directiveLoad && scope[attr.directiveLoad]) {
          scope[attr.directiveLoad]();
        }
      };
      if (dataTables.data) {
        handleData(dataTables.data);
      } else {
        $http.get(dataTables.url).then(function (res) {
          if (dataTables.field && dataTables.field !== '') {
            handleData(res.data[dataTables.field]);
          } else {
            handleData(res.data);
          }
        });
      }
    }
  };
});

directiveModule.directive('boServerDatatables', function ($http, $compile, datatableCommons, boUtils) {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    scope: {
      url: '@',
      urlParams: '=',
      boServerDatatables: '=',
      tableRender: '&'
    },
    link: function link(scope, elem) {
      var urlBase = scope.url;

      var dataTables = scope.boServerDatatables;
      var options = datatableCommons.getOptions(scope, dataTables);
      options.serverSide = true;
      options.ajax = function (data, callback, settings) {
        // console.log(data);
        var urlParams = _extends({}, scope.urlParams);
        urlParams.offset = data.start;
        urlParams.limit = data.length;
        if (data.search.value) {
          urlParams.q = data.search.value;
        }
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
            scope.tableRender();
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
}, {"../utils/module":15}],
15: [function(require, module, exports) {
'use strict';

var utilModule = angular.module('backoffice.utils', []);

utilModule.factory('boUtils', function ($http) {
  var isString = function isString(v) {
    return typeof v === 'string' || v instanceof String;
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
    formatDate: function formatDate(date) {
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      var yyyy = date.getFullYear().toString();
      function appendLeadingZeroIfNeeded(str) {
        if (str[1]) return str;
        return '0' + str;
      }
      var mm = appendLeadingZeroIfNeeded((date.getMonth() + 1).toString()); // getMonth() is zero-based
      var dd = appendLeadingZeroIfNeeded(date.getDate().toString());

      var HH = appendLeadingZeroIfNeeded(date.getHours().toString());
      var MM = appendLeadingZeroIfNeeded(date.getMinutes().toString());
      var SS = appendLeadingZeroIfNeeded(date.getSeconds().toString());
      return yyyy + '-' + mm + '-' + dd + ' ' + HH + ':' + MM + ':' + SS;
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
    getNameWithAllBuildingInfo: function getNameWithAllBuildingInfo(brand) {
      // format: 'Name (Building Floor FlatNumber)'
      var data = brand && brand.data;
      var name = brand && brand.name;
      if (!data || !name || !name.ko) {
        return '';
      }

      return name.ko + ' ( ' + _.get(brand, 'data.building.name') + ' ' + _.get(brand, 'data.building.floor') + ' ' + _.get(brand, 'data.building.flatNumber') + '호 )'; // eslint-disable-line
    },
    startProgressBar: function startProgressBar() {
      Metronic.blockUI({ target: '#bo-content-container', boxed: true });
    },
    stopProgressBar: function stopProgressBar() {
      Metronic.unblockUI('#bo-content-container');
    },
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
4: [function(require, module, exports) {
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
}, {"../third_party/angular-translate":12,"./i18n/translations.en.json":16,"./i18n/translations.ko.json":17,"./controllers.js":18}],
12: [function(require, module, exports) {
'use strict';

module.exports = require('angular-translate/bower-angular-translate@2.7.2:angular-translate.min.js');
}, {"angular-translate/bower-angular-translate@2.7.2:angular-translate.min.js":19}],
19: [function(require, module, exports) {
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
16: [function(require, module, exports) {
module.exports = {
  "dashboard": {
    "home": "홈"
  }
};
}, {}],
17: [function(require, module, exports) {
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
18: [function(require, module, exports) {
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
}, {"./module":4}],
5: [function(require, module, exports) {
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

userModule.factory('userUtil', function () {
  return {
    getRoleName: function getRoleName(user) {
      var role = _.get(user, 'roles[0]');
      return role ? role.type : '';
    }
  };
});

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../third_party/angular-translate":12,"./i18n/translations.en.json":20,"./i18n/translations.ko.json":21,"./controllers.js":22}],
20: [function(require, module, exports) {
module.exports = {

};
}, {}],
21: [function(require, module, exports) {
module.exports = {
  "user": {
    "createUser": {
      "admin": "어드민 생성",
      "seller": "셀러 생성"
    },
    "manage": {
      "title": "사용자"
    },
    "info": {
      "bizNameLabel": "사업자명",
      "bizNumberLabel": "사업자 번호",
      "emailLabel": "이메일",
      "gradeLabel": "회원 등급",
      "vbankCodeLabel": "은행코드",
      "vbankAccountLabel": "가상계좌번호",
      "changePasswordButton": "비밀번호 변경",
      "isConfirmed": "인증 여부",
      "title": "유저 정보",
      "telLabel": "전화번호",
      "userTypeLabel": "유저 종류",
      "editRoleButton": "권한 변경",
      "userDetailButton": "유저 상세 정보"
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
22: [function(require, module, exports) {
'use strict';

var userModule = require('./module');

userModule.controller('UserManageController', function ($scope, $http, $q, $state, $rootScope, $translate, $compile, userUtil) {
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

  $scope.userDatatables = {
    field: 'users',
    url: '/api/v1/users',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="user.info({ userId: ' + id + ' })">' + id + '</a>';
      }
    }, {
      data: 'email'
    }, {
      data: function data(_data) {
        return _data;
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
    }]
  };

  $scope.newUser = {};
  $scope.createUser = function (user) {
    $http.post('/api/v1/users', user).then(function (res) {
      $http.post('/api/v1/users/' + res.data.id + '/roles', $scope.newUserRole).then(function () {
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
  var roles = ['admin', 'bigBuyer', 'buyer'];
  $scope.makeUserRolePopupData = function (user) {
    var res = { admin: false, buyer: false, bigBuyer: false, seller: false };
    if (user.roles) {
      var _loop = function (i) {
        var role = user.roles[i];
        roles.forEach(function (item) {
          if (role.type === item) {
            res[item] = true;
          }
        });
        if (role.type === 'owner') {
          res.seller = true;
        }
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
    $scope.newUserPopup.name = $translate.instant('user.createUser.' + role);
    $scope.newUserRole = { roleType: role };
  };

  var userIdToData = {};

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
    var datas = $('#user_list').find('table').DataTable().rows().data();
    var children = $('#user_list').find('tbody').children();
    $scope.userIdToData = {};
    for (var i = 0; i < datas.length; i++) {
      var data = datas[i];
      $scope.userIdToData[data.id] = data;
    }
    $compile(angular.element($('table')))($scope);
  };

  // 2016. 02. 23. [heekyu] this is very limited since server cannot handle race condition properly
  $scope.saveRole = function () {
    var editRoleToData = function editRoleToData() {
      for (var i = 0; i < roles.length; i++) {
        var role = roles[i];
        if ($scope.editRole[role]) {
          return [{ type: role }];
        }
      }
      return null;
    };
    var newRoleData = editRoleToData();
    if (!newRoleData && !$scope.editRoleUser.roles) {
      return;
    }
    var addOrDelete = {};

    var isChangable = function isChangable(roleType) {
      for (var i = 0; i < roles.length; i++) {
        var role = roles[i];
        if (role === roleType) {
          return true;
        }
      }
      return false;
    };

    ($scope.editRoleUser.roles || []).forEach(function (role) {
      if (!isChangable(role.type)) {
        return;
      }
      if (addOrDelete[role.type]) {
        addOrDelete[role.type]--;
      } else {
        addOrDelete[role.type] = -1;
      }
    });
    (newRoleData || []).forEach(function (role) {
      if (!isChangable(role.type)) {
        return;
      }
      if (addOrDelete[role.type]) {
        addOrDelete[role.type]++;
      } else {
        addOrDelete[role.type] = 1;
      }
    });
    var url = '/api/v1/users/' + $scope.editRoleUser.id + '/roles';
    var keys = Object.keys(addOrDelete);
    var addRoles = [];
    var deleteRoles = [];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var count = addOrDelete[key];
      if (count === 1) {
        addRoles.push(key);
        // promises.push($http.post(url, { roleType: key }));
      } else if (count === -1) {
          deleteRoles.push(key);
          // promises.push($http.delete(url, { data: { type: key }, headers: {"Content-Type": "application/json;charset=utf-8"} }));
        }
    }
    if (deleteRoles.length > 0) {
      $http['delete'](url, { data: { type: deleteRoles[0] }, headers: { "Content-Type": "application/json;charset=utf-8" } }).then(function () {
        if (addRoles.length > 0) {
          $http.post(url, { roleType: addRoles[0] }).then(function () {
            $scope.closeRolePopup();
            $state.reload();
          })['catch'](function (err) {
            window.alert(err.message);
          });
        } else {
          $scope.closeRolePopup();
          $state.reload();
        }
      })['catch'](function (err) {
        window.alert(err.message);
      });
    } else if (addRoles.length > 0) {
      $http.post(url, { roleType: addRoles[0] }).then(function () {
        $scope.closeRolePopup();
        $state.reload();
      })['catch'](function (err) {
        window.alert(err.message);
      });
    } else {
      $scope.closeRolePopup();
    }
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

userModule.controller('UserInfoController', function ($scope, $http, $state, $rootScope, $translate, user, userUtil, convertUtil) {
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

  var init = function init(user) {
    $scope.user = user;

    $scope.userFields = [{ title: 'ID', key: 'id', obj: $scope.user.id, isReadOnly: true, isRequired: true }, { title: $translate.instant('user.info.emailLabel'), obj: $scope.user.email, key: 'email', isReadOnly: true, isRequired: true }, { title: $translate.instant('user.info.userTypeLabel'), obj: userUtil.getRoleName($scope.user), isReadOnly: true, isRequired: false }, { title: $translate.instant('user.info.telLabel'), obj: _.get($scope.user, 'data.tel'), key: 'data.tel', isRequired: false }, { title: $translate.instant('user.info.gradeLabel'), obj: _.get($scope.user, 'data.grade'), key: 'data.grade', isRequired: false }, { title: $translate.instant('user.info.bizNameLabel'), obj: _.get($scope.user, 'data.bizName'), key: 'data.grade', isRequired: false }, { title: $translate.instant('user.info.bizNumberLabel'), obj: _.get($scope.user, 'data.bizNumber'), key: 'data.grade', isRequired: false }, { title: $translate.instant('user.info.vbankCodeLabel'), obj: _.get($scope.user, 'inipay.vbank.bank'), key: 'inipay.vbank.bank', isRequired: false }, { title: $translate.instant('user.info.vbankAccountLabel'), obj: _.get($scope.user, 'inipay.vbank.vacct'), key: 'inipay.vbank.vacct', isRequired: false }];
  };
  init(user);

  $scope.save = function () {
    convertUtil.copyFieldObj($scope.userFields, $scope.user);
    $http.put('/api/v1/users/' + $scope.user.id, _.pick($scope.user, 'data', 'inipay')).then(function (res) {
      // init(res.data);
      $state.go('user.manage');
    });
  };

  $scope.openBizImage = function () {
    $('#user_biz_image').modal();
  };
});
}, {"./module":5}],
6: [function(require, module, exports) {
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
    url: '/main',
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
          window.alert(err.data);
        });
      }, function (err) {
        window.alert(err.data);
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
        });
      }, function (err) {
        window.alert(err.data);
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
      return _.pick(product, ['id', 'sku', 'KRW', 'categories', 'isActive', 'brand', 'data', 'appImages', 'name']);
    },
    narrowProductVariant: function narrowProductVariant(variant) {
      return _.pick(variant, ['id', 'productId', 'sku', 'KRW', 'data', 'appImages', 'status']);
    }
  };
});

// BEGIN module require js
require('./controllers/ProductMainController');
require('./controllers/ProductEditController');
require('./controllers/CategoryEditController');
require('./controllers/ProductBatchUploadController');
require('./controllers/ProductImageUploadController');
// END module require js
}, {"../third_party/angular-translate":12,"./i18n/translations.en.json":23,"./i18n/translations.ko.json":24,"./controllers/ProductMainController":25,"./controllers/ProductEditController":26,"./controllers/CategoryEditController":27,"./controllers/ProductBatchUploadController":28,"./controllers/ProductImageUploadController":29}],
23: [function(require, module, exports) {
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
24: [function(require, module, exports) {
module.exports = {
  "product": {
    "saveAndNewButton": "저장하고 새 상품 만들기",
    "main": {
      "title": "상품",
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
      "labelDeleteCategory": "삭제"
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
25: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

productModule.controller('ProductMainController', function ($scope, $http, $state, $rootScope, $translate, $compile, boConfig) {
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

  $scope.productDatatables = {
    field: 'products',
    // disableFilter: true,
    url: boConfig.apiUrl + '/api/v1/products/search',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="product.edit({productId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: function data(product) {
        return _.get(product, 'name.ko') || '';
      },
      orderable: false
    }, {
      data: function data(product) {
        return _.get(product, 'brand.name.ko') || '';
      },
      orderable: false
    }, {
      data: function data(product) {
        return product.sku || '';
      },
      orderable: false
    }, {
      data: 'id',
      orderable: false,
      render: function render(id) {
        return '<button data-ng-click="deleteProduct(' + id + ')" class="btn red"><i class="fa fa-remove"></i> ' + $translate.instant('main.deleteButton') + '</button>';
      }
    }]
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
});
}, {"../module.js":6}],
26: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

productModule.controller('ProductEditController', function ($scope, $http, $state, $rootScope, $translate, product, categories, productUtil, boUtils) {
  $scope.allColors = {
    B: ['Beige', 'Big Stripe', 'Black', 'Blue', 'Brown'],
    C: ['Camel', 'Charcoal', 'Check', 'Choco'],
    D: ['Dark Blue', 'Dark Grey', 'Denim'],
    G: ['Glossy Beige', 'Glossy Black', 'Glossy Silver', 'Gold', 'Green', 'Grey'],
    HIK: ['Hot Pink', 'Indigo', 'Ivory', 'Khaki'],
    L: ['Lavender', 'Light Beige', 'Light Grey', 'Light Khaki', 'Light Pink', 'Light Silver', 'Lime'],
    MN: ['Mint', 'Mustard', 'Navy'],
    OP: ['Oatmeal', 'Olive', 'Orange', 'Others', 'Peach', 'Pink', 'Purple'],
    RST: ['Red', 'Royal Blue', 'Silver', 'Sky Blue', 'Small Stripe', 'Suede Black', 'Taupe'],
    WY: ['White', 'Wine', 'Yellow']
  };
  $scope.colorKeys = Object.keys($scope.allColors);
  var getFeetSizes = function getFeetSizes(start, step, end) {
    var current = start;
    var res = [];
    while (current <= end) {
      res.push(current);
      current += step;
    }
    return res;
  };
  $scope.allSizes = {
    XXX: ['Free', 'XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
    Feet: getFeetSizes(225, 5, 290),
    '허리': getFeetSizes(25, 1, 32),
    '여자옷': getFeetSizes(44, 11, 88)
  };
  $scope.variantKinds = [{ name: '색상', key: 'color', groups: Object.keys($scope.allColors), groupMap: $scope.allColors }, { name: '크기', key: 'size', groups: Object.keys($scope.allSizes), groupMap: $scope.allSizes }];
  $scope.favoriteCategories = [{ name: '여성', categories: [{ name: '티셔츠', id: 53 }, { name: '원피스', id: 109 }, { name: '니트웨어', id: 77 }, { name: '스커트', id: 47 }, { name: '코트', id: 58 }] }, { name: '남성', categories: [{ name: '티셔츠', id: 184 }, { name: '셔츠', id: 185 }, { name: '바지', id: 187 }, { name: '자켓', id: 196 }, { name: '점퍼', id: 197 }] }];
  var kindsFromProductVariants = function kindsFromProductVariants(productVariants) {
    $scope.variantKinds.forEach(function (kind) {
      return kind.selected = new Set();
    });
    productVariants.forEach(function (variant) {
      if (!variant.sku) {
        return;
      }
      var split = variant.sku.split('-');
      if (split.length < 2) {
        return;
      }
      $scope.variantKinds[0].selected.add(split[split.length - 2]);
      $scope.variantKinds[1].selected.add(split[split.length - 1]);
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
  /*
   $scope.names = [
   {title: $translate.instant('product.edit.labelName.KO'), key: 'ko'},
   {title: $translate.instant('product.edit.labelName.EN'), key: 'en'},
   {title: $translate.instant('product.edit.labelName.ZH_CN'), key: 'zh-cn'},
   {title: $translate.instant('product.edit.labelName.ZH_TW'), key: 'zh-tw'},
   ];
   */
  $scope.inputFields = [
  // {title: 'SKU', key: 'sku', tmpKey: 'sku', placeholder: '00000-0000', isRequired: true},
  { title: 'name', key: 'name.ko', tmpKey: 'name', isRequired: true }];

  $scope.tmpObjToProduct = function () {
    for (var i = 0; i < $scope.inputFields.length; i++) {
      var field = $scope.inputFields[i];
      _.set($scope.product, field.key, $scope.tmpObj[field.tmpKey]);
    }
  };
  $scope.productToTmpObj = function () {
    for (var i = 0; i < $scope.inputFields.length; i++) {
      var field = $scope.inputFields[i];
      $scope.tmpObj[field.tmpKey] = _.get($scope.product, field.key);
    }
  };
  if ($scope.product.id) {
    $scope.productToTmpObj();
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
    var selected = $scope.variantKinds[index].selected;
    if (selected.has(attr)) {
      selected['delete'](attr);
    } else {
      selected.add(attr);
    }
    $scope.variantKinds[index].kinds = Array.from(selected);

    $scope.generateProductVariants();
    $scope.initImages();
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
        var newVariant = { sku: newVariantSKU, KRW: $scope.product.KRW, data: {} };
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
    if (!_.get($scope.product, 'brand.id')) {
      window.alert('select brand!');
      return new Promise(function (resolve, reject) {});
    }
    boUtils.startProgressBar();

    $scope.tmpObjToProduct();
    // $scope.imageToProduct();
    $scope.imageRowsToVariant();
    $scope.updateCategoryPath();
    if (!$scope.product.id) {
      return productUtil.createProduct($scope.product, $scope.productVariants).then(function (res) {
        boUtils.stopProgressBar();
        return res.product;
      }, function (err) {
        boUtils.stopProgressBar();
        window.alert('Product Create Fail' + err.data);
      });
    } else {
      return productUtil.updateProduct($scope.product, $scope.productVariants, $scope.origVariants).then(function (res) {
        boUtils.stopProgressBar();
        $scope.origVariants.clear();
        return res.product;
      }, function (err) {
        boUtils.stopProgressBar();
        console.log(err);
        window.alert('Product Update Fail' + err.data);
        $scope.origVariants.clear();
        return err;
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
      $scope.variantsByColor[color].share = isImageShared($scope.variantsByColor[color].variants);
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
    connectWith: '.image-container',
    placeholder: 'ui-state-highlight'
  };
  $scope.setProductMainImage = function () {
    if (!_.get($scope.product, 'appImages.default[0]') && _.get($scope, 'imageRows[0].images[0]')) {
      // TODO
      $scope.product.appImages = { 'default': [_.get($scope, 'imageRows[0].images[0]')] };
    }
  };
  $scope.imageRowsToVariant = function () {
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
        r.onload = function (e) {
          imageContents[i] = e.target.result;
          boUtils.uploadImage(e.target.result, 'tmp/product/P(' + ($scope.product.id || 'add') + ')-' + i + '-' + Date.now()).then(function (res) {
            uploaded[i] = {
              url: res.url.slice(5),
              publicId: res.public_id,
              version: res.version,
              mainImage: false,
              thumbnail: false
            };
            done++;
            if (done === len) {
              insertImages(uploaded);
              if (!$scope.$$phase) {
                $scope.$apply();
              }
              boUtils.stopProgressBar();
            }
          });
        };
        r.readAsDataURL(imageFiles[i]);
      };

      for (var i = 0; i < len; i++) {
        _loop2(i);
      }
    });
  };

  setTimeout(function () {
    addMultipleUploadListener();
    // 2016. 02. 29. [heekyu] I cannot find on load event doing this
    /*
    $('.product-image-trash').droppable({
      accept:'.image-container img',
      drop: function( event, ui ) {
        const row = $(event.srcElement).attr('row-index');
        const imgIndex = $(event.srcElement).attr('img-index');
        $scope.imageRows[row].images.splice(imgIndex, 1);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    });
    */
  }, 1000);
  // 2016. 02. 29. [heekyu] update image selecting UI
  /*
    $scope.images = [];
  
    $scope.generateImages = () => {
      $scope.images.length = 0;
      if ($scope.product.appImages && $scope.product.appImages.default && $scope.product.appImages.default.length > 0) {
        $scope.product.appImages.default.map((image) => {
          image.product = $scope.product;
          $scope.images.push(image);
        });
      }
      $scope.productVariants.map((productVariant) => {
        if (productVariant.appImages && productVariant.appImages.default && productVariant.appImages.default.length > 0) {
          productVariant.appImages.default.map((image) => {
            image.product = productVariant;
            $scope.images.push(image);
          });
        }
      });
    };
    $scope.generateImages();
    $scope.imageToProduct = () => {
      $scope.product.appImages = {default: []};
      $scope.productVariants.map((productVariant) => {
        productVariant.appImages = {default: []};
      });
      $scope.images.map((image) => {
        image.product.appImages.default.push(_.omit(image, 'product'));
      });
    };
  
    $scope.imageUploaded = (result) => {
      $scope.images.push({
        url: result.url.slice(5),
        publicId: result.public_id,
        version: result.version,
        product: $scope.product,
        mainImage: false,
        thumbnail: false,
      });
    };
   $scope.removeImage = (index) => {
   $scope.images.splice(index, 1);
   };
  */
  $scope.newProductVariant = { data: {} };
  $scope.addProductVariant = function (newProductVariant) {
    if (!newProductVariant.sku || newProductVariant.sku === '') {
      window.alert('sku must be valid string');
      return;
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
    $scope.newProductVariant = {};
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
    if ($scope.productCategorySet.has(categoryId)) {
      $scope.productCategorySet['delete'](categoryId);
      for (var i = 0; i < $scope.product.categories.length; i++) {
        var category = $scope.product.categories[i];
        if (category === categoryId) {
          $scope.product.categories.splice(i, 1);
          break;
        }
      }
    } else {
      $scope.productCategorySet.add(categoryId);
      $scope.product.categories.push(categoryId);
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
});
}, {"../module.js":6}],
27: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

productModule.controller('CategoryEditController', function ($scope, $rootScope, $http, $state, categories, $translate) {
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

  var getTreeData = function getTreeData(root, currentCategoryId, opened) {
    var json = {
      id: root.id,
      text: root.name ? root.name[editLocale] : 'NoName',
      data: { id: root.id },
      state: { selected: false, opened: opened } };
    /* TODO disabled: !root.isActive, */
    categoryIdMap[root.id] = root;
    if (currentCategoryId && +root.id === +currentCategoryId) {
      $scope.category = root;
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
  // $scope.category = categoryIdMap[currentCategoryId];
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
        max_depth: 3,
        icon: 'fa fa-folder icon-state-warning icon-lg'
      },
      file: {
        max_depth: 3,
        icon: 'fa fa-file icon-state-warning icon-lg'
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
    $scope.category = categoryIdMap[data.node.id];
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $state.go('product.category.child', { categoryId: data.node.id });
  });
  // TODO update all tree

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
    $http.put('/api/v1/categories/' + $scope.category.id, _.omit($scope.category, ['id', 'children'])).then(function (res) {
      var category = res.data;
      categoryIdMap[category.id] = category;
      jstreeNode.jstree('set_text', category.id, category.name[editLocale]);
      $scope.category = category;
    }, function (err) {
      window.alert(err.data);
    });
  };

  $scope.changeCategoryEditLocale = function (locale) {
    $rootScope.changeEditLocale(locale);
    $state.reload();
  };
});
}, {"../module.js":6}],
28: [function(require, module, exports) {
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
}, {"../module.js":6}],
29: [function(require, module, exports) {
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
      var loadDone = 0;
      var plusLoadDone = function plusLoadDone() {
        loadDone++;
        if (loadDone == imgIdx) {
          boUtils.stopProgressBar();
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      };
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
    var uploadedVariantCount = 0;
    var allVariantCount = 0;
    var changedProducts = new Set();
    var plusDoneVariant = function plusDoneVariant() {
      uploadedVariantCount++;
      if (allVariantCount === uploadedVariantCount) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = changedProducts.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var changedProduct = _step.value;

            // silently indexing
            $http.put('/api/v1/products/' + changedProduct, { isActive: true });
            $http.put('/api/v1/products/' + changedProduct + '/index');
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
      }
    };
    var isAddProductImage = !$scope.uploadTypes[$scope.uploadTypeIndex].productHasImage;
    var uploadRowImages = function uploadRowImages(productId, productVariantIds, images, isSaveProduct) {
      changedProducts.add(productId);
      var appImages = new Array(images.length);
      var uploadCount = 0;
      var done = 0;

      var _loop4 = function (i) {
        var imageUrl = images[i].url;
        if (imageUrl.length > 2 && imageUrl.substring(0, 2) === '//') {
          appImages[i] = images[i];
        } else {
          uploadCount++;
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
              plusDone();
              if (res) return res;
            },
            error: function error(res) {
              window.alert(res);
              appImages[i] = {};
              plusDone();
            }
          });
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
        $q.all(promises).then(function (res) {
          plusDoneVariant();
        });
      };
      var plusDone = function plusDone() {
        done++;
        if (done === uploadCount) {
          saveProductVariant();
        }
      };
      if (uploadCount === 0) {
        saveProductVariant();
      }
    };
    for (var j = 0; j < $scope.items.length; j++) {
      var item = $scope.items[j];
      var r = 0;
      while (r < item.rows.length) {
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
        allVariantCount++;
        uploadRowImages(item.product.id, variantIds, images, isAddProductImage && isUploadProduct);
      }
    }
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
}, {"../module":6}],
7: [function(require, module, exports) {
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
  }).state('order.beforePayment', {
    url: '/before_payment',
    templateUrl: templateRoot + '/order/step0-before-payment.html',
    controller: 'OrderListBeforePaymentController'
  }).state('order.uncle', {
    url: '/uncle',
    templateUrl: templateRoot + '/order/uncle.html',
    controller: 'OrderUncleController',
    resolve: {
      orderProducts: function orderProducts($http, $rootScope, $stateParams) {
        return $http.get('/api/v1/uncle/order_products').then(function (res) {
          return res.data;
        });
      }
    }
  }).state('order.cs', {
    url: '/cs',
    templateUrl: templateRoot + '/order/cs.html',
    controller: 'OrderCsController',
    resolve: {
      orderProducts: function orderProducts($http, $rootScope, $stateParams) {
        var result = [];
        var limit = 1000;
        function recursive(offset) {
          return $http.get('/api/v1/order_products?status=100:400&sorts=-orderId,-id&limit=' + limit + '&offset=' + offset).then(function (res) {
            var pagination = res.data.pagination;

            Array.prototype.push.apply(result, res.data.orderProducts);
            if (pagination.offset + pagination.limit < pagination.total) {
              return recursive(pagination.offset + pagination.limit);
            }
            console.log(result);
            return result;
          });
        }
        return recursive(0).then(function (res) {
          return res;
        });
      }
    }
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
}, {"../third_party/angular-translate":12,"./i18n/translations.en.json":30,"./i18n/translations.ko.json":31,"./controllers.js":32}],
30: [function(require, module, exports) {
module.exports = {
  "order": {

  }
};
}, {}],
31: [function(require, module, exports) {
module.exports = {
  "order": {
    "title": "주문",
    "main": {
      "buyerEmailColumn": "주문자 이메일",
      "buyerNameColumn": "주문자 이름",
      "buyerTelColumn": "주문자 전화번호",
      "createdAtColumn": "주문 생성 시각",
      "paymentStatusColumn": "결제 상태",
      "priceColumn": "주문가격",
      "startProcessing": "주문처리",
      "statusColumn": "주문 상태",
      "title": "주문현황"
    },
    "detail": {
      "title": "주문상세",
      "refundTitle": "환불",
      "saveButton": "저장"
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
        "accountNumber": "계좌번호",
      },
      "totalColumn": "금액",
      "dateColumn": "주문날짜",
      "buyerIdColumn": "바이어ID",
    },
    "uncle": {
      "title": "삼촌주문목록",
      "download": "CSV 다운로드"
    },
    "cs": {
      "title": "운영팀주문목록"
    }
  }
}
;
}, {}],
32: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var orderModule = require('./module');

orderModule.controller('OrderMainController', function ($scope, $rootScope, $http, $state, $translate, boUtils) {
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
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders?q=status:!0,paymentStatus:!0',
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
      data: 'createdAt',
      render: function render(data) {
        return boUtils.formatDate(data);
      }
    }, {
      data: 'totalKRW'
    }, {
      data: 'paymentStatus',
      render: function render(status) {
        return $rootScope.getContentsI18nText('enum.order.paymentStatus.' + status);
      }
    }, {
      data: function data(_data) {
        return _.get(_data, 'name') || '';
      }
    }, {
      data: function data(_data2) {
        return _.get(_data2, 'data.tel') || '';
      }
    }, {
      data: 'email'
    }]
  };
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
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: '/api/v1/orders?q=status:0,paymentStatus:200',
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
      data: 'totalKRW'
    }, {
      data: function data(_data3) {
        return _.get(_data3, 'name') || '';
      }
    }, {
      data: function data(_data4) {
        return _.get(_data4, 'data.tel') || '';
      }
    }, {
      data: 'email'
    }, {
      data: 'id',
      render: function render(id) {
        return '<button class="btn blue" data-ng-click="startProcessing(' + id + ')"><i class="fa fa-play"></i> ' + $translate.instant('order.main.startProcessing') + '</button>';
      }
    }]
  };
  $scope.startProcessing = function (orderId) {
    $http.post('/api/v1/orders/' + orderId + '/start_processing').then(function (res) {
      // TODO: Update datatables row data.
    });
  };
});

orderModule.controller('OrderDetailController', function ($scope, $rootScope, $http, $state, $translate, boUtils, convertUtil, order) {
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
  order.finalShippingCostKRW = order.finalShippingCostKRW && Number(order.finalShippingCostKRW);
  (order.orderProducts || []).forEach(function (p) {
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

  $scope.translateOrderStatus = function (status) {
    return $rootScope.getContentsI18nText('enum.order.status.' + status);
  };
  $scope.translateOrderPaymentStatus = function (status) {
    return $rootScope.getContentsI18nText('enum.order.paymentStatus.' + status);
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

  $scope.refundOrder = function () {
    if (order.finalTotalKRW === undefined) {
      alert('Plese save final order counts');
      return;
    }
    var amount = +order.totalPaid.amount - +order.finalTotalKRW - order.totalRefuned;
    console.log(amount);
    var payments = _.filter(order.payments, function (p) {
      return p.type === 0 && p.status === 0;
    });
    if (payments.length === 1) {
      $scope.refund(payments[0], amount);
    } else {
      alert('multiple payment transaction');
    }
  };

  $scope.popupRefund = function (payment) {
    $scope.refundPayment = payment;
    $('#order_refund_modal').modal();
  };

  $scope.refund = function (payment, amount) {
    $scope.closePopup();
    $http.post('/api/v1/orders/' + order.id + '/refund', {
      paymentId: payment.id,
      // amount: payment.data.TotPrice, // FIXME: from user input
      amount: +amount,
      msg: 'admin refund'
    }).then(function (res) {
      // TODO: refresh order.
      $state.reload();
    });
  };

  $scope.finalize = function () {
    var data = _.pick(order, 'finalShippingCostKRW');
    data.orderProducts = order.orderProducts.map(function (o) {
      return _.pick(o, 'id', 'finalQuantity');
    });
    $http.put('/api/v1/orders/' + order.id + '/finalize', data).then(function (res) {
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
    var data = _.pick(order, 'status');
    $http.put('/api/v1/orders/' + order.id + '/status', data).then(function (res) {
      $state.reload();
    }, function (err) {
      return alert(err.data.message);
    });
  };

  if ($scope.order.address) {
    $scope.addressFields = [{ title: $translate.instant('order.address.nameLabel'), obj: _.get($scope.order.address, 'detail.name'), key: 'name' }, { title: $translate.instant('order.address.postalCodeLabel'), obj: _.get($scope.order.address, 'detail.postalCode'), key: 'postalCode' }, { title: $translate.instant('order.address.addressLabel'), obj: _.get($scope.order.address, 'detail.address.base'), key: 'addressBase' }, { title: $translate.instant('order.address.addressDetailLabel'), obj: _.get($scope.order.address, 'detail.address.detail'), key: 'addressDetail' }, { title: $translate.instant('order.address.countryCodeLabel'), obj: _.get($scope.order.address, 'countryCode'), key: 'countryCode' }, { title: $translate.instant('order.address.telLabel'), obj: _.get($scope.order.address, 'detail.tel'), key: 'tel' }];
  }
});

orderModule.controller('OrderUncleController', function ($scope, $rootScope, $http, $state, $translate, orderProducts) {
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
  $scope.orderProducts = orderProducts;
  $scope.download = function () {
    $http.get('/api/v1/uncle/order_products?format=csv').then(function (res) {
      var blob = new Blob([res.data]);
      var downloadLink = angular.element('<a></a>');
      downloadLink.attr('href', window.URL.createObjectURL(blob));
      downloadLink.attr('download', 'uncle.csv');
      downloadLink[0].click();
    });
  };
  $rootScope.initAll($scope, $state.current.name);
});

orderModule.controller('OrderCsController', function ($scope, $rootScope, $http, $state, $translate, orderProducts) {
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
  $scope.orderProducts = orderProducts;
  $rootScope.initAll($scope, $state.current.name);
});
}, {"./module":7}],
8: [function(require, module, exports) {
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
  });
});

module.exports = brandModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../utils/module":15,"../third_party/angular-translate":12,"./i18n/translations.en.json":33,"./i18n/translations.ko.json":34,"./controllers.js":35}],
33: [function(require, module, exports) {
module.exports = {

};
}, {}],
34: [function(require, module, exports) {
module.exports = {
  "brand": {
    "title": "브랜드",
    "createButton": "브랜드 생성",
    "main": {
      "createBrandTitle": "브랜드 생성"
    },
    "edit": {
      "nameLabel": "브랜드명",
      "bizNameLabel": "사업자명",
      "bizNumberLabel": "사업자 번호",
      "accountBankLabel": "은행",
      "accountOwnerLabel": "예금주",
      "accountNumberLabel": "계좌번호",
      "buildingNameLabel": "빌딩 이름",
      "buildingFloorLabel": "빌딩 층",
      "buildingFlatNumberLabel": "빌딩 호수",
      "telLabel": "전화 번호",
      "mobileLabel": "핸드폰 번호"
    }
  }
}
;
}, {}],
35: [function(require, module, exports) {
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

brandModule.controller('BrandMainController', function ($scope, $http, $element, brandCommons, boUtils) {
  var brandsUrl = '/api/v1/brands';
  var fieldName = 'brands';
  $scope.brandDatatables = {
    field: fieldName,
    url: brandsUrl,
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="brand.edit({brandId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: 'name.ko',
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
});

brandModule.controller('BrandEditController', function ($scope, $http, $state, $rootScope, $translate, boUtils, convertUtil) {
  var initFields = function initFields() {
    if (!$scope.brand.data) {
      $scope.brand.data = {};
    }
    $scope.brandFields = [{ title: 'ID', key: 'id', obj: $scope.brand.id, isReadOnly: true }, { title: $translate.instant('brand.edit.nameLabel'), obj: _.get($scope.brand, 'name.ko'), key: 'name.ko' }, { title: $translate.instant('brand.edit.bizNameLabel'), obj: _.get($scope.brand, 'data.businessRegistration.name'), key: 'data.businessRegistration.name' }, { title: $translate.instant('brand.edit.bizNumberLabel'), obj: _.get($scope.brand, 'data.businessRegistration.number'), key: 'data.businessRegistration.number' }, { title: $translate.instant('brand.edit.accountBankLabel'), obj: _.get($scope.brand, 'data.bank.name'), key: 'data.bank.name' }, { title: $translate.instant('brand.edit.accountOwnerLabel'), obj: _.get($scope.brand, 'data.bank.accountHolder'), key: 'data.bank.accountHolder' }, { title: $translate.instant('brand.edit.accountNumberLabel'), obj: _.get($scope.brand, 'data.bank.accountNumber'), key: 'data.bank.accountNumber' }, { title: $translate.instant('brand.edit.buildingNameLabel'), obj: _.get($scope.brand, 'data.building.name'), key: 'data.building.name' }, { title: $translate.instant('brand.edit.buildingFloorLabel'), obj: _.get($scope.brand, 'data.building.floor'), key: 'data.building.floor' }, { title: $translate.instant('brand.edit.buildingFlatNumberLabel'), obj: _.get($scope.brand, 'data.building.flatNumber'), key: 'data.building.flatNumber' }, { title: $translate.instant('brand.edit.telLabel'), obj: _.get($scope.brand, 'data.tel'), key: 'data.tel' }, { title: $translate.instant('brand.edit.mobileLabel'), obj: _.get($scope.brand, 'data.mobile'), key: 'data.mobile' }];
  };
  if ($state.params.brandId) {
    boUtils.startProgressBar();
    $http.get('/api/v1/brands/' + $state.params.brandId + '/unmodified').then(function (res) {
      $scope.brand = res.data;
      initFields();
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
    convertUtil.copyFieldObj($scope.brandFields, $scope.brand);
    $rootScope.state.locales.forEach(function (locale) {
      $scope.brand.name[locale] = $scope.brand.name.ko;
    });
    var requestBrand = _.pick($scope.brand, 'name', 'data');
    var promise = undefined;
    if ($state.params.brandId) {
      promise = $http.put('/api/v1/brands/' + $scope.brand.id, requestBrand);
    } else {
      // create brand
      promise = $http.post('/api/v1/brands', requestBrand);
    }
    promise.then(function (res) {
      boUtils.stopProgressBar();
      return $http.put('/api/v1/brands/' + res.data.id + '/index');
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
});
}, {"./module":8}],
9: [function(require, module, exports) {
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
}, {"../third_party/angular-translate":12,"./i18n/translations.en.json":36,"./i18n/translations.ko.json":37,"./controllers.js":38}],
36: [function(require, module, exports) {
module.exports = {

}
;
}, {}],
37: [function(require, module, exports) {
module.exports = {
  "currency": {
    "title": "환율"
  }
}
;
}, {}],
38: [function(require, module, exports) {
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
}, {"./module":9}],
10: [function(require, module, exports) {
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
  }).state('cms.main_category', {
    url: '/main_category',
    templateUrl: templateRoot + '/cms/main-category.html',
    controller: 'CmsMainCategoryController'
  });
});

// BEGIN module require js
require('./controllers');
// END module require js
}, {"../third_party/angular-translate":12,"./i18n/translations.en.json":39,"./i18n/translations.ko.json":40,"./controllers":41}],
39: [function(require, module, exports) {
module.exports = {

};
}, {}],
40: [function(require, module, exports) {
module.exports = {
  "cms": {
    "mainCategory": "메인페이지 카테고리",
    "mainBanner": "메인 배너",
    "subBanner": "서브 배너"
  }
}
;
}, {}],
41: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var cmsModule = require('./module');

cmsModule.controller('CmsSimpleController', function ($scope, $http, $state, $rootScope, $translate) {
  $scope.cms = {
    title: {
      ko: '',
      en: '',
      zn_ch: '',
      zn_tw: ''
    },
    children: []
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
    if (!$scope.newObject.link || $scope.newObject.link === '') {
      window.alert('type link');
      return;
    }
    if (!$scope.newObject.image || !$scope.newObject.image.url) {
      window.alert('add image');
      return;
    }
    $scope.cms.children.push($scope.newObject);
    $scope.newObject = {};
  };

  $scope.save = function () {
    $http.post('/api/v1/cms', { name: $scope.name, data: $scope.cms }).then(function (res) {
      console.log(res);
    });
  };

  $scope.rowSortable = {
    handle: '.cms-simple-sortable-pointer',
    placeholder: 'ui-state-highlight'
  };
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
    });
  };
});
}, {"./module":10}],
11: [function(require, module, exports) {
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
}, {"../third_party/angular-translate":12,"./i18n/translations.en.json":42,"./i18n/translations.ko.json":43,"./controllers.js":44}],
42: [function(require, module, exports) {
module.exports = {

}
;
}, {}],
43: [function(require, module, exports) {
module.exports = {
  "text": {
    "title": "국제화"
  }
}
;
}, {}],
44: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var textModule = require('./module');

textModule.controller('TextMainController', function ($scope, $http, $q, $state, $rootScope) {
  $scope.activeNode = null;
  var nodeToKey = {};
  var nodeNum = 0;
  var getTreeData = function getTreeData(key, obj) {
    nodeNum++;
    nodeToKey[nodeNum] = key;
    if (obj.ko || obj.en) {
      return {
        id: nodeNum,
        text: obj[$rootScope.state.editLocale],
        data: obj
      };
    }
    var keys = Object.keys(obj);
    var res = {
      id: nodeNum,
      text: key,
      data: obj,
      children: [],
      state: { selected: false, opened: true, disabled: true }
    };
    for (var i = 0; i < keys.length; i++) {
      var child = obj[keys[i]];
      res.children.push(getTreeData(keys[i], child));
    }
    return res;
  };
  var jsTreeData = function jsTreeData(origData) {
    var res = [];
    var keys = Object.keys(origData);
    keys.forEach(function (key) {
      res.push(getTreeData(key, origData[key]));
    });
    return res;
  };

  var jstreeNode = $('#textTree');
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
      $scope.activeNode = data.node.data;
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
    $http.get('/api/v1/i18n/texts').then(function (res) {
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
    var data = jstreeToJson();
    var keys = Object.keys(data);
    var promises = [];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      promises.push($http.put('/api/v1/i18n/texts', { path: key, data: data[key] }));
    }
    $q.all(promises).then(function () {
      getTextsAndDrawTree(redraw);
      // 2016. 02. 29. [heekyu] activeNode is changed when redraw
      //                TODO maintain activeNode
      $scope.activeNode = null;
    });
  };

  $scope.changeTextEditLocale = function (locale) {
    $rootScope.changeEditLocale(locale);
    redraw();
  };
});
}, {"./module":11}],
13: [function(require, module, exports) {
module.exports = {

};
}, {}],
14: [function(require, module, exports) {
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
    }
  }
};
}, {}]}, {}, {"1":""})