// var express = require('express')
// var router = express.Router()
// var personController = require('../controllers/personController')

// router.post('/', (req, res) => {
//   // const person = {
//   //   name: req.body.name,
//   //   userData: req.body.userData
//   // }
//   // personController.createPersonInPersonGroup('test-faces', person)
//   //   .then(resolve => {
//   //     // saveUserToDatabase(person.userData, resolve.person)
//   //     return res.status(resolve.status).send(resolve)
//   //   }).catch(reject => {
//   //     return res.status(reject.status).send(reject)
//   //   })

// })
const express = require('express')
let router = express.Router()
const multer = require('multer')
const Constants = require('../../configs/constants')
const AuthService = require('../services/AuthService')
const PersonController = require('../controllers/PersonController')
const FaceController = require('../controllers/FaceController')
const UploadController = require('../controllers/UploadController')
const VisualDataController = require('../controllers/VisualDataController')

const m = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
})

router.post('/', /* m.single('file'), */ async (req, res) => {
  try {
    const session = AuthService.getSessionFromRequest(req)
    const uuid = await AuthService.isLoggedIn(session)
    const url = await UploadController.uploadFile(req)
    const visualData = await VisualDataController.createVisualData({
      URL: url,
      isImage: true
    })
    req.body.datas = [visualData._id]
    const person = await PersonController.createPerson(req.body, uuid)
    res.send() // Send response after upload image and create person in database
    const personId = (await FaceController.createPersonInPersonGroup(Constants.face.known, { name: req.body.name })).personId
    await FaceController.addFaceForPerson(Constants.face.known, personId, url) // Add face in face api
    await PersonController.updateMicrosoftPersonId(person._id, personId) // Update MSid in DB
  } catch (error) {
    console.log(error)
    return res.status(error.status || 500).send(error)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const response = await PersonController.getPerson(req.params.id)
    return res.send(response)
  } catch (error) {
    console.log(error)
    return res.status(error.status || 500).send(error)
  }
})
router.get('/', async (req, res) => {
  try {
    const session = AuthService.getSessionFromRequest(req)
    const uuid = await AuthService.isLoggedIn(session)
    const response = await PersonController.getPersonsSameAuthor(uuid)
    return res.send(response)
  } catch (error) {
    console.log(error)
    return res.status(error.status || 500).send(error)
  }
})

module.exports = router
