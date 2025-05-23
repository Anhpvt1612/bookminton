import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice, formatDate, formatTimeRange } from "@/lib/utils";
import { type Booking } from "@shared/schema";

export default function MyBookings() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/user'],
    enabled: !!isAuthenticated,
  });

  // Mutation for updating booking status
  const updateBooking = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/user'] });
      toast({
        title: "Thành công",
        description: "Trạng thái đơn đặt sân đã được cập nhật!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: error.message || "Không thể cập nhật trạng thái đơn đặt sân. Vui lòng thử lại.",
      });
    },
  });

  // Cancel booking
  const handleCancelBooking = (bookingId: number) => {
    if (confirm("Bạn có chắc chắn muốn hủy đơn đặt sân này không?")) {
      updateBooking.mutate({ id: bookingId, status: "cancelled" });
    }
  };

  // Filter bookings by status
  const pendingBookings = bookings?.filter(booking => booking.status === "pending") || [];
  const confirmedBookings = bookings?.filter(booking => booking.status === "confirmed") || [];
  const completedBookings = bookings?.filter(booking => booking.status === "completed") || [];
  const cancelledBookings = bookings?.filter(booking => booking.status === "cancelled") || [];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Đặt sân của tôi | BadmintonHub</title>
        <meta
          name="description"
          content="Quản lý các đơn đặt sân cầu lông của bạn. Xem trạng thái đơn đặt, hủy đơn và lịch sử đặt sân."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Đặt sân của tôi</h1>

        <Tabs defaultValue="pending">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="pending">
              Chờ xác nhận ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Đã xác nhận ({confirmedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Đã hoàn thành ({completedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Đã hủy ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="pending">
                {pendingBookings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancel={() => handleCancelBooking(booking.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Bạn không có đơn đặt sân nào đang chờ xác nhận" />
                )}
              </TabsContent>

              <TabsContent value="confirmed">
                {confirmedBookings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {confirmedBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancel={() => handleCancelBooking(booking.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Bạn không có đơn đặt sân nào đã được xác nhận" />
                )}
              </TabsContent>

              <TabsContent value="completed">
                {completedBookings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        showReview={true}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Bạn không có đơn đặt sân nào đã hoàn thành" />
                )}
              </TabsContent>

              <TabsContent value="cancelled">
                {cancelledBookings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cancelledBookings.map(booking => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Bạn không có đơn đặt sân nào đã hủy" />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel?: () => void;
  showReview?: boolean;
}

function BookingCard({ booking, onCancel, showReview }: BookingCardProps) {
  const court = booking.court;
  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <div className="relative h-36 bg-gray-200">
        {court?.imageUrl && (
          <img 
            src={court.imageUrl} 
            alt={court.name} 
            className="w-full h-full object-cover"
          />
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
          booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
          booking.status === "confirmed" ? "bg-green-100 text-green-800" :
          booking.status === "completed" ? "bg-blue-100 text-blue-800" :
          "bg-red-100 text-red-800"
        }`}>
          {booking.status === "pending" ? "Chờ xác nhận" :
           booking.status === "confirmed" ? "Đã xác nhận" :
           booking.status === "completed" ? "Đã hoàn thành" :
           "Đã hủy"}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">
          {court?.name || "Sân cầu lông"}
        </h3>
        
        <div className="mt-2 space-y-1">
          <div className="flex items-center text-sm">
            <i className="fas fa-map-marker-alt text-gray-500 w-5"></i>
            <span className="text-gray-700">
              {court?.location || "Không có thông tin"}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <i className="far fa-calendar-alt text-gray-500 w-5"></i>
            <span className="text-gray-700">
              {formatDate(booking.date)}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <i className="far fa-clock text-gray-500 w-5"></i>
            <span className="text-gray-700">
              {formatTimeRange(booking.startTime, booking.endTime)}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <i className="fas fa-money-bill-wave text-gray-500 w-5"></i>
            <span className="text-gray-700">
              {formatPrice(booking.totalPrice)}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {canCancel && onCancel && (
            <Button 
              variant="outline" 
              className="w-full text-red-500 hover:text-red-700"
              onClick={onCancel}
            >
              Hủy đơn
            </Button>
          )}
          
          {showReview && (
            <Button 
              className="w-full bg-primary hover:bg-indigo-700"
              onClick={() => {}}
            >
              Đánh giá
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg">
      <div className="text-4xl text-gray-400 mb-4">
        <i className="far fa-calendar-times"></i>
      </div>
      <h3 className="text-lg font-semibold mb-2">Không có đơn đặt sân</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <Button 
        className="bg-primary hover:bg-indigo-700"
        onClick={() => window.location.href = "/courts"}
      >
        Tìm và đặt sân ngay
      </Button>
    </div>
  );
}
