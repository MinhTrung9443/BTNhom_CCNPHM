"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Camera, Save, Edit3, CheckCircle, XCircle } from "lucide-react";
import { userService } from "@/services/userService";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!session?.user?.accessToken) {
      setError("Không tìm thấy token xác thực");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await userService.getProfile(session.user.accessToken);
      if (response.success) {
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name || "",
          phone: response.data.user.phone || "",
          address: response.data.user.address || "",
        });
      }
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      setError("Không thể tải thông tin profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!session?.user?.accessToken) {
      setError("Không tìm thấy token xác thực");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    setError("");

    try {
      // Dùng FormData để gửi file trực tiếp tới /api/users/me
      const formData = new FormData();
      formData.append("avatar", file); // Backend expect "avatar" field

      const response = await userService.updateProfile(formData, session.user.accessToken);

      if (response.success) {
        setUser((prev: any) => (prev ? { ...prev, avatar: response.data.user.avatar } : null));

        // ✅ Chỉ cần gọi hàm update của useSession
        await update({
          ...session,
          user: {
            ...session?.user,
            avatar: response.data.user.avatar,
          },
        });

        setSuccess("Cập nhật ảnh đại diện thành công!");
      } else {
        setError(response.message || "Không thể upload ảnh");
      }
    } catch (error: unknown) {
      console.error("Error uploading avatar:", error);
      setError("Không thể tải lên ảnh đại diện");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!session?.user?.accessToken) {
      setError("Không tìm thấy token xác thực");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await userService.updateProfile(formData, session.user.accessToken);

      if (response.success) {
        setUser((prev: any) => (prev ? { ...prev, ...formData } : null));
        setSuccess("Cập nhật thông tin thành công!");
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      setError("Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  // Fetch user profile on mount
  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  // Clear messages after timeout
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Vui lòng đăng nhập để xem profile</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-gray-500">Không thể tải thông tin profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin tài khoản và cài đặt cá nhân</p>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin cơ bản
          </CardTitle>
          <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {(() => {
                  const avatarUrl = user.avatar
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${user.avatar}?t=${Date.now()}`
                    : "";
                  console.log("Avatar URL:", avatarUrl);
                  return <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />;
                })()}
                <AvatarFallback className="text-xl font-semibold bg-green-100 text-green-700">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 rounded-full p-2 bg-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </Button>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={user.isVerified ? "default" : "secondary"}
                  className={user.isVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {user.isVerified ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Đã xác thực
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Chưa xác thực
                    </>
                  )}
                </Badge>
                <Badge variant="outline">{user.role === "admin" ? "Quản trị viên" : "Khách hàng"}</Badge>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium">Chi tiết thông tin</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nhập họ và tên" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ngày tham gia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Điểm tích lũy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{user.loyaltyPoints || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lần đăng nhập cuối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("vi-VN") : "N/A"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
