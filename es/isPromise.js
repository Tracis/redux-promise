"use strict";

exports.__esModule = true;
exports["default"] = _default;

function _default(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}