import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // %
    images: [{ type: String }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
