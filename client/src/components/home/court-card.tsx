import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Court } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

interface CourtCardProps {
  court: Court;
  availableSlots?: string[];
}

export default function CourtCard({ court, availableSlots = [] }: CourtCardProps) {
  const maxSlotsToShow = 3;
  const extraSlotsCount = availableSlots.length > maxSlotsToShow 
    ? availableSlots.length - maxSlotsToShow 
    : 0;
  
  return (
    <Card className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative h-48">
        <img 
          src={court.imageUrl} 
          alt={court.name} 
          className="w-full h-full object-cover"
        />
        {court.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow text-sm font-medium">
            <i className="fas fa-star text-amber-500"></i>
            <span>{court.rating}</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">{court.name}</h3>
          <div className="text-primary text-sm font-bold">
            {formatPrice(court.pricePerHour)}<span className="text-gray-500 font-normal">/giờ</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-gray-500 mt-1 text-sm">
          <i className="fas fa-map-marker-alt"></i>
          <span>{court.location}</span>
        </div>
        
        {availableSlots.length > 0 && (
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-1">Khung giờ còn trống hôm nay:</div>
            <div className="flex flex-wrap gap-1">
              {availableSlots.slice(0, maxSlotsToShow).map((slot, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                  {slot}
                </span>
              ))}
              {extraSlotsCount > 0 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                  +{extraSlotsCount} giờ khác
                </span>
              )}
            </div>
          </div>
        )}
        
        {court.amenities && court.amenities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {court.amenities.map((amenity, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {amenity}
              </span>
            ))}
          </div>
        )}
        
        <Link href={`/courts/${court.id}`}>
          <Button className="w-full mt-4 bg-primary hover:bg-indigo-700 text-white py-2">
            Đặt sân ngay
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
