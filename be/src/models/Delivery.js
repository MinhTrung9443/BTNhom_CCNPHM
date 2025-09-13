const Delivery = new mongoose.Schema({
  type: {
    type: String,
    enum: ["express", "regular", "standard"],
    default: "regular",
  },
  name: {
    type: String,
    required: true,
    enum: ["Giao hỏa tốc", "Giao thường", "Giao chuẩn"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    enum: [
      "Giao hàng trong vòng 24 giờ.",
      "Giao hàng trong 3-5 ngày làm việc.",
      "Giao hàng trong 5-7 ngày làm việc.",
    ],
  },
});

module.exports = mongoose.model("Delivery", Delivery);
