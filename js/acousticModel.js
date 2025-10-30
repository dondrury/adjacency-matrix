function init() {
  console.log('started acoustic Model')
  Array.from(document.getElementsByClassName('graph-container')).forEach(prepare)
}

function prepare(el, i) {
  const matrix = JSON.parse(el.dataset.matrix)
  const button = el.querySelector('button[name="acoustic-model"]')
  if (!button) {
    console.log('button[name="acoustic-model"] not found')
    return
  }
  button.onclick = function () {
    // console.log('onlick event for state space 3d model')
    const numericalMatrix = normalizeMatrix(matrix)
    // console.log('numericalMatrix', numericalMatrix)
    const iterations = vibrate(numericalMatrix, {
      periods: 10
    })
    console.log(iterations)
  }
}

function generateSoundFile () {
  // Legend
  // DUR - duration in seconds   SPS - sample per second (default 44100)
  // NCH - number of channels    BPS - bytes per sample

  // t - is number from range [0, DUR), return number in range [0, 1]
  function getSampleAt(t,DUR,SPS)
  {
      return Math.sin(6000*t); 
  }

  function genWAVUrl(fun, DUR=1, NCH=1, SPS=44100, BPS=1) {
    let size = DUR*NCH*SPS*BPS; 
    let put = (n,l=4) => [(n<<24),(n<<16),(n<<8),n].filter((x,i)=>i<l).map(x=> String.fromCharCode(x>>>24)).join('');
    let p = (...a) => a.map( b=> put(...[b].flat()) ).join(''); 
    let data = `RIFF${put(44+size)}WAVEfmt ${p(16,[1,2],[NCH,2],SPS,NCH*BPS*SPS,[NCH*BPS,2],[BPS*8,2])}data${put(size)}`
    for (let i = 0; i < DUR*SPS; i++) {
      let f= Math.min(Math.max(fun(i/SPS,DUR,SPS),0),1);
      data += put(Math.floor( f * (2**(BPS*8)-1)), BPS);
    }
    const wavUrl = "data:Audio/WAV;base64," + btoa(data)
    console.log('length of wavUrl', wavUrl.length)
    return wavUrl
  }


  var WAV = new Audio( genWAVUrl(getSampleAt,5) ); // 5s
  WAV.setAttribute("controls", "controls");
  document.getElementsByClassName('graph-container')[0].appendChild(WAV)
  WAV.style.marginTop = '40px'
  //WAV.play()
}

function producePerturbationChart(booleanMatrix) {
   const numericalMatrix = normalizeMatrix(booleanMatrix)
  
    // const iterations = iterateOnePulseNTimes(numericalMatrix, {
    //   channel: 0,
    //   stopAfter: 300
    // })
    const iterations = vibrateOnOneChannelNTimes(numericalMatrix,{
      channel: 0,
      wavelength: 3,
      intensity: 1,
      stopAfter: 100,
      stopForcingAfterWavelengths: 100
    })
    console.log(iterations)

    return iterations
}

function checkVectorSum (vector) {
  let sum = 0
  vector.forEach(v => {
    sum += v
  })
  if (sum > 0.00000000001) {
    throw new Error('vector sum not zero')
  }
  return sum
}

function vectorRadius (vector) {
  let sum = 0
  vector.forEach(v => {
    sum += Math.pow(v, 2)
  })
  return Math.pow(sum, 0.5)
}

function vibrate (numericalMatrix, options = {}) { // these just overdamped to equal portions!
  // const channel = options.channel || 0
  const periods = options.periods || 4
  const stopAfter = numericalMatrix.length * periods
  const initVector = (new Array(numericalMatrix.length)).fill(1)
  console.log(initVector)
  const results = [initVector]
  // console.log(`0:`, initVector, 'radius', vectorRadius(initVector))
  addAnotherResult()
  function addAnotherResult() {
    if (results.length > stopAfter) return
    const result = multiplyMatrixAndVector(numericalMatrix, results[results.length - 1]) // start with the latest result
    console.log(`${results.length}:`, result)
    // checkVectorSum(result)
    results.push(result)
    addAnotherResult()
  }
  return results
}

function vibrateOnOneChannelNTimes (numericalMatrix, options = {}) {
  const channel = options.channel || 0
  const intensity = options.intensity || 0.000001
  const stopAfter = options.stopAfter || 200
  const stopForcingAfterWavelengths = options.stopForcingAfterWavelengths || 10
  const initVector = (new Array(numericalMatrix.length)).fill(0)
  const wavelength = options.wavelength || 2
  initVector[channel] = intensity
  // initVector[channel + 1] = 0 - intensity
  // checkVectorSum(initVector)
  const results = [ initVector ]
  console.log(`0: forcingVector ${initVector.join(',')} to start`, initVector) 
  addAnotherResult()
  function addAnotherResult() {
    if (results.length > stopAfter) return
    let result = multiplyMatrixAndVector(numericalMatrix, results[results.length - 1]) // start with the latest result
    // let forcingFunction = results.length % 2 ? 0 : intensity
    let applyForcingVector = ((results.length % wavelength) === 0) && (results.length < (stopForcingAfterWavelengths * wavelength))
    if  (applyForcingVector) {
      result = addVectors(initVector, result)
      console.log(`${results.length}: forcingVector ${initVector} was applied`, result) 
    } else {
      console.log(`${results.length}: forcingVector not applied`, result)
    }
    console.log('result vector radius', vectorRadius(result))
    // checkVectorSum(result)
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

function addVectors (v, w) {
  if (v.length !== w.length) throw new Error('cannot add two different size vectors')
  const length = w.length
  const resultVector = (new Array(length)).fill(null)
  for (let i = 0; i < length; i++) {
    resultVector[i] = v[i] + w[i]
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
  return numericalMatrix
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


module.exports = {
  init,
  // producePerturbationChart
}
