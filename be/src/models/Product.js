import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  // cần thiết nếu là nextjs
  slug: { type: String, unique: true, trim: true, lowercase: true },
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

// Hàm helper để tạo slug từ tên
function generateSlug(name) {
  // Chuyển đổi tiếng Việt sang không dấu
  const vietnameseMap = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D'
  };

  let slug = name.toLowerCase().trim();
  
  // Thay thế ký tự tiếng Việt
  for (const [key, value] of Object.entries(vietnameseMap)) {
    slug = slug.replace(new RegExp(key, 'g'), value.toLowerCase());
  }
  
  // Thay thế khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  
  // Xóa dấu gạch ngang ở đầu và cuối
  slug = slug.replace(/^-+|-+$/g, '');
  
  return slug;
}

// Sinh code và slug tự động trước khi lưu
productSchema.pre("save", async function (next) {
  try {
    // Sinh code tự động nếu là document mới và chưa có code
    if (this.isNew && !this.code) {
      const lastProduct = await this.constructor.findOne({}, {}, { sort: { 'code': -1 } });
      let nextId = 1;
      if (lastProduct && lastProduct.code) {
        const lastId = parseInt(lastProduct.code.split('-')[1], 10);
        nextId = lastId + 1;
      }
      this.code = `PRD-${String(nextId).padStart(5, "0")}`;
    }

    // Sinh slug tự động nếu chưa có hoặc tên bị thay đổi
    if (this.isNew || this.isModified('name')) {
      let baseSlug = generateSlug(this.name);
      let slug = baseSlug;
      let counter = 1;

      // Kiểm tra slug đã tồn tại chưa, nếu có thì thêm số vào cuối
      while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      this.slug = slug;
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Product", productSchema);
