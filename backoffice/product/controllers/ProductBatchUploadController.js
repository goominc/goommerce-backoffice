// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module.js');

/**
 * CSV File Rule
 *   1. product variants must be just after it's product
 */
productModule.controller('ProductBatchUploadController', ($scope, $state, $rootScope, $translate, productUtil) => {
  $scope.contentTitle = $translate.instant('product.batchUpload.title');
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'product.main',
      name: $translate.instant('product.main.title'),
    },
    {
      sref: '-',
      name: $translate.instant('product.batchUpload.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  const fields = [
    {columnName: 'sku', apiName: 'sku'},
    {columnName: 'price', apiName: 'price.KRW', onlyProductVariant: true, convert: (value) => Number(value)},
    {columnName: 'qty', apiName: 'stock', onlyProductVariant: true},
    {columnName: 'product_nickname', apiName: 'data.nickname'},
    {columnName: 'category_ids', apiName: 'categories', onlyProduct: true, convert: (value) => value.split(',').map((v) => Number(v))},
    {columnName: 'seller', apiName: 'data.seller', onlyProduct: true, convert: (value) => Number(value)},
    {columnName: 'size', apiName: 'data.size', onlyProductVariant: true},
    {columnName: 'color', apiName: 'data.color', onlyProductVariant: true},
  ];
  $scope.rowCount = 0;
  $scope.productCount = $rootScope.state.batchUploadedProducts.length;
  $scope.productVariantCount = 0;

  for (let i = 0; i < $rootScope.state.batchUploadedProducts.length; i++) {
    const product = $rootScope.state.batchUploadedProducts[i];
    $scope.productVariantCount += product.productVariants ? product.productVariants.length : 0;
  }

  $scope.onFileLoad = (contents) => {
    const rows = contents.split('\n');
    if (rows.length < 2) {
      window.alert('There is no data');
      return;
    }
    $scope.resetUploaded();

    const columns = $.csv.toArray(rows[0]);
    const columnCount = columns.length;
    for (let idx = 0; idx < columnCount; idx++) {
      const column = columns[idx].trim();
      for (var i = 0; i < fields.length; i++) {
        if (fields[i].columnName === column) {
          console.log (fields[i].apiName + ' is in ' + idx);
          fields[i].idx = idx;
          break;
        }
      }
    }
    $scope.rowCount = rows.length - 1;
    $scope.productCount = 0;
    $scope.productVariantCount = 0;

    let requestCount = 0;
    let currentProduct = { sku: '\\-x*;:/' };

    const startCreate = (product, productVariants) => {
      requestCount++;
      console.log('Start Request.' + requestCount);
      productUtil.createProduct(product, productVariants).then((res) => {
        requestCount--;
        console.log('End Request.' + requestCount);
        if (!res || !res.product) {
          return;
        }
        $scope.productCount++;
        $scope.productVariantCount += productVariants.length;
        $rootScope.state.batchUploadedProducts.push(_.assign({}, product, { productVariants }));
      });
    };
    let productVariants = [];
    for (let i = 1; i < rows.length; i++) {
      const columns = $.csv.toArray(rows[i]);
      if (columns.length < 2) {
        console.log('skip');
        continue;
      } else if (columns.length < columnCount) {
        window.alert('lack columns : ' + columns);
        continue;
      }
      if (columns[fields[0].idx].startsWith(currentProduct.sku)) {
        // product variant
        const productVariant = {};
        for (let j = 0; j < fields.length; j++) {
          if (fields[j].onlyProduct) {
            continue;
          }
          productUtil.setObjectValue(productVariant, fields[j].apiName, columns[fields[j].idx], fields[j].convert);
        }
        productVariants.push(productVariant);
      } else {
        // product
        // if (productVariants.length > 0) {
        // can product without product variants?
        if (i > 1) {
          startCreate(currentProduct, productVariants);
        }
        productVariants = [];
        currentProduct = {};
        for (let j = 0; j < fields.length; j++) {
          if (fields[j].onlyProductVariant) {
            continue;
          }
          productUtil.setObjectValue(currentProduct, fields[j].apiName, columns[fields[j].idx], fields[j].convert);
        }
      }
    }
    // if (productVariants.length > 0) {
    startCreate(currentProduct, productVariants);
  };

  $scope.resetUploaded = () => {
    $rootScope.state.batchUploadedProducts.length = 0;
  };
});
