// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module.js');

productModule.controller('ProductEditController', ($scope, $http, $state, $rootScope, $translate, product, categories, productUtil) => {
  const initFromProduct = () => {
    let titleKey = 'product.edit.createTitle';
    if (!product) {
      $scope.product = { sku: 'autogen', data: {} };
      $scope.variantKinds = [
        {name: '색상', key: 'color', kinds: ['White', 'Black']},
        {name: '사이즈', key: 'size', kinds: ['Free']},
      ];
    } else {
      $scope.product = product;
      titleKey = 'product.edit.updateTitle';
    }
    $scope.tmpObj = {};
    $scope.productVariantsMap = {};
    $scope.origVariants = new Set();
    if ($scope.product.productVariants) {
      $scope.productVariants = $scope.product.productVariants;
      for (const productVariant of $scope.productVariants) {
        $scope.productVariantsMap[productVariant.sku] = productVariant;
        $scope.origVariants.add(productVariant.id);
      }
    } else {
      $scope.productVariants = [];
    }
    // 2016. 01. 21. [heekyu] products' categories
    $scope.productCategorySet = new Set();
    if (!$scope.product.categories) {
      $scope.product.categories = [];
    }
    for (const productCategory of $scope.product.categories) {
      if ($scope.productCategorySet.has(productCategory)) {
        window.alert('[DATA ERROR] (' + productCategory + ') is contained multiple');
        continue;
      }
      $scope.productCategorySet.add(productCategory);
    }
    // 2016. 01. 21. [heekyu] products' categories
    return {titleKey};
  };

  const initObj = initFromProduct();
  $scope.allCategories = categories;

  $scope.contentTitle = $translate.instant(initObj.titleKey);
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
      sref: 'product.edit',
      name: $translate.instant(initObj.titleKey),
    },
  ];
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
    {title: 'nickname', key: 'data.nickname', tmpKey: 'nickname', isRequired: true},
  ];

  $scope.tmpObjToProduct = () => {
    for (let i = 0; i < $scope.inputFields.length; i++) {
      const field = $scope.inputFields[i];
      _.set($scope.product, field.key, $scope.tmpObj[field.tmpKey]);
    }
  };
  $scope.productToTmpObj = () => {
    for (let i = 0; i < $scope.inputFields.length; i++) {
      const field = $scope.inputFields[i];
      $scope.tmpObj[field.tmpKey] = _.get($scope.product, field.key);
    }
  };
  if ($scope.product.id) {
    $scope.productToTmpObj();
  }

  // BEGIN Manipulate Variant Kinds

  $scope.newObjects = {
    variantKind: '',
    variantKindItem: '',
  };

  $scope.addVariantKind = (name) => {
    if (name && name.trim() !== '') {
      $scope.newObjects.variantKind = '';
      for (const kind of $scope.variantKinds) {
        if (kind.name === name) {
          $scope.hideAddItemBox();
          window.alert('duplicate name');
          return false;
        }
      }
      $scope.variantKinds.push({name: name, kinds: []});
      // TODO enhance hiding add item box
      $scope.hideAddItemBox();
    }
  };
  $scope.addVariantKindItem = (index, name) => {
    if (name && name.trim() !== '') {
      $scope.newObjects.variantKindItem = '';
      for (const kindItem of $scope.variantKinds[index].kinds) {
        if (kindItem === name) {
          $scope.hideAddItemBox();
          window.alert('duplicate name');
          return false;
        }
      }
      $scope.variantKinds[index].kinds.push(name);
      // TODO enhance hiding add item box
      $('.add-item-box').css('display', 'none');
    }
  };

  $scope.removeVariantKind = (kindIndex) => {
    const kind = $scope.variantKinds[kindIndex];
    if (window.confirm('Really Delete [' + kind.name + '] ?')) {
      $scope.variantKinds.splice(kindIndex, 1);
    }
  };

  $scope.removeVariantKindItem = (kindIndex, itemIndex) => {
    $scope.variantKinds[kindIndex].kinds.splice(itemIndex, 1);
  };

  $scope.clickAddVariantOrItem = (event) => {
    $scope.hideAddItemBox();
    $(event.target).prev().css('display', 'inline-block');
    $(event.target).prev().find('input').focus();
  };

  $scope.onInputKeypress = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      $(event.target).blur();
      return false;
    }
    return true;
  };

  $scope.hideAddItemBox = () => {
    $('.add-item-box').css('display', 'none');
  };
  // END Manipulate Variant Kinds

  // BEGIN Manipulate Variants
  $scope.generateProductVariants = () => {
    $scope.tmpObjToProduct();
    /*
    if (!$scope.product.sku || $scope.product.sku === '') {
      window.alert('insert SKU first.'); // TODO message
      return false;
    }
    */
    const newVariantSKUs = [];
    let idx = 0;
    for (const variantKind of $scope.variantKinds) {
      if (variantKind.kinds.length < 1) {
        continue;
      }
      if (newVariantSKUs.length < 1) {
        newVariantSKUs.push($scope.product.sku);
      }
      const start = idx;
      idx = newVariantSKUs.length;
      for (let i = start; i < idx; i++) {
        const newVariantSKU = newVariantSKUs[i];
        for (const kind of variantKind.kinds) {
          newVariantSKUs.push(newVariantSKU + '-' + kind);
        }
      }
    }
    const newVariants = [];
    const newVariantsMap = {};
    for (let i = idx; i < newVariantSKUs.length; i++) {
      const newVariantSKU = newVariantSKUs[i];
      const alreadyIn = $scope.productVariantsMap[newVariantSKU];
      if (alreadyIn) {
        delete $scope.productVariantsMap[newVariantSKU];
        newVariants.push(alreadyIn);
        newVariantsMap[newVariantSKU] = alreadyIn;
      } else {
        const newVariant = {sku: newVariantSKU, KRW: 0};
        newVariants.push(newVariant);
        newVariantsMap[newVariantSKU] = newVariant;
      }
    }
    for (const key in $scope.productVariantsMap) {
      if ($scope.productVariantsMap.hasOwnProperty(key)) {
        newVariants.push($scope.productVariantsMap[key]);
        newVariantsMap[key] = $scope.productVariantsMap[key];
      }
    }
    $scope.productVariants = newVariants;
    $scope.productVariantsMap = newVariantsMap;
  };
  // END Manipulate Variants

  const afterSaveProduct = (product) => {
    $http.put(`/api/v1/products/${product.id}/index`).then((res) => {
      // ignore
    });
  };

  $scope.saveAndContinue = () => {
    $scope.doSave().then((product) => {
      if ($scope.product.id) {
        // 2016. 02. 29. [heekyu] update product variant id for deny multiple create
        $state.reload();
      } else {
        $state.go('product.edit', { productId: product.id });
      }
    });
  };

  $scope.doSave = () => {
    // 2016. 01. 18. [heekyu] save images
    $scope.tmpObjToProduct();
    $scope.imageToProduct();
    $scope.updateCategoryPath();
    if (!$scope.product.id) {
      return productUtil.createProduct($scope.product, $scope.productVariants).then((res) => {
        afterSaveProduct(res.product);
        return res.product;
      }, (err) => {
        window.alert('Product Create Fail' + err.data);
      });
    } else {
      return productUtil.updateProduct($scope.product, $scope.productVariants, $scope.origVariants).then((res) => {
        afterSaveProduct(res.product);
        $scope.origVariants.clear();
        return res.product;
      }, (err) => {
        console.log(err);
        window.alert('Product Update Fail' + err.data);
        $scope.origVariants.clear();
        return err;
      });
    }
  };

  $scope.save = () => {
    $scope.doSave().then((product) => {
      if (product && product.id) {
        $state.go('product.main');
      }
    });
  };

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

  $scope.newProductVariant = { data: {} };
  $scope.addProductVariant = (newProductVariant) => {
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
  $scope.removeProductVariant = (index) => {
    $scope.productVariants.splice(index, 1);
  };
  $scope.removeImage = (index) => {
    $scope.images.splice(index, 1);
  };

  $scope.toggleCategory = (categoryId) => {
    if ($scope.productCategorySet.has(categoryId)) {
      $scope.productCategorySet.delete(categoryId);
      for (let i = 0; i < $scope.product.categories.length; i++) {
        const category = $scope.product.categories[i];
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
  $scope.updateCategoryPath = () => {
    if ($scope.product.categories.length < 1) {
      return true;
    }
    const paths = [];
    const getPathObject = (path) => {
      const res = {};
      const root = path[0];
      const langKeys = [];
      for (const k in root.name) {
        if (root.name.hasOwnProperty(k)) {
          res[k] = [root.name[k]];
          langKeys.push(k);
        }
      }
      for (let i = 1; i < path.length; i++) {
        const categoryName = path[i].name;
        for (let j = 0; j < langKeys.length; j++) {
          res[langKeys[j]].push(categoryName[langKeys[j]]);
        }
      }
      return res;
    };
    const dfs = (root, path) => {
      if (!root.children) {
        return false;
      }
      let exist = false;
      for (let i = 0; i < root.children.length; i++) {
        const child = root.children[i];
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
