const NS = 'http://www.w3.org/2000/svg'
// this is only going to work for tetrahedrons, of course
const FundamentalModes = []
const Triples = findAllTriples()
const tripleTransformation = [
  [false, 0, 1, 2],
  [0, false, 2, 1],
  [1, 2, false, 0],
  [2, 1, 0, false]
]

findAllFundamentalNodes()

console.log('there are ' + Triples.length + ' unique triples that add to 63, without carrying any digits')

function init () {
  showKeyOfFundamentalModes()
  showTripleTransformation()
  showAllTripleCompositions()
  // console.log('test triple # 456', Triples[456])
  // showCompositionOfTriple(Triples[456], document.getElementById('triple-composition-456'))
}

function showAllTripleCompositions () {
  const container = document.getElementById('triple-composition-all')
  for (let n = 0; n < Triples.length; n++) {
    const graphDiv = document.createElement('div')
    graphDiv.id = 'triple-composition-' + n
    container.appendChild(graphDiv)
    showCompositionOfTriple(Triples[n], graphDiv)
    const label = document.createElement('div')
    label.innerText = 'Triple Composition of ' + Triples[n]
    graphDiv.appendChild(label)
  }
}


function showCompositionOfTriple (triple, container) {
  const composed = composeTripleTransformationOf(triple)
  const flattened = flattenComposedMatrix(composed)
  showSparseMatrix(container, flattened, 20)
}

function composeTripleTransformationOf (triple) {
  const composed = []
  for (let i = 0; i < 4; i++) {
    const row = []
    for (let j = 0; j < 4; j++) {
      if (tripleTransformation[i][j] === false) {
        row.push(FundamentalModes[0])
        // console.log('composed mode 0', FundamentalModes[0])
      } else {
        const indexOfTriple = tripleTransformation[i][j]
        const modeNumber = triple[indexOfTriple]
        // console.log('composed mode ' + modeNumber, FundamentalModes[modeNumber])
        row.push(FundamentalModes[modeNumber])
      }
    }
    composed.push(row)
  }
  return composed
}

function flattenComposedMatrix (composed) {
  const flattened = []
  for (let i = 0; i < composed.length; i++) { // row of composed
    for (let m = 0; m < 4; m++) { // m is choice of row in sub-matrix
      let flattenedRow = []
      for (let j = 0; j < composed.length; j++) { // j is column of composed matrix
        const subRow = composed[i][j][m]
        flattenedRow = flattenedRow.concat(subRow)
      }
      flattened.push(flattenedRow)
    }
  }
  // console.log('flattened', flattened)
  return flattened
}

function showTripleTransformation () {
  const graphDiv = document.getElementById('triple-transformation')
  showSparseMatrix(graphDiv, tripleTransformation, 20)
}

function showKeyOfFundamentalModes () {
  const fundamentalModeContainer = document.getElementById('fundamental-modes-index')
  Array.from(FundamentalModes).forEach((mode, i) => {
    // console.log('graphing mode', i)
    const graphDiv = document.createElement('div')
    graphDiv.id = 'fundamental-mode-' + i
    fundamentalModeContainer.appendChild(graphDiv)
    const titleDiv = document.createElement('h5')
    titleDiv.innerText = 'Mode #' + i
    showSparseMatrix(graphDiv, mode, 15)
    graphDiv.appendChild(titleDiv)
  })
}

function createSparseMatrixFromFundamentalModeNumber (num) {
  let binaryString = num.toString(2)
  binaryString = binaryString.padStart(6, '0')
  const a = binaryString.split('').map(v => v === '1') // a here is a binary array of booleans
  // console.log('createSparseMatrixFromFundamentalModeNumber of ' + num, a)
  return [
    [false, a[0], a[1], a[2]],
    [a[0], false, a[3], a[4]],
    [a[1], a[3], false, a[5]],
    [a[2], a[4], a[5], false]
  ]
}

function showSparseMatrix (container, matrix, squareSize) {
  const svg = document.createElementNS(NS, 'svg')
  const height = matrix.length * squareSize
  const width = matrix.length * squareSize
  const yOffset = m => m * squareSize
  const xOffset = n => n * squareSize
  svg.setAttributeNS(NS, 'viewBox', `${0} ${0} ${width} ${height}`)
  svg.style.height = height + 'px'
  svg.style.width = width + 'px'
  svg.style.backgroundColor = '#d3d3d333'
  svg.style.border = '0.5px solid darkgrey'
  svg.classList.add('sparse-matrix')
  container.appendChild(svg)
  for (let j = 0; j < matrix.length; j++) { // rows
    for (let i = 0; i < matrix[j].length; i++) { // columns
      addMatrixSquare(j, i, matrix[j][i])
    }
  }

  function addMatrixSquare (j, i, value) {
    const square = document.createElementNS(NS, 'rect')
    square.setAttribute('y', yOffset(j))
    square.setAttribute('x', xOffset(i))
    square.setAttribute('width', squareSize)
    square.setAttribute('height', squareSize)
    square.setAttribute('stroke', 'black')
    square.id = 'row-' + j + '-column-' + i
    square.setAttribute('fill', value === true || typeof value === 'number' ? 'darkgrey' : 'white') // darkgrey for boolean true, or any number other than 0
    svg.appendChild(square)
    if (typeof value === 'number' || typeof value === 'string') {
      const text = document.createElementNS(NS, 'text')
      text.setAttribute('y', yOffset(j + 1) - squareSize / 5)
      text.setAttribute('x', xOffset(i) + squareSize / 10)
      text.textContent = value
      text.setAttribute('font-size', squareSize * 0.8 + 'px')
      text.setAttribute('fill', 'white')
      svg.appendChild(text)
    }
  }
}

function findAllTriples () { // this is currently incorrect, its spans further than it should, some don't work
  const addsToSixtyThree = []
  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64 - i; j++) {
      const triple = [i]
      triple.push(j)
      triple.push(63 - i - j)
      addsToSixtyThree.push(triple)
      // console.log('triple', triple, triple[0] + triple[1] + triple[2])
    }
  }
  console.log('adds to sicty three', addsToSixtyThree)
  const triples = addsToSixtyThree.filter((v, i) => {
    // console.log('triple number ' + i + ' is ' + v)
    // console.log(v[0].toString(2).padStart(6, '0'))
    // console.log(v[1].toString(2).padStart(6, '0'))
    // console.log(v[2].toString(2).padStart(6, '0'))
    const threeWayXor = v[0] ^ v[1] ^ v[2]
    // console.log('threeWayXor', threeWayXor)
    return threeWayXor === 63
  })
  // console.log('triples', triples)
  return triples
}

function findAllFundamentalNodes () {
  for (let i = 0; i < 64; i++) {
    FundamentalModes[i] = createSparseMatrixFromFundamentalModeNumber(i)
  }
}

exports.showSparseMatrix = showSparseMatrix
exports.init = init
