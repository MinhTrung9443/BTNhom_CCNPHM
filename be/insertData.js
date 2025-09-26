// insertData.js
import mongoose from "mongoose";
import Category from "./src/models/Category.js";
import Product from "./src/models/Product.js";
import User from "./src/models/User.js";
import Voucher from "./src/models/Voucher.js";
import LoyaltyPoints from "./src/models/LoyaltyPoints.js";

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/soctrang");

const insertTestData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await LoyaltyPoints.deleteMany({});
    await Voucher.deleteMany({});

    // Thêm users
    const users = await User.insertMany([
      {
        name: "Nguyễn Thị Lệ A",
        email: "user1@example.com",
        password:
          "$2b$10$3/2Gl9hLwjdj/v4PeNovteM91C93KrsYPDHwdhKLpV7FImT0E8jki",
        phone: "1234567890",
        address: "123 Main St",
        isVerified: true,
        role: "user",
      },
      {
        name: "Nguyễn Phạm B",
        email: "user2@example.com",
        password:
          "$2b$10$3/2Gl9hLwjdj/v4PeNovteM91C93KrsYPDHwdhKLpV7FImT0E8jki",
        phone: "0987654321",
        address: "456 Oak Ave",
        isVerified: true,
        role: "user",
      },
      {
        name: "Admin",
        email: "admin@example.com",
        password:
          "$2b$10$3/2Gl9hLwjdj/v4PeNovteM91C93KrsYPDHwdhKLpV7FImT0E8jki",
        phone: "1112223333",
        address: "789 Pine Ln",
        isVerified: true,
        role: "admin",
      },
      {
        name: "Lê Văn A1",
        email: "a1@gmail.com",
        password: "a",
        phone: "0123450001",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A2",
        email: "a2@gmail.com",
        password: "a",
        phone: "0123450002",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A3",
        email: "a3@gmail.com",
        password: "a",
        phone: "0123450003",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A4",
        email: "a4@gmail.com",
        password: "a",
        phone: "0123450004",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A5",
        email: "a5@gmail.com",
        password: "a",
        phone: "0123450005",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A6",
        email: "a6@gmail.com",
        password: "a",
        phone: "0123450006",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A7",
        email: "a7@gmail.com",
        password: "a",
        phone: "0123450007",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A8",
        email: "a8@gmail.com",
        password: "a",
        phone: "0123450008",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A9",
        email: "a9@gmail.com",
        password: "a",
        phone: "0123450009",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A10",
        email: "a10@gmail.com",
        password: "a",
        phone: "0123450010",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A11",
        email: "a11@gmail.com",
        password: "a",
        phone: "0123450011",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A12",
        email: "a12@gmail.com",
        password: "a",
        phone: "0123450012",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A13",
        email: "a13@gmail.com",
        password: "a",
        phone: "0123450013",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A14",
        email: "a14@gmail.com",
        password: "a",
        phone: "0123450014",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A15",
        email: "a15@gmail.com",
        password: "a",
        phone: "0123450015",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A16",
        email: "a16@gmail.com",
        password: "a",
        phone: "0123450016",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A17",
        email: "a17@gmail.com",
        password: "a",
        phone: "0123450017",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A18",
        email: "a18@gmail.com",
        password: "a",
        phone: "0123450018",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A19",
        email: "a19@gmail.com",
        password: "a",
        phone: "0123450019",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
      {
        name: "Lê Văn A20",
        email: "a20@gmail.com",
        password: "a",
        phone: "0123450020",
        address: "Hà Nội",
        isVerified: true,
        role: "user",
      },
    ]);
    console.log("Users inserted:", users.length);

    // Thêm categories
    const categories = await Category.insertMany([
      {
        name: "Bánh pía",
        description:
          "Bánh pía truyền thống Sóc Trăng với nhiều hương vị đặc sắc",
      },
      {
        name: "Bánh ít",
        description: "Bánh ít gói lá chuối đặc sản Sóc Trăng",
      },
      {
        name: "Bánh cam",
        description: "Bánh cam giòn rụm nhân đậu xanh thơm ngon",
      },
      {
        name: "Kem bơ",
        description: "Kem bơ từ dừa tươi Sóc Trăng mát lạnh thơm béo",
      },
      {
        name: "Combo",
        description: "Combo các loại đặc sản Sóc Trăng",
      },
      {
        name: "Bánh tráng nướng",
        description: "Bánh tráng nướng đặc sản miền Nam",
      },
    ]);

    console.log("Categories inserted:", categories.length);

    // Thêm 70 products đa dạng (20 cũ + 50 mới)
    const productData = [
      // Bánh pía (8 sản phẩm cũ)
      {
        name: "Bánh pía đậu xanh truyền thống",
        description:
          "Bánh pía đậu xanh nguyên chất, hương vị thơm ngon đặc trưng Sóc Trăng. Được làm từ đậu xanh cao cấp, bột mì thơm ngon và công thức gia truyền.",
        price: 150000,
        discount: 10,
        stock: 100,
        images: [
          "https://huongvietmart.vn/wp-content/uploads/2020/08/5SAO232.jpg",
          "https://placehold.co/800x800/green/white?text=Bánh+Pía+Đậu+Xanh",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía thịt heo quay",
        description:
          "Bánh pía nhân thịt heo quay thơm lừng, công thức gia truyền Sóc Trăng. Thịt heo được ướp gia vị đặc biệt, tạo hương vị đậm đà khó quên.",
        price: 180000,
        discount: 0,
        stock: 100,
        images: [
          "https://cf.shopee.vn/file/0cf51566187956d5bdf38578d1e701da",
          "https://placehold.co/800x800/red/white?text=Bánh+Pía+Thịt+Heo+Quay",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía dừa nướng",
        description:
          "Bánh pía dừa nướng thơm lừng, vị ngọt tự nhiên từ dừa tươi Sóc Trăng. Lớp vỏ giòn tan, nhân dừa thơm béo.",
        price: 160000,
        discount: 5,
        stock: 100,
        images: [
          "https://www.dacsanhuongviet.com/site/wp-content/uploads/2020/11/mua-banh-dua-nuong-o-tphcm-1.jpg",
          "https://placehold.co/800x800/yellow/white?text=Bánh+Pía+Dừa+Nướng",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía trứng muối",
        description:
          "Bánh pía trứng muối đặc sản, nhân trứng muối béo ngậy hòa quyện cùng đậu xanh thơm ngon. Vị mặn ngọt hài hòa.",
        price: 170000,
        discount: 8,
        stock: 100,
        images: [
          "https://banhbaominh.com/wp-content/uploads/2022/12/banh-pia-trung-300g-banh-pia-trung-bao-minh-moi-2024-1.jpg",
          "https://placehold.co/800x800/orange/white?text=Bánh+Pía+Trứng+Muối",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía đậu xanh đặc biệt",
        description:
          "Sản phẩm bán chạy nhất - bánh pía đậu xanh cao cấp với nguyên liệu tuyển chọn. Hương vị đậm đà, độc đáo.",
        price: 200000,
        discount: 15,
        stock: 100,
        images: [
          "https://www.banhpia.vn/site/wp-content/uploads/2016/11/banh-pia-5-sao-dau-xanh-sau-rieng-600g.jpg",
          "https://placehold.co/800x800/green/white?text=Bánh+Pía+Đặc+Biệt",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía sầu riêng",
        description:
          "Bánh pía sầu riêng thơm ngậy, nhân sầu riêng Thái Lan chính hiệu. Vị ngọt đậm đà của sầu riêng hòa quyện.",
        price: 220000,
        discount: 12,
        stock: 100,
        images: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFhBRmNhJU3iWPxCxWIU3DgYu5EdbSNE5A0Q&s",
          "https://placehold.co/800x800/gold/white?text=Bánh+Pía+Sầu+Riêng",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía chà bông",
        description:
          "Bánh pía nhân chà bông thơm béo, hương vị mới lạ độc đáo. Chà bông thơm ngon kết hợp đậu xanh.",
        price: 175000,
        discount: 6,
        stock: 100,
        images: [
          "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lwduket03lcpb2",
          "https://placehold.co/800x800/pink/white?text=Bánh+Pía+Chà+Bông",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía khoai môn",
        description:
          "Bánh pía khoai môn tím thơm ngon, nhân khoai môn béo ngậy tự nhiên. Màu tím đẹp mắt, vị ngọt thanh.",
        price: 165000,
        discount: 7,
        stock: 100,
        images: [
          "https://tamlong.com.vn/wp-content/uploads/banh-pia-khoa-mon-1.jpg",
          "https://placehold.co/800x800/purple/white?text=Bánh+Pía+Khoai+Môn",
        ],
        categoryId: categories[0]._id,
      },

      // Bánh ít (4 sản phẩm cũ)
      {
        name: "Bánh ít lá chuối",
        description:
          "Bánh ít truyền thống gói lá chuối, nhân tôm thịt đậm đà. Được gói bằng lá chuối tươi, mang hương vị đặc trưng.",
        price: 120000,
        discount: 5,
        stock: 100,
        images: [
          "https://i.ytimg.com/vi/Gf_ZFLiyE_E/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBmNcm9akl4FYtehErURTZptLkycQ",
          "https://placehold.co/800x800/green/white?text=Bánh+Ít+Lá+Chuối",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân dừa",
        description:
          "Bánh ít nhân dừa tươi thơm ngọt, được làm từ dừa già Sóc Trăng. Hương vị thanh mát, dẻo dai.",
        price: 110000,
        discount: 0,
        stock: 100,
        images: [
          "https://cdn.tgdd.vn/2020/10/CookRecipe/Avatar/banh-it-nhan-dau-xanh-thumbnail-1.jpg",
          "https://placehold.co/800x800/brown/white?text=Bánh+Ít+Dừa",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân đậu xanh",
        description:
          "Bánh ít nhân đậu xanh nguyên chất, vị ngọt thanh mát. Đậu xanh được xay nhuyễn mịn màng.",
        price: 115000,
        discount: 3,
        stock: 100,
        images: [
          "https://img-global.cpcdn.com/recipes/80716e0980dd1bc5/680x482cq70/banh-it-tr%E1%BA%A7n-nhan-d%E1%BA%ADu-xanh-th%E1%BB%8Bt-bam-recipe-main-photo.jpg",
          "https://placehold.co/800x800/green/white?text=Bánh+Ít+Đậu+Xanh",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít chay",
        description:
          "Bánh ít chay thanh đạm, nhân nấm hương và đậu hũ thơm ngon. Phù hợp cho người ăn chay.",
        price: 105000,
        discount: 8,
        stock: 100,
        images: [
          "https://amthucdochay.com/wp-content/uploads/2021/10/maxresdefault-14-1024x576.jpg",
          "https://placehold.co/800x800/green/white?text=Bánh+Ít+Chay",
        ],
        categoryId: categories[1]._id,
      },

      // Bánh cam (3 sản phẩm cũ)
      {
        name: "Bánh cam Sóc Trăng",
        description:
          "Bánh cam giòn rụm, nhân đậu xanh thơm ngon. Lớp vỏ giòn tan, nhân đậu xanh ngọt thanh.",
        price: 1000,
        discount: 5,
        stock: 100,
        images: [
          "http://banhchungngon.vn/wp-content/uploads/2023/07/dac-san-banh-cong-soc-trang.jpg",
          "https://placehold.co/800x800/orange/white?text=Bánh+Cam+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân thịt",
        description:
          "Bánh cam giòn rụm nhân thịt heo băm thơm ngon, gia vị đậm đà đặc trưng. Vị mặn ngọt hài hòa.",
        price: 120000,
        discount: 0,
        stock: 100,
        images: [
          "https://i.ytimg.com/vi/GPD3vBfWAps/maxresdefault.jpg",
          "https://placehold.co/800x800/orange/white?text=Bánh+Cam+Thịt",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân tôm",
        description:
          "Bánh cam nhân tôm tươi ngọt thịt, tôm Sóc Trăng tươi ngon. Hương vị biển cả đặc trưng.",
        price: 130000,
        discount: 10,
        stock: 100,
        images: [
          "https://cdn.tgdd.vn/2021/02/CookProduct/Untitled-1-1200x676-14.jpg",
          "https://placehold.co/800x800/orange/white?text=Bánh+Cam+Tôm",
        ],
        categoryId: categories[2]._id,
      },

      // Kem bơ (3 sản phẩm cũ)
      {
        name: "Kem bơ Sóc Trăng",
        description:
          "Kem bơ thơm ngon từ dừa tươi Sóc Trăng. Được làm từ dừa tươi 10%, mát lạnh, thơm béo.",
        price: 8000,
        discount: 0,
        stock: 100,
        images: [
          "https://i.ytimg.com/vi/MXFdIvfsCto/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAG5h1KKJRTHwsQ6cLUeN2JS8WheQ",
          "https://placehold.co/800x800/white/green?text=Kem+Bơ+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ dừa nướng",
        description:
          "Kem bơ từ dừa nướng thơm bùi, hương vị độc đáo khác biệt. Vị béo ngậy của dừa nướng.",
        price: 90000,
        discount: 10,
        stock: 100,
        images: [
          "https://file.hstatic.net/200000648353/file/cach-lam-kem-bo-dua__3__c591111fdf214e37bc344ed06a715825_1024x1024.jpg",
          "https://placehold.co/800x800/white/brown?text=Kem+Bơ+Dừa+Nướng",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ ca cao",
        description:
          "Kem bơ dừa pha ca cao thơm ngon, vị ngọt đắng hài hòa. Sự kết hợp hoàn hảo giữa dừa và ca cao.",
        price: 95000,
        discount: 5,
        stock: 100,
        images: [
          "https://adiva.com.vn/wp-content/uploads/2018/10/kem-ca-cao-2.gif",
          "https://placehold.co/800x800/white/brown?text=Kem+Bơ+Ca+Cao",
        ],
        categoryId: categories[3]._id,
      },

      // Combo (2 sản phẩm cũ)
      {
        name: "Combo bánh pía truyền thống",
        description:
          "Combo 4 loại bánh pía đặc sản Sóc Trăng: đậu xanh, thịt, dừa, trứng. Hộp quà tặng đẹp mắt, phù hợp làm quà.",
        price: 500000,
        discount: 30,
        stock: 100,
        images: [
          "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-m07h7azz5wbxa2",
          "https://placehold.co/800x800/yellow/white?text=Combo+Bánh+Pía+ĐT",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo đặc sản Sóc Trăng",
        description:
          "Combo đầy đủ đặc sản: bánh pía, bánh ín, bánh cam, kem bơ. Quà tặng ý nghĩa cho người thân, đại diện cho tinh hoa ẩm thực Sóc Trăng.",
        price: 600000,
        discount: 25,
        stock: 100,
        images: [
          "https://cf.shopee.vn/file/1489bd525a6ca748c3544ba0209aca5",
          "https://down-vn.img.susercontent.com/file/vn-1134207-7r98o-lrg3gzyze2s9eb",
          "https://placehold.co/800x800/yellow/white?text=Combo+ĐT+Sóc+Trăng",
        ],
        categoryId: categories[4]._id,
      },

      // Thêm 50 sản phẩm mới bắt đầu từ đây
      // Bánh pía (10 sản phẩm mới)
      {
        name: "Bánh pía sầu riêng hảo hạng",
        description:
          "Bánh pía nhân sầu riêng hảo hạng, được chọn lọc từ sầu riêng Musang King thơm ngon. Vỏ bánh mềm mịn, nhân sầu riêng đậm đặc.",
        price: 250000,
        discount: 15,
        stock: 80,
        images: [
          "https://placehold.co/800x800/gold/white?text=Bánh+Pía+Sầu+Riêng+Hảo+Hạng",
          "https://placehold.co/800x800/gold/black?text=Sầu+Riêng+Musang+King",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía thập cẩm đặc biệt",
        description:
          "Bánh pía nhân thập cẩm gồm nhiều loại hạt, thịt, trứng muối. Hương vị phong phú, phù hợp cho dịp lễ tết.",
        price: 200000,
        discount: 10,
        stock: 90,
        images: [
          "https://placehold.co/800x800/brown/white?text=Bánh+Pía+Thập+Cẩm+ĐT",
          "https://placehold.co/800x800/brown/white?text=Hạt+Thơm+Ngon",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía dừa sáp",
        description:
          "Bánh pía nhân dừa sáp thơm béo, được làm từ dừa sáp đặc sản Bến Tre. Vị ngọt thanh, béo ngậy tự nhiên.",
        price: 170000,
        discount: 5,
        stock: 100,
        images: [
          "https://placehold.co/800x800/yellow/white?text=Bánh+Pía+Dừa+Sáp",
          "https://placehold.co/800x800/yellow/black?text=Dừa+Sáp+Bến+TRE",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía nhân phô mai",
        description:
          "Bánh pía nhân phô mai béo ngậy, kết hợp với đậu xanh tạo nên hương vị mới lạ. Dành cho những người yêu thích vị béo.",
        price: 190000,
        discount: 8,
        stock: 85,
        images: [
          "https://placehold.co/800x800/white/orange?text=Bánh+Pía+Phô+Mai",
          "https://placehold.co/800x800/white/orange?text=Vị+Béo+Ngậy+ĐT",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía nhân mít",
        description:
          "Bánh pía nhân mít thơm ngon, được làm từ mít sấy dẻo đặc sản miền Tây. Hương vị ngọt thanh, độc đáo.",
        price: 160000,
        discount: 12,
        stock: 75,
        images: [
          "https://placehold.co/800x800/orange/white?text=Bánh+Pía+Mít",
          "https://placehold.co/800x800/orange/white?text=Mít+ĐT+Miền+Tây",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía nhân mè đen",
        description:
          "Bánh pía nhân mè đen thơm lừng, giàu dinh dưỡng. Vị bùi béo đặc trưng của mè đen kết hợp với đậu xanh.",
        price: 180000,
        discount: 7,
        stock: 95,
        images: [
          "https://placehold.co/800x800/black/white?text=Bánh+Pía+Mè+Đen",
          "https://placehold.co/800x800/black/white?text=Giàu+Dinh+Dưỡng",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía nhân khoai lang tím",
        description:
          "Bánh pía nhân khoai lang tím tự nhiên, không phẩm màu. Vị bùi béo đặc trưng của khoai lang tím.",
        price: 175000,
        discount: 6,
        stock: 88,
        images: [
          "https://placehold.co/800x800/purple/white?text=Bánh+Pía+Khoai+Lang+Tím",
          "https://placehold.co/800x800/purple/white?text=Không+Phẩm+Màu",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía nhân dâu tây",
        description:
          "Bánh pía nhân dâu tây sấy thơm ngon, vị chua ngọt hài hòa. Hương vị mới lạ cho người thích vị thanh mát.",
        price: 210000,
        discount: 9,
        stock: 70,
        images: [
          "https://placehold.co/800x800/red/white?text=Bánh+Pía+Dâu+Tây",
          "https://placehold.co/800x800/red/white?text=Chua+Ngọt+Hài+Hòa",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía nhân chocolate",
        description:
          "Bánh pía nhân chocolate đắng nhẹ, kết hợp với đậu xanh tạo nên hương vị độc đáo. Dành cho người yêu thích chocolate.",
        price: 220000,
        discount: 11,
        stock: 65,
        images: [
          "https://placehold.co/800x800/brown/white?text=Bánh+Pía+Chocolate",
          "https://placehold.co/800x800/brown/white?text=Vị+Đắng+Nhẹ",
        ],
        categoryId: categories[0]._id,
      },
      {
        name: "Bánh pía nhân lá dứa",
        description:
          "Bánh pía nhân đậu xanh kết hợp với hương lá dứa thơm dịu. Vỏ bánh xanh tự nhiên, hương vị thanh mát.",
        price: 165000,
        discount: 4,
        stock: 92,
        images: [
          "https://placehold.co/800x800/green/white?text=Bánh+Pía+Lá+Dứa",
          "https://placehold.co/800x800/green/white?text=Hương+Thơm+Dịu",
        ],
        categoryId: categories[0]._id,
      },

      // Bánh ít (10 sản phẩm mới)
      {
        name: "Bánh ít nhân đậu đỏ",
        description:
          "Bánh ít nhân đậu đỏ thơm ngon, được nấu nhuyễn cùng đường và vani. Vỏ bánh dẻo mịn, nhân đậu đỏ ngọt thanh.",
        price: 125000,
        discount: 5,
        stock: 80,
        images: [
          "https://placehold.co/800x800/red/white?text=Bánh+Ít+Đậu+Đỏ",
          "https://placehold.co/800x800/red/white?text=Ngọt+Thanh+Vani",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân khoai môn",
        description:
          "Bánh ít nhân khoai môn bùi béo, được làm từ khoai môn sáp dẻo. Vỏ bánh trắng trong, nhân khoai môn thơm ngon.",
        price: 130000,
        discount: 6,
        stock: 85,
        images: [
          "https://placehold.co/800x800/purple/white?text=Bánh+Ít+Khoai+Môn",
          "https://placehold.co/800x800/purple/white?text=Khoai+Môn+Sáp+Dẻo",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân mè đen",
        description:
          "Bánh ít nhân mè đen thơm lừng, giàu dinh dưỡng. Vị bùi béo đặc trưng của mè đen kết hợp với vỏ bánh dẻo mịn.",
        price: 135000,
        discount: 8,
        stock: 75,
        images: [
          "https://placehold.co/800x800/black/white?text=Bánh+Ít+Mè+Đen",
          "https://placehold.co/800x800/black/white?text=Giàu+Dinh+Dưỡng",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân sầu riêng",
        description:
          "Bánh ít nhân sầu riêng thơm ngậy, được làm từ sầu riêng tươi nguyên chất. Vị đặc biệt cho người yêu thích sầu riêng.",
        price: 150000,
        discount: 10,
        stock: 60,
        images: [
          "https://placehold.co/800x800/gold/white?text=Bánh+Ít+Sầu+Riêng",
          "https://placehold.co/800x800/gold/white?text=Sầu+Riêng+Tươi+ĐT",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân cốm",
        description:
          "Bánh ít nhân cốm dẻo thơm, được làm từ cốm làng Vòng Hà Nội. Hương vị đồng quê thanh tao, nhẹ nhàng.",
        price: 140000,
        discount: 7,
        stock: 70,
        images: [
          "https://placehold.co/800x800/green/white?text=Bánh+Ít+Cốm",
          "https://placehold.co/800x800/green/white?text=Cốm+Làng+Vòng",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân dừa",
        description:
          "Bánh ít nhân dừa béo ngậy, được làm từ dừa nạo sợi và đường thốt nốt. Vị ngọt tự nhiên, thơm béo.",
        price: 115000,
        discount: 3,
        stock: 90,
        images: [
          "https://placehold.co/800x800/brown/white?text=Bánh+Ít+Dừa",
          "https://placehold.co/800x800/brown/white?text=Dừa+Nạo+Sợi",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân mít",
        description:
          "Bánh ít nhân mít sợi thơm ngon, được làm từ mít tươi sấy dẻo. Vị ngọt thanh đặc trưng của mít miền Tây.",
        price: 120000,
        discount: 4,
        stock: 85,
        images: [
          "https://placehold.co/800x800/orange/white?text=Bánh+Ít+Mít",
          "https://placehold.co/800x800/orange/white?text=Mít+Miền+Tây",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân khoai lang tím",
        description:
          "Bánh ít nhân khoai lang tím tự nhiên, không phẩm màu. Vỏ bánh tím nhẹ, nhân khoai lang bùi béo.",
        price: 145000,
        discount: 9,
        stock: 78,
        images: [
          "https://placehold.co/800x800/purple/white?text=Bánh+Ít+Khoai+Lang+Tím",
          "https://placehold.co/800x800/purple/white?text=Không+Phẩm+Màu",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân lá cẩm",
        description:
          "Bánh ít nhân đậu xanh kết hợp với lá cẩm tự nhiên. Vỏ bánh tím đậm, vị thanh mát.",
        price: 138000,
        discount: 6,
        stock: 82,
        images: [
          "https://placehold.co/800x800/purple/white?text=Bánh+Ít+Lá+Cẩm",
          "https://placehold.co/800x800/purple/white?text=Tự+Nhiên+ĐT",
        ],
        categoryId: categories[1]._id,
      },
      {
        name: "Bánh ít nhân lá dứa",
        description:
          "Bánh ít nhân đậu xanh kết hợp với hương lá dứa thơm dịu. Vỏ bánh xanh tự nhiên, hương vị thanh mát.",
        price: 128000,
        discount: 5,
        stock: 8,
        images: [
          "https://placehold.co/800x800/green/white?text=Bánh+Ít+Lá+Dứa",
          "https://placehold.co/800x800/green/white?text=Hương+Lá+Dứa+ĐT",
        ],
        categoryId: categories[1]._id,
      },

      // Bánh cam (10 sản phẩm mới)
      {
        name: "Bánh cam nhân đậu xanh",
        description:
          "Bánh cam giòn rụm, nhân đậu xanh thơm ngon. Lớp vỏ giòn tan, nhân đậu xanh ngọt thanh.",
        price: 110000,
        discount: 6,
        stock: 10,
        images: [
          "https://placehold.co/800x800/orange/green?text=Bánh+Cam+Đậu+Xanh",
          "https://placehold.co/800x800/orange/green?text=Giòn+Tan+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân khoai môn",
        description:
          "Bánh cam giòn rụm, nhân khoai môn bùi béo. Hương vị đặc biệt từ khoai môn kết hợp với vỏ bánh giòn.",
        price: 115000,
        discount: 7,
        stock: 95,
        images: [
          "https://placehold.co/800x800/orange/purple?text=Bánh+Cam+Khoai+Môn",
          "https://placehold.co/800x800/orange/purple?text=Bùi+Béo+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân sầu riêng",
        description:
          "Bánh cam giòn rụm, nhân sầu riêng thơm ngậy. Vị đặc biệt cho người yêu thích sầu riêng.",
        price: 140000,
        discount: 12,
        stock: 70,
        images: [
          "https://placehold.co/800x800/orange/gold?text=Bánh+Cam+Sầu+Riêng",
          "https://placehold.co/800x800/orange/gold?text=Sầu+Riêng+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân dừa",
        description:
          "Bánh cam giòn rụm, nhân dừa béo ngậy. Vị ngọt tự nhiên từ dừa tươi, thơm béo hấp dẫn.",
        price: 105000,
        discount: 5,
        stock: 100,
        images: [
          "https://placehold.co/800x800/orange/brown?text=Bánh+Cam+Dừa",
          "https://placehold.co/800x800/orange/brown?text=Dừa+Tươi+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân chocolate",
        description:
          "Bánh cam giòn rụm, nhân chocolate đắng nhẹ. Hương vị mới lạ cho người yêu thích chocolate.",
        price: 130000,
        discount: 10,
        stock: 80,
        images: [
          "https://placehold.co/800x800/orange/brown?text=Bánh+Cam+Chocolate",
          "https://placehold.co/800x800/orange/brown?text=Vị+Đắng+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân phô mai",
        description:
          "Bánh cam giòn rụm, nhân phô mai béo ngậy. Vị béo mặn đặc trưng của phô mai.",
        price: 125000,
        discount: 8,
        stock: 85,
        images: [
          "https://placehold.co/800x800/orange/white?text=Bánh+Cam+Phô+Mai",
          "https://placehold.co/800x800/orange/white?text=Béo+Ngậy+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân mít",
        description:
          "Bánh cam giòn rụm, nhân mít sợi thơm ngon. Vị ngọt thanh đặc trưng của mít miền Tây.",
        price: 118000,
        discount: 6,
        stock: 90,
        images: [
          "https://placehold.co/800x800/orange/orange?text=Bánh+Cam+Mít",
          "https://placehold.co/800x800/orange/orange?text=Mít+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân mè đen",
        description:
          "Bánh cam giòn rụm, nhân mè đen thơm lừng. Vị bùi béo đặc trưng của mè đen.",
        price: 120000,
        discount: 7,
        stock: 88,
        images: [
          "https://placehold.co/800x800/orange/black?text=Bánh+Cam+Mè+Đen",
          "https://placehold.co/800x800/orange/black?text=Mè+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân đậu đỏ",
        description:
          "Bánh cam giòn rụm, nhân đậu đỏ thơm ngon. Vị ngọt thanh từ đậu đỏ được nấu nhuyễn.",
        price: 112000,
        discount: 5,
        stock: 92,
        images: [
          "https://placehold.co/800x800/orange/red?text=Bánh+Cam+Đậu+Đỏ",
          "https://placehold.co/800x800/orange/red?text=Ngọt+Thanh+ĐT",
        ],
        categoryId: categories[2]._id,
      },
      {
        name: "Bánh cam nhân lá dứa",
        description:
          "Bánh cam giòn rụm, nhân đậu xanh kết hợp hương lá dứa. Vỏ bánh xanh tự nhiên, hương thơm dịu.",
        price: 116000,
        discount: 6,
        stock: 95,
        images: [
          "https://placehold.co/800x800/orange/green?text=Bánh+Cam+Lá+Dứa",
          "https://placehold.co/800x800/orange/green?text=Hương+Thơm+ĐT",
        ],
        categoryId: categories[2]._id,
      },

      // Kem bơ (10 sản phẩm mới)
      {
        name: "Kem bơ dừa sáp",
        description:
          "Kem bơ kết hợp với dừa sáp Bến Tre, tạo nên hương vị béo ngậy đặc biệt. Hạt dừa sáp giòn dai, thơm ngon.",
        price: 10000,
        discount: 10,
        stock: 80,
        images: [
          "https://placehold.co/800x800/white/yellow?text=Kem+Bơ+Dừa+Sáp",
          "https://placehold.co/800x800/white/yellow?text=Dừa+Sáp+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ sầu riêng",
        description:
          "Kem bơ kết hợp với sầu riêng thơm ngậy. Vị đặc biệt cho người yêu thích sầu riêng.",
        price: 120000,
        discount: 15,
        stock: 65,
        images: [
          "https://placehold.co/800x800/white/gold?text=Kem+Bơ+Sầu+Riêng",
          "https://placehold.co/800x800/white/gold?text=Sầu+Riêng+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ dừa dứa",
        description:
          "Kem bơ kết hợp với dừa và dứa tạo nên hương vị nhiệt đới độc đáo. Vị chua ngọt hài hòa.",
        price: 95000,
        discount: 8,
        stock: 85,
        images: [
          "https://placehold.co/800x800/white/yellow?text=Kem+Bơ+Dừa+Dứa",
          "https://placehold.co/800x800/white/yellow?text=Vị+Nhiệt+Đới",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ mít",
        description:
          "Kem bơ kết hợp với mít sợi thơm ngon. Vị ngọt thanh đặc trưng của mít miền Tây.",
        price: 90000,
        discount: 5,
        stock: 90,
        images: [
          "https://placehold.co/800x800/white/orange?text=Kem+Bơ+Mít",
          "https://placehold.co/800x800/white/orange?text=Mít+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ mè đen",
        description:
          "Kem bơ kết hợp với mè đen thơm lừng. Vị bùi béo đặc trưng của mè đen.",
        price: 105000,
        discount: 12,
        stock: 75,
        images: [
          "https://placehold.co/800x800/white/black?text=Kem+Bơ+Mè+Đen",
          "https://placehold.co/800x800/white/black?text=Mè+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ chocolate",
        description:
          "Kem bơ kết hợp với chocolate đắng nhẹ. Hương vị mới lạ cho người yêu thích chocolate.",
        price: 110000,
        discount: 10,
        stock: 80,
        images: [
          "https://placehold.co/800x800/white/brown?text=Kem+Bơ+Chocolate",
          "https://placehold.co/800x800/white/brown?text=Vị+Đắng+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ đậu xanh",
        description:
          "Kem bơ kết hợp với đậu xanh nguyên chất. Vị ngọt thanh, béo ngậy hài hòa.",
        price: 85000,
        discount: 5,
        stock: 95,
        images: [
          "https://placehold.co/800x800/white/green?text=Kem+Bơ+Đậu+Xanh",
          "https://placehold.co/800x800/white/green?text=Ngọt+Thanh+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ khoai môn",
        description:
          "Kem bơ kết hợp với khoai môn tím tự nhiên. Vị bùi béo đặc trưng của khoai môn.",
        price: 98000,
        discount: 7,
        stock: 88,
        images: [
          "https://placehold.co/800x800/white/purple?text=Kem+Bơ+Khoai+Môn",
          "https://placehold.co/800x800/white/purple?text=Khoai+Môn+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ lá dứa",
        description:
          "Kem bơ kết hợp với hương lá dứa thơm dịu. Vị thanh mát, dễ chịu.",
        price: 8000,
        discount: 6,
        stock: 92,
        images: [
          "https://placehold.co/800x800/white/green?text=Kem+Bơ+Lá+Dứa",
          "https://placehold.co/800x800/white/green?text=Hương+Thơm+ĐT",
        ],
        categoryId: categories[3]._id,
      },
      {
        name: "Kem bơ cốm",
        description:
          "Kem bơ kết hợp với cốm làng Vòng Hà Nội. Hương vị đồng quê thanh tao, nhẹ nhàng.",
        price: 102000,
        discount: 12,
        stock: 78,
        images: [
          "https://placehold.co/800x800/white/green?text=Kem+Bơ+Cốm",
          "https://placehold.co/800x800/white/green?text=Cốm+Làng+Vòng",
        ],
        categoryId: categories[3]._id,
      },

      // Combo (10 sản phẩm mới)
      {
        name: "Combo bánh pía thập cẩm cao cấp",
        description:
          "Combo 6 loại bánh pía cao cấp: đậu xanh, thịt, dừa, trứng muối, sầu riêng, thập cẩm. Hộp quà sang trọng, phù hợp làm quà biếu.",
        price: 750000,
        discount: 25,
        stock: 50,
        images: [
          "https://placehold.co/800x800/yellow/white?text=Combo+Bánh+Pía+ĐT",
          "https://placehold.co/800x800/yellow/white?text=Quà+Sang+Trọng",
          "https://placehold.co/800x800/yellow/white?text=6+Loại+Bánh+ĐT",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo bánh ít 5 màu",
        description:
          "Combo 5 loại bánh ít với 5 màu sắc tự nhiên: truyền thống, lá dứa, lá cẩm, khoai lang tím, đậu đỏ. Đa dạng hương vị, đẹp mắt.",
        price: 450000,
        discount: 20,
        stock: 60,
        images: [
          "https://placehold.co/800x800/green/white?text=Combo+Bánh+Ít+5+Màu",
          "https://placehold.co/800x800/green/white?text=5+Màu+ĐT",
          "https://placehold.co/800x800/green/white?text=Đa+Dạng+ĐT",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo bánh cam thập cẩm",
        description:
          "Combo 5 loại bánh cam với các nhân khác nhau: đậu xanh, khoai môn, dừa, sầu riêng, chocolate. Thử đủ vị đặc sản.",
        price: 40000,
        discount: 18,
        stock: 70,
        images: [
          "https://placehold.co/800x800/orange/white?text=Combo+Bánh+Cam+ĐT",
          "https://placehold.co/800x800/orange/white?text=5+Loại+ĐT",
          "https://placehold.co/800x800/orange/white?text=Thử+Đủ+Vị",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo kem bơ 4 mùa",
        description:
          "Combo 4 vị kem bơ đặc biệt: truyền thống, dừa sáp, sầu riêng, mít. Thưởng thức hương vị đặc sản 4 mùa.",
        price: 350000,
        discount: 15,
        stock: 80,
        images: [
          "https://placehold.co/800x800/white/green?text=Combo+Kem+Bơ+4+Mùa",
          "https://placehold.co/800x800/white/green?text=4+Vị+ĐT",
          "https://placehold.co/800x800/white/green?text=Đặc+Sản+ĐT",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo đặc sản Sóc Trăng mini",
        description:
          "Combo nhỏ gọn gồm 4 loại đặc sản Sóc Trăng: bánh pía đậu xanh, bánh ít lá chuối, bánh cam, kem bơ. Thích hợp dùng thử.",
        price: 250000,
        discount: 12,
        stock: 100,
        images: [
          "https://placehold.co/800x800/yellow/white?text=Combo+ĐT+ST+Mini",
          "https://placehold.co/800x800/yellow/white?text=4+Loại+ĐT",
          "https://placehold.co/800x800/yellow/white?text=Dùng+Thử+ĐT",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo bánh pía cho người ăn kiêng",
        description:
          "Combo 4 loại bánh pía ít đường, không chất bảo quản: đậu xanh, khoai môn, mè đen, lá dứa. Phù hợp với người ăn kiêng.",
        price: 50000,
        discount: 22,
        stock: 65,
        images: [
          "https://placehold.co/800x800/green/white?text=Combo+Bánh+Pía+AK",
          "https://placehold.co/800x800/green/white?text=Ít+Đường",
          "https://placehold.co/800x800/green/white?text=Không+BV",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo bánh ít chay hảo hạng",
        description:
          "Combo 4 loại bánh ít chay với nhân nấm hương, đậu hũ, đậu đỏ, khoai môn. Vị chay thanh đạm, bổ dưỡng.",
        price: 42000,
        discount: 16,
        stock: 75,
        images: [
          "https://placehold.co/800x800/green/white?text=Combo+Bánh+Ít+Chay",
          "https://placehold.co/800x800/green/white?text=Chay+ĐT",
          "https://placehold.co/800x800/green/white?text=Thanh+Đạm",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo bánh cam giòn lâu",
        description:
          "Combo 3 loại bánh cam đặc biệt được làm theo công nghệ mới, giữ độ giòn lâu: truyền thống, chocolate, phô mai. Bảo quản tốt, lâu bị mềm.",
        price: 38000,
        discount: 14,
        stock: 85,
        images: [
          "https://placehold.co/800x800/orange/white?text=Combo+Bánh+Cam+Giòn",
          "https://placehold.co/800x800/orange/white?text=Giữ+Giòn+Lâu",
          "https://placehold.co/800x800/orange/white?text=3+Loại+ĐT",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo kem bơ cho bé yêu",
        description:
          "Combo 3 vị kem bơ dành riêng cho trẻ em: dừa, khoai môn, đậu xanh. Không đường, không chất bảo quản, bổ dưỡng.",
        price: 3000,
        discount: 10,
        stock: 90,
        images: [
          "https://placehold.co/800x800/white/yellow?text=Combo+Kem+Bơ+Cho+Bé",
          "https://placehold.co/800x800/white/yellow?text=Không+Đường",
          "https://placehold.co/800x800/white/yellow?text=Cho+Trẻ+ĐT",
        ],
        categoryId: categories[4]._id,
      },
      {
        name: "Combo quà tặng gia đình",
        description:
          "Combo đặc biệt gồm: 2 hộp bánh pía, 1 hộp bánh ít, 1 hộp bánh cam, 2 hũ kem bơ. Hộp quà sang trọng, phù hợp làm quà tặng dịp lễ tết.",
        price: 9000,
        discount: 30,
        stock: 40,
        images: [
          "https://placehold.co/800x800/yellow/white?text=Combo+Quà+Tặng+GĐ",
          "https://placehold.co/800x800/yellow/white?text=Hộp+Quà+Sang",
          "https://placehold.co/800x800/yellow/white?text=Quà+Tết+ĐT",
        ],
        categoryId: categories[4]._id,
      },

      // Bánh tráng nướng (10 sản phẩm mới)
      {
        name: "Bánh tráng nướng trứng cút",
        description:
          "Bánh tráng nướng giòn rụm với trứng cút, hành phi, mỡ hành. Món ăn vặt hấp dẫn, thơm ngon.",
        price: 50000,
        discount: 5,
        stock: 120,
        images: [
          "https://placehold.co/800x800/white/red?text=Bánh+Tráng+Nướng+Trứng+Cút",
          "https://placehold.co/800x800/white/red?text=Giòn+Rụm",
          "https://placehold.co/800x800/white/red?text=ĐT+Miền+Nam",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng pate",
        description:
          "Bánh tráng nướng với pate, trứng, hành phi và các loại gia vị đặc trưng. Hương vị đậm đà, hấp dẫn.",
        price: 60000,
        discount: 8,
        stock: 110,
        images: [
          "https://placehold.co/800x800/white/brown?text=Bánh+Tráng+Nướng+Pate",
          "https://placehold.co/800x800/white/brown?text=Hương+Vị+ĐT",
          "https://placehold.co/800x800/white/brown?text=Đậm+Đà",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng mắm ruốc",
        description:
          "Bánh tráng nướng với mắm ruốc đặc sản Huế, trứng, hành phi. Vị mặn mà đặc trưng của miền Trung.",
        price: 5500,
        discount: 6,
        stock: 100,
        images: [
          "https://placehold.co/800x800/white/orange?text=Bánh+Tráng+Nướng+Mắm+Ruốc",
          "https://placehold.co/800x800/white/orange?text=ĐT+Huế",
          "https://placehold.co/800x800/white/orange?text=Mặn+Mà",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng bơ tỏi",
        description:
          "Bánh tráng nướng với bơ tỏi thơm lừng, hành phi và phô mai. Vị béo ngậy, thơm ngon khó cưỡng.",
        price: 65000,
        discount: 10,
        stock: 95,
        images: [
          "https://placehold.co/800x800/white/yellow?text=Bánh+Tráng+Nướng+Bơ+Tỏi",
          "https://placehold.co/800x800/white/yellow?text=Béo+Ngậy",
          "https://placehold.co/800x800/white/yellow?text=Thơm+Lừng",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng phô mai",
        description:
          "Bánh tráng nướng với lớp phô mai kéo sợi béo ngậy, trứng và hành phi. Món ăn vặt được giới trẻ yêu thích.",
        price: 70000,
        discount: 12,
        stock: 90,
        images: [
          "https://placehold.co/800x800/white/white?text=Bánh+Tráng+Nướng+Phô+Mai",
          "https://placehold.co/800x800/white/white?text=Kéo+Sợi",
          "https://placehold.co/800x800/white/white?text=Béo+Ngậy",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng trứng muối",
        description:
          "Bánh tráng nướng với trứng muối mặn bùi, hành phi và gia vị đặc biệt. Vị mặn mà, hấp dẫn.",
        price: 75000,
        discount: 15,
        stock: 85,
        images: [
          "https://placehold.co/800x800/white/orange?text=Bánh+Tráng+Nướng+Trứng+Muối",
          "https://placehold.co/800x800/white/orange?text=Trứng+Muối+ĐT",
          "https://placehold.co/800x800/white/orange?text=Mặn+Mà",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng chay",
        description:
          "Bánh tráng nướng chay với các loại rau củ, nấm, gia vị chay. Món ăn vặt tốt cho sức khỏe, phù hợp người ăn chay.",
        price: 45000,
        discount: 5,
        stock: 100,
        images: [
          "https://placehold.co/800x800/green/white?text=Bánh+Tráng+Nướng+Chay",
          "https://placehold.co/800x800/green/white?text=Rau+Củ",
          "https://placehold.co/800x800/green/white?text=ĐT+Tốt+SK",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng mực một nắng",
        description:
          "Bánh tráng nướng với mực một nắng nướng giòn, hành phi và gia vị đặc biệt. Vị mặn mà, thơm ngon.",
        price: 85000,
        discount: 18,
        stock: 75,
        images: [
          "https://placehold.co/800x800/white/brown?text=Bánh+Tráng+Nướng+Mực+1+Nắng",
          "https://placehold.co/800x800/white/brown?text=Mực+ĐT",
          "https://placehold.co/800x800/white/brown?text=Thơm+Ngậy",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng tôm rim",
        description:
          "Bánh tráng nướng với tôm rim mặn ngọt, trứng, hành phi. Vị đậm đà, thơm ngon khó cưỡng.",
        price: 80000,
        discount: 16,
        stock: 80,
        images: [
          "https://placehold.co/800x800/white/pink?text=Bánh+Tráng+Nướng+Tôm+Rim",
          "https://placehold.co/800x800/white/pink?text=Tôm+ĐT",
          "https://placehold.co/800x800/white/pink?text=Mặn+Ngọt",
        ],
        categoryId: categories[5]._id,
      },
      {
        name: "Bánh tráng nướng đặc biệt",
        description:
          "Bánh tráng nướng với đầy đủ topping: trứng cút, pate, mắm ruốc, phô mai, hành phi. Món ăn vặt cao cấp, no căng bụng.",
        price: 100000,
        discount: 20,
        stock: 70,
        images: [
          "https://placehold.co/800x800/white/multi?text=Bánh+Tráng+Nướng+ĐT",
          "https://placehold.co/800x800/white/multi?text=Đầy+Đủ+Topping",
          "https://placehold.co/800x800/white/multi?text=ĐT+No+Căng",
        ],
        categoryId: categories[5]._id,
      },
    ];

    const initialProductCount = await Product.countDocuments();
    const productsWithCodes = productData.map((p, i) => ({
      ...p,
      code: `PRD-${String(initialProductCount + i + 1).padStart(5, "0")}`,
    }));

    const products = await Product.insertMany(productsWithCodes);

    console.log("Products inserted:", products.length);

    // Thêm vouchers
    const vouchers = await Voucher.insertMany([
      {
        code: "GIAM10K",
        discountValue: 10000,
        discountType: "fixed",
        minPurchaseAmount: 50000,
        maxDiscountAmount: 10000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        type: "public",
        globalUsageLimit: 100,
      },
      {
        code: "PIAZERO",
        discountValue: 10,
        discountType: "percentage",
        minPurchaseAmount: 100000,
        maxDiscountAmount: 20000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        type: "public",
        globalUsageLimit: 50,
        applicableCategories: [categories[0]._id],
      },
      {
        code: "COMBOFREESHIP",
        discountValue: 100,
        discountType: "percentage",
        minPurchaseAmount: 200000,
        maxDiscountAmount: 50000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        type: "public",
        globalUsageLimit: 20,
        applicableProducts: [products[20]._id, products[21]._id],
      },
      {
        code: "NOIT7",
        discountValue: 15,
        discountType: "percentage",
        minPurchaseAmount: 150000,
        maxDiscountAmount: 30000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        type: "public",
        globalUsageLimit: 30,
        excludedCategories: [categories[1]._id],
      },
      {
        code: "ONLYFORBANHPIA",
        discountValue: 20,
        discountType: "percentage",
        minPurchaseAmount: 200000,
        maxDiscountAmount: 40000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        type: "public",
        globalUsageLimit: 100,
        applicableProducts: [products[0]._id, products[1]._id, products[2]._id],
      },
    ]);
  } catch (error) {
    console.error("Error inserting test data:", error);
  } finally {
    mongoose.connection.close();
  }
};

insertTestData();
