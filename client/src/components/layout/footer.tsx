import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-shuttlecock text-primary text-2xl"></i>
              <span className="font-bold text-xl">BadmintonHub</span>
            </div>
            <p className="text-gray-400 mb-4">
              Nền tảng đặt sân cầu lông hàng đầu Việt Nam. Kết nối người chơi và chủ sân cầu lông một cách dễ dàng và thuận tiện.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/courts" className="text-gray-400 hover:text-white transition">
                  Tìm sân
                </Link>
              </li>
              <li>
                <Link href="/players" className="text-gray-400 hover:text-white transition">
                  Tìm bạn chơi
                </Link>
              </li>
              <li>
                <Link href="/manage-courts" className="text-gray-400 hover:text-white transition">
                  Đăng ký sân
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">Ưu đãi</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">Trung tâm hỗ trợ</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">Câu hỏi thường gặp</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">Liên hệ</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">Điều khoản sử dụng</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Liên hệ</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <i className="fas fa-map-marker-alt mt-1 text-gray-400"></i>
                <span className="text-gray-400">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-phone-alt mt-1 text-gray-400"></i>
                <span className="text-gray-400">090 123 4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-envelope mt-1 text-gray-400"></i>
                <span className="text-gray-400">info@badmintonhub.vn</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-gray-500 text-sm">© 2023 BadmintonHub. Tất cả các quyền được bảo lưu.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-white text-sm transition">Chính sách bảo mật</a>
              <a href="#" className="text-gray-500 hover:text-white text-sm transition">Điều khoản sử dụng</a>
              <a href="#" className="text-gray-500 hover:text-white text-sm transition">Cookie</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
