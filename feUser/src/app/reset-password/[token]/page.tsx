"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShoppingBag, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/authService";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isPasswordMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError("Mật khẩu không đáp ứng yêu cầu");
      return;
    }

    if (!isPasswordMatch) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authService.resetPassword(token, password);

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
      }
    } catch (error: unknown) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi đặt lại mật khẩu";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Đặt lại mật khẩu thành công</CardTitle>
            <CardDescription className="text-center">Mật khẩu của bạn đã được đặt lại thành công</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.</AlertDescription>
            </Alert>

            <Button onClick={() => router.push("/login")} className="w-full bg-green-600 hover:bg-green-700">
              Đăng nhập ngay
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-green-600 hover:underline inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại trang chủ
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Đặt lại mật khẩu</CardTitle>
          <CardDescription className="text-center">Nhập mật khẩu mới cho tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>

              {/* Password requirements */}
              {password && (
                <div className="text-xs space-y-1">
                  <div className={`flex items-center ${passwordValidation.minLength ? "text-green-600" : "text-red-500"}`}>
                    <span className="mr-1">{passwordValidation.minLength ? "✓" : "✗"}</span>
                    Ít nhất 8 ký tự
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasUpperCase ? "text-green-600" : "text-red-500"}`}>
                    <span className="mr-1">{passwordValidation.hasUpperCase ? "✓" : "✗"}</span>
                    Có chữ hoa
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasLowerCase ? "text-green-600" : "text-red-500"}`}>
                    <span className="mr-1">{passwordValidation.hasLowerCase ? "✓" : "✗"}</span>
                    Có chữ thường
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasNumber ? "text-green-600" : "text-red-500"}`}>
                    <span className="mr-1">{passwordValidation.hasNumber ? "✓" : "✗"}</span>
                    Có số
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>

              {/* Password match indicator */}
              {confirmPassword && (
                <div className={`text-xs flex items-center ${isPasswordMatch ? "text-green-600" : "text-red-500"}`}>
                  <span className="mr-1">{isPasswordMatch ? "✓" : "✗"}</span>
                  {isPasswordMatch ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading || !isPasswordValid || !isPasswordMatch}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đặt lại mật khẩu...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Nhớ mật khẩu rồi?{" "}
                <Link href="/login" className="text-green-600 hover:underline font-medium">
                  Đăng nhập ngay
                </Link>
              </p>

              <Link href="/" className="text-sm text-green-600 hover:underline inline-flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại trang chủ
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
