"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { authService } from "@/services/authService";
import { HttpError } from "@/lib/api";

export default function ActivateAccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.activateAccount(email, password);

      if (response.success) {
        toast.success(response.message || "Mã OTP đã được gửi đến email của bạn!");
        // Chuyển đến trang verify-otp với email
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&from=activate`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof HttpError ? err.response.data.message : "Đã xảy ra lỗi khi kích hoạt tài khoản";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Kích hoạt tài khoản</CardTitle>
          <CardDescription className="text-center">Nhập email và mật khẩu để kích hoạt tài khoản chưa xác thực</CardDescription>
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
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Gửi mã kích hoạt"
              )}
            </Button>

            <div className="text-center space-y-3">
              <div className="text-sm text-gray-600">
                <Link href="/login" className="text-green-600 hover:underline font-medium flex items-center justify-center">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
              </div>

              <div className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="text-green-600 hover:underline font-medium">
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
