import mongoose, { Schema, Document } from 'mongoose'

export interface IJobRun extends Document {
  jobType: 'data-ingestion' | 'chirps' | 'ndvi' | 'fews' | 'hdx'
  status: 'running' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  recordsProcessed?: number
  error?: string
  createdAt: Date
}

const JobRunSchema = new Schema<IJobRun>(
  {
    jobType: {
      type: String,
      enum: ['data-ingestion', 'chirps', 'ndvi', 'fews', 'hdx'],
      required: true,
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      required: true,
    },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    recordsProcessed: { type: Number },
    error: { type: String },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
JobRunSchema.index({ jobType: 1, startedAt: -1 })
JobRunSchema.index({ status: 1 })

export default mongoose.model<IJobRun>('JobRun', JobRunSchema)

