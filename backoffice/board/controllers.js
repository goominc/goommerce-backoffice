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
        orderable: false,
        render: (id) =>
          `<a ui-sref="board.edit({ boardId: ${$scope.boardId}, boardItemId: ${id} })">${id}</a>`,
      },
      {
        data: (data) => {
          let title = _.get(data, 'data.title');
          if (!title) {
            title = _.get(data, 'data.name');
          }
          if (!title) {
            title = '제목없음';
          }
          return title;
        },
        orderable: false,
      },
      {
        data: 'id',
        orderable: false,
        render: (id) =>
          `<button class="btn red" data-ng-click="deleteItem(${id})">삭제</button>`,
      },
    ],
  };

  $scope.goNewBoard = () => {
    $state.go(`board.add`, { boardId: $scope.boardId });
  };

  $scope.deleteItem = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      $http.delete(`/api/v1/boards/items/${id}`).then(() => {
        $state.reload();
      }, () => {
        window.alert('요청이 실패하였습니다');
      });
    }
  };
});

const saveBoardItem = (boardId, boardItemId, data, $http, $state) => {
  if (!boardItemId) {
    // add
    $http.post(`/api/v1/boards/${boardId}`, data).then(() => {
      window.alert('저장되었습니다');
      $state.go('board.list', { boardId });
    }, () => {
      window.alert('실패하였습니다');
    });
  } else {
    // edit
    $http.put(`/api/v1/boards/items/${boardItemId}`, data).then(() => {
      window.alert('저장되었습니다');
      $state.go('board.list', { boardId });
    }, () => {
      window.alert('실패하였습니다');
    });
  }
};

boardModule.controller('BoardDetailController', ($scope, $http, $state, $rootScope, $translate, boUtils) => {
  $scope.name = $state.params.boardType;
  $scope.contentTitle = $scope.boardType;
  $scope.contentSubTitle = '';
  $scope.boardId = +$state.params.boardId;
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

  let contentNode = null;
  if ($scope.boardId === 3) {
    // store
    $scope.boardFields = [
      { title: '이름', key: 'name', obj: _.get($scope, 'data.detail') },
      { title: '위치', key: 'location', obj: _.get($scope, 'data.detail') },
      { title: '전화번호', key: 'tel', obj: _.get($scope, 'data.detail') },
      { title: '매장타입', key: 'type', obj: _.get($scope, 'data.detail') },
      { title: '매장정보', key: 'detail', obj: _.get($scope, 'data.detail') },
    ];
  } else {
    // default(notice, etc)
    contentNode = $('#board-content');
    contentNode.summernote({
      width: 710,
      height: 500,
      onImageUpload: (files) => boUtils.getSummerNoteImageUpload(files, contentNode),
    });
  }

  const boardItemId = $state.params.boardItemId;
  if (boardItemId) {
    $http.get(`/api/v1/boards/items/${boardItemId}`).then((res) => {
      $scope.data = res.data.data || {};
      if ($scope.data.content && contentNode) {
        contentNode.code($scope.data.content);
      }
    });
  } else {
    $scope.data = {};
  }

  $scope.save = () => {
    if (contentNode) {
      $scope.data.content = contentNode.code();
    }
    saveBoardItem($scope.boardId, boardItemId, $scope.data, $http, $state);
  };
});
