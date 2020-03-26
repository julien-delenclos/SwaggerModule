"use strict";

var _swaggerUiExpress = _interopRequireDefault(require("swagger-ui-express"));

var _swaggerJsdoc = _interopRequireDefault(require("swagger-jsdoc"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SwaggerModule = /*#__PURE__*/function () {
  function SwaggerModule(config) {
    _classCallCheck(this, SwaggerModule);

    this.config = {
      info: 'Title',
      basePath: '/',
      routesDirectory: '',
      visibility: [],
      access: []
    };
    this.options = {};
    Object.assign(this.config, config);
    this.options = {
      swaggerDefinition: {
        info: this.config.info,
        basePath: this.config.basePath
      },
      apis: [_path["default"].resolve(this.config.routesDirectory) + '/*.js', '../../*.js.LICENSE']
    };
  }

  _createClass(SwaggerModule, [{
    key: "filterVisibility",
    value: function filterVisibility(swaggerSpec) {
      return this.filterSpec(swaggerSpec, 'visibility');
    }
  }, {
    key: "filterAccess",
    value: function filterAccess(swaggerSpec) {
      return this.filterSpec(swaggerSpec, 'access');
    }
  }, {
    key: "filterSpec",
    value: function filterSpec(swaggerSpec, key) {
      var _this = this;

      var swaggerSpecDefinitions = [];
      Object.keys(swaggerSpec.paths).forEach(function (element) {
        console.log(element, key, swaggerSpec.paths[element]["x-".concat(key)]);

        if (swaggerSpec.paths[element]["x-".concat(key)] && !_this.config[key].some(function (p) {
          return swaggerSpec.paths[element]["x-".concat(key)].includes(p);
        })) {
          delete swaggerSpec.paths[element];
        } else {
          var results = [];

          _this.searchProperty(swaggerSpec.paths[element], '$ref', results);

          results.forEach(function (r) {
            return swaggerSpecDefinitions.push(r);
          });
        }
      });
      swaggerSpec.definitions = this.getElements(swaggerSpec.definitions, swaggerSpecDefinitions);
      return swaggerSpec;
    }
  }, {
    key: "searchProperty",
    value: function searchProperty(obj, search, results) {
      var depth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

      for (var p in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
          if (typeof obj[p] == 'function') continue;

          if (p == search) {
            results.push(obj[p]);
            continue;
          }

          if (_typeof(obj[p]) == 'object' && depth < 7) {
            this.searchProperty(obj[p], search, results, depth + 1);
          }
        }
      }
    }
  }, {
    key: "getElements",
    value: function getElements(spec, elements) {
      var _this2 = this;

      var results = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      elements.map(function (d) {
        return d.split('/')[d.split('/').length - 1];
      }).forEach(function (element) {
        results[element] = spec[element];
        var refs = [];

        _this2.searchProperty(spec[element], '$ref', refs);

        if (refs.length > 0) _this2.getElements(spec, refs, results);
      });
      return results;
    }
  }, {
    key: "createSecurityRoute",
    value: function createSecurityRoute(app) {
      var _this3 = this;

      var swaggerSpec = (0, _swaggerJsdoc["default"])(this.options);
      app.all('*', function (req, res, next) {
        var products = swaggerSpec.paths[req.path] ? swaggerSpec.paths[req.path]['x-access'] : null;

        if (products == undefined || _this3.config.access.some(function (p) {
          return products.includes(p);
        })) {
          next();
        } else {
          res.send('Bad serial');
        }
      });
    }
  }, {
    key: "createSwaggerRoute",
    value: function createSwaggerRoute(app) {
      var swaggerSpecAdmin = this.filterAccess((0, _swaggerJsdoc["default"])(this.options));
      app.use('/_', _swaggerUiExpress["default"].serve, _swaggerUiExpress["default"].setup(swaggerSpecAdmin));
      var swaggerSpec = this.filterVisibility((0, _swaggerJsdoc["default"])(this.options));
      app.use('/', _swaggerUiExpress["default"].serve, _swaggerUiExpress["default"].setup(swaggerSpec));
    }
  }]);

  return SwaggerModule;
}();

module.exports = SwaggerModule;
//# sourceMappingURL=index.js.map