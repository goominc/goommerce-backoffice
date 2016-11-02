
const utilModule = angular.module('backoffice.utils', [
  'ngCookies',
]);

utilModule.factory('boUtils', ($http, $rootScope, $cookies, boConfig) => {
  const isString = (v) => {
    return typeof v === 'string' || v instanceof String;
  };
  const getBuildingName = (brand) =>
    `${_.get(brand, 'data.location.building.name.ko', '')} ${_.get(brand, 'data.location.floor', '')} ${_.get(brand, 'data.location.flatNumber', '')}호`;
  const uploadImageFile201607 = (files) => {
    const formData = new FormData();
    formData.append('images', files);
    // return $http.post('/api/v1/upload', formData, {
    return $http.post('/api/v1/upload', formData, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    }).then(
      (res) => res,
      (err) => window.alert(err)
    );
  };
  const startProgressBar = () => {
    Metronic.blockUI({target: '#bo-content-container', boxed: true});
  };
  const stopProgressBar = () => {
    Metronic.unblockUI('#bo-content-container');
  };
  const uploadImage201607 = (imageContent, { name, type }, thumbs = '160,320,640') => {
    const params = {
      content: imageContent,
      metaData: { name, type },
    };
    const query = `thumbs=${thumbs}`;
    return $http.post(`${boConfig.apiUrl}/api/v1/upload/stream?${query}`, params).then(
      (res) => res,
      (err) => {
        window.alert(err);
        throw err;
      },
    );
  };
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
    formatDate: (date, isDateOnly) => {
      const mo = moment(date);
      if (isDateOnly) {
        return mo.format('YYYY-MM-DD');
      }
      return mo.format('YYYY-MM-DD hh:mm:ss');
      /*
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
      */
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
    uploadImage201607,
    uploadImageFile201607,
    getBuildingName,
    getNameWithAllBuildingInfo: (brand) => {
      // format: 'Name (Building Floor FlatNumber)'
      const data = brand && brand.data;
      const name = brand && brand.name;
      if (!data || !name || !name.ko) {
        return '';
      }

      return `${name.ko} ( ${getBuildingName(brand)} )`; // eslint-disable-line
    },
    startProgressBar,
    stopProgressBar,
    isString,
    shorten: (str, maxLen = 15) => {
      if (!isString(str)) {
        str = new String(str);
      }
      if (str.length > maxLen) {
        return `${str.substring(0, maxLen)}...`;
      }
      return str;
    },
    initDateBetween: (startElem, endElem, state, storeKey) => {
      const cookieStartKey = `date-${storeKey}-start`;
      const cookieEndKey = `date-${storeKey}-end`;
      const startValue = $cookies.get(cookieStartKey);
      const endValue = $cookies.get(cookieEndKey);
      _.set($rootScope, `${storeKey}.startDate`, startValue || '');
      _.set($rootScope, `${storeKey}.endDate`, endValue || '');
      startElem.datepicker({ autoclose: true });
      endElem.datepicker({ autoclose: true });
      // 2016. 07. 13. [heekyu] expires in 1 hour
      const cookieOptions = {
        expires: moment().add(1, 'hour').toDate(),
      };
      startElem.on('change', () => {
        const newValue = startElem.val();
        $cookies.put(cookieStartKey, newValue, cookieOptions);
        if (newValue && endValue && new Date(newValue).getTime() > new Date(endValue).getTime()) {
          $cookies.put(cookieEndKey, newValue, cookieOptions);
        }
        state.reload();
      });
      endElem.on('change', () => {
        const newValue = endElem.val();
        $cookies.put(cookieEndKey, newValue, cookieOptions);
        if (startValue && newValue && new Date(startValue).getTime() > new Date(newValue).getTime()) {
          $cookies.put(cookieStartKey, newValue, cookieOptions);
        }
        state.reload();
      });
    },
    calcTax: (price) => {
      price = new Decimal(price);
      const supply = +(price.div(1.1).toFixed(0, Decimal.ROUND_CEIL));
      const tax = price.sub(new Decimal(supply)).toNumber();
      return { supply, tax };
    },
    // http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
    post: (path, params, method) => {
      /* CUSTOM LOGIC */
      if (path.length && path[0] === '/') {
        path = `${boConfig.apiUrl}${path}`;
      }
      /* CUSTOM LOGIC */
      method = method || "post"; // Set method to post by default if not specified.

      // The rest of this code assumes you are not using a library.
      // It can be made less wordy if you use one.
      var form = document.createElement("form");
      form.setAttribute("method", method);
      form.setAttribute("action", path);

      for(var key in params) {
        if(params.hasOwnProperty(key)) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);

          form.appendChild(hiddenField);
        }
      }

      document.body.appendChild(form);
      form.submit();
    },
    getSummerNoteImageUpload: (files, node) => {
      const file = files[0];
      const metaData = _.pick(file, ['name', 'type']);
      const r = new FileReader();
      startProgressBar();
      r.onload = function(e) {
        uploadImage201607(e.target.result, metaData, '').then((res) => {
          stopProgressBar();
          const resultImage = res.data.images[0];
          const elem = $('<img>').attr('src', resultImage.url);
          node.summernote('insertNode', elem[0]);
          // editor.insertImage(welEditable, resultImage.url);
        }).catch((err) => {
          stopProgressBar();
          throw err;
        });
      };
      r.readAsBinaryString(file);
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
