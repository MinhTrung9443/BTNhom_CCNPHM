import mongoose from "mongoose";

// Mongoose (MongoDB)
const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountValue: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isUsed: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Voucher", voucherSchema);
