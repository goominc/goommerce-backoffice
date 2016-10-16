// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module.js');

productModule.controller('CategoryEditController', ($scope, $rootScope, $http, $state, categories, $translate, boUtils) => {
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

  const editLocale = $rootScope.state.editLocale;

  $scope.root = categories;
  const categoryIdMap = {};
  let currentCategoryId = $state.params.categoryId;
  if (!currentCategoryId) {
    currentCategoryId = $scope.root.id;
  }
  $scope.root.name[editLocale] = $translate.instant('product.category.rootName'); // TODO root name i18n

  const devices = ['desktop', 'mobile'];
  $('#category-ui-desktop').summernote({
    width: 1200,
    height: 700,
    onImageUpload: (files) => boUtils.getSummerNoteImageUpload(files, $('#category-ui-desktop')),
  });
  $('#category-ui-mobile').summernote({
    width: 320,
    height: 500,
    onImageUpload: (files) => boUtils.getSummerNoteImageUpload(files, $('#category-ui-mobile')),
  });
  const getNode = (device) => $(`#category-ui-${device}`);
  $scope.setCategory = (category) => {
    $scope.category = category;
    devices.forEach((device) => {
      const editorData = _.get(category, `contents.customUI-${device}`, '');
      getNode(device).code(editorData);
    });
  };

  const getTreeData = (root, currentCategoryId, opened) => {
    let json = {
      id: root.id,
      text: root.name ? `${root.name[editLocale]}(${root.id})` : 'NoName',
      data: { id: root.id },
      state: { selected: false, opened }, /* TODO disabled: !root.isActive, */
    };
    categoryIdMap[root.id] = root;
    if (currentCategoryId && +root.id === +currentCategoryId) {
      $scope.setCategory(root);
      json.state.selected = true;
    }

    if (root.children) {
      json.children = root.children.map((child) => {
        return getTreeData(child, $state.params.categoryId, false);
      });
    }
    return json;
  };

  const jstreeData = getTreeData($scope.root, currentCategoryId, true);
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
        // 2016. 05. 10. [heekyu] max_depth yields 'move_node' restriction
        // max_depth: 3,
        icon: 'fa fa-folder icon-state-warning icon-lg',
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
                name: {},
                isActive: false,
                parentId: $node.id,
              };
              newCategory.name[editLocale] = 'NewNode';
              $http.post('/api/v1/categories', newCategory).then((res) => {
                categoryIdMap[res.data.id] = res.data;
                const newNodeId = tree.create_node($node, res.data.name[editLocale]);
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

  $scope.getImageUrl = (variant) =>
  _.get(variant, 'appImages.default[0].thumbnails.320') ||
  _.get(variant, 'appImages.default[0].image.url', '');

  const initVariantDatatables = (productVariants) => {
    $scope.variantDatatables = {
      data: productVariants,
      columns: [
        {
          data: (data) => _.get(data, 'product.name.ko', ''),
        },
        {
          data: (data) => _.get(data, 'data.color', ''),
        },
        {
          data: (data) => _.get(data, 'data.size', ''),
        },
        {
          data: (data) => data,
          render: (variant) =>
            `<img width="80px" src="${$scope.getImageUrl(variant)}" />`,
        },
        {
          data: 'id',
          render: (id) =>
            `<button class="btn blue" data-ng-click="addBestVariant(${id})"><i class="fa fa-plus"></i> 베스트</button>`,
        }
      ],
    };
  };

  const loadProducts = () => {
    const categoryId = _.get($scope, 'category.id');
    if (!categoryId) {
      return;
    }
    _.defaults($scope.category, { data: { bestVariants: [] }});
    const bestVariantIds = new Set();
    $scope.category.data.bestVariants.forEach((v) => bestVariantIds.add(v.id));
    $scope.variantIdMap = {};
    $http.get(`/api/v1/products?categoryId=${categoryId}&limit=500`).then((res) => {
      const products = res.data.products || [];
      const productVariants = [];
      products.forEach((product) => {
        (product.productVariants || []).forEach((variant) => {
          const isHide = _.get(variant, 'data.isHide');
          variant.product = product;
          if (!isHide && !bestVariantIds.has(variant.id)) {
            productVariants.push(variant);
            $scope.variantIdMap[variant.id] = variant;
          } else {
            for (let i = 0; i < $scope.category.data.bestVariants.length; i++) {
              // 2016. 09. 08. [heekyu] update variant data
              const variantId = $scope.category.data.bestVariants[i].id;
              if (variant.id === variantId) {
                $scope.category.data.bestVariants[i] = variant;
                break;
              }
            }
          }
        });
      });
      initVariantDatatables(productVariants);
    });
  };

  $scope.addBestVariant = (id) => {
    const variant = $scope.variantIdMap[id];
    $scope.category.data.bestVariants.push(variant);
    loadProducts();
  };

  $scope.deleteBestVariant = (index) => {
    $scope.category.data.bestVariants.splice(index, 1);
    loadProducts();
  };

  // 2016. 01. 20. [heekyu] refer to https://www.jstree.com/api
  jstreeNode.on('move_node.jstree', (e, data) => {
    const { old_parent, parent } = data;
    $http.put(`/api/v1/categories/${data.node.id}`, { parentId: data.parent }).then((res) => {
      console.log(res);
    });
    const saveChildIds = (categoryId) => {
      const childIds = jstreeNode.jstree('get_node', categoryId).children;
      $http.put(`/api/v1/categories/${categoryId}`, { childIds }).then((res) => {
        console.log(res);
      });
    };
    saveChildIds(parent);
    if (old_parent !== parent) {
      saveChildIds(old_parent);
    }
  });
  jstreeNode.on('select_node.jstree', (e, data) => {
    if (+data.node.id === +_.get($scope, 'category.id')) {
      return;
    }
    $scope.setCategory(categoryIdMap[data.node.id]);
    loadProducts();
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $state.go('product.category.child', { categoryId: data.node.id });
  });
  loadProducts();

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
    {title: 'zh-cn', key: 'zh-cn'},
    {title: 'zh-tw', key: 'zh-tw'},
  ];

  $scope.save = () => {
    if (!$scope.category) {
      window.alert('[ERROR] Category is NULL');
      return false;
    }
    devices.forEach((device) => {
      const editorData = getNode(device).code();
      if (editorData) {
        _.set($scope.category, `contents.customUI-${device}`, editorData);
      }
    });
    $scope.category.data.bestVariants.forEach((v) => {
      v.product = _.pick(v.product, 'name', 'KRW', 'data', 'id');
      if (v.product.data) {
        v.product.data = _.pick(v.product.data, 'description', 'shortDescription');
      }
    });
    $http.put('/api/v1/categories/' + $scope.category.id, _.omit($scope.category, ['id', 'children'])).then((res) => {
      const category = res.data;
      categoryIdMap[category.id] = category;
      jstreeNode.jstree('set_text', category.id, category.name[editLocale]);
      $scope.setCategory(category);
      window.alert(`${_.get(category, 'name.ko', category.id)}가 성공적으로 저장되었습니다`);
    }, (err) => {
      window.alert(err.data);
    });
  };

  $scope.reindex = () => {
    $http.put('/api/v1/products/reindex').then((res) => {
      window.alert(res.data.message);
    }, (err) => {
      window.alert(err.data);
    });
  };

  $scope.changeCategoryEditLocale = (locale) => {
    $rootScope.changeEditLocale(locale);
    $state.reload();
  };

  setTimeout(() => {
    $('#banner-upload-button').on('change', function (changeEvent) {
      const file = _.get(changeEvent, 'target.files[0]');
      if (!file) {
        return;
      }
      boUtils.startProgressBar();
      $('#banner-upload-button').attr('value', '');
      const r = new FileReader();
      r.onload = function(e) {
        boUtils.uploadImage201607(e.target.result, file, '').then((res) => {
          boUtils.stopProgressBar();
          _.set($scope.category, 'data.banner', res.data.images[0]);
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }, () => {
          window.alert('image upload fail');
          boUtils.stopProgressBar();
        });
      };
      r.readAsBinaryString(file);
    });
  }, 500);
});
