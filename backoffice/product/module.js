
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

  const narrowProduct = (product) => _.pick(product, ['id', 'sku', 'KRW', 'categories', 'isActive', 'brand', 'data', 'appImages']);
  const narrowProductVariant = (variant) => _.pick(variant, ['id', 'productId', 'sku', 'KRW', 'data', 'appImages']);

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
      url: '/add',
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
        product: ($http, $stateParams) => {
          return $http.get('/api/v1/products/' + $stateParams.productId).then((res) => {
            const product = narrowProduct(res.data);
            product.productVariants = res.data.productVariants.map((variant) => narrowProductVariant(variant));
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
      resolve: {
        brands: ($http, $q) => {
          const collectByBrand = (products) => {
            const brandMap = {};
            products.forEach((product) => {
              const brandId = _.get(product, 'brand.id');
              if (!brandId) return;
              if (!brandMap[brandId]) {
                brandMap[brandId] = { brand: product.brand, products: [] };
              }
              brandMap[brandId].products.push(product);
            });
            return Object.keys(brandMap).map((key) => brandMap[key]);
          };
          const maxProductCount = 20;
          return $http.get(`/api/v1/products?limit=${maxProductCount}`).then((res) => {
            const products = res.data.products;
            // 2016. 04. 04. [heekyu] older product is front
            for (let i = 0; i < products.length / 2; i++) {
              const tmp = products[i];
              products[i] = products[products.length - 1 - i];
              products[products.length - 1 - i] = tmp;
            }
            // Array.reverse(products); why Array.reverse does not exist?
            const len = products.length;
            const promises = [];
            for (let i = 0; i < len; i++) {
              const product = narrowProduct(products[i]);
              products[i] = product;
              promises.push($http.get(`/api/v1/products/${product.id}/product_variants`).then((res2) => {
                product.productVariants = res2.data.productVariants.map((variant) => narrowProductVariant(variant));
              }));
            }
            return $q.all(promises).then(() => {
              return collectByBrand(products);;
            });
          });
        },
      },
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
  };
});

// BEGIN module require js
require('./controllers/ProductMainController');
require('./controllers/ProductEditController');
require('./controllers/CategoryEditController');
require('./controllers/ProductBatchUploadController');
require('./controllers/ProductImageUploadController');
// END module require js