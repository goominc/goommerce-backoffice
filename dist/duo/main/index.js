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
'use strict';

var mainModule = angular.module('backoffice.main', ['ui.router', 'ngCookies', require('../directives/module.js').name, require('../dashboard/module').name, require('../user/module').name, require('../product/module').name, require('../third_party/angular-translate')]).config(function ($translateProvider) {
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
    sref: 'product.main',
    active: false,
    children: [{
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
    }]
  }, {
    key: 'order', // TODO get key from router
    name: 'Order',
    sref: 'order.list',
    active: false
  }, {
    key: 'user', // TODO get key from router
    name: 'User',
    sref: 'user.manage',
    active: false
  }, {
    key: 'cms', // TODO get key from router
    name: 'CMS',
    sref: 'cms.main',
    active: false,
    children: [{
      name: 'main1',
      sref: 'cms.edit({cms_id: "main1_1"})',
      children: [{
        name: 'kk',
        sref: '/'
      }]
    }, {
      name: 'main2',
      sref: 'cms.edit({cms_id: "main2_1"})'
    }]
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

  $rootScope.initAll = function (scope, stateName) {
    initContentTitle(scope);
    initBreadcrumb(scope);
    handleMenus(stateName);
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

  // $http.post('http://localhost:8080/api/v1/users', {email: 'heekyu', password: '1111', data: {singup: 'backoffice'} })
});
}, {"../directives/module.js":3,"../dashboard/module":4,"../user/module":5,"../product/module":6,"../third_party/angular-translate":7,"./i18n/translations.en.json":8,"./i18n/translations.ko.json":9}],
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
        order: dataTables.order || [[0, 'asc']], // set first column as a default sort by asc
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

directiveModule.directive('boDatatables', function ($compile, $parse, datatableCommons) {
  return {
    restrict: 'A',
    transclude: true,
    template: '<div ng-transclude></div>',
    link: function link(scope, elem, attr) {
      var dataTables = $parse(attr.boDatatables)(scope);
      var data = dataTables.data || $.get(dataTables.url).then(function (realData) {
        return realData[dataTables.field];
      });
      $.when(data).then(function (realData) {
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
      });
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
}, {"../utils/module":10}],
10: [function(require, module, exports) {
'use strict';

var utilModule = angular.module('backoffice.utils', []);

utilModule.factory('boUtils', function () {
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
}, {"../third_party/angular-translate":7,"./i18n/translations.en.json":11,"./i18n/translations.ko.json":12,"./controllers.js":13}],
7: [function(require, module, exports) {
'use strict';

module.exports = require('angular-translate/bower-angular-translate@2.7.2:angular-translate.min.js');
}, {"angular-translate/bower-angular-translate@2.7.2:angular-translate.min.js":14}],
14: [function(require, module, exports) {
/*!
 * angular-translate - v2.7.2 - 2015-06-01
 * http://github.com/angular-translate/angular-translate
 * Copyright (c) 2015 ; Licensed MIT
 */
!function(a,b){"function"==typeof define&&define.amd?define([],function(){return b()}):"object"==typeof exports?module.exports=b():b()}(this,function(){function a(a){"use strict";var b=a.storageKey(),c=a.storage(),d=function(){var d=a.preferredLanguage();angular.isString(d)?a.use(d):c.put(b,a.use())};d.displayName="fallbackFromIncorrectStorageValue",c?c.get(b)?a.use(c.get(b))["catch"](d):d():angular.isString(a.preferredLanguage())&&a.use(a.preferredLanguage())}function b(){"use strict";var a,b,c=null,d=!1,e=!1;b={sanitize:function(a,b){return"text"===b&&(a=g(a)),a},escape:function(a,b){return"text"===b&&(a=f(a)),a},sanitizeParameters:function(a,b){return"params"===b&&(a=h(a,g)),a},escapeParameters:function(a,b){return"params"===b&&(a=h(a,f)),a}},b.escaped=b.escapeParameters,this.addStrategy=function(a,c){return b[a]=c,this},this.removeStrategy=function(a){return delete b[a],this},this.useStrategy=function(a){return d=!0,c=a,this},this.$get=["$injector","$log",function(f,g){var h=function(a,c,d){return angular.forEach(d,function(d){if(angular.isFunction(d))a=d(a,c);else{if(!angular.isFunction(b[d]))throw new Error("pascalprecht.translate.$translateSanitization: Unknown sanitization strategy: '"+d+"'");a=b[d](a,c)}}),a},i=function(){d||e||(g.warn("pascalprecht.translate.$translateSanitization: No sanitization strategy has been configured. This can have serious security implications. See http://angular-translate.github.io/docs/#/guide/19_security for details."),e=!0)};return f.has("$sanitize")&&(a=f.get("$sanitize")),{useStrategy:function(a){return function(b){a.useStrategy(b)}}(this),sanitize:function(a,b,d){if(c||i(),arguments.length<3&&(d=c),!d)return a;var e=angular.isArray(d)?d:[d];return h(a,b,e)}}}];var f=function(a){var b=angular.element("<div></div>");return b.text(a),b.html()},g=function(b){if(!a)throw new Error("pascalprecht.translate.$translateSanitization: Error cannot find $sanitize service. Either include the ngSanitize module (https://docs.angularjs.org/api/ngSanitize) or use a sanitization strategy which does not depend on $sanitize, such as 'escape'.");return a(b)},h=function(a,b){if(angular.isObject(a)){var c=angular.isArray(a)?[]:{};return angular.forEach(a,function(a,d){c[d]=h(a,b)}),c}return angular.isNumber(a)?a:b(a)}}function c(a,b,c,d){"use strict";var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t={},u=[],v=a,w=[],x="translate-cloak",y=!1,z=!1,A=".",B=0,C=!0,D="default",E={"default":function(a){return(a||"").split("-").join("_")},java:function(a){var b=(a||"").split("-").join("_"),c=b.split("_");return c.length>1?c[0].toLowerCase()+"_"+c[1].toUpperCase():b},bcp47:function(a){var b=(a||"").split("_").join("-"),c=b.split("-");return c.length>1?c[0].toLowerCase()+"-"+c[1].toUpperCase():b}},F="2.7.2",G=function(){if(angular.isFunction(d.getLocale))return d.getLocale();var a,c,e=b.$get().navigator,f=["language","browserLanguage","systemLanguage","userLanguage"];if(angular.isArray(e.languages))for(a=0;a<e.languages.length;a++)if(c=e.languages[a],c&&c.length)return c;for(a=0;a<f.length;a++)if(c=e[f[a]],c&&c.length)return c;return null};G.displayName="angular-translate/service: getFirstBrowserLanguage";var H=function(){var a=G()||"";return E[D]&&(a=E[D](a)),a};H.displayName="angular-translate/service: getLocale";var I=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},J=function(){return this.toString().replace(/^\s+|\s+$/g,"")},K=function(a){for(var b=[],c=angular.lowercase(a),d=0,e=u.length;e>d;d++)b.push(angular.lowercase(u[d]));if(I(b,c)>-1)return a;if(f){var g;for(var h in f){var i=!1,j=Object.prototype.hasOwnProperty.call(f,h)&&angular.lowercase(h)===angular.lowercase(a);if("*"===h.slice(-1)&&(i=h.slice(0,-1)===a.slice(0,h.length-1)),(j||i)&&(g=f[h],I(b,angular.lowercase(g))>-1))return g}}if(a){var k=a.split("_");if(k.length>1&&I(b,angular.lowercase(k[0]))>-1)return k[0]}return a},L=function(a,b){if(!a&&!b)return t;if(a&&!b){if(angular.isString(a))return t[a]}else angular.isObject(t[a])||(t[a]={}),angular.extend(t[a],M(b));return this};this.translations=L,this.cloakClassName=function(a){return a?(x=a,this):x};var M=function(a,b,c,d){var e,f,g,h;b||(b=[]),c||(c={});for(e in a)Object.prototype.hasOwnProperty.call(a,e)&&(h=a[e],angular.isObject(h)?M(h,b.concat(e),c,e):(f=b.length?""+b.join(A)+A+e:e,b.length&&e===d&&(g=""+b.join(A),c[g]="@:"+f),c[f]=h));return c};M.displayName="flatObject",this.addInterpolation=function(a){return w.push(a),this},this.useMessageFormatInterpolation=function(){return this.useInterpolation("$translateMessageFormatInterpolation")},this.useInterpolation=function(a){return n=a,this},this.useSanitizeValueStrategy=function(a){return c.useStrategy(a),this},this.preferredLanguage=function(a){return N(a),this};var N=function(a){return a&&(e=a),e};this.translationNotFoundIndicator=function(a){return this.translationNotFoundIndicatorLeft(a),this.translationNotFoundIndicatorRight(a),this},this.translationNotFoundIndicatorLeft=function(a){return a?(q=a,this):q},this.translationNotFoundIndicatorRight=function(a){return a?(r=a,this):r},this.fallbackLanguage=function(a){return O(a),this};var O=function(a){return a?(angular.isString(a)?(h=!0,g=[a]):angular.isArray(a)&&(h=!1,g=a),angular.isString(e)&&I(g,e)<0&&g.push(e),this):h?g[0]:g};this.use=function(a){if(a){if(!t[a]&&!o)throw new Error("$translateProvider couldn't find translationTable for langKey: '"+a+"'");return i=a,this}return i};var P=function(a){return a?(v=a,this):l?l+v:v};this.storageKey=P,this.useUrlLoader=function(a,b){return this.useLoader("$translateUrlLoader",angular.extend({url:a},b))},this.useStaticFilesLoader=function(a){return this.useLoader("$translateStaticFilesLoader",a)},this.useLoader=function(a,b){return o=a,p=b||{},this},this.useLocalStorage=function(){return this.useStorage("$translateLocalStorage")},this.useCookieStorage=function(){return this.useStorage("$translateCookieStorage")},this.useStorage=function(a){return k=a,this},this.storagePrefix=function(a){return a?(l=a,this):a},this.useMissingTranslationHandlerLog=function(){return this.useMissingTranslationHandler("$translateMissingTranslationHandlerLog")},this.useMissingTranslationHandler=function(a){return m=a,this},this.usePostCompiling=function(a){return y=!!a,this},this.forceAsyncReload=function(a){return z=!!a,this},this.uniformLanguageTag=function(a){return a?angular.isString(a)&&(a={standard:a}):a={},D=a.standard,this},this.determinePreferredLanguage=function(a){var b=a&&angular.isFunction(a)?a():H();return e=u.length?K(b):b,this},this.registerAvailableLanguageKeys=function(a,b){return a?(u=a,b&&(f=b),this):u},this.useLoaderCache=function(a){return a===!1?s=void 0:a===!0?s=!0:"undefined"==typeof a?s="$translationCache":a&&(s=a),this},this.directivePriority=function(a){return void 0===a?B:(B=a,this)},this.statefulFilter=function(a){return void 0===a?C:(C=a,this)},this.$get=["$log","$injector","$rootScope","$q",function(a,b,c,d){var f,l,u,A=b.get(n||"$translateDefaultInterpolation"),D=!1,E={},G={},H=function(a,b,c,h){if(angular.isArray(a)){var j=function(a){for(var e={},f=[],g=function(a){var f=d.defer(),g=function(b){e[a]=b,f.resolve([a,b])};return H(a,b,c,h).then(g,g),f.promise},i=0,j=a.length;j>i;i++)f.push(g(a[i]));return d.all(f).then(function(){return e})};return j(a)}var m=d.defer();a&&(a=J.apply(a));var n=function(){var a=e?G[e]:G[i];if(l=0,k&&!a){var b=f.get(v);if(a=G[b],g&&g.length){var c=I(g,b);l=0===c?1:0,I(g,e)<0&&g.push(e)}}return a}();if(n){var o=function(){ab(a,b,c,h).then(m.resolve,m.reject)};o.displayName="promiseResolved",n["finally"](o,m.reject)}else ab(a,b,c,h).then(m.resolve,m.reject);return m.promise},Q=function(a){return q&&(a=[q,a].join(" ")),r&&(a=[a,r].join(" ")),a},R=function(a){i=a,c.$emit("$translateChangeSuccess",{language:a}),k&&f.put(H.storageKey(),i),A.setLocale(i);var b=function(a,b){E[b].setLocale(i)};b.displayName="eachInterpolatorLocaleSetter",angular.forEach(E,b),c.$emit("$translateChangeEnd",{language:a})},S=function(a){if(!a)throw"No language key specified for loading.";var e=d.defer();c.$emit("$translateLoadingStart",{language:a}),D=!0;var f=s;"string"==typeof f&&(f=b.get(f));var g=angular.extend({},p,{key:a,$http:angular.extend({},{cache:f},p.$http)}),h=function(b){var d={};c.$emit("$translateLoadingSuccess",{language:a}),angular.isArray(b)?angular.forEach(b,function(a){angular.extend(d,M(a))}):angular.extend(d,M(b)),D=!1,e.resolve({key:a,table:d}),c.$emit("$translateLoadingEnd",{language:a})};h.displayName="onLoaderSuccess";var i=function(a){c.$emit("$translateLoadingError",{language:a}),e.reject(a),c.$emit("$translateLoadingEnd",{language:a})};return i.displayName="onLoaderError",b.get(o)(g).then(h,i),e.promise};if(k&&(f=b.get(k),!f.get||!f.put))throw new Error("Couldn't use storage '"+k+"', missing get() or put() method!");if(w.length){var T=function(a){var c=b.get(a);c.setLocale(e||i),E[c.getInterpolationIdentifier()]=c};T.displayName="interpolationFactoryAdder",angular.forEach(w,T)}var U=function(a){var b=d.defer();if(Object.prototype.hasOwnProperty.call(t,a))b.resolve(t[a]);else if(G[a]){var c=function(a){L(a.key,a.table),b.resolve(a.table)};c.displayName="translationTableResolver",G[a].then(c,b.reject)}else b.reject();return b.promise},V=function(a,b,c,e){var f=d.defer(),g=function(d){if(Object.prototype.hasOwnProperty.call(d,b)){e.setLocale(a);var g=d[b];"@:"===g.substr(0,2)?V(a,g.substr(2),c,e).then(f.resolve,f.reject):f.resolve(e.interpolate(d[b],c)),e.setLocale(i)}else f.reject()};return g.displayName="fallbackTranslationResolver",U(a).then(g,f.reject),f.promise},W=function(a,b,c,d){var e,f=t[a];if(f&&Object.prototype.hasOwnProperty.call(f,b)){if(d.setLocale(a),e=d.interpolate(f[b],c),"@:"===e.substr(0,2))return W(a,e.substr(2),c,d);d.setLocale(i)}return e},X=function(a,c){if(m){var d=b.get(m)(a,i,c);return void 0!==d?d:a}return a},Y=function(a,b,c,e,f){var h=d.defer();if(a<g.length){var i=g[a];V(i,b,c,e).then(h.resolve,function(){Y(a+1,b,c,e,f).then(h.resolve)})}else h.resolve(f?f:X(b,c));return h.promise},Z=function(a,b,c,d){var e;if(a<g.length){var f=g[a];e=W(f,b,c,d),e||(e=Z(a+1,b,c,d))}return e},$=function(a,b,c,d){return Y(u>0?u:l,a,b,c,d)},_=function(a,b,c){return Z(u>0?u:l,a,b,c)},ab=function(a,b,c,e){var f=d.defer(),h=i?t[i]:t,j=c?E[c]:A;if(h&&Object.prototype.hasOwnProperty.call(h,a)){var k=h[a];"@:"===k.substr(0,2)?H(k.substr(2),b,c,e).then(f.resolve,f.reject):f.resolve(j.interpolate(k,b))}else{var l;m&&!D&&(l=X(a,b)),i&&g&&g.length?$(a,b,j,e).then(function(a){f.resolve(a)},function(a){f.reject(Q(a))}):m&&!D&&l?f.resolve(e?e:l):e?f.resolve(e):f.reject(Q(a))}return f.promise},bb=function(a,b,c){var d,e=i?t[i]:t,f=A;if(E&&Object.prototype.hasOwnProperty.call(E,c)&&(f=E[c]),e&&Object.prototype.hasOwnProperty.call(e,a)){var h=e[a];d="@:"===h.substr(0,2)?bb(h.substr(2),b,c):f.interpolate(h,b)}else{var j;m&&!D&&(j=X(a,b)),i&&g&&g.length?(l=0,d=_(a,b,f)):d=m&&!D&&j?j:Q(a)}return d},cb=function(a){j===a&&(j=void 0),G[a]=void 0};if(H.preferredLanguage=function(a){return a&&N(a),e},H.cloakClassName=function(){return x},H.fallbackLanguage=function(a){if(void 0!==a&&null!==a){if(O(a),o&&g&&g.length)for(var b=0,c=g.length;c>b;b++)G[g[b]]||(G[g[b]]=S(g[b]));H.use(H.use())}return h?g[0]:g},H.useFallbackLanguage=function(a){if(void 0!==a&&null!==a)if(a){var b=I(g,a);b>-1&&(u=b)}else u=0},H.proposedLanguage=function(){return j},H.storage=function(){return f},H.use=function(a){if(!a)return i;var b=d.defer();c.$emit("$translateChangeStart",{language:a});var e=K(a);return e&&(a=e),!z&&t[a]||!o||G[a]?j===a&&G[a]?G[a].then(function(a){return b.resolve(a.key),a},function(a){return b.reject(a),d.reject(a)}):(b.resolve(a),R(a)):(j=a,G[a]=S(a).then(function(a){return L(a.key,a.table),b.resolve(a.key),R(a.key),a},function(a){return c.$emit("$translateChangeError",{language:a}),b.reject(a),c.$emit("$translateChangeEnd",{language:a}),d.reject(a)}),G[a]["finally"](function(){cb(a)})),b.promise},H.storageKey=function(){return P()},H.isPostCompilingEnabled=function(){return y},H.isForceAsyncReloadEnabled=function(){return z},H.refresh=function(a){function b(){f.resolve(),c.$emit("$translateRefreshEnd",{language:a})}function e(){f.reject(),c.$emit("$translateRefreshEnd",{language:a})}if(!o)throw new Error("Couldn't refresh translation table, no loader registered!");var f=d.defer();if(c.$emit("$translateRefreshStart",{language:a}),a)if(t[a]){var h=function(c){L(c.key,c.table),a===i&&R(i),b()};h.displayName="refreshPostProcessor",S(a).then(h,e)}else e();else{var j=[],k={};if(g&&g.length)for(var l=0,m=g.length;m>l;l++)j.push(S(g[l])),k[g[l]]=!0;i&&!k[i]&&j.push(S(i));var n=function(a){t={},angular.forEach(a,function(a){L(a.key,a.table)}),i&&R(i),b()};n.displayName="refreshPostProcessor",d.all(j).then(n,e)}return f.promise},H.instant=function(a,b,c){if(null===a||angular.isUndefined(a))return a;if(angular.isArray(a)){for(var d={},f=0,h=a.length;h>f;f++)d[a[f]]=H.instant(a[f],b,c);return d}if(angular.isString(a)&&a.length<1)return a;a&&(a=J.apply(a));var j,k=[];e&&k.push(e),i&&k.push(i),g&&g.length&&(k=k.concat(g));for(var l=0,n=k.length;n>l;l++){var o=k[l];if(t[o]&&("undefined"!=typeof t[o][a]?j=bb(a,b,c):(q||r)&&(j=Q(a))),"undefined"!=typeof j)break}return j||""===j||(j=A.interpolate(a,b),m&&!D&&(j=X(a,b))),j},H.versionInfo=function(){return F},H.loaderCache=function(){return s},H.directivePriority=function(){return B},H.statefulFilter=function(){return C},o&&(angular.equals(t,{})&&H.use(H.use()),g&&g.length))for(var db=function(a){return L(a.key,a.table),c.$emit("$translateChangeEnd",{language:a.key}),a},eb=0,fb=g.length;fb>eb;eb++){var gb=g[eb];(z||!t[gb])&&(G[gb]=S(gb).then(db))}return H}]}function d(a,b){"use strict";var c,d={},e="default";return d.setLocale=function(a){c=a},d.getInterpolationIdentifier=function(){return e},d.useSanitizeValueStrategy=function(a){return b.useStrategy(a),this},d.interpolate=function(c,d){d=d||{},d=b.sanitize(d,"params");var e=a(c)(d);return e=b.sanitize(e,"text")},d}function e(a,b,c,d,e,f){"use strict";var g=function(){return this.toString().replace(/^\s+|\s+$/g,"")};return{restrict:"AE",scope:!0,priority:a.directivePriority(),compile:function(b,h){var i=h.translateValues?h.translateValues:void 0,j=h.translateInterpolation?h.translateInterpolation:void 0,k=b[0].outerHTML.match(/translate-value-+/i),l="^(.*)("+c.startSymbol()+".*"+c.endSymbol()+")(.*)",m="^(.*)"+c.startSymbol()+"(.*)"+c.endSymbol()+"(.*)";return function(b,n,o){b.interpolateParams={},b.preText="",b.postText="";var p={},q=function(a,c,d){if(c.translateValues&&angular.extend(a,e(c.translateValues)(b.$parent)),k)for(var f in d)if(Object.prototype.hasOwnProperty.call(c,f)&&"translateValue"===f.substr(0,14)&&"translateValues"!==f){var g=angular.lowercase(f.substr(14,1))+f.substr(15);a[g]=d[f]}},r=function(a){if(angular.isFunction(r._unwatchOld)&&(r._unwatchOld(),r._unwatchOld=void 0),angular.equals(a,"")||!angular.isDefined(a)){var d=g.apply(n.text()).match(l);if(angular.isArray(d)){b.preText=d[1],b.postText=d[3],p.translate=c(d[2])(b.$parent);var e=n.text().match(m);angular.isArray(e)&&e[2]&&e[2].length&&(r._unwatchOld=b.$watch(e[2],function(a){p.translate=a,x()}))}else p.translate=n.text().replace(/^\s+|\s+$/g,"")}else p.translate=a;x()},s=function(a){o.$observe(a,function(b){p[a]=b,x()})};q(b.interpolateParams,o,h);var t=!0;o.$observe("translate",function(a){"undefined"==typeof a?r(""):""===a&&t||(p.translate=a,x()),t=!1});for(var u in o)o.hasOwnProperty(u)&&"translateAttr"===u.substr(0,13)&&s(u);if(o.$observe("translateDefault",function(a){b.defaultText=a}),i&&o.$observe("translateValues",function(a){a&&b.$parent.$watch(function(){angular.extend(b.interpolateParams,e(a)(b.$parent))})}),k){var v=function(a){o.$observe(a,function(c){var d=angular.lowercase(a.substr(14,1))+a.substr(15);b.interpolateParams[d]=c})};for(var w in o)Object.prototype.hasOwnProperty.call(o,w)&&"translateValue"===w.substr(0,14)&&"translateValues"!==w&&v(w)}var x=function(){for(var a in p)p.hasOwnProperty(a)&&void 0!==p[a]&&y(a,p[a],b,b.interpolateParams,b.defaultText)},y=function(b,c,d,e,f){c?a(c,e,j,f).then(function(a){z(a,d,!0,b)},function(a){z(a,d,!1,b)}):z(c,d,!1,b)},z=function(b,c,e,f){if("translate"===f){e||"undefined"==typeof c.defaultText||(b=c.defaultText),n.html(c.preText+b+c.postText);var g=a.isPostCompilingEnabled(),i="undefined"!=typeof h.translateCompile,j=i&&"false"!==h.translateCompile;(g&&!i||j)&&d(n.contents())(c)}else{e||"undefined"==typeof c.defaultText||(b=c.defaultText);var k=o.$attr[f];"data-"===k.substr(0,5)&&(k=k.substr(5)),k=k.substr(15),n.attr(k,b)}};(i||k||o.translateDefault)&&b.$watch("interpolateParams",x,!0);var A=f.$on("$translateChangeSuccess",x);n.text().length?r(o.translate?o.translate:""):o.translate&&r(o.translate),x(),b.$on("$destroy",A)}}}}function f(a,b){"use strict";return{compile:function(c){var d=function(){c.addClass(b.cloakClassName())},e=function(){c.removeClass(b.cloakClassName())},f=a.$on("$translateChangeEnd",function(){e(),f(),f=null});return d(),function(a,c,f){f.translateCloak&&f.translateCloak.length&&f.$observe("translateCloak",function(a){b(a).then(e,d)})}}}}function g(a,b){"use strict";var c=function(c,d,e){return angular.isObject(d)||(d=a(d)(this)),b.instant(c,d,e)};return b.statefulFilter()&&(c.$stateful=!0),c}function h(a){"use strict";return a("translations")}return angular.module("pascalprecht.translate",["ng"]).run(a),a.$inject=["$translate"],a.displayName="runTranslate",angular.module("pascalprecht.translate").provider("$translateSanitization",b),angular.module("pascalprecht.translate").constant("pascalprechtTranslateOverrider",{}).provider("$translate",c),c.$inject=["$STORAGE_KEY","$windowProvider","$translateSanitizationProvider","pascalprechtTranslateOverrider"],c.displayName="displayName",angular.module("pascalprecht.translate").factory("$translateDefaultInterpolation",d),d.$inject=["$interpolate","$translateSanitization"],d.displayName="$translateDefaultInterpolation",angular.module("pascalprecht.translate").constant("$STORAGE_KEY","NG_TRANSLATE_LANG_KEY"),angular.module("pascalprecht.translate").directive("translate",e),e.$inject=["$translate","$q","$interpolate","$compile","$parse","$rootScope"],e.displayName="translateDirective",angular.module("pascalprecht.translate").directive("translateCloak",f),f.$inject=["$rootScope","$translate"],f.displayName="translateCloakDirective",angular.module("pascalprecht.translate").filter("translate",g),g.$inject=["$parse","$translate"],g.displayName="translateFilterFactory",angular.module("pascalprecht.translate").factory("$translationCache",h),h.$inject=["$cacheFactory"],h.displayName="$translationCache","pascalprecht.translate"});
}, {}],
11: [function(require, module, exports) {
module.exports = {
  "dashboard": {
    "home": "홈"
  }
};
}, {}],
12: [function(require, module, exports) {
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
13: [function(require, module, exports) {
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
  });
});

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../third_party/angular-translate":7,"./i18n/translations.en.json":15,"./i18n/translations.ko.json":16,"./controllers.js":17}],
15: [function(require, module, exports) {
module.exports = {

};
}, {}],
16: [function(require, module, exports) {
module.exports = {
  "user": {
    "createUser": "유저 생성",
    "manage": {
      "title": "사용자 관리"
    }
  }
};
}, {}],
17: [function(require, module, exports) {
'use strict';

var userModule = require('./module');

userModule.controller('UserManageController', function ($scope, $http, $state, $rootScope, $translate) {
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

  $scope.newUser = {};
  $scope.createUser = function (user) {
    $http.post('/api/v1/users', user).then(function () {
      $scope.closeUserPopup();
    }, function (res) {
      window.alert(res.data.message);
    });
  };
  $scope.closeUserPopup = function () {
    $('#user_manage_create_user').modal('hide');
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
    url: '/add',
    templateUrl: templateRoot + '/product/edit.html',
    controller: 'ProductEditController',
    resolve: {
      product: function product() {
        return { name: {}, price: {} };
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
          return res.data;
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
  });
});

module.exports = productModule;

// BEGIN module require js
require('./controllers.js');
// END module require js
}, {"../third_party/angular-translate":7,"./i18n/translations.en.json":18,"./i18n/translations.ko.json":19,"./controllers.js":20}],
18: [function(require, module, exports) {
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
19: [function(require, module, exports) {
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
    }
  }
};
}, {}],
20: [function(require, module, exports) {
'use strict';

var productModule = require('./module.js');

productModule.controller('ProductMainController', function ($scope, $state, $rootScope, $translate, boConfig) {
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
    }]
  };
  $scope.fileContents = 'before';
});

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

            if (productVariant.stock < 0) {
              continue;
            }
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

      return $http.put(url, product).then(function (res) {
        var promises = [];
        var pvUrl = '/api/v1/products/' + product.id + '/product_variants';
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = productVariants[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var productVariant = _step2.value;

            if (productVariant.stock < 0) {
              continue;
            }
            oldProductVariants['delete'](productVariant.id);
            if (!productVariant.id) {
              promises.push($http.post(pvUrl, productVariant));
            } else {
              promises.push($http.put(pvUrl + '/' + productVariant.id, productVariant));
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

productModule.controller('ProductEditController', function ($scope, $http, $state, $rootScope, $translate, product, categories, productUtil) {
  var initFromProduct = function initFromProduct() {
    var titleKey = 'product.edit.createTitle';
    $scope.product = product;
    if ($scope.product.id) {
      titleKey = 'product.edit.updateTitle';
    }
    $scope.productVariantsMap = {};
    $scope.origVariants = new Set();
    if ($scope.product.productVariants) {
      $scope.productVariants = $scope.product.productVariants;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = $scope.productVariants[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var productVariant = _step4.value;

          $scope.productVariantsMap[productVariant.sku] = productVariant;
          $scope.origVariants.add(productVariant.id);
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
    } else {
      $scope.productVariants = [];
    }
    // 2016. 01. 21. [heekyu] products' categories
    $scope.productCategorySet = new Set();
    if (!$scope.product.categories) {
      $scope.product.categories = [];
    }
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = $scope.product.categories[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var productCategory = _step5.value;

        if ($scope.productCategorySet.has(productCategory)) {
          window.alert('[DATA ERROR] (' + productCategory + ') is contained multiple');
          continue;
        }
        $scope.productCategorySet.add(productCategory);
      }
      // 2016. 01. 21. [heekyu] products' categories
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
  $scope.inputFields = [];

  // BEGIN Manipulate Variant Kinds
  $scope.variantKinds = [{ name: '사이즈', kinds: ['S', 'M', 'Free'] }, { name: '색상', kinds: ['blue', 'red'] }];

  $scope.newObjects = {
    variantKind: '',
    variantKindItem: ''
  };

  $scope.addVariantKind = function (name) {
    if (name && name.trim() !== '') {
      $scope.newObjects.variantKind = '';
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = $scope.variantKinds[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var kind = _step6.value;

          if (kind.name === name) {
            $scope.hideAddItemBox();
            window.alert('duplicate name');
            return false;
          }
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

      $scope.variantKinds.push({ name: name, kinds: [] });
      // TODO enhance hiding add item box
      $scope.hideAddItemBox();
    }
  };
  $scope.addVariantKindItem = function (index, name) {
    if (name && name.trim() !== '') {
      $scope.newObjects.variantKindItem = '';
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = $scope.variantKinds[index].kinds[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var kindItem = _step7.value;

          if (kindItem === name) {
            $scope.hideAddItemBox();
            window.alert('duplicate name');
            return false;
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7['return']) {
            _iterator7['return']();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
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
    if (!$scope.product.sku || $scope.product.sku === '') {
      window.alert('insert SKU first.'); // TODO message
      return false;
    }
    var newVariantSKUs = [];
    var idx = 0;
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = $scope.variantKinds[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var variantKind = _step8.value;

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
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = variantKind.kinds[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var kind = _step9.value;

              newVariantSKUs.push(newVariantSKU + '-' + kind);
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9['return']) {
                _iterator9['return']();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8['return']) {
          _iterator8['return']();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
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
        var newVariant = { sku: newVariantSKU, price: { KRW: 0 }, stock: -1 };
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

  $scope.saveAndContinue = function () {
    // 2016. 01. 18. [heekyu] save images
    $scope.imageToProduct();
    if (!$scope.product.id) {
      return productUtil.createProduct($scope.product, $scope.productVariants).then(function (res) {
        $state.go('product.edit', { productId: res.product.id });
      }, function (err) {
        window.alert('Product Create Fail' + err.data);
      });
    } else {
      return productUtil.updateProduct($scope.product, $scope.productVariants, $scope.origVariants).then(function (res) {
        $state.go('product.edit', { productId: res.product.id });
        $scope.origVariants.clear();
      }, function (err) {
        window.alert('Product Update Fail' + err.data);
        $scope.origVariants.clear();
        return err;
      });
    }
  };

  $scope.save = function () {
    var createOrUpdate = !$scope.product.id; // create is true
    $scope.saveAndContinue().then(function (err) {
      if (!createOrUpdate && !err) {
        $state.go('product.main');
      }
    });
  };

  $scope.images = [];

  $scope.generateImages = function () {
    $scope.images.length = 0;
    if ($scope.product.appImages && $scope.product.appImages['default'] && $scope.product.appImages['default'].length > 0) {
      $scope.product.appImages['default'].map(function (image) {
        image.product = $scope.product;
        $scope.images.push(image);
      });
    }
    $scope.productVariants.map(function (productVariant) {
      if (productVariant.appImages && productVariant.appImages && productVariant.appImages['default'].length > 0) {
        productVariant.appImages['default'].map(function (image) {
          image.product = productVariant;
          $scope.images.push(image);
        });
      }
    });
  };
  $scope.generateImages();
  $scope.imageToProduct = function () {
    $scope.product.appImages = { 'default': [] };
    $scope.productVariants.map(function (productVariant) {
      productVariant.appImages = { 'default': [] };
    });
    $scope.images.map(function (image) {
      image.product.appImages['default'].push(_.omit(image, 'product'));
    });
  };

  $scope.imageUploaded = function (result) {
    $scope.images.push({
      url: result.url.slice(5),
      publicId: result.public_id,
      version: result.version,
      product: $scope.product,
      mainImage: false,
      thumbnail: false
    });
  };

  $scope.newProductVariant = { price: {} };
  $scope.addProductVariant = function (newProductVariant) {
    if (!newProductVariant.sku || newProductVariant.sku === '') {
      window.alert('sku must be valid string');
      return;
    }
    if ($scope.productVariantsMap[newProductVariant.sku]) {
      window.alert(newProductVariant.sku + ' already exists');
      return;
    }
    if (newProductVariant.price <= 0 || newProductVariant.stock < 0) {
      window.alert('Price > 0, Stock >= 0');
      return;
    }
    $scope.newProductVariant = { price: {} };
    $scope.productVariants.push(newProductVariant);
    $scope.productVariantsMap[newProductVariant.sku] = newProductVariant;
  };
  $scope.removeProductVariant = function (index) {
    $scope.productVariants.splice(index, 1);
  };
  $scope.removeImage = function (index) {
    $scope.images.splice(index, 1);
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
});

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

  $scope.root = categories;
  var categoryIdMap = {};
  var currentCategoryId = $state.params.categoryId;
  if (!currentCategoryId) {
    currentCategoryId = $scope.root.id;
  }
  $scope.root.name.ko = $translate.instant('product.category.rootName'); // TODO root name i18n

  var getTreeData = function getTreeData(root, currentCategoryId) {
    var json = {
      id: root.id,
      text: root.name ? root.name.ko : 'NoName',
      data: { id: root.id },
      state: { selected: false, opened: true } };
    /* TODO disabled: !root.isActive, */
    categoryIdMap[root.id] = root;
    if (currentCategoryId && root.id === currentCategoryId) {
      $scope.category = root;
      json.state.selected = true;
    }

    if (root.children) {
      json.children = root.children.map(function (child) {
        return getTreeData(child, $state.params.categoryId);
      });
    }
    return json;
  };

  var jstreeData = getTreeData($scope.root, currentCategoryId);
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
                name: { ko: newNodeName },
                isActive: false,
                parentId: $node.id
              };
              $http.post('/api/v1/categories', newCategory).then(function (res) {
                categoryIdMap[res.data.id] = res.data;
                var newNodeId = tree.create_node($node, res.data.name.ko); // TODO i18n
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
    console.log(data);
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
    $http.put('/api/v1/categories/' + $scope.category.id, $scope.category).then(function (res) {
      var category = res.data;
      categoryIdMap[category.id] = category;
      jstreeNode.jstree('set_text', category.id, category.name.ko); // TODO i18n
      $scope.category = category;
    }, function (err) {
      window.alert(err.data);
    });
  };
});

/**
 * CSS File Rule
 *   1. product variants must be just after it's product
 */
productModule.controller('ProductBatchUploadController', function ($scope, productUtil) {
  var fields = [{ columnName: 'sku', apiName: 'sku' }, { columnName: 'price', apiName: 'price.KRW', convert: function convert(value) {
      return Number(value);
    } }, { columnName: 'qty', apiName: 'stock' }, { columnName: 'product_nickname', apiName: 'data.nickname' }, { columnName: 'category_ids', apiName: 'categories', convert: function convert(value) {
      return value.split(',').map(function (v) {
        return Number(v);
      });
    } }, { columnName: 'seller', apiName: 'data.seller', onlyProduct: true, convert: function convert(value) {
      return Number(value);
    } }];
  $scope.onFileLoad = function (contents) {
    var rows = contents.split('\n');
    if (rows.length < 2) {
      window.alert('There is no data');
      return;
    }
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
      productUtil.createProduct(product, productVariants).then(function () {
        // TODO display Uploaded products
        requestCount--;
        $scope.productCount++;
        $scope.productVariantCount += productVariants.length;
        console.log('End Request.' + requestCount);
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
});
}, {"./module.js":6}],
8: [function(require, module, exports) {
module.exports = {

};
}, {}],
9: [function(require, module, exports) {
module.exports = {
  "main": {
    "createButton": "추가",
    "closeButton": "닫기",
    "deleteButton": "삭제",
    "saveButton": "저장",
    "saveAndContinueButton": "저장 후 계속",
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