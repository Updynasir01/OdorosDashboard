import mongoose, { Schema, Document } from 'mongoose'

export interface ITimeSeries extends Document {
  regionId: string
  date: Date
  rainfall?: number
  ndvi?: number
  temperature?: number
  createdAt: Date
}

const TimeSeriesSchema = new Schema<ITimeSeries>(
  {
    regionId: { type: String, required: true },
    date: { type: Date, required: true },
    rainfall: { type: Number },
    ndvi: { type: Number },
    temperature: { type: Number },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
TimeSeriesSchema.index({ regionId: 1, date: -1 })
TimeSeriesSchema.index({ regionId: 1, date: 1 }, { unique: true })

export default mongoose.model<ITimeSeries>('TimeSeries', TimeSeriesSchema)
