
const productModule = require('./module.js');

productModule.controller('ProductMainController', ($scope, $state, $rootScope, $translate, boConfig) => {
  $scope.contentTitle = $translate.instant('product.main.title');
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
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.productDatatables = {
    field: 'products',
    // disableFilter: true,
    // data: [{id:1, name:'aa'}, {id:2, name:'bb'}], // temp
    url: boConfig.apiUrl + '/api/v1/products',
    columns: [
      {
        data: 'id',
        render: (id) => {
          return '<a ui-sref="product.edit({productId: ' + id + '})">' + id + '</a>'
        },
      },
      {
        data: 'sku',
      },
    ],
  };
  $scope.fileContents = 'before';
});

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
          if (productVariant.stock < 0) {
            continue;
          }
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
          if (productVariant.stock < 0) {
            continue;
          }
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

productModule.controller('ProductEditController', ($scope, $http, $state, $rootScope, $translate, product, categories, productUtil) => {
  const initFromProduct = () => {
    let titleKey = 'product.edit.createTitle';
    $scope.product = product;
    if ($scope.product.id) {
      titleKey = 'product.edit.updateTitle';
    }
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
  $scope.inputFields = [];

  // BEGIN Manipulate Variant Kinds
  $scope.variantKinds = [
    {name: '사이즈', kinds: ['S', 'M', 'Free']},
    {name: '색상', kinds: ['blue', 'red']},
  ];

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
    if (!$scope.product.sku || $scope.product.sku === '') {
      window.alert('insert SKU first.'); // TODO message
      return false;
    }
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
        const newVariant = {sku: newVariantSKU, price: {KRW: 0}, stock: -1};
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

  $scope.saveAndContinue = () => {
    // 2016. 01. 18. [heekyu] save images
    $scope.imageToProduct();
    if (!$scope.product.id) {
      return productUtil.createProduct($scope.product, $scope.productVariants).then((res) => {
        $state.go('product.edit', { productId: res.product.id });
      }, (err) => {
        window.alert('Product Create Fail' + err.data);
      });
    } else {
      return productUtil.updateProduct($scope.product, $scope.productVariants, $scope.origVariants).then((res) => {
        $state.go('product.edit', {productId: res.product.id });
        $scope.origVariants.clear();
      }, (err) => {
        window.alert('Product Update Fail' + err.data);
        $scope.origVariants.clear();
        return err;
      });
    }
  };

  $scope.save = () => {
    const createOrUpdate = !$scope.product.id; // create is true
    $scope.saveAndContinue().then((err) => {
      if (!createOrUpdate && !err) {
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
      if (productVariant.appImages && productVariant.appImages && productVariant.appImages.default.length > 0) {
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

  $scope.newProductVariant = { price: {} };
  $scope.addProductVariant = (newProductVariant) => {
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
});

productModule.controller('CategoryEditController', ($scope, $rootScope, $http, $state, categories, $translate) => {
  $scope.contentTitle = $translate.instant('product.category.title');
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
      sref: 'product.category',
      name: $translate.instant('product.category.title'),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.root = categories;
  const categoryIdMap = {};
  let currentCategoryId = $state.params.categoryId;
  if (!currentCategoryId) {
    currentCategoryId = $scope.root.id;
  }
  $scope.root.name.ko = $translate.instant('product.category.rootName'); // TODO root name i18n

  const getTreeData = (root, currentCategoryId) => {
    let json = {
      id: root.id,
      text: root.name ? root.name.ko : 'NoName',
      data: { id: root.id },
      state: { selected: false, opened: true }, /* TODO disabled: !root.isActive, */
    };
    categoryIdMap[root.id] = root;
    if (currentCategoryId && root.id === currentCategoryId) {
      $scope.category = root;
      json.state.selected = true;
    }

    if (root.children) {
      json.children = root.children.map((child) => {
        return getTreeData(child, $state.params.categoryId);
      });
    }
    return json;
  };

  const jstreeData = getTreeData($scope.root, currentCategoryId);
  const jstreeNode = $('#categoryTree');
  jstreeNode.jstree({
    core: {
      themes: {
        responsive: false,
      },
      check_callback: (operation, node, node_parent, node_position, more) => {
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
      multiple: false,
    },
    types: {
      default: {
        max_depth: 3,
        icon: 'fa fa-folder icon-state-warning icon-lg',
      },
      file: {
        max_depth: 3,
        icon: 'fa fa-file icon-state-warning icon-lg',
      },
    },
    plugins: [ 'dnd', 'types', 'contextmenu' ],
    contextmenu: {
      items: function ($node) {
        const tree = jstreeNode.jstree(true);
        const newNodeName = $translate.instant('product.category.nameNewCategory');
        return {
          Create: {
            label: $translate.instant('product.category.labelNewCategory'),
            action: () => {
              const newCategory = {
                name: { ko: newNodeName },
                isActive: false,
                parentId: $node.id,
              };
              $http.post('/api/v1/categories', newCategory).then((res) => {
                categoryIdMap[res.data.id] = res.data;
                const newNodeId = tree.create_node($node, res.data.name.ko); // TODO i18n
                jstreeNode.jstree('set_id', newNodeId, res.data.id);
                selectNode(res.data.id);
              }, (err) => {
                window.alert(err.data);
              });
            },
          },
          Delete: {
            label: $translate.instant('product.category.labelDeleteCategory'),
            action: (obj) => {
              const categoryId = $node.id;
              $http.delete('/api/v1/categories/' + categoryId).then(() => {
                delete categoryIdMap[categoryId];
                jstreeNode.jstree('delete_node', categoryId);
              }, (err) => {
                window.alert(err.data);
              });
            },
          },
        };
      },
    },
  });

  // 2016. 01. 20. [heekyu] refer to https://www.jstree.com/api
  jstreeNode.on('move_node.jstree', (e, data) => {
    console.log(data);
  });
  jstreeNode.on('select_node.jstree', (e, data) => {
    $scope.category = categoryIdMap[data.node.id];
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $state.go('product.category.child', { categoryId: data.node.id });
  });
  // TODO update all tree

  const selectNode = (categoryId) => {
    jstreeNode.jstree('select_node', categoryId);
    const selected = jstreeNode.jstree('get_selected');
    selected.map((id) => {
      if (id != categoryId) {
        jstreeNode.jstree('deselect_node', id);
      }
    });
  };

  $scope.names = [
    {title: 'ko', key: 'ko'},
    {title: 'en', key: 'en'},
    {title: 'zh_cn', key: 'zh_cn'},
    {title: 'zh_tw', key: 'zh_tw'},
  ];

  $scope.save = () => {
    if (!$scope.category) {
      window.alert('[ERROR] Category is NULL');
      return false;
    }
    $http.put('/api/v1/categories/' + $scope.category.id, _.omit($scope.category, ['id', 'children'])).then((res) => {
      const category = res.data;
      categoryIdMap[category.id] = category;
      jstreeNode.jstree('set_text', category.id, category.name.ko); // TODO i18n
      $scope.category = category;
    }, (err) => {
      window.alert(err.data);
    });
  };
});

/**
 * CSV File Rule
 *   1. product variants must be just after it's product
 */
productModule.controller('ProductBatchUploadController', ($scope, productUtil) => {
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
  $scope.onFileLoad = (contents) => {
    const rows = contents.split('\n');
    if (rows.length < 2) {
      window.alert('There is no data');
      return;
    }
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
      productUtil.createProduct(product, productVariants).then(() => {
        // TODO display Uploaded products
        requestCount--;
        $scope.productCount++;
        $scope.productVariantCount += productVariants.length;
        console.log('End Request.' + requestCount);
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
});
