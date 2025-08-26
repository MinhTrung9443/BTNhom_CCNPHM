import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên là bắt buộc.'],
            trim: true,
            match: [
                /^[\p{L}\p{N} ]+$/u, 
                'Tên chỉ được chứa chữ cái, số và khoảng trắng.'
            ],
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc.'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc.'],
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự.'],
            select: false, 
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^[0-9]{10}$/.test(v);
                },
                message: 'Số điện thoại phải là 10 chữ số.'
            },
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự.'],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model('User', userSchema);

export default User;