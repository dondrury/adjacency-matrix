(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var NS = 'http://www.w3.org/2000/svg';
// this is only going to work for tetrahedrons, of course
var FundamentalModes = [];
// const Triples = findAllTriples()
var Quadruples = findAllQuadruples();
var tripleTransformation = [[false, 0, 1, 2], [0, false, 2, 1], [1, 2, false, 0], [2, 1, 0, false]];
var compositionMatrices = [[[0, 1, 2, 3], [1, 0, 3, 2], [2, 3, 0, 1], [3, 2, 1, 0]], [[0, 1, 2, 3], [1, 0, 3, 2], [2, 3, 1, 0], [3, 2, 0, 1]], [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2]], [[0, 1, 2, 3], [1, 3, 0, 2], [2, 0, 3, 1], [3, 2, 1, 0]]];
findAllFundamentalNodes();

// console.log('there are ' + Triples.length + ' unique triples that add to 63, without carrying any digits')

function init() {
  showKeyOfFundamentalModes();
  // showTripleTransformation()
  showFundamentalCompositionMatrices();
  // showAllTripleCompositions()
  // console.log('test triple # 456', Triples[456])
  // showCompositionOfTriple(Triples[456], document.getElementById('triple-composition-456'))
}
function showFundamentalCompositionMatrices() {
  var container = document.getElementById('four-composition-matrices');
  for (var n = 0; n < 4; n++) {
    var graphDiv = document.createElement('div');
    graphDiv.id = 'composition-matrix-' + n;
    container.appendChild(graphDiv);
    showSparseMatrix(graphDiv, compositionMatrices[n], 20);
    var label = document.createElement('div');
    label.innerText = 'Fundamental Composition Matrix # ' + n;
    graphDiv.appendChild(label);
  }
}
function showAllTripleCompositions() {
  var container = document.getElementById('triple-composition-all');
  for (var n = 0; n < Triples.length; n++) {
    var graphDiv = document.createElement('div');
    graphDiv.id = 'triple-composition-' + n;
    container.appendChild(graphDiv);
    showCompositionOfTriple(Triples[n], graphDiv);
    var label = document.createElement('div');
    label.innerText = 'Triple Composition of ' + Triples[n];
    graphDiv.appendChild(label);
  }
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
  svg.style.border = '0.5px solid darkgrey';
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
    square.setAttribute('stroke', 'black');
    square.id = 'row-' + j + '-column-' + i;
    square.setAttribute('fill', value === true || typeof value === 'number' ? 'darkgrey' : 'white'); // darkgrey for boolean true, or any number other than 0
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
  // this is currently incorrect, its spans further than it should, some don't work
  var addsToSixtyThree = [];
  for (var i = 0; i < 64; i++) {
    for (var j = 0; j < 64 - i; j++) {
      var triple = [i];
      triple.push(j);
      triple.push(63 - i - j);
      addsToSixtyThree.push(triple);
      // console.log('triple', triple, triple[0] + triple[1] + triple[2])
    }
  }
  console.log('adds to sicty three', addsToSixtyThree);
  var triples = addsToSixtyThree.filter(function (v, i) {
    // console.log('triple number ' + i + ' is ' + v)
    // console.log(v[0].toString(2).padStart(6, '0'))
    // console.log(v[1].toString(2).padStart(6, '0'))
    // console.log(v[2].toString(2).padStart(6, '0'))
    var threeWayXor = v[0] ^ v[1] ^ v[2];
    // console.log('threeWayXor', threeWayXor)
    return threeWayXor === 63;
  });
  // console.log('triples', triples)
  return triples;
}
function findAllQuadruples() {
  var addsToSixtyThree = [];
  for (var i = 0; i < 64; i++) {
    for (var j = 0; j < 64 - i; j++) {
      var triple = [i];
      triple.push(j);
      triple.push(63 - i - j);
      addsToSixtyThree.push(triple);
      // console.log('triple', triple, triple[0] + triple[1] + triple[2])
    }
  }
  console.log('adds to sixty three', addsToSixtyThree);
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
