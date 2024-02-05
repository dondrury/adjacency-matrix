import { eigs } from 'mathjs'
const cytoscape = require('cytoscape')
const Polynomial = require('polynomial')

function init() {
  console.log('started cytoscape visualization')
  // Array.from(document.getElementsByClassName('cytoscape-visualization')).forEach(create)
  Array.from(document.getElementsByClassName('matrix-svg-container')).forEach(prepare)
}

function prepare(el, i) {
  // console.log('matrix svg element', el)
  const matrix = JSON.parse(el.dataset.matrix)
  
  // console.log('matrix', matrix)
  const button = el.querySelector('button')
  if (!button) return
  // console.log('button', button)
  const container = el.querySelector('div.cytoscape-visualization')
  // console.log('container', container)
  const characteristicEquationEl = el.querySelector('.characteristic-equation')
  const characteristicEquation = findCharacteristicEquation(matrix)
  characteristicEquationEl.innerHTML = prettyPrintPolynomial(characteristicEquation)
  const svg = el.querySelector('svg')
  button.onclick = function () {
    container.style.display = container.style.display === 'none' ? 'inline-block' : 'none'
    if (container.style.display === 'inline-block') {
      visualize(matrix, container)
      findEigenValues(matrix)
      // const characteristicEquation = 
      // console.log('characteristic equation', characteristicEquation.toString())
      button.innerText = 'Show as Matrix'
    } else {
      container.innerHTML = ''
      button.innerText = 'Show as Wireframe'
    }
    svg.style.display = svg.style.display === 'none' ? 'inline-block' : 'none'
  }
}

function prettyPrintPolynomial (poly) {
  // console.log(poly)
  let prettyHtml = ''
  const polynomial = poly.coeff
  for (const power in polynomial) {
    // console.log('power', power)
    const coeff = polynomial[power]
    // console.log('coefficient', coeff)
    let html = ''
    if (power !== '0') {
      if (coeff === 1) html = `+&lambda;<sup>${power === '1' ? '': power}</sup>`
      else if (coeff === -1) html = `-&lambda;<sup>${power === '1' ? '': power}</sup>`
      else html = `${coeff > 0 ? '+' : ''}${coeff}&lambda;<sup>${power === '1' ? '': power}</sup>`
    }
    else  html = (coeff > 0 ? '+' : '') + coeff // for regular numbers
    prettyHtml = html + prettyHtml
  }
  // console.log('prettyHtml', prettyHtml)
  if (prettyHtml.charAt(0) === '+') prettyHtml = prettyHtml.substring(1)
  return prettyHtml + ' = 0'
}

function findCharacteristicEquation (matrix) {
 const polynomialMatrix = createPolynomialMatrix(matrix)
 return detByLaplace(polynomialMatrix)
//  const testMatrix = [
//   [new Polynomial([0,-1]), new Polynomial([1]),new Polynomial([0])],
//   [new Polynomial([1]), new Polynomial([0,-1]),new Polynomial([1])],
//   [new Polynomial([0]), new Polynomial([1]),new Polynomial([0, -1])]
//  ]
//  console.log('empty polynomial toString', (new Polynomial([0])).toString())
//  console.log('determinant by Laplace as string', detByLaplace(testMatrix).toString())
//  const pol0 = new Polynomial([1,1])
//  const pol1 = new Polynomial([1,1])
//  console.log(pol0, pol0.toString())
//  console.log(pol1, pol1.toString())
//  console.log('pol0 + pol1', pol0.add(pol1).toString())
//  console.log('pol0 * pol1', pol0.mul(pol1).toString())
}


function detByLaplace(polyMatrix) {
  // console.log('polynomial matrix from which to take determinant', polyMatrix)
  if (polyMatrix.length === 2) { // 2x2 easy to calculate, also escape condition
    const ad = polyMatrix[0][0].mul(polyMatrix[1][1])
    const bc = polyMatrix[0][1].mul(polyMatrix[1][0])
    return ad.sub(bc) // ad - bc, polynomial object, not number
  }
  // if not 2x2 we need to break it up into submatrices
  const topRow = polyMatrix[0].map((el, index) => {
    if (el.toString() === '0') {
      console.log('excepted a zero prefix')
      return {
        prefix: 0,
        subMatrix: null
      }
    }
    const subMatrix = []
    for (let i = 1; i < polyMatrix.length; i++) {  // i is for rows, we ignore the first one, containing our coefficients
      const row = []
      for (let j = 0; j < polyMatrix[i].length; j++) { // j is for columns
        if (j !== index) row.push(polyMatrix[i][j]) // don't take from our column
      }
      subMatrix.push(row)
    }
    
    return {
      prefix: el.mul(new Polynomial([index % 2 ? -1 : 1])), // switch sign for odd numbers
      subMatrix
    }
  })
  // console.log('topRow', topRow)
  let polynomialSum = new Polynomial([0])
  topRow.forEach(ob => {
    // console.log('prefix', ob.prefix.toString())
    if (ob.prefix !== 0) {
      let partialSum = ob.prefix.mul(detByLaplace(ob.subMatrix))
      polynomialSum = polynomialSum.add(partialSum)
    }
  }) // topRow now list of polynomials
  return polynomialSum
  // is this the bug ? λ16-24λ14-8λ13+228λ12+144λ11-1080λ10-984λ9+2606λ8+3168λ7-2760λ6-4792λ5+372λ4+2832λ3+792λ2-360λ-135 = 0
}

function createPolynomialMatrix (matrix) {
  // console.log('before createPolynomialMatrix', matrix)
  const polynomialMatrix = []
  for (let i = 0; i < matrix.length; i++) {  // i is for rows
    const row = []
    for (let j = 0; j < matrix[i].length; j++) { // j is for columns
      let element = new Polynomial([0])
      if (matrix[i][j]) element = new Polynomial([1])
      if (i === j) element = new Polynomial([0, -1])
      row.push(element)
    }
    polynomialMatrix.push(row)
  }
  // console.log('after createPolynomialMatrix', polynomialMatrix)
  return polynomialMatrix
}

function findEigenValues (matrix) {
  const numericalMatrix = []
  for (let i = 0; i < matrix.length; i++) {  // i is for rows
    const row = []
    for (let j = 0; j < matrix[i].length; j++) { // j is for columns
      row.push(matrix[i][j] ? 1: 0)
    }
    numericalMatrix.push(row)
  }
  // console.log('matrix', matrix)
  // console.log('numericalMatrix', numericalMatrix)
  // console.log('eigenvalues', eigs(numericalMatrix, { eigenvectors: false }))
  const eigenValues = eigs(numericalMatrix, { eigenvectors: false }).values.sort((a,b) => a - b)
  console.log('eigenValues', eigenValues)
}

function visualize (matrix, container) {
 
  const nodes = []
  for ( let i = 0; i < matrix.length; i++) {
    nodes.push({
      data: { id: i.toString() }
    })
  }
  const connections = []
  for (let i = 0; i < matrix.length; i++) {  // i is for rows
    for (let j = 0; j < matrix[i].length; j++) { // j is for columns
      if ( j > i && matrix[i][j]) { // above the diagonal, and "true"
        connections.push({
          data: {
            id: i + ',' + j,
            source: i.toString(),
            target: j.toString()
          }
        })
      }
    }
  }
  // console.log('nodes', nodes)
  // console.log('connections', connections)
  cytoscape({
    container: container, // container to render in
    elements: nodes.concat(connections),
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'none',
          'curve-style': 'bezier'
        }
      }
    ],
    layout: {
      name: 'cose',
      // rows: 1
    }
  })
}



exports.init = init