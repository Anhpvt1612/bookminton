import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import LoginForm from "@/components/auth/login-form";

export default function Login() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <LoginForm />
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href="/register">
              <a className="text-primary hover:underline">Đăng ký ngay</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
