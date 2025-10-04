import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đánh giá của tôi - Đặc Sản Sóc Trăng",
  description: "Xem các đánh giá và nhận xét của bạn về sản phẩm tại Đặc Sản Sóc Trăng",
};

export default function MyReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
