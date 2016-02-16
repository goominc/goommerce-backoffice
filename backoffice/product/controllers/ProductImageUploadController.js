// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module');

productModule.controller('ProductImageUploadController', ($scope, $http, $q, products) => {
  $scope.saveDisabled = true;
  $scope.brands = {};
  $scope.brandIds = [];
  const productsToRows = () => {
    // must be called once
    // if called multiple, $scope.brands must be clear
    const len = products.length;
    for (let i = 0; i < len; i++) {
      const product = products[i];
      const brandId = product.data.seller || -1;
      if (!$scope.brands[brandId]) {
        $scope.brands[brandId] = [];
      }
      $scope.brands[brandId].push(
        { productId: product.id, variantId: '', mainProduct: false, slotCount: 0, images: [] }
      );
      for (let j = 0; j < product.productVariants.length; j++) {
        const productVariant = product.productVariants[j];
        const mainProduct = j == 0;
        $scope.brands[brandId].push(
          { productId: '', variantId: productVariant.id, mainProduct, slotCount: mainProduct ? 6 : 2, images: [] }
        );
      }
    }
    $scope.brandIds = Object.keys($scope.brands);
  };
  productsToRows();

  const imgExt = new Set(['jpg', 'jpeg', 'png']);
  $('#image-upload-button').on('change', function (changeEvent) {
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
    const brandIds = Object.keys(imagesByBrand);
    for (let i = 0; i < brandIds.length; i++) {
      const brandId = brandIds[i];
      if ($scope.brands[brandId]) {
        const rows = $scope.brands[brandId];
        const images = imagesByBrand[brandId];
        /*
        if (rows.length != images.length) {
          window.alert(`Brand [${brandId}]'s image count mismatch. Slot = ${rows.length} Image = ${images.length}`);
          continue;
        }
        */
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
        for (let j = 0; j < rows.length; j++) {
          const row = rows[j];
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
    /*
    const r = new FileReader();
    r.onload = function(e) {
      const contents = e.target.result;
      $.ajax({
        url: 'https://api.cloudinary.com/v1_1/linkshops/image/upload',
        type: 'POST',
        data: {file: contents, upload_preset: 'nd9k8295', public_id: 'tmp/tmpImage'},
        success: (res) => {
          console.log(res);
        },
        error: (res) => {
          console.log(res);
        },
      });
    };
    r.readAsDataURL($scope.files[1]);
    */
  });
  $scope.saveImages = () => {
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
          console.log(res);
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

    for (let i = 0; i < $scope.brandIds.length; i++) {
      const rows = $scope.brands[$scope.brandIds[i]];
      let productId = -1;
      for (let j = 0; j < rows.length; j++) {
        const row = rows[j];
        if (row.productId !== '') {
          productId = row.productId;
          continue;
        }
        if (!row.images || row.images.length < 1) continue;

        uploadRowImages(productId, row.variantId, row.images, row.mainProduct);
      }
    }
  };
});
