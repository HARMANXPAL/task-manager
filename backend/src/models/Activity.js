const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true
    },
    taskTitle: { type: String, required: true },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'status_changed', 'priority_changed'],
      required: true
    },
    detail: { type: String, default: '' } // e.g. "status: todo → done"
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
