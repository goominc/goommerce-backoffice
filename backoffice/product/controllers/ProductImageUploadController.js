// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module');

productModule.controller('ProductImageUploadController', ($scope, $http, $q, boUtils, brands) => {
  $scope.saveDisabled = true;
  if (!brands.length) {
    // 2016. 04. 04. [heekyu] there is nothing to do
    return;
  }
  brands.forEach((brand) => {
    brand.brand.displayName = boUtils.getNameWithAllBuildingInfo(brand.brand);
  });
  $scope.brands = brands;
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
        rows.push({
          color: colors[i],
          rowspan: j === 0 ? variants.length : 0,
          sku: variants[j].sku,
          mainProduct: i === 0,
          slotCount: j > 0 ? 0 : (i === 0 ? 6 : 2),
          images: [],
          variantId: variants[j].id,
        });
      }
    }
    return { rows, product };
  };
  const productsToRows = (products) => {
    $scope.items = [];
    const len = products.length;
    for (let i = 0; i < len; i++) {
      const product = products[i];
      $scope.items.push(productToTableData(product));
    }
  };

  $scope.setActiveBrand = (brand) => {
    $scope.activeBrand = brand;
    $scope.saveDisabled = true;
    productsToRows($scope.activeBrand.products);
  };
  $scope.setActiveBrand(brands[0]);

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
        $scope.saveDisabled = false;
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
        row.images.length = row.slotCount;
        for (let k = 0; k < row.slotCount; k++) {
          if (imgIdx == images.length) {
            window.alert('image count mismatch');
            row.images.length = k;
            break;
          }
          const r = new FileReader();
          r.onload = function(e) {
            row.images[k] = { url: e.target.result };
            plusLoadDone();
          };
          r.readAsDataURL(images[imgIdx++]);
        }
        if (imgIdx == images.length) break;
      }
      if (imgIdx == images.length) break;
    }
    /*
    const imagesByBrand = {};
    for (let i = 0; i < changeEvent.target.files.length; i++) {
      const file = changeEvent.target.files[i];
      const split = file.webkitRelativePath.split('.');
      const ext = split[split.length - 1];
      if (imgExt.has(ext)) {
        const paths = file.webkitRelativePath.split('/');
        if (paths.length < 2) {
          continue;
        }
        const brandId = paths[paths.length - 2];
        if (!imagesByBrand[brandId]) {
          imagesByBrand[brandId] = [];
        }
        imagesByBrand[brandId].push(file);
      }
    }
    for (let i = 0; i < brandIds.length; i++) {
      const brandId = brandIds[i];
      if ($scope.brands[brandId]) {
        const items = $scope.brands[brandId]; // { product: , rows: }
        const images = imagesByBrand[brandId];

        let imgIdx = 0;
        let loadDone = 0;
        const plusLoadDone = () => {
          loadDone++;
          if (loadDone == imgIdx) {
            $scope.saveDisabled = false;
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          }
        };
        for (let j = 0; j < items.length; j++) {
          const rows = items[j].rows;
          for (let k = 0; k < rows.length; k++) {
            const row = rows[k];
            if (row.rowspan < 1) {
              continue;
            }
            row.images.length = row.slotCount;
            for (let k = 0; k < row.slotCount; k++) {
              if (imgIdx == images.length) {
                window.alert('image count mismatch');
                break;
              }
              const r = new FileReader();
              r.onload = function(e) {
                row.images[k] = { url: e.target.result };
                plusLoadDone();
              };
              r.readAsDataURL(images[imgIdx++]);
            }
            if (imgIdx == images.length) break;
          }
        }
      }
    }
     */
  });
  $scope.imageSortable = {
    connectWith: '.image-container',
    placeholder: 'ui-state-highlight',
  };
  $scope.saveImages = () => {
    let uploadedVariantCount = 0;
    let allVariantCount = 0;
    const plusDoneVariant = () => {
      uploadedVariantCount++;
      if (allVariantCount === uploadedVariantCount) {
        window.alert('all images uploaded and product informations saved');
      }
    };
    const uploadRowImages = (productId, productVariantId, images, isMainProduct) => {
      // TODO append exist images
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
            data: {file: imageUrl, upload_preset: 'nd9k8295', public_id: `tmp/batch_image/${productId}-${productVariantId}-${i}`},
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
        promises.push($http.put(`/api/v1/products/${productId}/product_variants/${productVariantId}`, data));
        if (isMainProduct) {
          const productData = {
            appImages: { default: [_.assign({}, appImages[0], { mainImage: true })] },
          };
          promises.push($http.put(`/api/v1/products/${productId}`, productData));
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
          uploadRowImages(item.product.id, row.variantId, images, row.mainProduct);
        }
      }
    }
/*
    for (let i = 0; i < $scope.brandIds.length; i++) {
      const items = $scope.brands[$scope.brandIds[i]];
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        let r = 0;
        while (r < item.rows.length) {
          const sameColor = item.rows[r].rowspan;
          const images = item.rows[r].images;
          for (let k = 0; k < sameColor; k++) {
            const row = item.rows[r++];
            if (!row.images || row.images.length < 1) continue;

            allVariantCount++;
            uploadRowImages(item.product.id, row.variantId, images, row.mainProduct);
          }
        }
        for (let k = 0; k < item.rows.length; k++) {
          const row = item.rows[k];
          if (!row.images || row.images.length < 1) continue;
        }
      }
    }
    */
  };
});
