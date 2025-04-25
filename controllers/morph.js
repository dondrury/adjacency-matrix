const Morph = require('../models/morph')
const Graph = require('../models/graph')

exports.afterConnectionTasks = function () {
  setTimeout(function () {
   console.log('morph controller after connection tasks')
  //  updateAllSuperpositionMatrices() // this also serves to update "exampleCount to match actual matrices. During the search process some errors caused double counting"
  // findAllAntiMorphs()
  }, 1000)
}

function findAllAntiMorphs () {
  Morph.find({ antiMorph: { $exists: false }}).populate('bestExample').exec((err, allUndeterminedMorphs) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('findAllAntiMorphs has found %s morphs', allUndeterminedMorphs.length)
    let i = 0
    updateNextUndeterminedMorph()
    function updateNextUndeterminedMorph () {
      if (i === allUndeterminedMorphs.length) {
        console.log('findAllAntiMorphs is done')
        return
      }
      allUndeterminedMorphs[i].findAndApplyAntiMorph(() => {
        i++
        setTimeout(updateNextUndeterminedMorph, 10)
      })
    }
  })
}


// function updateAllSuperpositionMatrices () {
//   Morph.find({ superpositionMatrix : { $exists: false }}).exec((err, allMorphs) => {
//     if (err) {
//       console.log(err)
//       return
//     }
//     console.log('updateAllSuperpositionMatrices has found %s morphs', allMorphs.length)
//     let i = 0
//     updateNextSuperpositionMatrix()
//     function updateNextSuperpositionMatrix () {
//       if (i === allMorphs.length) {
//         console.log('updateAllSuperpositionMatrices is done')
//         return
//       }
//       allMorphs[i].updateSuperPositionMatrix(() => {
//         i++
//         setTimeout(updateNextSuperpositionMatrix, 0)
//       })
//     }
//   })
// }

exports.getMorphsTableView = (req, res) => {
  Morph.find().exec((err, morphs) => {
    if (err || !morphs) {
      console.log(err)
      return
    }
    // morphs = morphs.map((m, i) => {
    //   m = m.toObject()
    //   const coeff = m.characteristicPolynomial.coeff
    //   let sumOfCoefficients = 0
    //   let alternatingSumOfCoefficients = 0
    //   for (const exponent in coeff) { // add coefficients together just to see
    //     sumOfCoefficients += coeff[exponent]
    //   }
    //   for (const exponent in coeff) { // add coefficients together just to see
    //     if (exponent % 2) alternatingSumOfCoefficients += coeff[exponent]
    //     else alternatingSumOfCoefficients -= coeff[exponent]
    //   }
    //   m.sumOfCoefficients = sumOfCoefficients
    //   m.alternatingSumOfCoefficients = alternatingSumOfCoefficients
    //   if (5 <= i && i <= 7) console.log(m)
    //   return m
    // })

    return res.render('layout', { title: 'Morphs Table View', view: 'morphsTableView', morphs })
  })
}

exports.getMorphsJson = (req, res) => {
  Morph.find().populate('bestExample').exec((err, morphs) => {
    if (err || !morphs) {
      console.log(err)
      return
    }
    // console.log(morphs)
    return res.json({ morphs })
  })
}

exports.getMorphs = (req, res) => { 
  const size = Number(req.params.size)
  const rank = Number(req.params.rank)
  // console.log(size, rank)
  Morph.find({size, rank}).populate('bestExample').sort('selfReferences -isSymmetric').exec((err, morphs) => {
    if (err) {
      console.log(err)
      return
    }
    Graph.count({size, rank}).exec((err, counted) => {
      if (err) {
        console.log(err)
        return
      }
      return res.render('layout', { title: 'What Morphs Exist', view: 'morphs', morphs, size, rank, graphsInSpace: counted })
    })
  })
}

exports.postEditMorph = (req, res) => {
  const id = req.params.id
  Morph.findById(id).populate('bestExample').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    morph.name = req.body.name
    morph.save((err, morphAfter) => {
      return res.redirect('/morphs/edit/' + id)
    })
  })
}


exports.postEditSaveImageMorph = (req, res) => {
  const id = req.params.id
  Morph.findById(id).populate('bestExample').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    morph.image = req.body.imageSrc
    morph.save((err, morphAfter) => {
      return res.redirect('/morphs/edit/' + id)
    })
  })
}


exports.getEditMorph = (req, res) => {
  const id = req.params.id
  // console.log(id)
  Morph.findById(id).populate('bestExample antiMorph').exec((err, morph) => {
    if (err) {
      console.log(err)
      return
    }
    // console.log(morph)
    Graph.find({ morphIdentified: id }).select('name pseudoSkewSymmetryScore').sort('pseudoSkewSymmetryScore').exec((err, graphs) => {
      if (err) {
        console.log(err)
        return
      }
      // console.log(graphs)
      return res.render('layout', { title: 'Morph ' + id, view: 'editMorph', morph, graphs })
    })
  })
  
}
