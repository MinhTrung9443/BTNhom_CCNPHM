// insertData.js
import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import User from './src/models/User.js';

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/auth_db');

const insertTestData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    // Thêm users
    const users = await User.insertMany([
        { name: 'Test User 1', email: 'user1@example.com', password: 'password123', phone: '1234567890', address: '123 Main St', isVerified: true, role: 'user' },
        { name: 'Test User 2', email: 'user2@example.com', password: 'password123', phone: '0987654321', address: '456 Oak Ave', isVerified: true, role: 'user' },
        { name: 'Admin User', email: 'admin@example.com', password: 'adminpassword', phone: '1112223333', address: '789 Pine Ln', isVerified: true, role: 'admin' },
    ]);
    console.log('Users inserted:', users.length);


    // Thêm categories
    const categories = await Category.insertMany([
      {
        name: "Bánh pía",
        description: "Bánh pía truyền thống Sóc Trăng với nhiều hương vị đặc sắc"
      },
      {
        name: "Bánh ít",
        description: "Bánh ít gói lá chuối đặc sản Sóc Trăng"
      },
      {
        name: "Bánh cam",
        description: "Bánh cam giòn rụm nhân đậu xanh thơm ngon"
      },
      {
        name: "Kem bơ",
        description: "Kem bơ từ dừa tươi Sóc Trăng mát lạnh thơm béo"
      },
      {
        name: "Combo",
        description: "Combo các loại đặc sản Sóc Trăng"
      },
      {
        name: "Bánh tráng nướng",
        description: "Bánh tráng nướng đặc sản miền Nam"
      }
    ]);

    console.log('Categories inserted:', categories.length);

    // Thêm 20 products đa dạng
    const products = await Product.insertMany([
      // Bánh pía (8 sản phẩm)
      {
        name: "Bánh pía đậu xanh truyền thống",
        description: "Bánh pía đậu xanh nguyên chất, hương vị thơm ngon đặc trưng Sóc Trăng. Được làm từ đậu xanh cao cấp, bột mì thơm ngon và công thức gia truyền.",
        price: 150000,
        discount: 10,
        stock: 100,
        images: ["https://huongvietmart.vn/wp-content/uploads/2020/08/5SAO232.jpg"],
        categoryId: categories[0]._id
      },
      {
        name: "Bánh pía thịt heo quay",
        description: "Bánh pía nhân thịt heo quay thơm lừng, công thức gia truyền Sóc Trăng. Thịt heo được ướp gia vị đặc biệt, tạo hương vị đậm đà khó quên.",
        price: 180000,
        discount: 0,
        stock: 100,
        images: ["https://cf.shopee.vn/file/0cf51566187956d5bdf38578d1e701da"],
        categoryId: categories[0]._id
      },
      {
        name: "Bánh pía dừa nướng",
        description: "Bánh pía dừa nướng thơm lừng, vị ngọt tự nhiên từ dừa tươi Sóc Trăng. Lớp vỏ giòn tan, nhân dừa thơm béo.",
        price: 160000,
        discount: 5,
        stock: 100,
        images: ["https://www.dacsanhuongviet.com/site/wp-content/uploads/2020/11/mua-banh-dua-nuong-o-tphcm-1.jpg"],
        categoryId: categories[0]._id
      },
      {
        name: "Bánh pía trứng muối",
        description: "Bánh pía trứng muối đặc sản, nhân trứng muối béo ngậy hòa quyện cùng đậu xanh thơm ngon. Vị mặn ngọt hài hòa.",
        price: 170000,
        discount: 8,
        stock: 100,
        images: ["https://banhbaominh.com/wp-content/uploads/2022/12/banh-pia-trung-300g-banh-pia-trung-bao-minh-moi-2024-1.jpg"],
        categoryId: categories[0]._id
      },
      {
        name: "Bánh pía đậu xanh đặc biệt",
        description: "Sản phẩm bán chạy nhất - bánh pía đậu xanh cao cấp với nguyên liệu tuyển chọn. Hương vị đậm đà, độc đáo.",
        price: 200000,
        discount: 15,
        stock: 100,
        images: ["https://www.banhpia.vn/site/wp-content/uploads/2016/11/banh-pia-5-sao-dau-xanh-sau-rieng-600g.jpg"],
        categoryId: categories[0]._id
      },
      {
        name: "Bánh pía sầu riêng",
        description: "Bánh pía sầu riêng thơm ngậy, nhân sầu riêng Thái Lan chính hiệu. Vị ngọt đậm đà của sầu riêng hòa quyện.",
        price: 220000,
        discount: 12,
        stock: 100,
        images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFhBRmNhJU3iWPxCxWIU3DgYu5EdbSNE5A0Q&s"],
        categoryId: categories[0]._id
      },
      {
        name: "Bánh pía chà bông",
        description: "Bánh pía nhân chà bông thơm béo, hương vị mới lạ độc đáo. Chà bông thơm ngon kết hợp đậu xanh.",
        price: 175000,
        discount: 6,
        stock: 100,
        images: ["https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lwduket03lcpb2"],
        categoryId: categories[0]._id
      },
      {
        name: "Bánh pía khoai môn",
        description: "Bánh pía khoai môn tím thơm ngon, nhân khoai môn béo ngậy tự nhiên. Màu tím đẹp mắt, vị ngọt thanh.",
        price: 165000,
        discount: 7,
        stock: 100,
        images: ["https://tamlong.com.vn/wp-content/uploads/banh-pia-khoa-mon-1.jpg"],
        categoryId: categories[0]._id
      },

      // Bánh ít (4 sản phẩm)
      {
        name: "Bánh ít lá chuối",
        description: "Bánh ít truyền thống gói lá chuối, nhân tôm thịt đậm đà. Được gói bằng lá chuối tươi, mang hương vị đặc trưng.",
        price: 120000,
        discount: 5,
        stock: 100,
        images: ["https://i.ytimg.com/vi/Gf_ZFLiyE_E/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBmNcm9akl4FYtehErURTZptLkycQ"],
        categoryId: categories[1]._id
      },
      {
        name: "Bánh ít nhân dừa",
        description: "Bánh ít nhân dừa tươi thơm ngọt, được làm từ dừa già Sóc Trăng. Hương vị thanh mát, dẻo dai.",
        price: 110000,
        discount: 0,
        stock: 100,
        images: ["https://cdn.tgdd.vn/2020/10/CookRecipe/Avatar/banh-it-nhan-dau-xanh-thumbnail-1.jpg"],
        categoryId: categories[1]._id
      },
      {
        name: "Bánh ít nhân đậu xanh",
        description: "Bánh ít nhân đậu xanh nguyên chất, vị ngọt thanh mát. Đậu xanh được xay nhuyễn mịn màng.",
        price: 115000,
        discount: 3,
        stock: 100,
        images: ["https://img-global.cpcdn.com/recipes/80716e0980dd1bc5/680x482cq70/banh-it-tr%E1%BA%A7n-nhan-d%E1%BA%ADu-xanh-th%E1%BB%8Bt-bam-recipe-main-photo.jpg"],
        categoryId: categories[1]._id
      },
      {
        name: "Bánh ít chay",
        description: "Bánh ít chay thanh đạm, nhân nấm hương và đậu hũ thơm ngon. Phù hợp cho người ăn chay.",
        price: 105000,
        discount: 8,
        stock: 100,
        images: ["https://amthucdochay.com/wp-content/uploads/2021/10/maxresdefault-14-1024x576.jpg"],
        categoryId: categories[1]._id
      },

      // Bánh cam (3 sản phẩm)
      {
        name: "Bánh cam Sóc Trăng",
        description: "Bánh cam giòn rụm, nhân đậu xanh thơm ngon. Lớp vỏ giòn tan, nhân đậu xanh ngọt thanh.",
        price: 100000,
        discount: 5,
        stock: 100,
        images: ["http://banhchungngon.vn/wp-content/uploads/2023/07/dac-san-banh-cong-soc-trang.jpg"],
        categoryId: categories[2]._id
      },
      {
        name: "Bánh cam nhân thịt",
        description: "Bánh cam giòn rụm nhân thịt heo băm thơm ngon, gia vị đậm đà đặc trưng. Vị mặn ngọt hài hòa.",
        price: 120000,
        discount: 0,
        stock: 100,
        images: ["https://i.ytimg.com/vi/GPD3vBfWAps/maxresdefault.jpg"],
        categoryId: categories[2]._id
      },
      {
        name: "Bánh cam nhân tôm",
        description: "Bánh cam nhân tôm tươi ngọt thịt, tôm Sóc Trăng tươi ngon. Hương vị biển cả đặc trưng.",
        price: 130000,
        discount: 10,
        stock: 100,
        images: ["https://cdn.tgdd.vn/2021/02/CookProduct/Untitled-1-1200x676-14.jpg"],
        categoryId: categories[2]._id
      },

      // Kem bơ (3 sản phẩm)
      {
        name: "Kem bơ Sóc Trăng",
        description: "Kem bơ thơm ngon từ dừa tươi Sóc Trăng. Được làm từ dừa tươi 100%, mát lạnh, thơm béo.",
        price: 80000,
        discount: 0,
        stock: 100,
        images: ["https://i.ytimg.com/vi/MXFdIvfsCto/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAG5h1KKJRTHwsQ6cLUeN2JS8WheQ"],
        categoryId: categories[3]._id
      },
      {
        name: "Kem bơ dừa nướng",
        description: "Kem bơ từ dừa nướng thơm bùi, hương vị độc đáo khác biệt. Vị béo ngậy của dừa nướng.",
        price: 90000,
        discount: 10,
        stock: 100,
        images: ["https://file.hstatic.net/200000648353/file/cach-lam-kem-bo-dua__3__c591111fdf214e37bc344ed06a715825_1024x1024.jpg"],
        categoryId: categories[3]._id
      },
      {
        name: "Kem bơ ca cao",
        description: "Kem bơ dừa pha ca cao thơm ngon, vị ngọt đắng hài hòa. Sự kết hợp hoàn hảo giữa dừa và ca cao.",
        price: 95000,
        discount: 5,
        stock: 100,
        images: ["https://adiva.com.vn/wp-content/uploads/2018/10/kem-ca-cao-2.gif"],
        categoryId: categories[3]._id
      },

      // Combo (2 sản phẩm)
      {
        name: "Combo bánh pía truyền thống",
        description: "Combo 4 loại bánh pía đặc sản Sóc Trăng: đậu xanh, thịt, dừa, trứng. Hộp quà tặng đẹp mắt, phù hợp làm quà.",
        price: 500000,
        discount: 30,
        stock: 100,
        images: ["https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-m07h7azz5wbxa2"],
        categoryId: categories[4]._id
      },
      {
        name: "Combo đặc sản Sóc Trăng",
        description: "Combo đầy đủ đặc sản: bánh pía, bánh ín, bánh cam, kem bơ. Quà tặng ý nghĩa cho người thân, đại diện cho tinh hoa ẩm thực Sóc Trăng.",
        price: 600000,
        discount: 25,
        stock: 100,
        images: ["https://cf.shopee.vn/file/1489bd525a6ca748c3544ba00209aca5", "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lrg3gzyze2s9eb"],
        categoryId: categories[4]._id
      }
    ]);

    console.log('Products inserted:', products.length);
    console.log('Test data inserted successfully!');
    
    // Hiển thị thống kê
    console.log('\n=== THỐNG KÊ DỮ LIỆU ===');
    console.log(`Total Categories: ${categories.length}`);
    console.log(`Total Products: ${products.length}`);
    
    console.log('\n=== DANH SÁCH CATEGORIES ===');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (ID: ${cat._id})`);
    });
    
    console.log('\n=== DANH SÁCH PRODUCTS ===');
    products.forEach((prod, index) => {
      const category = categories.find(cat => cat._id.equals(prod.categoryId));
      console.log(`${index + 1}. ${prod.name} - ${prod.price.toLocaleString()}đ (${category.name})`);
    });
    
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

insertTestData();