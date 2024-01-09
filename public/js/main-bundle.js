(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var NS = 'http://www.w3.org/2000/svg';
// this is only going to work for tetrahedrons, of course
var FundamentalModes = [];
var Triples = [];
var tripleTransformation = [[false, 0, 1, 2], [0, false, 2, 1], [1, 2, false, 0], [2, 1, 0, false]];
findAllFundamentalNodes();
findAllTriples();
// console.log('there are ' + Triples.length + ' unique triples that add to 63')

function init() {
  showKeyOfFundamentalModes();
  showTripleTransformation();
  // console.log('test triple # 456', Triples[456])
  showCompositionOfTriple([4, 8, 51], document.getElementById('triple-composition-456'));
}
function showCompositionOfTriple(triple, container) {
  var composed = composeTripleTransformationOf(triple);
  var flattened = flattenComposedMatrix(composed);
  showSparseMatrix(container, flattened, 20);
}
function composeTripleTransformationOf(triple) {
  var composed = [];
  for (var i = 0; i < 4; i++) {
    var row = [];
    for (var j = 0; j < 4; j++) {
      if (tripleTransformation[i][j] === false) {
        row.push(FundamentalModes[0]);
        // console.log('composed mode 0', FundamentalModes[0])
      } else {
        var indexOfTriple = tripleTransformation[i][j];
        var modeNumber = triple[indexOfTriple];
        // console.log('composed mode ' + modeNumber, FundamentalModes[modeNumber])
        row.push(FundamentalModes[modeNumber]);
      }
    }
    composed.push(row);
  }
  return composed;
}
function flattenComposedMatrix(composed) {
  var flattened = [];
  for (var i = 0; i < composed.length; i++) {
    // row of composed
    for (var m = 0; m < 4; m++) {
      // m is choice of row in sub-matrix
      var flattenedRow = [];
      for (var j = 0; j < composed.length; j++) {
        // j is column of composed matrix
        var subRow = composed[i][j][m];
        flattenedRow = flattenedRow.concat(subRow);
      }
      flattened.push(flattenedRow);
    }
  }
  // console.log('flattened', flattened)
  return flattened;
}
function showTripleTransformation() {
  var graphDiv = document.getElementById('triple-transformation');
  showSparseMatrix(graphDiv, tripleTransformation, 20);
}
function showKeyOfFundamentalModes() {
  var fundamentalModeContainer = document.getElementById('fundamental-modes-index');
  Array.from(FundamentalModes).forEach(function (mode, i) {
    // console.log('graphing mode', i)
    var graphDiv = document.createElement('div');
    graphDiv.id = 'fundamental-mode-' + i;
    fundamentalModeContainer.appendChild(graphDiv);
    var titleDiv = document.createElement('h5');
    titleDiv.innerText = 'Mode #' + i;
    showSparseMatrix(graphDiv, mode, 15);
    graphDiv.appendChild(titleDiv);
  });
}
function createSparseMatrixFromFundamentalModeNumber(num) {
  var binaryString = num.toString(2);
  binaryString = binaryString.padStart(6, '0');
  var a = binaryString.split('').map(function (v) {
    return v === '1';
  }); // a here is a binary array of booleans
  // console.log('createSparseMatrixFromFundamentalModeNumber of ' + num, a)
  return [[false, a[0], a[1], a[2]], [a[0], false, a[3], a[4]], [a[1], a[3], false, a[5]], [a[2], a[4], a[5], false]];
}
function showSparseMatrix(container, matrix, squareSize) {
  var svg = document.createElementNS(NS, 'svg');
  var height = matrix.length * squareSize;
  var width = matrix.length * squareSize;
  var yOffset = function yOffset(m) {
    return m * squareSize;
  };
  var xOffset = function xOffset(n) {
    return n * squareSize;
  };
  svg.setAttributeNS(NS, 'viewBox', "".concat(0, " ", 0, " ", width, " ").concat(height));
  svg.style.height = height + 'px';
  svg.style.width = width + 'px';
  svg.style.backgroundColor = '#d3d3d333';
  svg.style.border = '0.5px solid black';
  svg.classList.add('sparse-matrix');
  container.appendChild(svg);
  for (var j = 0; j < matrix.length; j++) {
    // rows
    for (var i = 0; i < matrix[j].length; i++) {
      // columns
      addMatrixSquare(j, i, matrix[j][i]);
    }
  }
  function addMatrixSquare(j, i, value) {
    var square = document.createElementNS(NS, 'rect');
    square.setAttribute('y', yOffset(j));
    square.setAttribute('x', xOffset(i));
    square.setAttribute('width', squareSize);
    square.setAttribute('height', squareSize);
    square.id = 'row-' + j + '-column-' + i;
    square.setAttribute('fill', value === true || typeof value === 'number' ? 'black' : 'white'); // black for boolean true, or any number other than 0
    svg.appendChild(square);
    if (typeof value === 'number' || typeof value === 'string') {
      var text = document.createElementNS(NS, 'text');
      text.setAttribute('y', yOffset(j + 1) - squareSize / 5);
      text.setAttribute('x', xOffset(i) + squareSize / 10);
      text.textContent = value;
      text.setAttribute('font-size', squareSize * 0.8 + 'px');
      text.setAttribute('fill', 'white');
      svg.appendChild(text);
    }
  }
}
function findAllTriples() {
  // this is currently incorrect, they don't "add" to 63, they should be composed of combinations of exactly one element of [1,2,4,8,16,32]
  // const powersOfTwo = [1, 2, 4, 8, 16, 32]
  var exponents = [0, 1, 2, 3, 4, 5];
  console.log('powerset of exponenets ', exponents);
  console.log(getAllSubsets(exponents));
  function getAllSubsets(array) {
    var subsets = [[]];
    var _iterator = _createForOfIteratorHelper(array),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var el = _step.value;
        var last = subsets.length - 1;
        for (var i = 0; i <= last; i++) {
          subsets.push([].concat(_toConsumableArray(subsets[i]), [el]));
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return subsets;
  }
}
function findAllFundamentalNodes() {
  for (var i = 0; i < 64; i++) {
    FundamentalModes[i] = createSparseMatrixFromFundamentalModeNumber(i);
  }
}
exports.showSparseMatrix = showSparseMatrix;
exports.init = init;

},{}],2:[function(require,module,exports){
'use strict';

var adjacencyGraph = require('./adjacencyGraph');
document.addEventListener('DOMContentLoaded', function () {
  console.log('Start');
  adjacencyGraph.init();
});

},{"./adjacencyGraph":1}]},{},[2]);
