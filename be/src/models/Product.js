import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  code: { type: String, unique: true, trim: true, maxlength: 20 },
  description: { type: String, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  images: [{ type: String }],
  stock: { type: Number, required: true, default: 0, min: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ stock: 1 });

// Sinh code tự động trước khi lưu
productSchema.pre("save", async function (next) {
  if (this.isNew && !this.code) {
    try {
      const lastProduct = await this.constructor.findOne({}, {}, { sort: { 'code': -1 } });
      let nextId = 1;
      if (lastProduct && lastProduct.code) {
        const lastId = parseInt(lastProduct.code.split('-')[1], 10);
        nextId = lastId + 1;
      }
      this.code = `PRD-${String(nextId).padStart(5, "0")}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model("Product", productSchema);
