// Copyright (C) 2016 Goom Inc. All rights reserved.

const textModule = require('./module');

textModule.controller('TextMainController', ($scope, $http, $q, $state, $rootScope) => {
  $scope.activeNode = null;
  const jstreeNode = $('#textTree');

  const nodeToKey = {};
  let nodeNum = 0;
  const getTreeData = (key, obj, fullPath) => {
    nodeNum++;
    nodeToKey[nodeNum] = key;
    if (obj.ko || obj.en) {
      const res = {
        id: nodeNum,
        text: obj[$rootScope.state.editLocale],
        data: obj,
      };
      if ($scope.activeKey && $scope.activeKey === fullPath) {
        const activeNodeNum = nodeNum;
        setTimeout(() => {
          jstreeNode.jstree('select_node', activeNodeNum);
        }, 100);
      }
      return res;
    }
    const keys = Object.keys(obj);
    const res = {
      id: nodeNum,
      text: key,
      data: obj,
      children: [],
      state: { selected: false, opened: false, disabled: true },
    };
    for (let i = 0; i < keys.length; i++) {
      const child = obj[keys[i]];
      res.children.push(getTreeData(keys[i], child, `${key}.${keys[i]}`));
    }
    return res;
  };
  const jsTreeData = (origData) => {
    const res = [];
    const keys = Object.keys(origData);
    keys.forEach((key) => {
      res.push(getTreeData(key, origData[key], key));
    });
    return res;
  };

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
      $scope.activeNode = data.node;
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
    return $http.get('/api/v1/i18n/texts').then((res) => {
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
    // 2016. 05. 31. [heekyu] do not update all but only activeNode
    let nodeFullPath = '';
    let node = $scope.activeNode;
    while (node.id !== '#') {
      nodeFullPath = `${nodeToKey[node.id]}${nodeFullPath ? '.' : ''}${nodeFullPath}`;
      node = jstreeNode.jstree('get_node', node.parent);
    }
    $http.put('/api/v1/i18n/texts', {
      path: nodeFullPath,
      data: $scope.activeNode.data,
    }).then(() => {
      $scope.activeKey = nodeFullPath;
      $scope.activeNode = null;
      getTextsAndDrawTree(redraw).then(() => {
        jstreeNode.jstree('select_node')
      });
    });
    /*
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
    */
  };

  $scope.changeTextEditLocale = (locale) => {
    $rootScope.changeEditLocale(locale);
    redraw();
  };
});
