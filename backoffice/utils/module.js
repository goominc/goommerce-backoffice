
const utilModule = angular.module('backoffice.utils', []);

utilModule.factory('boUtils', ($http) => {
  return {
    // http://stackoverflow.com/questions/111529/create-query-parameters-in-javascript
    encodeQueryData : (url, data) => {
      var ret = [];
      for (var d in data) {
        if (data.hasOwnProperty(d)) {
          ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        }
      }
      return url + '?' + ret.join("&");
    },
    refreshDatatableAjax: (url, elem, dataKey) => {
      $http.get(url).then((res) => {
        let table = elem.find('table').dataTable();
        table.fnClearTable();
        if (res.data && res.data[dataKey]) {
          table.fnAddData(res.data[dataKey]);
        }
        table.fnDraw();
      });
    },
    formatDate: (date) => {
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      const yyyy = date.getFullYear().toString();
      function appendLeadingZeroIfNeeded(str) {
        if (str[1]) return str;
        return '0' + str;
      }
      const mm = appendLeadingZeroIfNeeded((date.getMonth() + 1).toString()); // getMonth() is zero-based
      const dd  = appendLeadingZeroIfNeeded(date.getDate().toString());

      const HH = appendLeadingZeroIfNeeded(date.getHours().toString());
      const MM = appendLeadingZeroIfNeeded(date.getMinutes().toString());
      const SS = appendLeadingZeroIfNeeded(date.getSeconds().toString());
      return yyyy + '-' + mm + '-' + dd + ' ' + HH + ':' + MM + ':' + SS;
    },
    autoComplete: (elem, name, data, fnGetDisplay) => {
      const Bloodhound = window.Bloodhound;
      let tokenizer = Bloodhound.tokenizers.whitespace;
      if (fnGetDisplay) {
        tokenizer = (datum) => {
          return Bloodhound.tokenizers.whitespace(fnGetDisplay(datum));
        };
      }
      const option1 = {
        datumTokenizer: tokenizer,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: data,
      };
      const source = new Bloodhound(option1);
      source.initialize();

      const option2 = {
        hint: false,
        highlight: true,
        minLength: 1,
      };
      const option3 = {
        name,
        source: source.ttAdapter(),
      };
      if (fnGetDisplay) {
        // option3.displayKey = valueKey;
        option3.display = (d) => fnGetDisplay(d);
      }
      elem.typeahead(
        option2,
        option3
      );
    },
    uploadImage: (imageContent, publicId) => {
      return $.ajax({
        url: 'https://api.cloudinary.com/v1_1/linkshops/image/upload',
        type: 'POST',
        // data: {file: imageContent, upload_preset: 'nd9k8295', public_id: `tmp/batch_image/${productId}-${productVariantId}-${i}`},
        data: {file: imageContent, upload_preset: 'nd9k8295', public_id: publicId},
      }).then(
        (res) => res,
        (err) => window.alert(err)
      );
    },
    getNameWithAllBuildingInfo: (brand) => {
      // format: 'Name (Building Floor FlatNumber)'
      const data = brand && brand.data;
      const name = brand && brand.name;
      if (!data || !name || !name.ko) {
        return '';
      }

      return `${name.ko} ( ${_.get(brand, 'data.building.name')} ${_.get(brand, 'data.building.floor')} ${_.get(brand, 'data.building.flatNumber')}호 )`; // eslint-disable-line
    },
    startProgressBar: () => {
      Metronic.blockUI({target: '#bo-content-container', boxed: true});
    },
    stopProgressBar: () => {
      Metronic.unblockUI('#bo-content-container');
    },
  };
});

utilModule.factory('convertUtil', () => {
  return {
    copyFieldObj: (fields, origObj) => {
      fields.forEach((field) => {
        if (!field.key) return;
        _.set(origObj, field.key, field.obj);
      });
    },
  };
});

module.exports = utilModule;
