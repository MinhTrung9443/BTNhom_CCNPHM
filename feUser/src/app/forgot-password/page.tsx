"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShoppingBag, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Gọi API để gửi email reset password thông qua authService
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Đã xảy ra lỗi khi gửi email");
      }
    } catch (error: unknown) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi gửi email";
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
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Email đã được gửi</CardTitle>
            <CardDescription className="text-center">Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu. Nếu không thấy email, hãy kiểm tra thư mục spam.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
                Gửi lại email
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-green-600 hover:underline inline-flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Quay lại đăng nhập
                </Link>
              </div>
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
          <CardTitle className="text-2xl text-center">Quên mật khẩu?</CardTitle>
          <CardDescription className="text-center">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi liên kết đặt lại mật khẩu"
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
