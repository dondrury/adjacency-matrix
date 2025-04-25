function init() {
  console.log('started State Space 3D Model')
  Array.from(document.getElementsByClassName('graph-container')).forEach(prepare)
}

function prepare(el, i) {
  const matrix = JSON.parse(el.dataset.matrix)
  const button = el.querySelector('button[name="model-3d"]')
  if (!button) {
    console.log('button[name="model-3d"] not found')
    return
  }
  const container = el.querySelector('div.model-3d-container')
  button.onclick = function () {
    // console.log('onlick event for state space 3d model')
    const  {rows, cols, rank, numericalMatrix} = normalizeMatrix(matrix)
  
    const iterations = iterateOnePulseNTimes(numericalMatrix, {
      channel: 0,
      stopAfter: 300
    })
    // const iterations = vibrateOnOneChannelNTimes(numericalMatrix,{
    //   channel: 0,
    //   wavelength: 3,
    //   intensity: 0.00001,
    //   stopAfter: 100,
    //   stopForcingAfter: 5
    // })
    console.log(iterations)
  }
}

function iterateOnePulseNTimes (numericalMatrix, options = {}) { // these just overdamped to equal portions!
  const channel = options.channel || 0
  const stopAfter = options.stopAfter || 200
  const initVector = (new Array(numericalMatrix.length)).fill(0)
  initVector[channel] = 1
  const results = [initVector]
  addAnotherResult()
  function addAnotherResult() {
    if (results.length > stopAfter) return
    const result = multiplyMatrixAndVector(numericalMatrix, results[results.length - 1]) // start with the latest result
    console.log(`${results.length}:`, result)
    results.push(result)
    addAnotherResult()
  }
  return results
}

function vibrateOnOneChannelNTimes (numericalMatrix, options = {}) {
  const channel = options.channel || 0
  const intensity = options.intensity || 0.000001
  const stopAfter = options.stopAfter || 200
  const stopForcingAfter = options.stopForcingAfter || 10
  const initVector = (new Array(numericalMatrix.length)).fill(0)
  const wavelength = options.wavelength || 2
  initVector[channel] = intensity
  const results = [ initVector ]
  addAnotherResult()
  function addAnotherResult() {
    if (results.length > stopAfter) return
    const result = multiplyMatrixAndVector(numericalMatrix, results[results.length - 1]) // start with the latest result
    // let forcingFunction = results.length % 2 ? 0 : intensity
    let forcingFunction = (results.length % wavelength) === 0 ? intensity : 0
    if  (results.length >= stopForcingAfter) {
      forcingFunction = 0
    }
    result[channel] += forcingFunction + result[channel]
    console.log(`${results.length}: forcingFunction ${forcingFunction} applied on channel ${channel}`, result) 
    results.push(result)
    addAnotherResult()
  }
  return results
}

function multiplyMatrixAndVector (numericalMatrix, vector) { // this appears trustworthy
  const resultVector = (new Array(vector.length)).fill(null)
  // console.log(resultVector)
  // console.log(' numericalMatrix.length',  numericalMatrix.length)
  for (let i = 0; i < numericalMatrix.length; i++) { // i iterates rows
    let cumulativeSumOfMultipliedPairs = 0
    for (let j = 0; j < numericalMatrix.length; j++) { // j is for columns
      cumulativeSumOfMultipliedPairs += vector[j] * numericalMatrix[i][j]
      // console.log(`(${i},${j})`, 'vector[j],  numericalMatrix[i][j], vector[j] * numericalMatrix[i][j]', vector[j],  numericalMatrix[i][j], vector[j] * numericalMatrix[i][j] )
    }
    resultVector[i] = cumulativeSumOfMultipliedPairs
    // console.log('resultVector[i]', resultVector[i])
  }
  return resultVector
}



function normalizeMatrix (matrix) {
  // console.log(matrix)
  const rows = matrix.length
  const cols = matrix[0].length
  if (rows !== cols) {
    console.log('not square')
    return 
  }
  const rank = determineRank(matrix)
  // console.log({ rank })
  if (typeof rank !== 'number') return
  const numericalMatrix = []
  for (let i = 0; i < matrix.length; i++) {  // i is for rows
    const row = []
    for (let j = 0; j < matrix[i].length; j++) { // j is for columns
      const elementValue = matrix[i][j] ? 1: 0
      row.push(elementValue / rank)
    }
    numericalMatrix.push(row)
  }
  return {rows, cols, rank, numericalMatrix}
}

function determineRank (booleanMatrix) {
  let rowRank  = []
  for (let i = 0; i < booleanMatrix.length; i++) {
    let rank = 0
    for (let j = 0; j < booleanMatrix[i].length; j++) {
      if (booleanMatrix[i][j]) rank++
    }
    rowRank.push(rank)
    if (i > 0 && rowRank[i] !== rowRank[i - 1]) {
      console.log('inconsistent adjascent row ranks, exiting determineRank')
      return null
    }
  }
  let columnRank = []
  for (let i = 0; i < booleanMatrix.length; i++) {
    let rank = 0
    for (let j = 0; j < booleanMatrix[i].length; j++) {
      if (booleanMatrix[j][i]) rank++
    }
    columnRank.push(rank)
    if (i > 0 && rowRank[i] !== rowRank[i - 1]) {
      console.log('inconsistent adjascent column ranks, exiting determineRank')
      return null
    }
  }
 
  const testRank = rowRank[0]
  if (rowRank.every(el => el === testRank) && columnRank.every(el => el === testRank) ) {
    console.log('consistent rank of ' + testRank)
    return testRank
  }
  return null // will throw error
}


exports.init = init
