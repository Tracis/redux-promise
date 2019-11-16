"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _isPromise = _interopRequireDefault(require("./isPromise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function createReduxPromise(params) {
  if (params === void 0) {
    params = {};
  }

  var _params = params,
      checkSuccess = _params.checkSuccess,
      getPayLoad = _params.getPayLoad;
  return function (_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;
    return function (next) {
      return function (action) {
        if (typeof action === "function") {
          return action(dispatch, getState, params);
        }

        var promise = action.promise,
            type = action.type,
            rest = _objectWithoutPropertiesLoose(action, ["promise", "type"]);

        if (typeof promise !== "function" || !Array.isArray(type)) {
          return next(action);
        } // 如果action是type promise 这种
        // {type: [REQUEST, SUCCESS, FAILURE] , promise:()=>{}}


        var REQUEST = type[0],
            SUCCESS = type[1],
            FAILURE = type[2];
        next(_extends({}, rest, {
          type: REQUEST
        }));
        var actionPromise = promise();

        if ((0, _isPromise["default"])(actionPromise)) {
          actionPromise.then(function (result) {
            var payload = typeof getPayLoad === "function" ? getPayLoad(result) : result;

            if (typeof checkSuccess === "function" && !checkSuccess(result)) {
              next(_extends({}, rest, {
                error: result,
                type: FAILURE
              }));
            } else {
              (Array.isArray(SUCCESS) ? SUCCESS : [SUCCESS]).forEach(function (successType) {
                return next(_extends({}, rest, {
                  payload: payload,
                  type: successType
                }));
              });
            }
          })["catch"](function (error) {
            console.error("redux error:", error);
            next(_extends({}, rest, {
              error: error,
              type: FAILURE
            }));
          });
        }

        return actionPromise;
      };
    };
  };
}

var reduxPromise = createReduxPromise();
reduxPromise.withExtraArgument = createReduxPromise;
var _default = reduxPromise;
exports["default"] = _default;