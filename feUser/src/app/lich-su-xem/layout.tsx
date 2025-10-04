import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch sử xem sản phẩm - Đặc Sản Sóc Trăng",
  description: "Xem lại các sản phẩm bạn đã xem gần đây tại Đặc Sản Sóc Trăng",
};

export default function ViewHistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
