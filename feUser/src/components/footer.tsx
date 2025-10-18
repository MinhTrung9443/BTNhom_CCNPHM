import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <span className="font-bold text-xl">Đặc Sản Sóc Trăng</span>
            </div>
            <p className="text-gray-400">
              Mang đến cho bạn những món đặc sản truyền thống tốt nhất từ vùng đất Sóc Trăng.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Sản Phẩm</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/search?category=banh-pia" className="hover:text-white transition-colors">Bánh Pía</Link></li>
              <li><Link href="/search?category=keo-dua" className="hover:text-white transition-colors">Kẹo Dừa</Link></li>
              <li><Link href="/search?category=banh-trang" className="hover:text-white transition-colors">Bánh Tráng</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Đặc Sản Khác</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Thông Tin</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">Giới Thiệu</Link></li>
              <li><Link href="/lien-he" className="hover:text-white transition-colors">Liên Hệ</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Chính Sách</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Hỗ Trợ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Liên Hệ</h4>
            <div className="space-y-2 text-gray-400">
              <p>📍 Sóc Trăng, Việt Nam</p>
              <p>📞 0123 456 789</p>
              <p>✉️ info@dacsansoctrang.vn</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Đặc Sản Sóc Trăng. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}