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

var ACCESS_TOKEN_KEY = 'GOOMMERCE-BO-TOKEN';

mainModule.controller('MainController', function ($scope, $http, $rootScope, $compile, $translate, $cookies) {
  $rootScope.menus = [{
    key: 'product', // TODO get key from router
    name: $translate.instant('product.main.title'),
    active: false,
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
    active: false,
    children: [{
      key: 'order.main',
      name: $translate.instant('main.mainMenu'),
      sref: 'order.main'
    }, {
      key: 'order.beforePayment',
      name: $translate.instant('order.beforePayment.title'),
      sref: 'order.beforePayment'
    }]
  }, {
    key: 'user', // TODO get key from router
    name: $translate.instant('user.manage.title'),
    active: false,
    children: [{
      key: 'order.main',
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
    sref: 'brand.main',
    active: false
  }, {
    key: 'cms', // TODO get key from router
    name: 'CMS',
    active: false,
    children: [{
      name: $translate.instant('cms.mainBanner'),
      sref: 'cms.simple({name: "pc_main_banner1"})'
    }, {
      name: $translate.instant('cms.subBanner'),
      sref: 'cms.simple({name: "pc_main_banner2"})'
    }]
  }, {
    key: 'currency', // TODO get key from router
    name: $translate.instant('currency.title'),
    sref: 'currency.main',
    active: false
  }, {
    key: 'text',
    name: $translate.instant('text.title'),
    sref: 'text.main',
    active: false
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
  $rootScope.$on('$stateChangeSuccess', function (event, toState) {
    handleMenus(toState.name);
  });

  $rootScope.initAll = function (scope, stateName) {
    initContentTitle(scope);
    initBreadcrumb(scope);
  };

  $rootScope.doLogout = function () {
    // TODO server logout
    $cookies.remove(ACCESS_TOKEN_KEY);
    checkLogin();
  };

  var checkLogin = function checkLogin() {
    var token = $cookies.get(ACCESS_TOKEN_KEY);
    // TODO check if token is valid
    if (!token) {
      $rootScope.modalBox = 'login';
      $('#login_modal').modal({
        backdrop: 'static',
        keyboard: false
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
    editLocale: 'ko'
  };

  // 2016. 02. 29. [heekyu] change locale in each page
  $rootScope.changeEditLocale = function (locale) {
    $rootScope.state.editLocale = locale;
  };
});

mainModule.controller('LoginModalController', function ($scope, $http, $cookies) {
  $scope.credential = {};

  $scope.doLogin = function () {
    var data = { email: $scope.credential.email, password: $scope.credential.password };
    $http.post('/api/v1/login', data).then(function (res) {
      // TODO better way
      $('#login_modal').modal('hide');

      var token = 'Bearer ' + res.data.bearer;
      $http.defaults.headers.common.Authorization = token;
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

directiveModule.directive('boServerDatatables', function ($http, datatableCommons, boUtils) {
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
      var urlParams = scope.urlParams;
      if (!urlParams) {
        urlParams = {};
      }

      var dataTables = scope.boServerDatatables;
      var options = datatableCommons.getOptions(scope, dataTables);
      options.serverSide = true;
      options.ajax = function (data, callback, settings) {
        urlParams.offset = data.start;
        urlParams.limit = data.length;
        var url = boUtils.encodeQueryData(urlBase, urlParams);
        $http.get(url).then(function (value) {
          var serverData = value.data[dataTables['field']];
          if (!serverData) {
            serverData = [];
          }
          var pageInfo = { data: serverData, draw: data.draw };
          pageInfo.recordsTotal = serverData.total;
          // TODO really filtered data
          pageInfo.recordsFiltered = pageInfo.recordsTotal;
          callback(pageInfo);
          if (scope.tableRender) {
            scope.tableRender();
          }
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
}, {"../utils/module":15}],
15: [function(require, module, exports) {
'use strict';

var utilModule = angular.module('backoffice.utils', []);

utilModule.factory('boUtils', function ($http) {
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
  }).state('user.waitConfirm', {
    url: '/wait_confirm',
    templateUrl: templateRoot + '/user/wait-confirm.html',
    controller: 'UserWaitConfirmController'
  });
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

userModule.controller('UserManageController', function ($scope, $http, $q, $state, $rootScope, $translate) {
  $scope.contentTitle = $translate.instant('user.manage.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [{
    sref: 'dashboard',
    name: $translate.instant('dashboard.home')
  }, {
    sref: 'user.main',
    name: $translate.instant('user.manage.title')
  }];
  $rootScope.initAll($scope, $state.current.name);

  $scope.userDatatables = {
    field: '',
    url: '/api/v1/users',
    columns: [{
      data: 'id'
    }, {
      data: 'email'
    }, {
      data: 'roles',
      render: function render(roles) {
        if (!roles) return '';
        return JSON.stringify(roles);
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
  $scope.editRole = { admin: false, buyer: false, seller: false };
  $scope.makeUserRolePopupData = function (user) {
    var res = { admin: false, buyer: false, seller: false };
    if (user.roles) {
      for (var i = 0; i < user.roles.length; i++) {
        var role = user.roles[i];
        if (role.type === 'admin') {
          res.admin = true;
        } else if (role.type === 'buyer') {
          res.buyer = true;
        }
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

  $scope.datatablesLoaded = function () {
    var datas = $('#user_list').find('table').DataTable().rows().data();
    var children = $('#user_list').find('tbody').children();
    for (var i = 0; i < datas.length; i++) {
      var data = datas[i];
      userIdToData[data.id] = data;

      var child = children[i];
      $(child).css('cursor', 'pointer');
      $(child).click(function (e) {
        var userId = $(e.target).closest('tr').attr('id');
        var user = userIdToData[userId];
        $scope.editRoleUser = user;
        $scope.makeUserRolePopupData(user);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        $('#user_change_role').modal();
      });
    }
  };

  // 2016. 02. 23. [heekyu] this is very limited since server cannot handle race condition properly
  $scope.saveRole = function () {
    var editRoleToData = function editRoleToData() {
      if ($scope.editRole.admin) {
        return [{ type: 'admin' }];
      } else if ($scope.editRole.buyer) {
        return [{ type: 'buyer' }];
      }
      return null;
    };
    var newRoleData = editRoleToData();
    if (!newRoleData && !$scope.editRoleUser.roles) {
      return;
    }
    var addOrDelete = {};

    var isChangable = function isChangable(roleType) {
      if (roleType === 'admin' || roleType === 'buyer') {
        return true;
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
    sref: 'user.main',
    name: $translate.instant('user.manage.title')
  }, {
    sref: 'user.waitConfirm',
    name: $translate.instant('user.waitConfirm.title')
  }];
  $rootScope.initAll($scope, $state.current.name);
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

  var narrowProduct = function narrowProduct(product) {
    return _.pick(product, ['id', 'sku', 'categories', 'isActive', 'brand', 'data', 'appImages']);
  };
  var narrowProductVariant = function narrowProductVariant(variant) {
    return _.pick(variant, ['id', 'productId', 'sku', 'KRW', 'data', 'appImages']);
  };

  $stateProvider.state('product', {
    abstract: true,
    url: '/product',
    template: '<ui-view/>'
  }).state('product.main', {
    url: '/main',
    templateUrl: templateRoot + '/product/main.html',
    controller: 'ProductMainController'
  }).state('product.add', {
    url: '/add',
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
      product: function product($http, $stateParams) {
        return $http.get('/api/v1/products/' + $stateParams.productId).then(function (res) {
          var product = narrowProduct(res.data);
          product.productVariants = res.data.productVariants.map(function (variant) {
            return narrowProductVariant(variant);
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
    controller: 'ProductImageUploadController',
    resolve: {
      products: function products($http, $q) {
        return $http.get('/api/v1/products').then(function (res) {
          var products = res.data.products;
          if (products.length > 5) {
            products.length = 5;
          }
          var len = products.length;
          var promises = [];

          var _loop = function (i) {
            var product = narrowProduct(products[i]);
            products[i] = product;
            promises.push($http.get('/api/v1/products/' + product.id + '/product_variants').then(function (res2) {
              product.productVariants = res2.data.productVariants.map(function (variant) {
                return narrowProductVariant(variant);
              });
            }));
          };

          for (var i = 0; i < len; i++) {
            _loop(i);
          }
          return $q.all(promises).then(function (res) {
            return products;
          });
        });
      }
    }
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
        var promises = [];
        var pvUrl = '/api/v1/products/' + product.id + '/product_variants';
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = productVariants[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var productVariant = _step.value;

            promises.push($http.post(pvUrl, productVariant));
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

        return $q.all(promises).then(function (res2) {
          return { product: res.data, productVariants: res2.map(function (item) {
              return item.data;
            }) };
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
        var promises = [];
        var pvUrl = '/api/v1/products/' + product.id + '/product_variants';
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = productVariants[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var productVariant = _step2.value;

            oldProductVariants['delete'](productVariant.id);
            if (!productVariant.id) {
              promises.push($http.post(pvUrl, productVariant));
            } else {
              promises.push($http.put(pvUrl + '/' + productVariant.id, _.omit(productVariant, 'id')));
            }
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
            for (var _iterator3 = oldProductVariants.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var deletedVariant = _step3.value;

              promises.push($http({ method: 'DELETE', url: pvUrl + '/' + deletedVariant }));
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

        return $q.all(promises).then(function (res2) {
          return { product: res.data, productVariants: res2.map(function (item) {
              return item.data;
            }) };
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
    "main": {
      "title": "상품"
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
};
}, {}],
25: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var productModule = require('../module.js');

productModule.controller('ProductMainController', function ($scope, $http, $state, $rootScope, $translate, boConfig) {
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
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: boConfig.apiUrl + '/api/v1/products',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="product.edit({productId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: 'sku'
    }, {
      data: 'id',
      render: function render(id) {
        return '<button data-ng-click="deleteProduct(' + id + ')" class="btn red"><i class="fa fa-remove"></i> ' + $translate.instant('main.deleteButton') + '</button>';
      }
    }]
  };
  $scope.fileContents = 'before';

  $scope.deleteProduct = function (productId) {
    if (window.confirm('Really delete product (' + productId + ')?')) {
      $http['delete']('/api/v1/products/' + productId).then(function () {
        // reload
        $state.reload(true);
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

productModule.controller('ProductEditController', function ($scope, $http, $state, $rootScope, $translate, product, categories, productUtil) {
  var initFromProduct = function initFromProduct() {
    var titleKey = 'product.edit.createTitle';
    if (!product) {
      $scope.product = { sku: 'autogen', data: {} };
      $scope.variantKinds = [{ name: '색상', key: 'color', kinds: ['White', 'Black'] }, { name: '사이즈', key: 'size', kinds: ['Free'] }];
    } else {
      $scope.product = product;
      titleKey = 'product.edit.updateTitle';
    }
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
   {title: $translate.instant('product.edit.labelName.ZH_CN'), key: 'zh_cn'},
   {title: $translate.instant('product.edit.labelName.ZH_TW'), key: 'zh_tw'},
   ];
   */
  $scope.inputFields = [
  // {title: 'SKU', key: 'sku', tmpKey: 'sku', placeholder: '00000-0000', isRequired: true},
  { title: 'nickname', key: 'data.nickname', tmpKey: 'nickname', isRequired: true }];

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

  // BEGIN Manipulate Variant Kinds

  $scope.newObjects = {
    variantKind: '',
    variantKindItem: ''
  };

  $scope.addVariantKind = function (name) {
    if (name && name.trim() !== '') {
      $scope.newObjects.variantKind = '';
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = $scope.variantKinds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var kind = _step3.value;

          if (kind.name === name) {
            $scope.hideAddItemBox();
            window.alert('duplicate name');
            return false;
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

      $scope.variantKinds.push({ name: name, kinds: [] });
      // TODO enhance hiding add item box
      $scope.hideAddItemBox();
    }
  };
  $scope.addVariantKindItem = function (index, name) {
    if (name && name.trim() !== '') {
      $scope.newObjects.variantKindItem = '';
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = $scope.variantKinds[index].kinds[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var kindItem = _step4.value;

          if (kindItem === name) {
            $scope.hideAddItemBox();
            window.alert('duplicate name');
            return false;
          }
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

      $scope.variantKinds[index].kinds.push(name);
      // TODO enhance hiding add item box
      $('.add-item-box').css('display', 'none');
    }
  };

  $scope.removeVariantKind = function (kindIndex) {
    var kind = $scope.variantKinds[kindIndex];
    if (window.confirm('Really Delete [' + kind.name + '] ?')) {
      $scope.variantKinds.splice(kindIndex, 1);
    }
  };

  $scope.removeVariantKindItem = function (kindIndex, itemIndex) {
    $scope.variantKinds[kindIndex].kinds.splice(itemIndex, 1);
  };

  $scope.clickAddVariantOrItem = function (event) {
    $scope.hideAddItemBox();
    $(event.target).prev().css('display', 'inline-block');
    $(event.target).prev().find('input').focus();
  };

  $scope.onInputKeypress = function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $(event.target).blur();
      return false;
    }
    return true;
  };

  $scope.hideAddItemBox = function () {
    $('.add-item-box').css('display', 'none');
  };
  // END Manipulate Variant Kinds

  // BEGIN Manipulate Variants
  $scope.generateProductVariants = function () {
    $scope.tmpObjToProduct();
    /*
    if (!$scope.product.sku || $scope.product.sku === '') {
      window.alert('insert SKU first.'); // TODO message
      return false;
    }
    */
    var newVariantSKUs = [];
    var idx = 0;
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = $scope.variantKinds[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var variantKind = _step5.value;

        if (variantKind.kinds.length < 1) {
          continue;
        }
        if (newVariantSKUs.length < 1) {
          newVariantSKUs.push($scope.product.sku);
        }
        var start = idx;
        idx = newVariantSKUs.length;
        for (var i = start; i < idx; i++) {
          var newVariantSKU = newVariantSKUs[i];
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = variantKind.kinds[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var kind = _step6.value;

              newVariantSKUs.push(newVariantSKU + '-' + kind);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                _iterator6['return']();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5['return']) {
          _iterator5['return']();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
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
        var newVariant = { sku: newVariantSKU, KRW: 0 };
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

  var afterSaveProduct = function afterSaveProduct(product) {
    $http.put('/api/v1/products/' + product.id + '/index').then(function (res) {
      // ignore
    });
  };

  $scope.saveAndContinue = function () {
    $scope.doSave().then(function (product) {
      if ($scope.product.id) {
        // 2016. 02. 29. [heekyu] update product variant id for deny multiple create
        $state.reload();
      } else {
        $state.go('product.edit', { productId: product.id });
      }
      window.alert('Saved Successfully');
    });
  };

  $scope.doSave = function () {
    // 2016. 01. 18. [heekyu] save images
    $scope.tmpObjToProduct();
    // $scope.imageToProduct();
    $scope.imageRowsToVariant();
    $scope.updateCategoryPath();
    if (!$scope.product.id) {
      return productUtil.createProduct($scope.product, $scope.productVariants).then(function (res) {
        afterSaveProduct(res.product);
        return res.product;
      }, function (err) {
        window.alert('Product Create Fail' + err.data);
      });
    } else {
      return productUtil.updateProduct($scope.product, $scope.productVariants, $scope.origVariants).then(function (res) {
        afterSaveProduct(res.product);
        $scope.origVariants.clear();
        return res.product;
      }, function (err) {
        console.log(err);
        window.alert('Product Update Fail' + err.data);
        $scope.origVariants.clear();
        return err;
      });
    }
  };

  $scope.save = function () {
    $scope.doSave().then(function (product) {
      if (product && product.id) {
        $state.go('product.main');
      }
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
          slotCount: firstVariant ? 6 : 2, // TODO,
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
              _.get(imgVariant, 'appImages.default').forEach(function (image) {
                if (!imageSet.has(image.url)) {
                  imageSet.add(image.url);
                  row.images.push(image);
                }
              });
            }
          })();
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
  $scope.toggleShare = function () {
    makeImageRows();
  };
  $scope.imageSortable = {
    connectWith: '.image-container, .product-image-trash',
    placeholder: 'ui-state-highlight'
  };
  $scope.imageRowsToVariant = function () {
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
          window.alert('(' + used + ') images uploaded');
          return;
        }
      }
    }
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
  // TODO
  /*
  $('#image-upload-button').on('change', function (changeEvent) {
   });
  */
  setTimeout(function () {
    // 2016. 02. 29. [heekyu] I cannot find on load event doing this
    $('.product-image-trash').droppable({
      accept: '.image-container img',
      drop: function drop(event, ui) {
        var row = $(event.srcElement).attr('row-index');
        var imgIndex = $(event.srcElement).attr('img-index');
        $scope.imageRows[row].images.splice(imgIndex, 1);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    });
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
  };
  $scope.removeProductVariant = function (index) {
    $scope.productVariants.splice(index, 1);
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
    if (currentCategoryId && root.id === currentCategoryId) {
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
  $scope.category = categoryIdMap[currentCategoryId];
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
    // TODO update client tree after server updated
    $http.put('/api/v1/categories/' + data.node.id, { parentId: data.parent }).then(function (res) {
      console.log(res);
    });
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

  $scope.names = [{ title: 'ko', key: 'ko' }, { title: 'en', key: 'en' }, { title: 'zh_cn', key: 'zh_cn' }, { title: 'zh_tw', key: 'zh_tw' }];

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
    } }, { columnName: 'qty', apiName: 'stock', onlyProductVariant: true }, { columnName: 'product_nickname', apiName: 'data.nickname' }, { columnName: 'category_ids', apiName: 'categories', onlyProduct: true, convert: function convert(value) {
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

productModule.controller('ProductImageUploadController', function ($scope, $http, $q, products) {
  $scope.saveDisabled = true;
  $scope.brands = {};
  $scope.brandIds = [];
  var extractDataFromVariant = function extractDataFromVariant(variant) {
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
        rows.push({
          color: colors[i],
          rowspan: j === 0 ? variants.length : 0,
          sku: variants[j].sku,
          mainProduct: i === 0,
          slotCount: j > 0 ? 0 : i === 0 ? 6 : 2,
          images: [],
          variantId: variants[j].id
        });
      }
    }
    return { rows: rows, product: product };
  };
  var productsToRows = function productsToRows() {
    // must be called once
    // if called multiple, $scope.brands must be clear
    var len = products.length;
    for (var i = 0; i < len; i++) {
      var product = products[i];
      var brandId = _.get(product, 'brand.id') || -1;
      if (!$scope.brands[brandId]) {
        $scope.brands[brandId] = [];
      }
      $scope.brands[brandId].push(productToTableData(product));
    }
    $scope.brandIds = Object.keys($scope.brands);
  };
  productsToRows();

  var imgExt = new Set(['jpg', 'jpeg', 'png']);
  $('#image-upload-button').on('change', function (changeEvent) {
    var imagesByBrand = {};
    for (var i = 0; i < changeEvent.target.files.length; i++) {
      var file = changeEvent.target.files[i];
      var split = file.webkitRelativePath.split('.');
      var ext = split[split.length - 1];
      if (imgExt.has(ext)) {
        var paths = file.webkitRelativePath.split('/');
        if (paths.length < 2) {
          continue;
        }
        var brandId = paths[paths.length - 2];
        if (!imagesByBrand[brandId]) {
          imagesByBrand[brandId] = [];
        }
        imagesByBrand[brandId].push(file);
      }
    }
    var brandIds = Object.keys(imagesByBrand);
    for (var i = 0; i < brandIds.length; i++) {
      var brandId = brandIds[i];
      if ($scope.brands[brandId]) {
        (function () {
          var items = $scope.brands[brandId]; // { product: , rows: }
          var images = imagesByBrand[brandId];

          var imgIdx = 0;
          var loadDone = 0;
          var plusLoadDone = function plusLoadDone() {
            loadDone++;
            if (loadDone == imgIdx) {
              $scope.saveDisabled = false;
              if (!$scope.$$phase) {
                $scope.$apply();
              }
            }
          };
          for (var j = 0; j < items.length; j++) {
            var rows = items[j].rows;

            var _loop = function (k) {
              var row = rows[k];
              if (row.rowspan < 1) {
                return 'continue';
              }
              row.images.length = row.slotCount;

              var _loop3 = function (_k) {
                if (imgIdx == images.length) {
                  window.alert('image count mismatch');
                  return 'break';
                }
                var r = new FileReader();
                r.onload = function (e) {
                  row.images[_k] = { url: e.target.result };
                  plusLoadDone();
                };
                r.readAsDataURL(images[imgIdx++]);
              };

              for (var _k = 0; _k < row.slotCount; _k++) {
                var _ret3 = _loop3(_k);

                if (_ret3 === 'break') break;
              }
              if (imgIdx == images.length) return 'break';
            };

            _loop2: for (var k = 0; k < rows.length; k++) {
              var _ret2 = _loop(k);

              switch (_ret2) {
                case 'continue':
                  continue;

                case 'break':
                  break _loop2;}
            }
          }
        })();
      }
    }
  });
  $scope.saveImages = function () {
    var uploadedVariantCount = 0;
    var allVariantCount = 0;
    var plusDoneVariant = function plusDoneVariant() {
      uploadedVariantCount++;
      if (allVariantCount === uploadedVariantCount) {
        window.alert('all images uploaded and product informations saved');
      }
    };
    var uploadRowImages = function uploadRowImages(productId, productVariantId, images, isMainProduct) {
      // TODO append exist images
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
            data: { file: imageUrl, upload_preset: 'nd9k8295', public_id: 'tmp/batch_image/' + productId + '-' + productVariantId + '-' + i },
            success: function success(res) {
              appImages[i] = {
                url: res.url.substring(5),
                publicId: res.public_id,
                version: res.version,
                mainImage: false
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
        promises.push($http.put('/api/v1/products/' + productId + '/product_variants/' + productVariantId, data));
        if (isMainProduct) {
          var productData = {
            appImages: { 'default': [_.assign({}, appImages[0], { mainImage: true })] }
          };
          promises.push($http.put('/api/v1/products/' + productId, productData));
        }
        $q.all(promises).then(function (res) {
          console.log(res);
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

    for (var i = 0; i < $scope.brandIds.length; i++) {
      var items = $scope.brands[$scope.brandIds[i]];
      for (var j = 0; j < items.length; j++) {
        var item = items[j];
        var r = 0;
        while (r < item.rows.length) {
          var sameColor = item.rows[r].rowspan;
          var images = item.rows[r].images;
          for (var k = 0; k < sameColor; k++) {
            var row = item.rows[r++];
            if (!row.images || row.images.length < 1) continue;

            allVariantCount++;
            uploadRowImages(item.product.id, row.variantId, images, row.mainProduct);
          }
        }
        for (var k = 0; k < item.rows.length; k++) {
          var row = item.rows[k];
          if (!row.images || row.images.length < 1) continue;
        }
      }
    }
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
  }).state('order.detail', {
    url: '/detail/:orderId',
    templateUrl: templateRoot + '/order/detail.html',
    controller: 'OrderDetailController',
    resolve: {
      order: function order($http, $stateParams) {
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
      "title": "주문현황",
      "createdAtColumn": "주문 생성 시각",
      "paymentStatusColumn": "결제 상태",
      "priceColumn": "주문가격"
    },
    "detail": {
      "title": "주문상세"
    },
    "beforePayment": {
      "title": "무통장 입금 대기",
      "subTitle": "또는 결제 전"
    }
  }
};
}, {}],
32: [function(require, module, exports) {
// Copyright (C) 2016 Goom Inc. All rights reserved.

'use strict';

var orderModule = require('./module');

orderModule.controller('OrderMainController', function ($scope, $rootScope, $http, $state, $translate) {
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
    url: '/api/v1/orders',
    columns: [{
      data: 'id',
      render: function render(id) {
        return '<a ui-sref="order.detail({orderId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: 'createdAt'
    }, {
      data: 'status'
    }, {
      data: 'totalEstimationKRW'
    }]
  };
});

orderModule.controller('OrderListBeforePaymentController', function ($scope, $rootScope, $http, $state, $translate) {
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
});

orderModule.controller('OrderDetailController', function ($scope, $rootScope, $http, $state, $translate, boUtils, order) {
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
  $scope.order = order;
  $scope.user = {};
  $http.get('/api/v1/users/' + order.userId).then(function (res) {
    $scope.user = res.data;
  });
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
      var brandFields = ['pathname', 'data'];
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
        return '<a ui-sref="brand.info({brandId: ' + id + '})">' + id + '</a>';
      }
    }, {
      data: 'data.name.ko'
    }]
  };

  $scope.createBrand = function (brand) {
    brandCommons.saveBrand(brand).then(function () {
      $scope.closeBrandPopup();
      $scope.newBrand.data.name = {};
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
    data: { name: {} }
  };

  $scope.closeBrandPopup = function () {
    $('#new_brand_modal').modal('hide');
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
    console.log(res);
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
  $scope.langs = ['en', 'ko', 'zh_cn', 'zh_tw'];
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
    "saveAndContinueButton": "저장 후 계속",
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