import { useState } from "react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openItem, setOpenItem] = useState<number | null>(0);
  
  const faqItems: FaqItem[] = [
    {
      id: 1,
      question: "Làm thế nào để đặt sân cầu lông?",
      answer: "Đặt sân cầu lông rất đơn giản. Bạn chỉ cần tìm kiếm sân phù hợp, chọn ngày và giờ muốn đặt, thanh toán và nhận xác nhận đặt sân. Bạn có thể đặt sân trên website hoặc ứng dụng di động của chúng tôi."
    },
    {
      id: 2,
      question: "Làm thế nào để hủy hoặc thay đổi lịch đặt sân?",
      answer: "Bạn có thể hủy hoặc thay đổi lịch đặt sân trong mục \"Lịch sử đặt sân\" trên trang cá nhân của bạn. Lưu ý rằng việc hủy sân trước 24 giờ sẽ được hoàn tiền 100%, hủy trước 12 giờ sẽ được hoàn tiền 50%, và hủy muộn hơn sẽ không được hoàn tiền."
    },
    {
      id: 3,
      question: "Làm thế nào để đăng ký sân cầu lông của tôi lên nền tảng?",
      answer: "Để đăng ký sân cầu lông của bạn, bạn cần tạo tài khoản chủ sân, cung cấp thông tin chi tiết về sân cầu lông (địa chỉ, hình ảnh, giá cả, tiện ích), và hoàn tất quá trình xác minh. Đội ngũ của chúng tôi sẽ xem xét và phê duyệt sân của bạn trong vòng 24-48 giờ."
    },
    {
      id: 4,
      question: "Các phương thức thanh toán nào được chấp nhận?",
      answer: "Chúng tôi chấp nhận nhiều phương thức thanh toán khác nhau bao gồm thẻ tín dụng/ghi nợ, ví điện tử (MoMo, VNPay, ZaloPay), và chuyển khoản ngân hàng. Bạn cũng có thể nạp tiền vào ví BadmintonHub để thuận tiện hơn trong việc đặt sân."
    },
    {
      id: 5,
      question: "Tính năng tìm bạn chơi hoạt động như thế nào?",
      answer: "Tính năng tìm bạn chơi cho phép bạn kết nối với những người chơi cầu lông khác trong khu vực của bạn. Bạn có thể tạo một bài đăng tìm bạn chơi với thông tin về thời gian, địa điểm và trình độ của bạn. Những người chơi khác có thể xem bài đăng và liên hệ với bạn nếu họ quan tâm."
    }
  ];

  const toggleAccordion = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-4">Câu hỏi thường gặp</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tìm hiểu thêm về BadmintonHub và cách chúng tôi giúp bạn đặt sân cầu lông dễ dàng hơn.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item) => (
            <div key={item.id} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="flex justify-between items-center w-full p-5 text-left bg-white hover:bg-gray-50 transition"
                onClick={() => toggleAccordion(item.id)}
              >
                <span className="font-semibold">{item.question}</span>
                <i className={`fas fa-chevron-down text-primary transition-transform ${openItem === item.id ? 'rotate-180' : ''}`}></i>
              </button>
              
              {openItem === item.id && (
                <div className="bg-white px-5 pb-5">
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
