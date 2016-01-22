
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
});

productModule.controller('ProductEditController', ($scope, $http, $q, $state, $rootScope, $translate, product, categories) => {
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
        newVariants.push(alreadyIn);
        newVariantsMap[newVariantSKU] = alreadyIn;
      } else {
        const newVariant = {sku: newVariantSKU, price: {KRW: 0}, stock: -1};
        newVariants.push(newVariant);
        newVariantsMap[newVariantSKU] = newVariant;
      }
    }
    $scope.productVariants = newVariants;
    $scope.productVariantsMap = newVariantsMap;
    window.setTimeout(() => {
      $("input[type=checkbox]").uniform();
    }, 0);
  };
  // END Manipulate Variants

  // TODO more convenient way
  window.setTimeout(() => {
    $("input[type=checkbox]").uniform();
  }, 0);

  $scope.save = () => {
    let method = "POST";
    let url = '/api/v1/products';
    if ($scope.product.id) {
      method = "PUT";
      url += '/' + $scope.product.id;
    }
    // 2016. 01. 18. [heekyu] save images
    $scope.imageToProduct();

    $http({method: method, url: url, data: $scope.product, contentType: 'application/json;charset=UTF-8'}).then((res) => {
      if (!$scope.product.id) {
        $scope.product.id = res.data.id; // need if create
        $state.go('product.edit', {productId: $scope.product.id});
      }
      const promises = [];
      const pvUrl = '/api/v1/products/' + $scope.product.id + '/product_variants';
      for (const productVariant of $scope.productVariants) {
        if (productVariant.stock < 0) {
          continue;
        }
        if (productVariant.id) {
          promises.push($http({
            method: 'PUT',
            url: pvUrl + '/' + productVariant.id,
            data: productVariant,
            contentType: 'application/json;charset=UTF-8'
          }));
          $scope.origVariants.delete(productVariant.id);
        } else {
          promises.push($http({
            method: 'POST',
            url: pvUrl,
            data: productVariant,
            contentType: 'application/json;charset=UTF-8'
          }));
        }
      }
      // 2016. 01. 18. [heekyu] delete removed variants
      if ($scope.origVariants.size > 0) {
        for (const deletedVariant of $scope.origVariants.values()) {
          promises.push($http({method: 'DELETE', url: pvUrl + '/' + deletedVariant}));
        }
      }

      $q.all(promises).then((result) => {
        console.log(result);
      });
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
      product: $scope.product,
      mainImage: false,
      thumbnail: false,
    });
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
    $http.put('/api/v1/categories/' + $scope.category.id, $scope.category).then((res) => {
      const category = res.data;
      categoryIdMap[category.id] = category;
      jstreeNode.jstree('set_text', category.id, category.name.ko); // TODO i18n
      $scope.category = category;
    }, (err) => {
      window.alert(err.data);
    });
  };
});
