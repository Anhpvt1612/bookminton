import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, formatDate } from "@/lib/utils";
import { type Court, type TimeSlot, type Review } from "@shared/schema";
import BookingForm from "./booking-form";

export default function CourtDetails() {
  const { id } = useParams<{ id: string }>();
  const courtId = parseInt(id);

  // Fetch court details
  const { data: court, isLoading: isLoadingCourt } = useQuery<Court>({
    queryKey: [`/api/courts/${courtId}`],
  });

  // Fetch time slots for the court
  const today = new Date().toISOString().split('T')[0];
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = useQuery<TimeSlot[]>({
    queryKey: [`/api/time-slots/${courtId}/${today}`],
    enabled: !!courtId,
  });

  // Fetch reviews for the court
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/reviews/court/${courtId}`],
    enabled: !!courtId,
  });

  if (isLoadingCourt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-10 bg-gray-200 rounded mb-4 max-w-md"></div>
          <div className="h-6 bg-gray-200 rounded mb-6 max-w-sm"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-4xl text-gray-400 mb-4">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy sân cầu lông</h2>
        <p className="text-gray-600 mb-6">Sân cầu lông bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Button className="bg-primary hover:bg-indigo-700" onClick={() => window.history.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  // Group time slots by hour for easier display
  const availableTimeSlots = timeSlots?.filter(slot => !slot.isBooked) || [];
  const bookedTimeSlots = timeSlots?.filter(slot => slot.isBooked) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-80 rounded-lg overflow-hidden mb-6">
            <img 
              src={court.imageUrl} 
              alt={court.name} 
              className="w-full h-full object-cover"
            />
            {court.rating > 0 && (
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-md text-sm font-semibold flex items-center">
                <i className="fas fa-star text-amber-500 mr-1"></i>
                <span>{court.rating}/5</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{court.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span>{court.location}</span>
            </div>
            <p className="text-gray-700 mb-4">{court.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {court.amenities?.map((amenity, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <Tabs defaultValue="availability" className="mb-8">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="availability">Lịch trống</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá ({reviews?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="availability" className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Khung giờ trống hôm nay</h3>
              {isLoadingTimeSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-10 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimeSlots.map((slot) => {
                    const startTime = new Date(slot.startTime);
                    const endTime = new Date(slot.endTime);
                    const timeString = `${startTime.getHours()}:00 - ${endTime.getHours()}:00`;
                    
                    return (
                      <div 
                        key={slot.id} 
                        className="px-3 py-2 bg-green-100 text-green-800 rounded text-center cursor-pointer hover:bg-green-200 transition"
                      >
                        {timeString}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500">
                  <i className="far fa-calendar-times text-3xl mb-2"></i>
                  <p>Không có khung giờ trống nào cho hôm nay</p>
                </div>
              )}
              
              {bookedTimeSlots.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold my-4">Khung giờ đã đặt</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {bookedTimeSlots.map((slot) => {
                      const startTime = new Date(slot.startTime);
                      const endTime = new Date(slot.endTime);
                      const timeString = `${startTime.getHours()}:00 - ${endTime.getHours()}:00`;
                      
                      return (
                        <div 
                          key={slot.id} 
                          className="px-3 py-2 bg-gray-100 text-gray-500 rounded text-center line-through"
                        >
                          {timeString}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                          {review.user && review.user.avatarUrl ? (
                            <img 
                              src={review.user.avatarUrl} 
                              alt={review.user.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                              {review.user?.name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{review.user?.name || "Người dùng"}</div>
                          <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex text-amber-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas fa-star ${i < review.rating ? "" : "text-gray-300"}`}></i>
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  <i className="far fa-comments text-3xl mb-2"></i>
                  <p>Chưa có đánh giá nào cho sân này</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Đặt sân</CardTitle>
              <CardDescription>Chọn ngày giờ và đặt sân cầu lông ngay hôm nay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Giá thuê sân:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(court.pricePerHour)}<span className="text-sm text-gray-600">/giờ</span>
                </span>
              </div>
              <Separator className="mb-4" />
              <BookingForm courtId={courtId} pricePerHour={court.pricePerHour} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
