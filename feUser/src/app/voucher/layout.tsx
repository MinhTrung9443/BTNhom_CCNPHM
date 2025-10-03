import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voucher khuyến mãi - Đặc Sản Sóc Trăng",
  description: "Khám phá và lưu các voucher khuyến mãi hấp dẫn tại Đặc Sản Sóc Trăng",
};

export default function VoucherLayout({ children }: { children: React.ReactNode }) {
  return children;
}
