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
  if (this.code) return next(); // nếu đã có code thì bỏ qua

  // Lấy số lượng document hiện tại
  const count = await mongoose.model("Product").countDocuments();
  // Sinh code, padding 5 chữ số
  this.code = `PRD-${String(count + 1).padStart(5, "0")}`;
  next();
});

export default mongoose.model("Product", productSchema);
