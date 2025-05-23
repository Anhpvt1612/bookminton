import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function BecomeCourtOwner() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-4">Bạn có sân cầu lông?</h2>
            <p className="text-gray-300 mb-6">
              Tối ưu hóa việc quản lý và tăng doanh thu cho sân cầu lông của bạn. Với BadmintonHub, bạn có thể dễ dàng quản lý lịch đặt sân, xem báo cáo doanh thu và tiếp cận hàng ngàn người chơi tiềm năng.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="fas fa-calendar-alt text-amber-500"></i>
                  <h4 className="font-semibold">Quản lý lịch đặt sân</h4>
                </div>
                <p className="text-gray-400 text-sm">Dễ dàng theo dõi và quản lý tất cả các đơn đặt sân.</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="fas fa-chart-line text-amber-500"></i>
                  <h4 className="font-semibold">Phân tích doanh thu</h4>
                </div>
                <p className="text-gray-400 text-sm">Xem báo cáo chi tiết về doanh thu và hiệu suất sân.</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="fas fa-users text-amber-500"></i>
                  <h4 className="font-semibold">Tiếp cận khách hàng</h4>
                </div>
                <p className="text-gray-400 text-sm">Kết nối với hàng ngàn người chơi cầu lông tiềm năng.</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="fas fa-star text-amber-500"></i>
                  <h4 className="font-semibold">Xây dựng thương hiệu</h4>
                </div>
                <p className="text-gray-400 text-sm">Nhận đánh giá và phản hồi để cải thiện chất lượng dịch vụ.</p>
              </div>
            </div>
            
            {isAuthenticated && user?.isCourtOwner ? (
              <Link href="/manage-courts">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3">
                  Quản lý sân của tôi
                </Button>
              </Link>
            ) : (
              <Link href={isAuthenticated ? "/manage-courts" : "/register"}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3">
                  Đăng ký sân cầu lông
                </Button>
              </Link>
            )}
          </div>
          
          <div className="md:w-1/2 order-1 md:order-2">
            <img 
              src="https://pixabay.com/get/g76856b1cd6704843b10d25a1ce2696150bceacedcc5d8921272687e5cef3b5e433ff0bb5cc827362140c587a44d9e9a3ad2af99289e6486b746599c019ce07a5_1280.jpg" 
              alt="Quản lý sân cầu lông" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
