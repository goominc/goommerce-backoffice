
const productModule = angular.module('backoffice.product', [
  'ui.router',
  'ui.bootstrap',
  require('../third_party/angular-translate'),
]);

productModule.config(($translateProvider) => {
  $translateProvider
    .translations('en', require('./i18n/translations.en.json'))
    .translations('ko', require('./i18n/translations.ko.json'));
  $translateProvider.preferredLanguage('ko');
});

productModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('product', {
      abstract: true,
      url: '/product',
      template: '<ui-view/>',
    })
    .state('product.main', {
      url: '/main',
      templateUrl: templateRoot + '/product/main.html',
      controller: 'ProductMainController',
    })
    .state('product.add', {
      url: '/add?brandId',
      templateUrl: templateRoot + '/product/edit.html',
      controller: 'ProductEditController',
      resolve: {
        product: () => null,
        categories: ($http) => {
          return $http.get('/api/v1/categories').then((res) => {
            return res.data;
          });
        },
      },
    })
    .state('product.edit', {
      url: '/edit/:productId',
      templateUrl: templateRoot + '/product/edit.html',
      controller: 'ProductEditController',
      resolve: {
        product: ($http, $stateParams, productUtil) => {
          return $http.get('/api/v1/products/' + $stateParams.productId).then((res) => {
            const product = productUtil.narrowProduct(res.data);
            product.productVariants = res.data.productVariants.map((variant) => productUtil.narrowProductVariant(variant));
            return product;
          });
        },
        categories: ($http) => {
          return $http.get('/api/v1/categories').then((res) => {
            return res.data;
          });
        },
      },
    })
    .state('product.category', {
      url: '/category',
      templateUrl: templateRoot + '/product/category.html',
      controller: 'CategoryEditController',
      resolve: {
        categories: ($http) => {
          return $http.get('/api/v1/categories').then((res) => {
            return res.data;
          });
        },
      },
    })
    .state('product.category.child', {
      url: '/:categoryId',
    })
    .state('product.batchUpload', {
      url: '/batch-upload',
      templateUrl: templateRoot + '/product/batch-upload.html',
      controller: 'ProductBatchUploadController',
    })
    .state('product.imageUpload', {
      url: '/image-upload',
      templateUrl: templateRoot + '/product/image-upload.html',
      controller: 'ProductImageUploadController',
    });
});

module.exports = productModule;

productModule.factory('productUtil', ($http, $q) => {
  return {
    createProduct: (product, productVariants) => {
      const url = '/api/v1/products';

      return $http.post(url, product).then((res) => {
        if (!product.id) {
          product.id = res.data.id; // need if create
          // $state.go('product.edit', {productId: $scope.product.id});
        }
        const promises = [];
        const pvUrl = '/api/v1/products/' + product.id + '/product_variants';
        for (const productVariant of productVariants) {
          promises.push($http.post(pvUrl, productVariant));
        }
        return $q.all(promises).then((res2) => {
          return { product: res.data, productVariants: res2.map((item) => item.data) }
        }, (err) => {
          window.alert(err.data);
        });
      }, (err) => {
        window.alert(err.data);
      });
    },
    updateProduct: (product, productVariants, oldProductVariants) => {
      const url = '/api/v1/products/' + product.id;

      return $http.put(url, _.omit(product, ['id', 'productVariants'])).then((res) => {
        const promises = [];
        const pvUrl = '/api/v1/products/' + product.id + '/product_variants';
        for (const productVariant of productVariants) {
          oldProductVariants.delete(productVariant.id);
          if (!productVariant.id) {
            promises.push($http.post(pvUrl, productVariant));
          } else {
            promises.push($http.put(pvUrl + '/' + productVariant.id, _.omit(productVariant, 'id')));
          }
        }
        // 2016. 01. 18. [heekyu] delete removed variants
        if (oldProductVariants.size > 0) {
          for (const deletedVariant of oldProductVariants.values()) {
            promises.push($http({method: 'DELETE', url: pvUrl + '/' + deletedVariant}));
          }
        }

        return $q.all(promises).then((res2) => {
          return { product: res.data, productVariants: res2.map((item) => item.data) }
        }, (err) => {
          window.alert(err.data);
        });
      }, (err) => {
        window.alert(err.data);
      });
    },
    setObjectValue: (obj, key, value, convert) => {
      if (convert) {
        value  = convert(value);
      }
      const paths = key.split('.');
      let curObj = obj;
      paths.forEach((path, index) => {
        if (index === paths.length - 1) {
          curObj[path] = value;
        } else {
          if (!curObj[path]) {
            curObj[path] = {};
          }
          curObj = curObj[path];
        }
      })
    },
    narrowProduct: (product) => _.pick(product, ['id', 'sku', 'KRW', 'categories', 'isActive', 'brand', 'data', 'appImages', 'name']),
    narrowProductVariant: (variant) => _.pick(variant, ['id', 'productId', 'sku', 'KRW', 'data', 'appImages']),
  };
});

// BEGIN module require js
require('./controllers/ProductMainController');
require('./controllers/ProductEditController');
require('./controllers/CategoryEditController');
require('./controllers/ProductBatchUploadController');
require('./controllers/ProductImageUploadController');
// END module require js
