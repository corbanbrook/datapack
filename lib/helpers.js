"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var hasFlag = exports.hasFlag = function hasFlag(bitmask, flag) {
  return (bitmask & flag) === flag;
};