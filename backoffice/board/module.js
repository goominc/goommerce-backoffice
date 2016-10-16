// Copyright (C) 2016 Goom Inc. All rights reserved.

const boardModule = angular.module('backoffice.coupon', []);

module.exports = boardModule;

boardModule.config(($stateProvider) => {
  // 2016. 01. 04. [heekyu] how can I configure this outside of config?
  const templateRoot = 'templates/metronic';

  $stateProvider
    .state('board', {
      abstract: true,
      url: '/board',
      template: '<ui-view/>',
    })
    .state('board.add', {
      url: '/:boardId/add',
      templateUrl: templateRoot + '/board/edit.html',
      controller: 'BoardDetailController',
    })
    .state('board.edit', {
      url: '/:boardId/:boardItemId',
      templateUrl: templateRoot + '/board/edit.html',
      controller: 'BoardDetailController',
    })
    .state('board.list', {
      url: '/:boardId',
      templateUrl: templateRoot + '/board/list.html',
      controller: 'BoardListController',
    });
});

// BEGIN module require js
require('./controllers');
// END module require js
