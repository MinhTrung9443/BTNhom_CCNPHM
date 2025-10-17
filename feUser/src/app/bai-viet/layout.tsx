import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bài viết - Đặc sản Sóc Trăng",
  description: "Khám phá những câu chuyện và kiến thức về đặc sản Sóc Trăng",
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
