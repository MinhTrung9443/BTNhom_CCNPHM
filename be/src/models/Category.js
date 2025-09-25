import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      unique: true,
      trim: true,
      maxlength: 100
    },
    description: { 
      type: String,
      trim: true,
      maxlength: 500
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for better performance
categorySchema.index({ isActive: 1 });

export default mongoose.model("Category", categorySchema);
