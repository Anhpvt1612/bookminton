import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import RegisterForm from "@/components/auth/register-form";

export default function Register() {
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
        <RegisterForm />
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Đã có tài khoản?{" "}
            <Link href="/login">
              <a className="text-primary hover:underline">Đăng nhập</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
