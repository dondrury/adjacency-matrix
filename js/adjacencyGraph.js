const NS = 'http://www.w3.org/2000/svg'
// this is only going to work for tetrahedrons, of course
const FundamentalModes = []
const Triples = []

findAllFundamentalNodes()
findAllTriples()
console.log('there are ' + Triples.length + ' unique triples that add to 63')
function findAllTriples () {
  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64 - i; j++) {
      const triple = [i]
      triple.push(j)
      triple.push(63 - i - j)
      Triples.push(triple)
      // console.log('triple', triple, triple[0] + triple[1] + triple[2])
    }
  }
}

function findAllFundamentalNodes () {
  for (let i = 0; i < 64; i++) {
    FundamentalModes[i] = createSparseMatrixFromFundamentalModeNumber(i)
  }
}

// console.log(fundamentalModes)

function init () {
  // const sparseMatrixContainers = Array.from(document.querySelectorAll('div.sparse-matrix'))
  // console.log('sparseMatrixContainers', sparseMatrixContainers)
  // sparseMatrixContainers.forEach(showSparseMatrix)
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
  const svg = document.createElementNS(NS, 'svg')
  const height = matrix.length * squareSize
  const width = matrix.length * squareSize
  const yOffset = m => m * squareSize
  const xOffset = n => n * squareSize
  svg.setAttributeNS(NS, 'viewBox', `${0} ${0} ${width} ${height}`)
  svg.style.height = height + 'px'
  svg.style.width = width + 'px'
  svg.style.backgroundColor = '#d3d3d333'
  svg.style.border = '0.5px solid black'
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
    square.id = 'row-' + j + '-column-' + i
    square.setAttribute('fill', value ? 'black' : 'white') // black for boolean true, or any number other than 0
    svg.appendChild(square)
    if (typeof value === 'number' || typeof value === 'string') {
      const text = document.createElementNS(NS, 'text')
      text.setAttribute('y', yOffset(j + 1) - squareSize / 5)
      text.setAttribute('x', xOffset(i) + squareSize / 14)
      text.textContent = value
      text.setAttribute('font-size', squareSize * 0.8 + 'px')
      text.setAttribute('fill', 'red')
      svg.appendChild(text)
    }
  }
}

exports.showSparseMatrix = showSparseMatrix
exports.init = init
