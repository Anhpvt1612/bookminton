import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function CTASection() {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="py-12 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng đặt sân cầu lông?</h2>
        <p className="text-indigo-200 max-w-2xl mx-auto mb-8">
          {isAuthenticated
            ? "Tìm kiếm sân cầu lông phù hợp và đặt sân ngay hôm nay."
            : "Đăng ký tài khoản miễn phí ngay hôm nay và nhận ưu đãi 10% cho lần đặt sân đầu tiên."}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/courts">
                <Button className="bg-white text-primary hover:bg-gray-100 transition px-8 py-3">
                  Tìm sân ngay
                </Button>
              </Link>
              <Link href="/players">
                <Button variant="outline" className="bg-transparent text-white border border-white hover:bg-white/10 transition px-8 py-3">
                  Tìm bạn chơi
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button className="bg-white text-primary hover:bg-gray-100 transition px-8 py-3">
                  Đăng ký ngay
                </Button>
              </Link>
              <Link href="/courts">
                <Button variant="outline" className="bg-transparent text-white border border-white hover:bg-white/10 transition px-8 py-3">
                  Tìm hiểu thêm
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
