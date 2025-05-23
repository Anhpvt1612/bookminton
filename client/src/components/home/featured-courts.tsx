import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import CourtCard from "./court-card";
import { type Court } from "@shared/schema";

// Sample available slots for demo
const sampleAvailableSlots = [
  ["9:00 - 10:00", "14:00 - 15:00", "20:00 - 21:00", "21:00 - 22:00", "11:00 - 12:00"],
  ["7:00 - 8:00", "12:00 - 13:00", "17:00 - 18:00", "19:00 - 20:00"],
  ["10:00 - 11:00", "15:00 - 16:00", "21:00 - 22:00", "8:00 - 9:00"],
  ["8:00 - 9:00", "13:00 - 14:00", "19:00 - 20:00", "20:00 - 21:00", "10:00 - 11:00", "12:00 - 13:00"]
];

export default function FeaturedCourts() {
  const { data: courts, isLoading } = useQuery<Court[]>({
    queryKey: ['/api/courts'],
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-dark">Sân cầu lông nổi bật</h2>
            <Link href="/courts">
              <a className="text-primary hover:text-indigo-700 font-medium">
                Xem tất cả <i className="fas fa-arrow-right ml-1"></i>
              </a>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 animate-pulse rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="flex gap-1 mb-4">
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
                  </div>
                  <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-dark">Sân cầu lông nổi bật</h2>
          <Link href="/courts">
            <a className="text-primary hover:text-indigo-700 font-medium">
              Xem tất cả <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courts && courts.slice(0, 4).map((court, index) => (
            <CourtCard 
              key={court.id} 
              court={court} 
              availableSlots={sampleAvailableSlots[index % sampleAvailableSlots.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
