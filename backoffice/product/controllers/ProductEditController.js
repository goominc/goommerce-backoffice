// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module.js');

productModule.controller('ProductEditController', ($scope, $http, $state, $rootScope, $translate, product, categories, productUtil, boUtils) => {
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
    WY: ['White', 'Wine', 'Yellow'],
  };
  $scope.colorKeys = Object.keys($scope.allColors);
  const getFeetSizes = (start, step, end) => {
    let current = start;
    const res = [];
    while (current <= end) {
      res.push(current);
      current += step;
    }
    return res;
  };
  $scope.allSizes = {
    XXX: ['Free', 'XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
    Feet: getFeetSizes(225, 5, 290),
  };
  $scope.variantKinds = [
    {name: '색상', key: 'color', groups: Object.keys($scope.allColors), groupMap: $scope.allColors},
    {name: '크기', key: 'size', groups: Object.keys($scope.allSizes), groupMap: $scope.allSizes},
  ];
  const kindsFromProductVariants = (productVariants) => {
    $scope.variantKinds.forEach((kind) => kind.selected = new Set());
    productVariants.forEach((variant) => {
      if (!variant.sku) {
        return;
      }
      const split = variant.sku.split('-');
      if (split.length < 2) {
        return;
      }
      $scope.variantKinds[0].selected.add(split[split.length - 2]);
      $scope.variantKinds[1].selected.add(split[split.length - 1]);
    });
    $scope.variantKinds.forEach((kind) => kind.kinds = Array.from(kind.selected));
  };
  const initFromProduct = () => {
    let titleKey = 'product.edit.createTitle';
    const currencies = ['KRW', 'USD', 'CNY'];
    if (!product) {
      $scope.product = { sku: 'autogen', KRW: 0, data: {} };
      $scope.variantKinds[0].kinds = [];
      $scope.variantKinds[1].kinds = ['Free'];
      $scope.variantKinds.forEach((kind) => kind.selected = new Set(kind.kinds));
    } else {
      $scope.product = product;
      currencies.forEach((currency) => $scope.product[currency] = Number($scope.product[currency]));
      ($scope.product.productVariants || []).forEach((variant) => {
        currencies.forEach((currency) => variant[currency] = Number(variant[currency]));
      });
      kindsFromProductVariants($scope.product.productVariants || []);
      titleKey = 'product.edit.updateTitle';
    }

    const initAutoComplete = () => {
      const autoCompleteNode = $('#brand_search_input');
      boUtils.autoComplete(autoCompleteNode, 'product-brand-search', $scope.allBrands, boUtils.getNameWithAllBuildingInfo);
      autoCompleteNode.on('typeahead:selected', (obj, datum) => {
        $scope.product.brand = datum;
      });
      if ($scope.product.brand) {
        autoCompleteNode.val(boUtils.getNameWithAllBuildingInfo($scope.product.brand));
      }
    };
    $scope.fieldIdPrefix = 'ProductField';
    $http.get('/api/v1/brands').then((res) => {
      $scope.allBrands = res.data.brands || [];
      if ($state.params.brandId) {
        for (let i = 0; i < $scope.allBrands.length; i++) {
          const brand = $scope.allBrands[i];
          if (+brand.id === +$state.params.brandId) {
            $scope.product.brand = brand;
            $('#ProductFieldname').focus();
            break;
          }
        }
      }
      initAutoComplete();
    });
    $scope.handleBrandKeyPress = (e) => {
      if (e.which === 13) {
        // Enter key
        e.preventDefault();
        // http://stackoverflow.com/questions/26785109/select-first-suggestion-from-typeahead-js-when-hit-enter-key-in-the-field#answer-26785802
        $(".tt-suggestion:first-child", this).trigger('click');
      }
    };

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
   {title: $translate.instant('product.edit.labelName.ZH_CN'), key: 'zh-cn'},
   {title: $translate.instant('product.edit.labelName.ZH_TW'), key: 'zh-tw'},
   ];
   */
  $scope.inputFields = [
    // {title: 'SKU', key: 'sku', tmpKey: 'sku', placeholder: '00000-0000', isRequired: true},
    {title: 'name', key: 'name.ko', tmpKey: 'name', isRequired: true},
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

  $scope.productPriceChanged = (oldKRW, newKRW) => {
    $scope.productVariants.forEach((variant) => {
      if (!variant.KRW || Number(variant.KRW) === Number(oldKRW)) {
        variant.KRW = newKRW;
      }
    });
  };

  // 2016. 03. 01. [heekyu] change method for handling variant attributes
  // BEGIN Manipluate Variant attributes
  $scope.clickGroupButton = (index, group) => {
    if ($scope.variantKinds[index].currentGroup === group) {
      $scope.variantKinds[index].currentGroup = null;
      return;
    }
    $scope.variantKinds[index].currentGroup = group;
  };
  $scope.clickVariantAttribute = (event, index, attr) => {
    const selected = $scope.variantKinds[index].selected;
    if (selected.has(attr)) {
      selected.delete(attr);
    } else {
      selected.add(attr);
    }
    $scope.variantKinds[index].kinds = Array.from(selected);

    $scope.generateProductVariants();
    $scope.initImages();
  };
  $scope.removeVariantKindItem = (kindIndex, itemIndex) => {
    const variantKind = $scope.variantKinds[kindIndex];
    const removed = variantKind.kinds.splice(itemIndex, 1);
    variantKind.selected.delete(removed[0]);
    variantKind.kinds = Array.from(variantKind.selected);
    const newVariants = [];
    ($scope.productVariants || []).forEach((variant) => {
      if (variant.data[variantKind.key] !== removed[0]) {
        newVariants.push(variant);
      } else {
        delete $scope.productVariantsMap[variant.sku];
      }
    });
    $scope.productVariants = newVariants;
  };
  // END Manipluate Variant attributes

  // BEGIN Manipulate Variants
  $scope.generateProductVariants = () => {
    $scope.tmpObjToProduct();
    const newVariantSKUs = [];
    let idx = 0;
    for (const variantKind of $scope.variantKinds) {
      if (variantKind.kinds.length < 1) {
        // 2016. 04. 05. [heekyu] there is no combinations
        return;
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
        const newVariant = { sku: newVariantSKU, KRW: $scope.product.KRW, data: {} };
        const split = newVariantSKU.split('-');
        let kindPos = split.length - 1;
        for (let i = $scope.variantKinds.length - 1; i >= 0; i--) {
          newVariant.data[$scope.variantKinds[i].key] = split[kindPos--];
        }
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

  $scope.generateProductVariants();

  const afterSaveProduct = (product) => {
    return $http.put(`/api/v1/products/${product.id}/index`).then((res) => {
      // ignore
    });
  };

  $scope.saveAndContinue = () => {
    const isNewProduct = !$scope.product.id;
    $scope.doSave().then((product) => {
      afterSaveProduct(product);
      if (isNewProduct) {
        $state.go('product.edit', { productId: product.id });
      } else {
        // 2016. 02. 29. [heekyu] update product variant id for deny multiple create
        $state.reload();
      }
    });
  };

  $scope.doSave = () => {
    // 2016. 01. 18. [heekyu] save images
    if (!_.get($scope.product, 'brand.id')) {
      window.alert('select brand!');
      return new Promise((resolve, reject) => {});
    }
    boUtils.startProgressBar();

    $scope.tmpObjToProduct();
    // $scope.imageToProduct();
    $scope.imageRowsToVariant();
    $scope.updateCategoryPath();
    if (!$scope.product.id) {
      return productUtil.createProduct($scope.product, $scope.productVariants).then((res) => {
        boUtils.stopProgressBar();
        return res.product;
      }, (err) => {
        boUtils.stopProgressBar();
        window.alert('Product Create Fail' + err.data);
      });
    } else {
      return productUtil.updateProduct($scope.product, $scope.productVariants, $scope.origVariants).then((res) => {
        boUtils.stopProgressBar();
        $scope.origVariants.clear();
        return res.product;
      }, (err) => {
        boUtils.stopProgressBar();
        console.log(err);
        window.alert('Product Update Fail' + err.data);
        $scope.origVariants.clear();
        return err;
      });
    }
  };

  $scope.save = () => {
    $scope.doSave().then((product) => {
      afterSaveProduct(product).then(() => {
        if (product && product.id) {
          // 2016. 04. 04. [heekyu] elasticsearch does not return newly updated product
          boUtils.startProgressBar();
          setTimeout(() => {
            boUtils.stopProgressBar();
            $state.go('product.main');
          }, 1000);
        }
      });
    });
  };

  $scope.saveAndNew = () => {
    $scope.doSave().then((product) => {
      afterSaveProduct(product).then(() => {
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

  const makeImageRows = () => {
    $scope.imageRows = [];
    const colors = Object.keys($scope.variantsByColor);
    let firstVariant = true;
    colors.forEach((color) => {
      const item = $scope.variantsByColor[color];
      for (let i = 0; i < item.variants.length; i++) {
        const variant = item.variants[i];
        const rowspan = i === 0 ? item.variants.length : 0;
        const imagespan = item.share ? rowspan : 1;
        const row = {
          sku: variant.sku,
          color,
          rowspan,
          imagespan: imagespan,
          mainProduct: firstVariant,
          slotCount: 2, // TODO,
          images: [],
        };
        firstVariant = false;
        if (imagespan === 1) {
          row.images = _.get(variant, 'appImages.default') || [];
        } else if (imagespan > 1) {
          const imageSet = new Set();
          for (let j = 0; j < row.imagespan; j++) {
            const imgVariant = item.variants[i+j];
            (_.get(imgVariant, 'appImages.default') || []).forEach((image) => {
              if (!imageSet.has(image.url)) {
                imageSet.add(image.url);
                row.images.push(image);
              }
            });
          }
        }
        if (row.images.length > 0) {
          row.slotCount = row.images.length;
        }
        $scope.imageRows.push(row);
      }
    });
  };
  const isImageShared = (variants) => {
    if (variants.length < 2) return true;
    let imgCount = -1;
    for (let i = 0; i < variants.length; i++) {
      const images = _.get(variants[i], 'appImages.default');
      if (!images) {
        return false;
      }
      if (i === 0) {
        imgCount = images.length;
      } else if (imgCount !== images.length) {
        return false;
      }
    }

    for (let i = 0; i < imgCount; i++) {
      const url = variants[0].appImages.default[i].url;
      for (let j = 1; j < variants.length; j++) {
        if (variants[j].appImages.default[i].url !== url) {
          return false;
        }
      }
    }
    return true;
  };
  const collectByColor = () => {
    $scope.variantsByColor = {};
    const imageUrls = new Set();
    $scope.productVariants.forEach((variant) => {
      let color = _.get(variant, 'data.color');
      if (!color) {
        color = '-';
      }
      if (!$scope.variantsByColor[color]) {
        $scope.variantsByColor[color] = { variants: [] };
      }
      $scope.variantsByColor[color].variants.push(variant);
    });
    const colors = Object.keys($scope.variantsByColor);
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      $scope.variantsByColor[color].share = isImageShared($scope.variantsByColor[color].variants);
    }
  };
  $scope.initImages = () => {
    collectByColor();
    makeImageRows();
  };
  $scope.initImages();
  $scope.toggleShare = () => {
    makeImageRows();
  };
  $scope.deleteImage = (row, index) => {
    row.images.splice(index, 1);
  };
  $scope.imageSortable = {
    connectWith: '.image-container',
    placeholder: 'ui-state-highlight',
  };
  $scope.setProductMainImage = () => {
    if (!_.get($scope.product, 'appImages.default[0]') && _.get($scope, 'imageRows[0].images[0]')) {
      // TODO
      $scope.product.appImages = { default: [_.get($scope, 'imageRows[0].images[0]')] };
    }
  };
  $scope.imageRowsToVariant = () => {
    $scope.setProductMainImage(); // TODO
    let i = 0;
    while (i < $scope.imageRows.length) {
      const row = $scope.imageRows[i];
      for (let j = 0; j < row.imagespan; j++) {
        const variant = $scope.productVariantsMap[$scope.imageRows[i].sku];
        variant.appImages = { default: row.images };
        i++;
      }
    }
  };
  const insertImages = (images) => {
    let used = 0;
    for (let i = 0; i < $scope.imageRows.length; i++) {
      const row = $scope.imageRows[i];
      if (row.rowspan < 1) continue;
      if (row.slotCount > row.images.length) {
        const count = Math.min(row.slotCount - row.images.length, images.length - used);
        for (let j = 0; j < count; j++) {
          row.images.push(images[used++]);
        }
        if (used === images.length) {
          $scope.imageRowsToVariant();
          window.alert(`(${used}) images uploaded`);
          return;
        }
      }
    }
    $scope.imageRowsToVariant();
    window.alert(`(${used}) images uploaded`);
  };
  $scope.imageUploaded = (result) => {
    insertImages([{
      url: result.url.slice(5),
      publicId: result.public_id,
      version: result.version,
      mainImage: false,
      thumbnail: false,
    }]);
  };

  // 2016. 03. 09. [heekyu] $('#image-upload-button') does not load on controller init or document ready
  const addMultipleUploadListener = () => {
    const imgExt = new Set(['jpg', 'jpeg', 'png']);
    $('#image-upload-button').on('change', function (changeEvent) {
      const imageFiles = [];
      for (let i = 0; i < changeEvent.target.files.length; i++) {
        const file = changeEvent.target.files[i];
        const split = file.webkitRelativePath.split('.');
        const ext = split[split.length - 1];
        if (imgExt.has(ext)) {
          imageFiles.push(file);
        }
      }
      const len = imageFiles.length;
      if (len < 1) {
        return;
      }
      if (!window.confirm(`${len} 개의 이미지가 있습니다. 업로드 할까요?`)) {
        return;
      }
      boUtils.startProgressBar();
      const imageContents = new Array(len);
      const uploaded = new Array(len);
      let done = 0;
      for (let i = 0; i < len; i++) {
        const r = new FileReader();
        r.onload = function(e) {
          imageContents[i] = e.target.result;
          boUtils.uploadImage(e.target.result, `tmp/product/P(${$scope.product.id || 'add'})-${i}-${Date.now()}`).then((res) => {
            uploaded[i] = {
              url: res.url.slice(5),
              publicId: res.public_id,
              version: res.version,
              mainImage: false,
              thumbnail: false,
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
      }
    });
  };

  setTimeout(() => {
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
    $scope.initImages();
  };
  $scope.removeProductVariant = (index) => {
    const removed = $scope.productVariants.splice(index, 1);
    delete $scope.productVariantsMap[removed[0].sku];
    $scope.initImages();
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
