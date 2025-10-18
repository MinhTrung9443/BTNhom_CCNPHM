import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 200 
  },
  slug: { 
    type: String, 
    unique: true, 
    trim: true, 
    lowercase: true,
    index: true
  },
  content: { 
    type: String, 
    required: true 
  },
  excerpt: { 
    type: String, 
    trim: true, 
    maxlength: 500
  },
  featuredImage: {
    type: String,
    trim: true,
  },
  images: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  tags: [{ type: String, trim: true }],
  publishedAt: { type: Date },
  scheduledAt: { type: Date },
  seoMeta: {
    title: { type: String, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    keywords: [{ type: String }]
  },
  stats: {
    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 }
  }
}, { timestamps: true });

// Indexes for better performance
articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
articleSchema.index({ tags: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ 'stats.views': -1 });
articleSchema.index({ 'stats.likes': -1 });
articleSchema.index({ status: 1, publishedAt: -1 });

// Compound indexes for common query patterns
articleSchema.index({ status: 1, tags: 1, publishedAt: -1 });
articleSchema.index({ status: 1, 'stats.views': -1 });
articleSchema.index({ status: 1, 'stats.likes': -1 });
articleSchema.index({ slug: 1, status: 1 });

// Sparse index for scheduled articles
articleSchema.index({ scheduledAt: 1 }, { sparse: true });

// TTL index for draft articles older than 1 year (optional cleanup)
articleSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 31536000, // 1 year
  partialFilterExpression: { status: 'draft' }
});

// Hàm helper để tạo slug từ tên
function generateSlug(title) {
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

  let slug = title.toLowerCase().trim();

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

// Sinh slug tự động trước khi lưu
articleSchema.pre("save", async function (next) {
  try {
    // Sinh slug tự động nếu chưa có hoặc title bị thay đổi
    if (this.isNew || this.isModified('title')) {
      let baseSlug = generateSlug(this.title);
      let slug = baseSlug;
      let counter = 1;

      // Kiểm tra slug đã tồn tại chưa, nếu có thì thêm số vào cuối
      while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      this.slug = slug;
    }

    // Tự động set publishedAt khi status chuyển sang published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }

    // Tự động tạo excerpt từ content nếu chưa có
    if (!this.excerpt && this.content) {
      // Loại bỏ HTML tags và lấy 150 ký tự đầu
      const plainText = this.content.replace(/<[^>]*>/g, '');
      this.excerpt = plainText.substring(0, 150).trim() + '...';
    }

    // Tự động tạo SEO meta nếu chưa có
    if (!this.seoMeta.title) {
      this.seoMeta.title = this.title;
    }
    if (!this.seoMeta.description && this.excerpt) {
      this.seoMeta.description = this.excerpt;
    }

    // Tự động tạo keywords từ tags nếu chưa có
    if (!this.seoMeta.keywords || this.seoMeta.keywords.length === 0) {
      this.seoMeta.keywords = this.tags || [];
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Article", articleSchema);
