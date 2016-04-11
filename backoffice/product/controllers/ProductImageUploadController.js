// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module');

productModule.controller('ProductImageUploadController', ($scope, $http, $q, productUtil, boUtils) => {
  const today = moment();
  const maxDays = 10;
  $scope.dates = [];
  for (let i = 0; i < maxDays; i++) {
    $scope.dates.push(today.format('YYYY-MM-DD'));
    today.subtract(1, 'd');
  }
  $scope.activeDate = $scope.dates[0];
  const initializeDate = () => {
    boUtils.startProgressBar();
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
    $http.get(`/api/v1/products?start=${$scope.activeDate}&end=${$scope.activeDate}`).then((res) => {
      const products = res.data.products.map(productUtil.narrowProduct);
      if (products.length < 1) {
        window.alert(`There is no products on ${$scope.activeDate}`);
        $scope.activeBrand = {};
        $scope.brands = [];
        productsToRows([]);
        return;
      }
      // 2016. 04. 04. [heekyu] older product is former
      for (let i = 0; i < products.length / 2; i++) {
        const tmp = products[i];
        products[i] = products[products.length - 1 - i];
        products[products.length - 1 - i] = tmp;
      }
      // Array.reverse(products); why Array.reverse does not exist?
      $scope.brands = collectByBrand(products);
      $scope.brands.forEach((brand) => {
        brand.brand.displayName = boUtils.getNameWithAllBuildingInfo(brand.brand);
      });
      $scope.setActiveBrand($scope.brands[0]);
    }, () => {
      window.alert('Failed to get products before Image Upload');
    }).then(() => {
      boUtils.stopProgressBar();
    });
  };
  $scope.setDate = (date) => {
    $scope.activeDate = date;
    initializeDate();
  };
  initializeDate();

  const extractDataFromVariant = (variant) => {
    const color = _.get(variant, 'data.color');
    const size = _.get(variant, 'data.size');
    if (color && size) {
      return { color, size };
    }
    const splits = variant.sku.split('-');
    if (splits.length === 3) {
      return {
        color: splits[1],
        size: splits[2],
      }
    }
    return {};
  };
  const productToTableData = (product) => {
    const colorMap = {};
    let mainColor = null;
    for (let i = 0; i < product.productVariants.length; i++) {
      const productVariant = product.productVariants[i];
      let color = productVariant.data.color;
      let size = productVariant.data.size;
      if (!color) {
        const parsed = extractDataFromVariant(productVariant);
        color = parsed.color;
        if (!size) size = productVariant.data.size;
      }
      if (!color) {
        console.log(`cannot detect color name for variant ${productVariant.sku}`);
        window.alert(`cannot extract 'color' and/or 'size' from ${productVariant.sku}`);
        continue;
      }
      if (!colorMap[color]) {
        colorMap[color] = [];
        if (mainColor) mainColor = color;
      }
      colorMap[color].push(productVariant);
    }
    const rows = [];
    const colors = Object.keys(colorMap);
    for (let i = 0; i < colors.length; i++) {
      const variants = colorMap[colors[i]];
      for (let j = 0; j < variants.length; j++) {
        const variant = variants[j];
        const images = _.get(variant, 'appImages.default') || [];
        rows.push({
          color: colors[i],
          images: images || [],
          mainProduct: false, // TODO
          rowspan: j === 0 ? variants.length : 0,
          sku: variant.sku,
          slotCount: images.length || 2,
          variantId: variant.id,
        });
      }
    }
    if (product.hasImage) {
      rows.push({
        color: 'Main',
        images: _.get(product, 'appImages.default') || [],
        mainProduct: false, // TODO
        rowspan: 1,
        sku: _.get(product, 'name.ko'),
        slotCount: 5,
        variantId: null,
      });
    }
    return { rows, product };
  };
  const productsToRows = (products) => {
    $scope.items = [];
    const len = products.length;
    for (let i = 0; i < len; i++) {
      const product = products[i];
      product.hasImage = true;
      $scope.items.push(productToTableData(product));
    }
  };

  $scope.setActiveBrand = (brand) => {
    const products = brand.products;
    const len = products.length;
    const promises = [];
    for (let i = 0; i < len; i++) {
      const product = products[i];
      if (!product.productVariants) {
        promises.push($http.get(`/api/v1/products/${product.id}/product_variants`).then((res2) => {
          product.productVariants = res2.data.productVariants.map(productUtil.narrowProductVariant);
        }));
      }
    }
    return $q.all(promises).then(() => {
      $scope.activeBrand = brand;
      productsToRows($scope.activeBrand.products);
    });
  };

  const imgExt = new Set(['jpg', 'jpeg', 'png']);
  $('#image-upload-button').on('change', function (changeEvent) {
    const images = [];
    for (let i = 0; i < changeEvent.target.files.length; i++) {
      const file = changeEvent.target.files[i];
      const split = file.webkitRelativePath.split('.');
      const ext = split[split.length - 1];
      if (imgExt.has(ext)) {
        images.push(file);
      }
    }

    let imgIdx = 0;
    let loadDone = 0;
    const plusLoadDone = () => {
      loadDone++;
      if (loadDone == imgIdx) {
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    };
    for (let j = 0; j < $scope.items.length; j++) {
      const rows = $scope.items[j].rows;
      for (let k = 0; k < rows.length; k++) {
        const row = rows[k];
        if (row.rowspan < 1) {
          continue;
        }
        // 2016. 04. 06. [heekyu] do not override existing images
        const current = row.images.length;
        const more = row.slotCount - current;
        if (more < 1) {
          continue;
        }
        for (let k = 0; k < more; k++) {
          if (imgIdx == images.length) {
            window.alert('image count mismatch');
            row.images.length = k;
            break;
          }
          const r = new FileReader();
          r.onload = function(e) {
            row.images[current + k] = { url: e.target.result };
            plusLoadDone();
          };
          r.readAsDataURL(images[imgIdx++]);
        }
        if (imgIdx == images.length) break;
      }
      if (imgIdx == images.length) break;
    }
  });
  $scope.deleteImage = (row, index) => {
    row.images.splice(index, 1);
  };
  $scope.imageSortable = {
    connectWith: '.image-container',
    placeholder: 'ui-state-highlight',
  };
  $scope.saveImages = () => {
    boUtils.startProgressBar();
    let uploadedVariantCount = 0;
    let allVariantCount = 0;
    const plusDoneVariant = () => {
      uploadedVariantCount++;
      if (allVariantCount === uploadedVariantCount) {
        window.alert('all images uploaded and product informations saved');
        boUtils.stopProgressBar();
      }
    };
    const uploadRowImages = (productId, productVariantId, images, isMainProduct) => {
      const appImages = new Array(images.length);
      let uploadCount = 0;
      let done = 0;
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i].url;
        if (imageUrl.length > 2 && imageUrl.substring(0, 2) === '//') {
          appImages[i] = images[i];
        } else {
          uploadCount++;
          $.ajax({
            url: 'https://api.cloudinary.com/v1_1/linkshops/image/upload',
            type: 'POST',
            data: {file: imageUrl, upload_preset: 'nd9k8295', public_id: `tmp/batch_image/${productId}-${productVariantId || ''}-${i}`},
            success: (res) => {
              appImages[i] = {
                url: res.url.substring(5),
                publicId: res.public_id,
                version: res.version,
                mainImage: false,
              };
              plusDone();
              if (res) return res;
            },
            error: (res) => {
              window.alert(res);
              appImages[i] = {};
              plusDone();
            },
          });
        }
      }
      const saveProductVariant = () => {
        const promises = [];
        const data = {
          appImages: { default: appImages },
        };
        if (productVariantId) {
          promises.push($http.put(`/api/v1/products/${productId}/product_variants/${productVariantId}`, data));
          if (isMainProduct) {
            const productData = {
              appImages: { default: [_.assign({}, appImages[0], { mainImage: true })] },
            };
            promises.push($http.put(`/api/v1/products/${productId}`, productData));
          }
        } else {
          promises.push($http.put(`/api/v1/products/${productId}`, data));
        }
        $q.all(promises).then((res) => {
          plusDoneVariant();
        });
      };
      const plusDone = () => {
        done++;
        if (done === uploadCount) {
          saveProductVariant();
        }
      };
      if (uploadCount === 0) {
        saveProductVariant();
      }
    };
    for (let j = 0; j < $scope.items.length; j++) {
      const item = $scope.items[j];
      let r = 0;
      while (r < item.rows.length) {
        const sameColor = item.rows[r].rowspan;
        const images = item.rows[r].images;
        for (let k = 0; k < sameColor; k++) {
          const row = item.rows[r++];
          if (!row.images || row.images.length < 1) continue;

          allVariantCount++;
          uploadRowImages(item.product.id, row.variantId, images, !item.product.hasImage && row.mainProduct);
        }
      }
    }
  };
});
