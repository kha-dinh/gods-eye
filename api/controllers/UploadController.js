const Storage = require('@google-cloud/storage')
const config = require('../../config')
const tinify = require('tinify')
const fs = require('fs')
const bucketName = config.google.cloudStorage.bucketName
tinify.key = 'uMSAHd1Lvm4U8kGUHmYknkwylO2H2abJ'

// interface Credentials {
//   client_email?: string;
//   private_key?: string;
// }

// interface ConfigurationObject {
//   autoRetry?: boolean;
//   credentials?: Credentials;
//   email?: string;
//   keyFilename?: string;
//   maxRetries?: number;
//   projectId?: string;
//   promise?: PromiseLibrary<any>;
// }
var storage
console.log(process.env.GOOGLE_PRIVATE_KEY)
if (process.env.GOOGLE_PRIVATE_KEY) {
  fs.readFile('demo-856e4ac1d0d4.json', 'utf8', function readFileCallback (err, data) {
    if (err) {
      console.log(err)
    } else {
      var obj = JSON.parse(data) // now it an object
      obj['private_key'] = process.env.GOOGLE_PRIVATE_KEY  // add some data
      var json = JSON.stringify(obj) // convert it back to json
      fs.writeFile('demo-856e4ac1d0d4.json', json, 'utf8') // write it back
    }
  })
  storage = new Storage({
    projectId: config.google.projectId,
    keyFilename: 'demo-856e4ac1d0d4.json' // 'CC14-2fb6831eca13.json'
  })
} else {
  storage = new Storage({
    projectId: config.google.projectId,
    keyFilename: 'demo-856e4ac1d0d4_bk.json' // 'CC14-2fb6831eca13.json'
  })
}

const bucket = storage.bucket(bucketName)

// async function uploadFile (file) {
// console.log(file)
// const url = await storage
//   .bucket(bucketName)
//   .upload(file.path, { destination: 'images/' + file.name })
// return url
// }

function uploadFile (req) {
  return new Promise((resolve, reject) => {
    if (!req.files) {
      throw reject(new Error('No file uploaded.')) // res.status(400).send('No file uploaded.')
    }
    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.files.file.name)

    // Make sure to set the contentType metadata for the browser to be able
    // to render the image instead of downloading the file (default behavior)
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.files.file.mimetype
      }
    })

    blobStream.on('error', err => {
      console.log(err)
      reject(err)
    })

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`
      // Make the image public to the web (since we'll be displaying it in browser)
      blob.makePublic().then(() => {
        // return publicUrl
        return resolve(publicUrl)
      })
    })

    blobStream.end(req.files.file.data)
  })
}

function uploadFileV2 (req) {
  return new Promise(async (resolve, reject) => {
    if (!req.files) {
      throw reject(new Error('No file uploaded.')) // res.status(400).send('No file uploaded.')
    }

    const data = req.files.file.data
    const resultData = req.files.file.mimetype.startsWith('image') ? await tinify.fromBuffer(data).toBuffer() : data

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(req.files.file.name)

    // Make sure to set the contentType metadata for the browser to be able
    // to render the image instead of downloading the file (default behavior)
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.files.file.mimetype
      }
    })

    blobStream.on('error', err => {
      console.log(err)
      reject(err)
    })

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`
      // Make the image public to the web (since we'll be displaying it in browser)
      blob.makePublic().then(() => {
        // return publicUrl
        return resolve(publicUrl)
      })
    })

    blobStream.end(resultData)
  })
}

module.exports = {
  uploadFile: uploadFile,
  uploadFileV2: uploadFileV2
}
