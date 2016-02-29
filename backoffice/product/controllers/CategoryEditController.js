// Copyright (C) 2016 Goom Inc. All rights reserved.

const productModule = require('../module.js');

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

  const editLocale = $rootScope.state.editLocale;

  $scope.root = categories;
  const categoryIdMap = {};
  let currentCategoryId = $state.params.categoryId;
  if (!currentCategoryId) {
    currentCategoryId = $scope.root.id;
  }
  $scope.root.name[editLocale] = $translate.instant('product.category.rootName'); // TODO root name i18n

  const getTreeData = (root, currentCategoryId, opened) => {
    let json = {
      id: root.id,
      text: root.name ? root.name[editLocale] : 'NoName',
      data: { id: root.id },
      state: { selected: false, opened }, /* TODO disabled: !root.isActive, */
    };
    categoryIdMap[root.id] = root;
    if (currentCategoryId && root.id === currentCategoryId) {
      $scope.category = root;
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
  $scope.category = categoryIdMap[currentCategoryId];
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

  // 2016. 01. 20. [heekyu] refer to https://www.jstree.com/api
  jstreeNode.on('move_node.jstree', (e, data) => {
    // TODO update client tree after server updated
    $http.put(`/api/v1/categories/${data.node.id}`, { parentId: data.parent }).then((res) => {
      console.log(res);
    });
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
      jstreeNode.jstree('set_text', category.id, category.name[state.editLocale]); // TODO i18n
      $scope.category = category;
    }, (err) => {
      window.alert(err.data);
    });
  };

  $scope.changeCategoryEditLocale = (locale) => {
    $rootScope.changeEditLocale(locale);
    $state.reload();
  };
});
