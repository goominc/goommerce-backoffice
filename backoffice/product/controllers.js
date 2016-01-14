
const productModule = require('./module.js');

productModule.controller('ProductMainController', ($scope, $state, $rootScope, $translate) => {
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


  // GET
});

productModule.controller('ProductEditController', ($scope, $http, $state, $rootScope, $translate, product) => {
  let titleKey = 'product.edit.createTitle';
  $scope.product = product;
  if ($scope.product.id) {
    titleKey = 'product.edit.updateTitle';
  }
  $scope.contentTitle = $translate.instant(titleKey);
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
      name: $translate.instant(titleKey),
    },
  ];
  $rootScope.initAll($scope, $state.current.name);

  $scope.names = [
    {title: $translate.instant('product.edit.labelName.KO'), key: 'ko'},
    {title: $translate.instant('product.edit.labelName.EN'), key: 'en'},
    {title: $translate.instant('product.edit.labelName.ZH_CN'), key: 'zh_cn'},
    {title: $translate.instant('product.edit.labelName.ZH_TW'), key: 'zh_tw'},
  ];

  $scope.inputFields = [
  ];

  // BEGIN Manipulate Variant Kinds
  $scope.variantKinds = [
    {name: '색상', kinds: ['blue', 'red']},
    {name: '사이즈', kinds: ['S', 'M', 'Free']},
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
  // END Manipulate Variants

  $scope.save = () => {
    let method = "POST";
    let url = '/api/v1/products';
    if ($scope.product.id) {
      method = "PUT";
      url += '/' + $scope.product.id;
    }
    $http({method: method, url: url, data: $scope.product, contentType: 'application/json;charset=UTF-8'}).then((result) => {
      console.log(result);
    });
  };
});
