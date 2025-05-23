export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Ngọc Linh",
      role: "Người chơi cầu lông",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
      rating: 5,
      text: "Rất tiện lợi và dễ sử dụng. Tôi đã tìm được sân cầu lông gần nhà và đặt sân chỉ trong vài phút. Đặc biệt là tính năng tìm bạn chơi rất hữu ích."
    },
    {
      id: 2,
      name: "Minh Tuấn",
      role: "Chủ sân cầu lông",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
      rating: 4.5,
      text: "Là chủ sân cầu lông, tôi rất hài lòng với hệ thống quản lý của BadmintonHub. Giúp tôi dễ dàng theo dõi lịch đặt sân và tăng đáng kể lượng khách hàng mới."
    },
    {
      id: 3,
      name: "Hoàng Việt",
      role: "Người chơi cầu lông",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
      rating: 5,
      text: "Việc thanh toán trực tuyến rất thuận tiện và an toàn. Tôi thích cách BadmintonHub hiển thị sân trống và cho phép đặt sân ngay lập tức, tiết kiệm rất nhiều thời gian."
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    
    return stars;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">Người dùng nói gì về chúng tôi?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Khám phá trải nghiệm của những người dùng BadmintonHub.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-xl">
              <div className="flex space-x-1 text-amber-500 mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-gray-700 mb-6">{testimonial.text}</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
