import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Schema con cho địa chỉ giao hàng
const addressSchema = new mongoose.Schema({
  recipientName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  phoneNumber: { 
    type: String, 
    required: true,
    trim: true
  },
  street: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  ward: { 
    type: String, 
    required: true,
    trim: true
  },
  district: { 
    type: String, 
    required: true,
    trim: true
  },
  province: { 
    type: String, 
    required: true,
    trim: true
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { _id: true, timestamps: true });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    avatar: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 1
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    // Mảng địa chỉ giao hàng
    addresses: [addressSchema],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    lastLogin: {
      type: Date,
      default: null
    },
    lastCheckinDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for better performance
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ passwordResetToken: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
