const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RecordSchema = new Schema({
  datas: [{
    type: Schema.Types.ObjectId,
    ref: 'VisualData'
  }],
  locationid: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  },
  personId: {
    type: Schema.Types.ObjectId,
    ref: 'Person'
  }
}, { usePushEach: true, timestamps: true, toJSON: { virtuals: true } })

RecordSchema.virtual('author', {
  ref: 'User',
  localField: 'uuid',
  foreignField: 'uuid',
  justOne: true
})

mongoose.model('Record', RecordSchema)
