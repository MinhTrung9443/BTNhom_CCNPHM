import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import SessionProvider from "@/components/providers/session-provider";
import { CartProvider } from "@/contexts/cart-context";
import { auth } from "@/auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ChatWidget from "@/components/chat-widget";
import N8nChatbot from "@/components/n8n-chatbot";
import Preloader from "@/components/preloader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Đặc Sản Sóc Trăng - Hương Vị Truyền Thống Miền Tây",
  description: "Khám phá những món đặc sản truyền thống của Sóc Trăng: bánh pía, kẹo dừa, bánh tráng và nhiều sản phẩm ngon khác.",
  keywords: "đặc sản sóc trăng, bánh pía, kẹo dừa, bánh tráng, đặc sản miền tây",
  authors: [{ name: "Đặc Sản Sóc Trăng" }],
  creator: "Đặc Sản Sóc Trăng",
  publisher: "Đặc Sản Sóc Trăng",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dacsansoctrang.vn"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Đặc Sản Sóc Trăng - Hương Vị Truyền Thống Miền Tây",
    description: "Khám phá những món đặc sản truyền thống của Sóc Trăng: bánh pía, kẹo dừa, bánh tráng và nhiều sản phẩm ngon khác.",
    url: "https://dacsansoctrang.vn",
    siteName: "Đặc Sản Sóc Trăng",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Đặc Sản Sóc Trăng",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đặc Sản Sóc Trăng - Hương Vị Truyền Thống Miền Tây",
    description: "Khám phá những món đặc sản truyền thống của Sóc Trăng: bánh pía, kẹo dừa, bánh tráng và nhiều sản phẩm ngon khác.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="vi">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* <Preloader /> */}
        <SessionProvider session={session}>
          <CartProvider>
            <Header />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">{children}</main>
            <Footer />
            <ChatWidget />
            <N8nChatbot />
            <Toaster richColors position="top-right" />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
