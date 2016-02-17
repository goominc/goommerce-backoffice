// Copyright (C) 2016 Goom Inc. All rights reserved.

const textModule = require('./module');

textModule.controller('TextMainController', ($scope, $http, $q) => {
  $scope.currentLang = 'ko';
  $scope.activeNode = null;
  $scope.langs = ['en', 'ko', 'zh_cn', 'zh_tw'];
  const nodeToKey = {};
  let nodeNum = 0;
  const getTreeData = (key, obj) => {
    nodeNum++;
    nodeToKey[nodeNum] = key;
    if (obj.ko || obj.en) {
      return {
        id: nodeNum,
        text: obj[$scope.currentLang],
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

  const initJsTree = (origData) => {
    const jstreeNode = $('#textTree');
    nodeNum = 0;
    const jstreeData = [];
    const keys = Object.keys(origData);
    keys.forEach((key) => {
      jstreeData.push(getTreeData(key, origData[key]))
    });
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

  $http.get('/api/v1/i18n/texts').then((res) => {
    initJsTree(res.data);
  }).catch((err) => {
    window.alert(err);
  });

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
    $q.all(promises).then((res) => {
      console.log(res);
    });
  };
});
