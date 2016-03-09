// Copyright (C) 2016 Goom Inc. All rights reserved.

const textModule = require('./module');

textModule.controller('TextMainController', ($scope, $http, $q, $state, $rootScope) => {
  $scope.activeNode = null;
  $scope.langs = ['en', 'ko', 'zh-cn', 'zh-tw'];
  const nodeToKey = {};
  let nodeNum = 0;
  const getTreeData = (key, obj) => {
    nodeNum++;
    nodeToKey[nodeNum] = key;
    if (obj.ko || obj.en) {
      return {
        id: nodeNum,
        text: obj[$rootScope.state.editLocale],
        data: obj,
      }
    }
    const keys = Object.keys(obj);
    const res = {
      id: nodeNum,
      text: key,
      data: obj,
      children: [],
      state: { selected: false, opened: true, disabled: true },
    };
    for (let i = 0; i < keys.length; i++) {
      const child = obj[keys[i]];
      res.children.push(getTreeData(keys[i], child));
    }
    return res;
  };
  const jsTreeData = (origData) => {
    const res = [];
    const keys = Object.keys(origData);
    keys.forEach((key) => {
      res.push(getTreeData(key, origData[key]))
    });
    return res;
  };

  const jstreeNode = $('#textTree');
  const initJsTree = (origData) => {
    nodeNum = 0;
    const jstreeData = jsTreeData(origData);

    jstreeNode.jstree({
      core: {
        themes: {
          responsive: false,
        },
        data: jstreeData,
        multiple: false,
      },
    });
    jstreeNode.on('select_node.jstree', (e, data) => {
      $scope.activeNode = data.node.data;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  };

  const redraw = () => {
    let treeData = jsTreeData($scope.origData);
    jstreeNode.jstree(true).settings.core.data = treeData;

    jstreeNode.jstree('refresh');
  };

  $scope.origData = null;
  const getTextsAndDrawTree = (func) => {
    $http.get('/api/v1/i18n/texts').then((res) => {
      $scope.origData = res.data;
      func($scope.origData);
    }).catch((err) => {
      window.alert(err);
    });
  };
  getTextsAndDrawTree(initJsTree);

  const jstreeToJson = () => {
    const tops = $('#textTree').jstree('get_json', '#');
    const dfs = (root) => {
      if (root.children.length === 0) {
        // this is leaf
        return root.data;
      }
      const res = {};
      root.children.forEach((child) => {
        res[nodeToKey[child.id]] = dfs(child);
      });
      return res;
    };
    return dfs({ children: tops });
  };
  $scope.save = () => {
    const data = jstreeToJson();
    const keys = Object.keys(data);
    const promises = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      promises.push($http.put('/api/v1/i18n/texts', { path: key, data: data[key] }));
    }
    $q.all(promises).then(() => {
      getTextsAndDrawTree(redraw);
      // 2016. 02. 29. [heekyu] activeNode is changed when redraw
      //                TODO maintain activeNode
      $scope.activeNode = null;
    });
  };

  $scope.changeTextEditLocale = (locale) => {
    $rootScope.changeEditLocale(locale);
    redraw();
  };
});
