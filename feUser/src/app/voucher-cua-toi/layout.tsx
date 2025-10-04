import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voucher của tôi - Đặc Sản Sóc Trăng",
  description: "Quản lý các voucher đã lưu và theo dõi trạng thái sử dụng tại Đặc Sản Sóc Trăng",
};

export default function MyVouchersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
