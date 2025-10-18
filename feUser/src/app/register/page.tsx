"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingBag } from 'lucide-react';
import { HttpError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi của trường khi người dùng bắt đầu nhập
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate Họ và tên
    if (!formData.name.trim()) {
      errors.name = 'Họ và tên là trường bắt buộc.';
    }

    // Validate Email
    if (!formData.email.trim()) {
      errors.email = 'Email là trường bắt buộc.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Email không đúng định dạng.';
      }
    }

    // Validate Số điện thoại
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là trường bắt buộc.';
    } else {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = 'Số điện thoại phải có 10-11 chữ số.';
      }
    }

    // Validate Địa chỉ
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là trường bắt buộc.';
    }

    // Validate Mật khẩu
    if (!formData.password) {
      errors.password = 'Mật khẩu là trường bắt buộc.';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    // Validate Xác nhận mật khẩu
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu là trường bắt buộc.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form trước khi submit
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      console.log('Register response:', response);

      if (response.success) {
        toast.success(response.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
        // Chuyển hướng đến trang xác thực OTP, đính kèm email
        router.push(`/verify-otp?email=${encodeURIComponent(response.email)}`);
      }
    } catch (err: unknown) {
        const errorMessage = err instanceof HttpError 
            ? err.response.data.message 
            : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
        setError(errorMessage);
        toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
            <div className="inline-block bg-green-600 p-3 rounded-full mx-auto">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Điền thông tin dưới đây để đăng ký tài khoản mới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      disabled={isLoading}
                      className={fieldErrors.name ? 'border-red-500' : ''}
                    />
                    {fieldErrors.name && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      disabled={isLoading}
                      className={fieldErrors.phone ? 'border-red-500' : ''}
                    />
                    {fieldErrors.phone && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.phone}</p>
                    )}
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  disabled={isLoading}
                  className={fieldErrors.email ? 'border-red-500' : ''}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ <span className="text-red-500">*</span></Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  disabled={isLoading}
                  className={fieldErrors.address ? 'border-red-500' : ''}
                />
                {fieldErrors.address && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.address}</p>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      disabled={isLoading}
                      className={fieldErrors.password ? 'border-red-500' : ''}
                    />
                    {fieldErrors.password && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={formData.confirmPassword} 
                      onChange={handleInputChange} 
                      disabled={isLoading}
                      className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : 'Đăng ký'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-green-600 hover:underline font-medium">
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
