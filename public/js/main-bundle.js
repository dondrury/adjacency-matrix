(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var NS = 'http://www.w3.org/2000/svg';
// this is only going to work for tetrahedrons, of course
var FundamentalModes = [];
var Triples = [];
findAllFundamentalNodes();
findAllTriples();
console.log('there are ' + Triples.length + ' unique triples that add to 63');
function findAllTriples() {
  for (var i = 0; i < 64; i++) {
    for (var j = 0; j < 64 - i; j++) {
      var triple = [i];
      triple.push(j);
      triple.push(63 - i - j);
      Triples.push(triple);
      // console.log('triple', triple, triple[0] + triple[1] + triple[2])
    }
  }
}
function findAllFundamentalNodes() {
  for (var i = 0; i < 64; i++) {
    FundamentalModes[i] = createSparseMatrixFromFundamentalModeNumber(i);
  }
}

// console.log(fundamentalModes)

function init() {
  // const sparseMatrixContainers = Array.from(document.querySelectorAll('div.sparse-matrix'))
  // console.log('sparseMatrixContainers', sparseMatrixContainers)
  // sparseMatrixContainers.forEach(showSparseMatrix)
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
  // graphEl.querySelector('div.sparse-matrix-container').style.display = 'inline-block'
  // console.log('showSparseMatrix', container, matrix)
  // let matrix = {}
  // try {
  //   matrix = JSON.parse(container.dataset.matrix)
  //   console.log('sparse matrix, after parsing', matrix)
  // } catch (e) {
  //   console.log(e)
  //   container.innerText = 'Failure to parse matrix data ---> ' + e
  //   return
  // }
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
    square.setAttribute('fill', value ? 'black' : 'white'); // black for boolean true, or any number other than 0
    svg.appendChild(square);
    if (typeof value === 'number' || typeof value === 'string') {
      var text = document.createElementNS(NS, 'text');
      text.setAttribute('y', yOffset(j + 1) - squareSize / 5);
      text.setAttribute('x', xOffset(i) + squareSize / 14);
      text.textContent = value;
      text.setAttribute('font-size', squareSize * 0.8 + 'px');
      text.setAttribute('fill', 'red');
      svg.appendChild(text);
    }
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
