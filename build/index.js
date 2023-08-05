/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./style.scss */ "./src/style.scss");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./block.json */ "./src/block.json");







// Manual call to fetch the observations from the editor page once query settings are entered
function refreshQuery() {
  // Find all the iNaturalist blocks on the page
  let inatgrids = document.querySelectorAll('.ws-inat-grid-container');
  let baseUrl = 'https://api.inaturalist.org/v1/observations';
  let valueMap = {
    'needs_id': 'ID',
    'research': 'RG',
    'casual': '',
    'Needs ID': 'ID',
    'Research Grade': 'RG',
    '': ''
  };
  let inverseMap = {
    'ID': 'Needs ID',
    'RG': 'Research Grade',
    '': ''
  };

  // Query the iNaturalist API for each block
  inatgrids.forEach(function (inatgrid) {
    // Remove the placeholder text
    try {
      let placeholder = inatgrid.nextElementSibling;
      placeholder.remove();
    } catch (error) {} // We don't care if the text has already been removed

    // Parse the query variables from the html dataset
    let params = {
      ...inatgrid.dataset
    };

    // Formats the ISO date strings to the format iNaturalist expects
    params.d1 = formatAPIdate(params.d1);
    params.d2 = formatAPIdate(params.d2);

    // Form the API url with the query strings
    let url = new URL(baseUrl);
    url.search = new URLSearchParams(params).toString();

    // If there's an existing grid, remove it before appending more items
    inatgrid.innerHTML = '';
    fetch(url).then(response => {
      if (!response.ok) {
        // This will be returned if iNaturalist didn't like the query
        // We throw an error that will be caught and displayed to the user in the editor
        return response.json().then(errorData => {
          throw new Error(`${errorData.error} Status: ${response.status}`);
        });
      }
      return response.json();
    }).then(data => {
      console.log(data);

      // If no results are found, throw an error that will be displayed in the editor
      if (data.results.length == 0) {
        throw new Error('No observations found for search criteria.');
      }

      // Iterate through all results, creating a grid item for each
      data.results.forEach(item => {
        // Create all needed elements
        let gridItemDiv = document.createElement('div');
        let topRowDiv = document.createElement('div');
        let speciesDiv = document.createElement('div');
        let idsDiv = document.createElement('div');
        let gradeDiv = document.createElement('div');
        let gridLink = document.createElement('a');

        // Replace the tiny image url with a slightly higher resolution version
        let bgurl = item.observation_photos[0].photo.url;
        bgurl = bgurl.replace('square.jpg', 'small.jpg');

        // Add the right text to the right places
        speciesDiv.innerText = item.taxon.preferred_common_name ? item.taxon.preferred_common_name : item.taxon.name;
        let idsSuffix = item.identifications.length == 1 ? ' ID' : ' IDs';
        idsDiv.innerText = item.identifications.length + idsSuffix;
        gradeDiv.innerText = valueMap[item.quality_grade];

        // Add some css classes
        gridLink.classList.add('ws-inat-link');
        gridItemDiv.classList.add('ws-inat-item');
        topRowDiv.classList.add('ws-inat-top-row-info');
        idsDiv.classList.add('ws-inat-info');
        gradeDiv.classList.add('ws-inat-info');
        speciesDiv.classList.add('ws-inat-info');

        // Set the background image via inline css and set the link href
        gridLink.href = item.uri;
        gridLink.style.backgroundImage = `url('${bgurl}')`;

        // Add a function to expand the grade text on hover
        gridLink.addEventListener('mouseover', function () {
          gradeDiv.textContent = inverseMap[gradeDiv.textContent];
        });
        gridLink.addEventListener('mouseout', function () {
          gradeDiv.textContent = valueMap[gradeDiv.textContent];
        });

        // Assemble all the elements
        topRowDiv.appendChild(idsDiv);
        topRowDiv.appendChild(gradeDiv);
        gridItemDiv.appendChild(topRowDiv);
        gridItemDiv.appendChild(speciesDiv);
        gridLink.appendChild(gridItemDiv);
        inatgrid.appendChild(gridLink);
      });
    }).catch(error => {
      // Display any errors in the editor. Will be deleted upon refresh by the same code that removed the placeholder text
      let newP = document.createElement('p');
      newP.innerText = error;
      inatgrid.insertAdjacentElement('afterend', newP);
      console.error('Error:', error);
    });
  });
}
function formatFriendlyDate(isoDateStr) {
  const date = new Date(isoDateStr);
  const month = date.getMonth() + 1; // getMonth() is zero-indexed, so we add 1
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}
function formatAPIdate(isoDateStr) {
  const date = new Date(isoDateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-indexed, so we add 1
  const day = String(date.getDate()).padStart(2, '0'); // pad minutes with 0 if necessary
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

// Register the block
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_5__.name, {
  // Set a custom icon
  icon: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    width: "202px",
    height: "179px",
    viewBox: "0 0 202 179"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("title", null, "iNaturalist-Logo"), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
    id: "iNaturalist-Logo",
    stroke: "none",
    "stroke-width": "1",
    fill: "none",
    "fill-rule": "evenodd"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M0,20.7263158 C54.5248587,26.3201751 97.3849609,46.3506571 128.580307,80.8177618 C129.79793,82.1630894 133.17907,85.9671053 135.762791,85.025 C138.346512,84.0828947 141.499632,78.1866754 142.878787,76.1338022 C145.044488,72.9101545 151.734884,61.4723684 166.297674,56.7618421 C180.860465,52.0513158 199.313331,57.29323 199.98336,57.5252042 C201.242664,57.9611941 202.513754,58.5328898 201.788146,59.5540524 C201.062539,60.5752149 194.897364,63.0330024 190.708719,71.0598586 C186.227594,79.6472066 183.593875,96.2609609 182.94767,99.9224135 C180.402526,115.000988 174.299302,128.982225 165.472214,140.864406 C149.941743,161.770039 125.979483,176.17799 98.1288182,178.632593 C82.9034426,179.974473 68.2067059,177.594989 54.9232727,172.242093 C71.020061,170.658979 90.50223,163.000959 106.151872,144.665804 C125.897674,121.531579 104.288372,133.543421 85.7325581,130.481579 C72.7319736,128.336389 62.1504527,121.641086 44.3908476,98.9974003 C50.0879988,97.4013289 61.3190036,95.4542789 70.3782277,95.0660826 C53.6217502,91.2098699 31.3919846,80.5885837 21.5565397,64.2256177 C29.4608287,61.4778099 39.861857,62.475544 48.1719022,62.8370987 C16.5208943,43.7475222 2.87054309,33.46405 0,20.7263158 Z M75.6325581,-8.52651283e-14 C77.5030666,0.913766419 105.702313,13.1841017 119.32093,31.5605263 C138.346512,57.2328947 139.051163,81.9631579 133.883721,76.3105263 C121.740896,63.0275681 110.57747,54.5219154 96.772093,44.9855263 C86.2023256,37.6842105 79.1384898,16.8742837 75.6325581,-8.52651283e-14 Z M173.874316,64.0813655 C171.289891,64.308092 169.378097,66.5927128 169.604204,69.1842089 C169.830312,71.775705 172.1087,73.6927294 174.693126,73.4660029 C177.277551,73.2392764 179.189345,70.9546556 178.963237,68.3631595 C178.737129,65.7716635 176.458742,63.854639 173.874316,64.0813655 Z",
    id: "iNaturalist-Logo",
    fill: "#74AC00"
  }))),
  edit: function (props) {
    const {
      attributes: {
        user_id,
        d1,
        d2,
        per_page,
        gridSize,
        gridGap,
        showHeader,
        headerFontSize
      },
      setAttributes
    } = props;

    // Initialize the date values with today's date
    let now = new Date();
    if (!d1) {
      let dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      setAttributes({
        d1: dayStart.toISOString()
      });
    }
    if (!d2) {
      let tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      setAttributes({
        d2: tomorrowStart.toISOString()
      });
    }
    const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)();
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      ...blockProps
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: "Observation Query",
      initialOpen: true
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
      label: "iNat Username",
      value: user_id,
      onChange: value => setAttributes({
        user_id: value
      })
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: `Start Date: ${formatFriendlyDate(d1)}`,
      initialOpen: false
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.DatePicker, {
      currentDate: d1,
      onChange: newDate => setAttributes({
        d1: newDate
      })
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: `End Date: ${formatFriendlyDate(d2)}`,
      initialOpen: false
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.DatePicker, {
      currentDate: d2,
      onChange: newDate => setAttributes({
        d2: newDate
      })
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: "Advanced Parameters",
      initialOpen: false
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
      label: "Maximum number of observations",
      value: per_page,
      onChange: value => setAttributes({
        per_page: value
      }),
      min: 1,
      max: 200
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
      variant: "primary",
      onClick: () => refreshQuery()
    }, "Preview")), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: "Layout",
      initialOpen: false
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
      label: "Minimum Item Size",
      value: gridSize,
      onChange: value => setAttributes({
        gridSize: value
      }),
      min: 50,
      max: 300
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.RangeControl, {
      label: "Grid Gap",
      value: gridGap,
      onChange: value => setAttributes({
        gridGap: value
      }),
      min: 0,
      max: 50
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
      title: "Header",
      initialOpen: false
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
      label: "Show Header",
      checked: showHeader,
      onChange: value => setAttributes({
        showHeader: value
      })
    }))), showHeader ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      class: "ws-inat-block-header"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
      width: "202px",
      height: "179px",
      viewBox: "0 0 202 179"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("title", null, "iNaturalist"), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
      id: "iNaturalist-Logo",
      stroke: "none",
      "stroke-width": "1",
      fill: "none",
      "fill-rule": "evenodd"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
      d: "M0,20.7263158 C54.5248587,26.3201751 97.3849609,46.3506571 128.580307,80.8177618 C129.79793,82.1630894 133.17907,85.9671053 135.762791,85.025 C138.346512,84.0828947 141.499632,78.1866754 142.878787,76.1338022 C145.044488,72.9101545 151.734884,61.4723684 166.297674,56.7618421 C180.860465,52.0513158 199.313331,57.29323 199.98336,57.5252042 C201.242664,57.9611941 202.513754,58.5328898 201.788146,59.5540524 C201.062539,60.5752149 194.897364,63.0330024 190.708719,71.0598586 C186.227594,79.6472066 183.593875,96.2609609 182.94767,99.9224135 C180.402526,115.000988 174.299302,128.982225 165.472214,140.864406 C149.941743,161.770039 125.979483,176.17799 98.1288182,178.632593 C82.9034426,179.974473 68.2067059,177.594989 54.9232727,172.242093 C71.020061,170.658979 90.50223,163.000959 106.151872,144.665804 C125.897674,121.531579 104.288372,133.543421 85.7325581,130.481579 C72.7319736,128.336389 62.1504527,121.641086 44.3908476,98.9974003 C50.0879988,97.4013289 61.3190036,95.4542789 70.3782277,95.0660826 C53.6217502,91.2098699 31.3919846,80.5885837 21.5565397,64.2256177 C29.4608287,61.4778099 39.861857,62.475544 48.1719022,62.8370987 C16.5208943,43.7475222 2.87054309,33.46405 0,20.7263158 Z M75.6325581,-8.52651283e-14 C77.5030666,0.913766419 105.702313,13.1841017 119.32093,31.5605263 C138.346512,57.2328947 139.051163,81.9631579 133.883721,76.3105263 C121.740896,63.0275681 110.57747,54.5219154 96.772093,44.9855263 C86.2023256,37.6842105 79.1384898,16.8742837 75.6325581,-8.52651283e-14 Z M173.874316,64.0813655 C171.289891,64.308092 169.378097,66.5927128 169.604204,69.1842089 C169.830312,71.775705 172.1087,73.6927294 174.693126,73.4660029 C177.277551,73.2392764 179.189345,70.9546556 178.963237,68.3631595 C178.737129,65.7716635 176.458742,63.854639 173.874316,64.0813655 Z",
      id: "iNaturalist-Logo",
      fill: "#74AC00"
    }))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("inline", null, "Observations")) : '', (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      class: "ws-inat-grid-container"
      // Allows reactive adjustments to the grid layout section
      ,
      style: {
        gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`,
        gridGap: `${gridGap}px`
      }
      // Include the block attributes in the html dataset so they can be easily accessed by javascript
      ,
      "data-user_id": user_id,
      "data-d1": d1,
      "data-d2": d2,
      "data-per_page": per_page
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      class: "ws-inat-editor-placeholder"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("inline", null, "Enter observation search parameters in the block settings sidebar, then click the 'Preview' button."), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
      variant: "primary",
      onClick: () => refreshQuery()
    }, "Preview")));
  },
  save: function (props) {
    const {
      attributes: {
        user_id,
        d1,
        d2,
        per_page,
        gridSize,
        gridGap,
        showHeader
      }
    } = props;
    const blockProps = _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps.save();
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      ...blockProps
    }, showHeader ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      class: "ws-inat-block-header"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
      width: "202px",
      height: "179px",
      viewBox: "0 0 202 179"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("title", null, "iNaturalist"), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
      id: "iNaturalist-Logo",
      stroke: "none",
      "stroke-width": "1",
      fill: "none",
      "fill-rule": "evenodd"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
      d: "M0,20.7263158 C54.5248587,26.3201751 97.3849609,46.3506571 128.580307,80.8177618 C129.79793,82.1630894 133.17907,85.9671053 135.762791,85.025 C138.346512,84.0828947 141.499632,78.1866754 142.878787,76.1338022 C145.044488,72.9101545 151.734884,61.4723684 166.297674,56.7618421 C180.860465,52.0513158 199.313331,57.29323 199.98336,57.5252042 C201.242664,57.9611941 202.513754,58.5328898 201.788146,59.5540524 C201.062539,60.5752149 194.897364,63.0330024 190.708719,71.0598586 C186.227594,79.6472066 183.593875,96.2609609 182.94767,99.9224135 C180.402526,115.000988 174.299302,128.982225 165.472214,140.864406 C149.941743,161.770039 125.979483,176.17799 98.1288182,178.632593 C82.9034426,179.974473 68.2067059,177.594989 54.9232727,172.242093 C71.020061,170.658979 90.50223,163.000959 106.151872,144.665804 C125.897674,121.531579 104.288372,133.543421 85.7325581,130.481579 C72.7319736,128.336389 62.1504527,121.641086 44.3908476,98.9974003 C50.0879988,97.4013289 61.3190036,95.4542789 70.3782277,95.0660826 C53.6217502,91.2098699 31.3919846,80.5885837 21.5565397,64.2256177 C29.4608287,61.4778099 39.861857,62.475544 48.1719022,62.8370987 C16.5208943,43.7475222 2.87054309,33.46405 0,20.7263158 Z M75.6325581,-8.52651283e-14 C77.5030666,0.913766419 105.702313,13.1841017 119.32093,31.5605263 C138.346512,57.2328947 139.051163,81.9631579 133.883721,76.3105263 C121.740896,63.0275681 110.57747,54.5219154 96.772093,44.9855263 C86.2023256,37.6842105 79.1384898,16.8742837 75.6325581,-8.52651283e-14 Z M173.874316,64.0813655 C171.289891,64.308092 169.378097,66.5927128 169.604204,69.1842089 C169.830312,71.775705 172.1087,73.6927294 174.693126,73.4660029 C177.277551,73.2392764 179.189345,70.9546556 178.963237,68.3631595 C178.737129,65.7716635 176.458742,63.854639 173.874316,64.0813655 Z",
      id: "iNaturalist-Logo",
      fill: "#74AC00"
    }))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("inline", null, "Observations")) : '', (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      class: "ws-inat-grid-container",
      style: {
        gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`,
        gridGap: `${gridGap}px`
      },
      "data-user_id": user_id,
      "data-d1": d1,
      "data-d2": d2,
      "data-per_page": per_page
    }));
  }
});

/***/ }),

/***/ "./src/style.scss":
/*!************************!*\
  !*** ./src/style.scss ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "./src/block.json":
/*!************************!*\
  !*** ./src/block.json ***!
  \************************/
/***/ ((module) => {

module.exports = JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"willsides/willsides-inat-grid","version":"1.0.0","title":"Grid of iNaturalist Observations","category":"embed","icon":"smiley","description":"Displays a grid of observations from iNaturalist","supports":{"html":false,"align":["wide","full"],"typography":{"__experimentalFontFamily":true,"__experimentalFontWeight":true,"__experimentalFontStyle":true,"__experimentalTextTransform":true,"__experimentalLetterSpacing":true}},"attributes":{"user_id":{"type":"string","default":""},"d1":{"type":"string"},"d2":{"type":"string"},"per_page":{"type":"integer","default":200},"gridSize":{"type":"integer","default":150},"gridGap":{"type":"integer","default":3},"showHeader":{"type":"boolean","default":true}},"textdomain":"inat-observations","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css","viewScript":"file:./script.js"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"index": 0,
/******/ 			"./style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkwillsides_inat_grid"] = self["webpackChunkwillsides_inat_grid"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["./style-index"], () => (__webpack_require__("./src/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map