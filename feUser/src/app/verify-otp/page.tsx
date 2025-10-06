"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound } from "lucide-react";
import { HttpError } from "@/lib/api";

function VerifyOtpComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const fromActivate = searchParams.get("from") === "activate";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || otp.length < 6) {
      setError("Vui lòng nhập đủ 6 ký tự OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOtp({ email, otp });
      if (response.success) {
        toast.success(response.message || "Xác thực tài khoản thành công!");
        // Chuyển hướng đến trang đăng nhập với thông báo
        router.push("/login");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof HttpError ? err.response.data.message : "Mã OTP không hợp lệ hoặc đã hết hạn.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                Không tìm thấy thông tin email. Vui lòng quay lại trang đăng ký.
                <Link href="/register" className="font-bold underline ml-2">
                  Quay lại
                </Link>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="inline-block bg-green-600 p-3 rounded-full mx-auto">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{fromActivate ? "Kích hoạt tài khoản" : "Xác thực tài khoản"}</CardTitle>
          <CardDescription>
            {fromActivate ? "Mã OTP để kích hoạt tài khoản đã được gửi đến " : "Một mã OTP gồm 6 chữ số đã được gửi đến "}
            <span className="font-bold text-gray-800">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={(value: string) => setOtp(value)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xác thực...
                </>
              ) : (
                "Xác thực"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Không nhận được mã?{" "}
              <Button variant="link" type="button" className="text-green-600 p-0 h-auto">
                Gửi lại
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Bọc component trong Suspense để có thể dùng useSearchParams
export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      }
    >
      <VerifyOtpComponent />
    </Suspense>
  );
}
