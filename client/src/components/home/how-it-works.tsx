export default function HowItWorks() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">Cách thức hoạt động</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đặt sân cầu lông chưa bao giờ dễ dàng đến thế. Chỉ với vài bước đơn giản, bạn có thể tìm và đặt sân cầu lông phù hợp.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-primary text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Tìm kiếm</h3>
            <p className="text-gray-600">Tìm sân cầu lông phù hợp theo địa điểm, thời gian và giá cả.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="far fa-calendar-check text-primary text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Đặt sân</h3>
            <p className="text-gray-600">Chọn khung giờ phù hợp và đặt sân trực tuyến chỉ trong vài phút.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shuttlecock text-primary text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chơi thôi!</h3>
            <p className="text-gray-600">Đến sân theo lịch đã đặt và tận hưởng trận đấu cầu lông tuyệt vời.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
