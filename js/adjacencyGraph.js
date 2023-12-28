const NS = 'http://www.w3.org/2000/svg'

function init () {
  const sparseMatrixContainers = Array.from(document.querySelectorAll('div.sparse-matrix'))
  console.log('sparseMatrixContainers', sparseMatrixContainers)
  sparseMatrixContainers.forEach(showSparseMatrix)
}

function showSparseMatrix (container) {

  // graphEl.querySelector('div.sparse-matrix-container').style.display = 'inline-block'
  console.log('showSparseMatrix', container)
  const squareSize = 40
  let matrix = {}
  try {
    matrix = JSON.parse(container.dataset.matrix)
    console.log('sparse matrix, after parsing', matrix)
  } catch (e) {
    console.log(e)
    container.innerText = 'Failure to parse matrix data ---> ' + e
    return
  }
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
    square.setAttribute('fill', value ? 'black' : 'white')
    svg.appendChild(square)
    if (value) {
      const text = document.createElementNS(NS, 'text')
      text.setAttribute('y', yOffset(j + 1) - squareSize / 5)
      text.setAttribute('x', xOffset(i) + squareSize / 14 )
      text.textContent = value
      text.setAttribute('font-size', squareSize * 0.8 + 'px')
      text.setAttribute('fill', 'red')
      svg.appendChild(text)
    }
  }
}

exports.showSparseMatrix = showSparseMatrix
exports.init = init
