import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <i className="fas fa-shuttlecock text-primary text-2xl"></i>
            <span className="font-bold text-xl text-dark">BadmintonHub</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-dark hover:text-primary font-medium">
              Trang chủ
            </Link>
            <Link href="/courts" className="text-gray-600 hover:text-primary">
              Tìm sân
            </Link>
            <Link href="/players" className="text-gray-600 hover:text-primary">
              Tìm bạn chơi
            </Link>
            {isAuthenticated && user?.isCourtOwner && (
              <Link href="/manage-courts" className="text-gray-600 hover:text-primary">
                Quản lý sân
              </Link>
            )}
          </div>
          
          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/my-bookings" className="text-gray-600 hover:text-primary">
                  <i className="far fa-calendar-check text-lg mr-1"></i>
                  <span>Đặt sân của tôi</span>
                </Link>
                <Button 
                  variant="outline" 
                  className="text-primary border-primary hover:bg-primary hover:text-white"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary text-white hover:bg-indigo-700">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600" onClick={toggleMobileMenu}>
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-3 py-2">
            <Link href="/" className="text-dark hover:text-primary font-medium py-1" onClick={() => setIsMobileMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link href="/courts" className="text-gray-600 hover:text-primary py-1" onClick={() => setIsMobileMenuOpen(false)}>
              Tìm sân
            </Link>
            <Link href="/players" className="text-gray-600 hover:text-primary py-1" onClick={() => setIsMobileMenuOpen(false)}>
              Tìm bạn chơi
            </Link>
            {isAuthenticated && user?.isCourtOwner && (
              <Link href="/manage-courts" className="text-gray-600 hover:text-primary py-1" onClick={() => setIsMobileMenuOpen(false)}>
                Quản lý sân
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/my-bookings" className="text-gray-600 hover:text-primary py-1" onClick={() => setIsMobileMenuOpen(false)}>
                Đặt sân của tôi
              </Link>
            )}
            <div className="flex space-x-4 py-1">
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  className="flex-1 text-primary border-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Đăng xuất
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-primary border-primary hover:bg-primary hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button 
                      className="flex-1 bg-primary text-white hover:bg-indigo-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Đăng ký
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
