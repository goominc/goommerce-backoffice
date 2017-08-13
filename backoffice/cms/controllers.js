// Copyright (C) 2016 Goom Inc. All rights reserved.

const cmsModule = require('./module');

cmsModule.controller('CmsSimpleController', ($scope, $http, $state, $rootScope, $translate, boUtils) => {
  $scope.cms = {
    ko: { rows: [] },
    en: { rows: [] },
    'zh-cn': { rows: [] },
    'zh-tw': { rows: [] },
  };
  $http.get(`/api/v1/cms/${$state.params.name}`).then((res) => {
    if (res.data) {
      $scope.cms = res.data;
    }
  }).catch(() => {
    // ignore
  });

  $scope.name = $state.params.name;
  $scope.contentTitle = $scope.name;
  $scope.contentSubTitle = '';
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: 'cms.simple',
      name: $scope.name,
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.newObject = {};
  $scope.imageUploaded = (result, obj) => {
    obj.image = { url: result.url.substring(5), publicId: result.public_id, version: result.version };
  };

  $scope.addRow = () => {
    if (!$scope.newObject.link) {
      $scope.newObject.link = '';
    }
    if (!$scope.newObject.image || !$scope.newObject.image.url) {
      window.alert('add image'  );
      return;
    }
    $scope.cms[$rootScope.state.editLocale].rows.push($scope.newObject);
    $scope.newObject = {};
  };

  $scope.removeRow = (index) => {
    $scope.cms[$rootScope.state.editLocale].rows.splice(index, 1)[0];
  };

  $scope.save = () => {
    $http.post(`/api/v1/cms`, { name: $scope.name, data: $scope.cms }).then((res) => {
      console.log(res);
      window.alert('Saved Successfully');
    });
  };

  $scope.rowSortable = {
    handle: '.cms-simple-sortable-pointer',
    placeholder: 'ui-state-highlight',
  };

  $('#image-upload-button').on('change', function (changeEvent) {
    const file = _.get(changeEvent, 'target.files[0]');
    if (!file) {
      return;
    }
    boUtils.startProgressBar();
    $('#image-upload-button').attr('value', '');
    const r = new FileReader();
    r.onload = function(e) {
      boUtils.uploadImage201607(e.target.result, file, '').then((res) => {
        boUtils.stopProgressBar();
        $scope.newObject.image = res.data.images[0];
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
});

cmsModule.controller('CmsMainCategoryController', ($scope, $rootScope, $http, $state, boUtils) => {
  const cmsName = 'main_categories';
  $scope.displayLocale = 'en';
  const jstreeNode = $('#categoryTree');
  const autoCompleteNode = $('#selectCategory');
  const initAutoComplete = (root) => {
    // TODO locale
    // const locale = $rootScope.state.editLocale;
    $scope.allCategories = [];
    $scope.categoryIdMap = {};
    $scope.categoryNameMap = {};
    const dfs = (root) => {
      const name = root.name[$scope.displayLocale];
      let searchName = name;
      if (root.parentId && $scope.categoryIdMap[root.parentId]) {
        searchName += `(<-${$scope.categoryIdMap[root.parentId].name[$scope.displayLocale]})`;
      }
      $scope.allCategories.push(searchName);
      $scope.categoryIdMap[root.id] = root;
      $scope.categoryNameMap[searchName] = root;
      (root.children || []).forEach((child) => dfs(child));
      delete root.children;
    };
    dfs(root);

    boUtils.autoComplete(autoCompleteNode, cmsName, $scope.allCategories);
    autoCompleteNode.on('typeahead:selected', (obj, datum) => {
      const idx = datum.indexOf('(<-');
      let text = datum;
      if (idx > 0) {
        text = datum.substring(0, idx);
      }
      autoCompleteNode.typeahead('val', text);
      const tree = jstreeNode.jstree(true);
      const selected = tree.get_selected();
      if (!selected || selected.length < 1) {
        return;
      }
      const newCategory = $scope.categoryNameMap[datum];
      if (tree.get_node(newCategory.id)) {
        window.alert('category already in menu');
        return;
      }
      tree.set_id(selected[0], newCategory.id);
      tree.set_text(newCategory.id, text);
      $scope.selectedNodeName = newCategory.name[$scope.displayLocale];
      autoCompleteNode.blur();
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  };
  $http.get('/api/v1/categories').then((res) => {
    $scope.allCategories = [];
    const root = res.data;
    initAutoComplete(root);
  });
  const jstreeDataToCmsData = () => {
    const jstreeData = jstreeNode.jstree(true).get_json('#');
    const dfs = (root) => {
      const res = $scope.categoryIdMap[root.id];
      if (!res) {
        window.alert('created node does not select category');
        return null;
      }
      if (root.children && root.children.length > 0) {
        res.children = root.children.map((child) => dfs(child)).filter(value => !!value);
      }
      return res;
    };
    return jstreeData.map((data) => dfs(data));
  };
  const cmsDataToJstreeData = (cmsData) => {
    const dfs = (root) => {
      const res = {
        id: root.id,
        text: root.name ? root.name[$scope.displayLocale] : '카테고리 고르세요',
        data: { id: root.id },
      };
      if (root.children) {
        res.children = root.children.map(dfs);
      }
      return res;
    };
    return cmsData.map((data) => dfs(data));
  };
  let nextNodeId = 10000;
  const initJsTree = (cmsData) => {
    jstreeNode.jstree({
      core: {
        themes: {
          responsive: false,
        },
        check_callback: true,
        data: cmsDataToJstreeData(cmsData),
        multiple: false,
      },
      plugins: [ 'types', 'contextmenu' ],
      types: {
        default: {
          max_depth: 2,
          icon: 'fa fa-folder icon-state-warning icon-lg',
        },
      },
      contextmenu: {
        items: function ($node) {
          const tree = jstreeNode.jstree(true);
          return {
            Create: {
              label: 'Create',
              action: () => {
                const newNodeId = tree.create_node($node, 'NewMenu');
                tree.set_id(newNodeId, nextNodeId);
                tree.deselect_all();
                tree.select_node(nextNodeId++);
                autoCompleteNode.typeahead('val', '');
                $scope.selectedNodeName = null;
                if (!$scope.$$phase) {
                  $scope.$apply();
                }
                autoCompleteNode.focus();
              },
            },
            Delete: {
              label: 'Delete',
              action: () => {
                tree.delete_node($node);
              },
            }
          };
        }
      },
    });
    jstreeNode.on('select_node.jstree', (e, data) => {
      const category = $scope.categoryIdMap[data.node.id];
      if (!category) {
        $scope.selectedNodeName = null;
        return;
      }
      $scope.selectedNodeName = category.name[$scope.displayLocale];
      autoCompleteNode.typeahead('val', $scope.selectedNodeName);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    jstreeNode.on('deselect_node.jstree', () => {
      $scope.selectedNodeName = null;
    });
  };

  $http.get(`/api/v1/cms/${cmsName}`).then((res) => {
    initJsTree(res.data);
  });
  $scope.save = () => {
    $http.post('/api/v1/cms', { name: cmsName, data: jstreeDataToCmsData() }).then(() => {
      window.alert('saved successfully');
      $state.reload();
    }, () => {
      window.alert('fail. check your admin permission');
    });
  };
});

cmsModule.controller('CmsMainCenterController', ($scope, $http, $rootScope, $state, boUtils) => {
  $('#summernote-desktop').summernote({
    width: 1200,
    height: 700,
    onImageUpload: (files) => boUtils.getSummerNoteImageUpload(files, $('#summernote-desktop')),
  });
  const name = 'desktop_main_center';
  $http.get(`/api/v1/cms/${name}`).then((res) => {
    $scope.cmsData = res.data;
    const data = res.data.data;
    $('#summernote-desktop').code(`${data}`);
  }, () => {
    window.alert('failed to load data');
  });

  $scope.save = () => {
    const data = $('#summernote-desktop').code();
    $http.post('/api/v1/cms', { name, data: { name, data } }).then(() => {
      window.alert('saved successfully');
    }, () => {
      window.alert('fail. check your admin permission');
    });
  };
});


cmsModule.controller('CmsPureHtmlController', ($scope, $http, $rootScope, $state) => {
  $('#summernote').summernote({ height: 400 });
  const name = $state.params.name;
  $http.get(`/api/v1/cms/${name}`).then((res) => {
    $scope.cmsData = res.data;
    const data = res.data.data;
    $('#summernote').code(`${data}`);
  }, () => {
    window.alert('failed to load data');
  });

  $scope.save = () => {
    const data = $('#summernote').code();
    $http.post('/api/v1/cms', { name, data: { name, data } }).then(() => {
      window.alert('saved successfully');
    }, () => {
      window.alert('fail. check your admin permission');
    });
  };
});

cmsModule.controller('CmsEventBannerController', ($scope, $http, $state, $rootScope, $translate, boUtils) => {
  $scope.cms = {
    ko: { rows: [] },
    en: { rows: [] },
    'zh-cn': { rows: [] },
    'zh-tw': { rows: [] },
  };
  const name = 'event_banner';
  $http.get(`/api/v1/cms/${name}`).then((res) => {
    if (res.data) {
      $scope.cms = res.data;
    }
  }).catch(() => {
    // ignore
  });

  $scope.contentTitle = name;
  $scope.contentSubTitle = '';
  $rootScope.initAll($scope, $state.current.name);

  $scope.newObject = {};

  $scope.addRow = () => {
    $scope.cms[$rootScope.state.editLocale].rows.push($scope.newObject);
    $scope.newObject = {};
  };

  $scope.removeRow = (index) => {
    $scope.cms[$rootScope.state.editLocale].rows.splice(index, 1)[0];
  };

  $scope.save = () => {
    $http.post(`/api/v1/cms`, { name, data: $scope.cms }).then((res) => {
      console.log(res);
      window.alert('Saved Successfully');
    });
  };
});
