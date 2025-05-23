import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourtForm from "@/components/courts/court-form";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/utils";
import { type Court, type Booking } from "@shared/schema";

export default function ManageCourts() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [showCourtForm, setShowCourtForm] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | undefined>(undefined);

  // Redirect if not authenticated or not a court owner
  useEffect(() => {
    if (isAuthenticated && user && !user.isCourtOwner) {
      navigate("/");
    } else if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch courts owned by the user
  const { data: courts, isLoading: isLoadingCourts } = useQuery<Court[]>({
    queryKey: ['/api/courts/owner'],
    enabled: !!isAuthenticated && !!user?.isCourtOwner,
  });

  // Fetch bookings for all courts
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/owner'],
    enabled: !!isAuthenticated && !!user?.isCourtOwner && !!courts?.length,
  });

  // Filter bookings by status
  const pendingBookings = bookings?.filter(booking => booking.status === "pending") || [];
  const confirmedBookings = bookings?.filter(booking => booking.status === "confirmed") || [];
  const historyBookings = bookings?.filter(booking => ["completed", "cancelled"].includes(booking.status)) || [];

  const handleEditCourt = (court: Court) => {
    setSelectedCourt(court);
    setShowCourtForm(true);
  };

  if (!isAuthenticated || (user && !user.isCourtOwner)) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Quản lý sân cầu lông | BadmintonHub</title>
        <meta
          name="description"
          content="Quản lý sân cầu lông của bạn. Thêm sân mới, chỉnh sửa thông tin, xem đơn đặt sân và duyệt đơn."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý sân cầu lông</h1>
          <Button 
            className="bg-primary hover:bg-indigo-700"
            onClick={() => {
              setSelectedCourt(undefined);
              setShowCourtForm(true);
            }}
          >
            <i className="fas fa-plus mr-2"></i>
            Thêm sân mới
          </Button>
        </div>

        {showCourtForm ? (
          <div className="mb-8">
            <CourtForm 
              court={selectedCourt}
              onSuccess={() => {
                setShowCourtForm(false);
                setSelectedCourt(undefined);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle>Sân cầu lông của tôi</CardTitle>
                  <CardDescription>
                    Quản lý danh sách sân cầu lông của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCourts ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
                      ))}
                    </div>
                  ) : courts && courts.length > 0 ? (
                    <div className="space-y-4">
                      {courts.map(court => (
                        <div 
                          key={court.id} 
                          className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="flex-shrink-0 w-12 h-12 mr-4 rounded overflow-hidden">
                            <img 
                              src={court.imageUrl} 
                              alt={court.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold">{court.name}</h3>
                            <p className="text-sm text-gray-600">{court.location}</p>
                          </div>
                          <div className="text-sm font-medium text-primary">
                            {formatPrice(court.pricePerHour)}/giờ
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCourt(court)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-volleyball-ball text-3xl mb-2"></i>
                      <p className="mb-4">Bạn chưa có sân cầu lông nào</p>
                      <Button 
                        className="bg-primary hover:bg-indigo-700"
                        onClick={() => setShowCourtForm(true)}
                      >
                        Thêm sân mới
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-7">
              <Card>
                <CardHeader>
                  <CardTitle>Đơn đặt sân</CardTitle>
                  <CardDescription>
                    Quản lý các đơn đặt sân của khách hàng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBookings ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    <Tabs defaultValue="pending">
                      <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="pending">
                          Chờ duyệt ({pendingBookings.length})
                        </TabsTrigger>
                        <TabsTrigger value="confirmed">
                          Đã xác nhận ({confirmedBookings.length})
                        </TabsTrigger>
                        <TabsTrigger value="history">
                          Lịch sử ({historyBookings.length})
                        </TabsTrigger>
                      </TabsList>
                      
                      {["pending", "confirmed", "history"].map((tabValue) => {
                        let bookingsToDisplay: Booking[] = [];
                        
                        if (tabValue === "pending") {
                          bookingsToDisplay = pendingBookings;
                        } else if (tabValue === "confirmed") {
                          bookingsToDisplay = confirmedBookings;
                        } else {
                          bookingsToDisplay = historyBookings;
                        }
                        
                        return (
                          <TabsContent key={tabValue} value={tabValue}>
                            {bookingsToDisplay.length > 0 ? (
                              <div className="space-y-4">
                                {bookingsToDisplay.map(booking => {
                                  const court = courts?.find(c => c.id === booking.courtId);
                                  
                                  return (
                                    <Card key={booking.id}>
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                          <div>
                                            <h3 className="font-semibold">
                                              {court?.name || "Sân cầu lông"}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                              {new Date(booking.date).toLocaleDateString()} • {" "}
                                              {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {" "}
                                              {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                          </div>
                                          <div className="text-sm font-medium text-primary">
                                            {formatPrice(booking.totalPrice)}
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center text-sm">
                                          <div className="mr-4">
                                            <span className="text-gray-600">Người đặt:</span>
                                            <span className="ml-1 font-medium">
                                              {booking.user?.name || "Khách hàng"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Trạng thái:</span>
                                            <span className={`ml-1 font-medium ${
                                              booking.status === "pending" ? "text-yellow-600" :
                                              booking.status === "confirmed" ? "text-green-600" :
                                              booking.status === "completed" ? "text-blue-600" :
                                              "text-red-600"
                                            }`}>
                                              {
                                                booking.status === "pending" ? "Chờ duyệt" :
                                                booking.status === "confirmed" ? "Đã xác nhận" :
                                                booking.status === "completed" ? "Đã hoàn thành" :
                                                "Đã hủy"
                                              }
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {tabValue === "pending" && (
                                          <div className="flex justify-end mt-4 space-x-2">
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              Từ chối
                                            </Button>
                                            <Button 
                                              className="bg-green-600 hover:bg-green-700"
                                              size="sm"
                                            >
                                              Xác nhận
                                            </Button>
                                          </div>
                                        )}
                                        
                                        {tabValue === "confirmed" && (
                                          <div className="flex justify-end mt-4">
                                            <Button 
                                              className="bg-blue-600 hover:bg-blue-700"
                                              size="sm"
                                            >
                                              Đánh dấu hoàn thành
                                            </Button>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <i className="far fa-calendar-times text-3xl mb-2"></i>
                                <p>Không có đơn đặt sân nào</p>
                              </div>
                            )}
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
