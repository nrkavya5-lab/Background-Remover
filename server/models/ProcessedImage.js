import mongoose from 'mongoose';

const processedImageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  originalPath: { type: String, required: true },
  resultPath: { type: String, required: true },
  operationType: {
    type: String,
    enum: ['removeBg', 'replaceBg', 'edit', 'batch'],
    default: 'removeBg',
  },
  fileSize: Number,
  format: { type: String, default: 'png' },
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

processedImageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ProcessedImage', processedImageSchema);
