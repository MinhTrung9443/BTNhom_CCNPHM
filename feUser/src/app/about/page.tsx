import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Về <span className="text-green-600">Đặc Sản Sóc Trăng</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Khám phá hương vị truyền thống và câu chuyện đằng sau những món đặc sản 
            nổi tiếng của vùng đất Sóc Trăng
          </p>
        </div>

        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Câu Chuyện Của Chúng Tôi
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Sóc Trăng, vùng đất phù sa màu mỡ của miền Tây Nam Bộ, đã nuôi dưỡng 
                những món đặc sản với hương vị độc đáo qua hàng trăm năm lịch sử. 
                Chúng tôi tự hào mang đến cho quý khách những sản phẩm chất lượng nhất 
                từ vùng đất này.
              </p>
              <p>
                Với sứ mệnh bảo tồn và phát triển các công thức truyền thống, 
                chúng tôi cam kết sử dụng nguyên liệu tươi ngon nhất, 
                kết hợp với kỹ thuật chế biến hiện đại để tạo ra những sản phẩm 
                vừa giữ được hương vị truyền thống vừa đảm bảo tiêu chuẩn an toàn thực phẩm.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src="https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Bánh pía Sóc Trăng truyền thống"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Các Sản Phẩm Đặc Trưng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Bánh Pía */}
            <div className="text-center">
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Bánh Pía Sóc Trăng"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bánh Pía</h3>
              <p className="text-gray-600">
                Món đặc sản nổi tiếng nhất của Sóc Trăng với vỏ bánh mỏng, 
                nhân thơm ngon từ sầu riêng, đậu xanh hay thịt nướng.
              </p>
            </div>

            {/* Kẹo Dừa */}
            <div className="text-center">
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Kẹo Dừa"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kẹo Dừa</h3>
              <p className="text-gray-600">
                Kẹo dừa thơm béo, ngọt dịu từ cơm dừa tươi, 
                được chế biến theo công thức gia truyền.
              </p>
            </div>

            {/* Bánh Tráng */}
            <div className="text-center">
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Bánh Tráng"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bánh Tráng</h3>
              <p className="text-gray-600">
                Bánh tráng giòn rụm, được làm từ bột gạo tươi, 
                có thể thưởng thức trực tiếp hoặc cuốn với các loại rau củ.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-green-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Giá Trị Cốt Lõi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tự Nhiên</h3>
              <p className="text-gray-600">
                Sử dụng 100% nguyên liệu tự nhiên, không chất bảo quản có hại
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chất Lượng</h3>
              <p className="text-gray-600">
                Cam kết về chất lượng từ khâu chọn nguyên liệu đến thành phẩm
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🏛️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Truyền Thống</h3>
              <p className="text-gray-600">
                Giữ gín và phát huy những công thức chế biến truyền thống
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Liên Hệ Với Chúng Tôi
          </h2>
          <p className="text-gray-700 mb-8">
            Chúng tôi luôn sẵn sàng lắng nghe và phục vụ quý khách hàng tốt nhất
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Địa Chỉ</h4>
              <p className="text-gray-600">Sóc Trăng, Việt Nam</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Điện Thoại</h4>
              <p className="text-gray-600">0123 456 789</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
              <p className="text-gray-600">info@dacsansoctrang.vn</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}