import mongoose, { Schema, Document } from 'mongoose'

export interface IAlert extends Document {
  regionId: string
  region: string
  type: 'rainfall' | 'vegetation' | 'heat' | 'water'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  date: Date
  acknowledged: boolean
  createdAt: Date
}

const AlertSchema = new Schema<IAlert>(
  {
    regionId: { type: String, required: true },
    region: { type: String, required: true },
    type: {
      type: String,
      enum: ['rainfall', 'vegetation', 'heat', 'water'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    message: { type: String, required: true },
    date: { type: Date, required: true },
    acknowledged: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
AlertSchema.index({ regionId: 1, severity: 1, date: -1 })

export default mongoose.model<IAlert>('Alert', AlertSchema)

