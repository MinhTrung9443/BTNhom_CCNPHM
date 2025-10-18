"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("user1@example.com");
  const [password, setPassword] = useState("12345678");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email là trường bắt buộc";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không đúng định dạng";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Mật khẩu là trường bắt buộc";
    }
    return "";
  };

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    return !emailErr && !passwordErr;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setEmailError(error);
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setPasswordError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: unknown) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi đăng nhập";
      setError(errorMessage);
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
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">Đăng nhập để truy cập giỏ hàng và các tính năng khác</CardDescription>
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
                placeholder="user1@example.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                disabled={isLoading}
                className={emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                disabled={isLoading}
                className={passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-green-600 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Thông tin demo:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                Email: user1@example.com
                <br />
                Password: 12345678
              </p>
            </div>

            <div className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-green-600 hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </div>

            <div className="text-center">
              <Link href="/" className="text-sm text-green-600 hover:underline">
                ← Quay lại trang chủ
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
