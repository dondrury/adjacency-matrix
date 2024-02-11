const mongoose = require('mongoose')

const requiredIntegerSum = {
  4: 63
}

const tupleSchema = new mongoose.Schema({
  size: { type: Number, required: true, index: true },
  rank: { type: Number, required: true },
  numberArray: [Number],
  stringRepresentation: { type: String, required: true, unique: true},
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
  timestamps: true
})

tupleSchema.pre('validate', function (next) {
  this.size = this.numberArray.length
  this.rank = findRank(this.numberArray)
  this.stringRepresentation = JSON.stringify(this.numberArray)
  // console.log('after validating', this)
  const isNotTupleError = isNotTuple(this.numberArray)
  if (isNotTupleError) {
    next(isNotTupleError)
    return
  }
  // this.base10Representation = makeBase10Representation(this.numberArray)
  console.log('after validation', this)
  next()
})

function findRank (numberArray) {
  let rank = 0
  for (let i = 0; i < numberArray.length; i++) {
    if (numberArray[i]) rank++
  }
  return rank
}

function isNotTuple (numberArray) {
  let sum = 0
  const size = numberArray.length
  for (let i = 0; i < numberArray.length; i++) {
    sum += numberArray[i]
  }
  // console.log('sum', sum)
  if (sum !== requiredIntegerSum[size]) return new Error('tuple does not add to '+ requiredIntegerSum[size])
  let xorSum = 0
  for (let i = 0; i < numberArray.length; i++) {
    xorSum = xorSum ^ numberArray[i]
  }
  if (xorSum !== requiredIntegerSum[size]) return new Error('tuple does add to become a ' + size + '-hedron')
}


const Tuple = mongoose.model('Tuple', tupleSchema)

module.exports = Tuple
