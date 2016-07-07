// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module.js');

productModule.controller('SMarketController', ($scope, $http) => {
  $scope.smarketDatatables = {
    field: 'products',
    storeKey: 'smarket',
    columns: [
      {
        data: 'gid',
      },
      {
        data: 'storeName',
      },
      {
        data: (data) => _.get(data, 'data.goodsName', ''),
      },
      {
        data: (data) => _.get(data, 'data.goodsPrice', ''),
      },
      {
        data: (data) => _.get(data, 'data.color', ''),
      },
      {
        data: (data) => {
          const images = (_.get(data, 'data.goodsImages') || []).map((img) =>
            `${img.imageUrl || ''}${img.filename || ''}`
          );
          return images;
        },
        render: (images) => images.map((image) => `<img width="100" src=${image} />`).join(''),
      },
    ],
  };
});