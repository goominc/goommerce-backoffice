// Copyright (C) 2016 Goom Inc. All rights reserved.

const boardModule = require('./module');

const boardIdToTitle = {
  1: '공지사항',
  3: '매장',
  4: '이벤트',
};

boardModule.controller('BoardListController', ($scope, $http, $state, $rootScope, $translate, $compile) => {
  $scope.name = $state.params.boardType;
  $scope.contentTitle = $scope.boardType;
  $scope.contentSubTitle = '';
  $scope.boardId = $state.params.boardId;
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: `board.list({ boardId: ${$scope.boardId} })`,
      name: boardIdToTitle[$scope.boardId] || 'Unknown',
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.datatablesLoaded = () => {
    $compile(angular.element($('table')))($scope);
  };

  $scope.boardDatatables = {
    field: 'boardItems',
    columns: [
      {
        data: 'id',
        render: (id) =>
          `<a ui-sref="board.edit({ boardId: ${$scope.boardId}, boardItemId: ${id} })">${id}</a>`,
      },
      {
        data: (data) => _.get(data, 'data.title', '제목없음'),
      },
    ],
  };

  $scope.goNewBoard = () => {
    $state.go(`board.add`, { boardId: $scope.boardId });
  };
});

boardModule.controller('BoardDetailController', ($scope, $http, $state, $rootScope, $translate) => {
  $scope.name = $state.params.boardType;
  $scope.contentTitle = $scope.boardType;
  $scope.contentSubTitle = '';
  $scope.boardId = $state.params.boardId;
  $scope.breadcrumb = [
    {
      sref: 'dashboard',
      name: $translate.instant('dashboard.home'),
    },
    {
      sref: `board.list({ boardId: ${$scope.boardId} })`,
      name: boardIdToTitle[$scope.boardId] || 'Unknown',
    },
    {
      sref: 'board.edit',
      name: $scope.name,
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  const contentNode = $('#board-content');
  contentNode.summernote({
    width: 710,
    height: 500,
  });

  const boardItemId = $state.params.boardItemId;
  if (boardItemId) {
    $http.get(`/api/v1/boards/items/${boardItemId}`).then((res) => {
      $scope.data = res.data.data || {};
      if ($scope.data.content) {
        contentNode.code($scope.data.content);
      }
    });
  } else {
    $scope.data = {};
  }

  $scope.save = () => {
    $scope.data.content = contentNode.code();
    if (!boardItemId) {
      // add
      $http.post(`/api/v1/boards/${$scope.boardId}`, $scope.data).then(() => {
        window.alert('저장되었습니다');
        $state.go(`board.list({ boardId: ${$scope.boardId} )`);
      }, () => {
        window.alert('실패하였습니다');
      });
    } else {
      // edit
      $http.put(`/api/v1/boards/items/${boardItemId}`, $scope.data).then(() => {
        window.alert('저장되었습니다');
        $state.go('board.list', { boardId: $scope.boardId });
      }, () => {
        window.alert('실패하였습니다');
      });
    }
  };
});
