import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { timeRanges } from "@/lib/utils";
import { type Court } from "@shared/schema";
import CourtCard from "@/components/home/court-card";

export default function CourtSearch() {
  // Get search params from URL
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [, setLocation] = useLocation();

  // Search state
  const [searchParams, setSearchParams] = useState({
    location: params.get("location") || "",
    date: params.get("date") || new Date().toISOString().split('T')[0],
    time: params.get("time") || "any"
  });

  const [searchResults, setSearchResults] = useState<Court[]>([]);
  const { data: courts, isLoading } = useQuery<Court[]>({
    queryKey: ['/api/courts'],
  });

  // Filter courts based on search params
  useEffect(() => {
    if (courts) {
      let filteredCourts = [...courts];

      if (searchParams.location) {
        filteredCourts = filteredCourts.filter(court => 
          court.location.toLowerCase().includes(searchParams.location.toLowerCase())
        );
      }

      // More filters can be applied here when the API supports them

      setSearchResults(filteredCourts);
    }
  }, [courts, searchParams]);

  // Update URL when search params change
  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    
    if (searchParams.location) {
      queryParams.append('location', searchParams.location);
    }
    
    if (searchParams.date) {
      queryParams.append('date', searchParams.date);
    }
    
    if (searchParams.time && searchParams.time !== "any") {
      queryParams.append('time', searchParams.time);
    }
    
    setLocation(`/courts?${queryParams.toString()}`);
  };

  // Sample available slots for demo
  const generateRandomSlots = (index: number) => {
    const allSlots = [
      "6:00 - 7:00", "7:00 - 8:00", "8:00 - 9:00", "9:00 - 10:00",
      "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
      "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00",
      "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"
    ];
    
    // Shuffle and take a random number of slots
    const shuffled = [...allSlots].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3 + (index % 5)); // Return 3-7 slots
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Tìm kiếm sân cầu lông</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Địa điểm</label>
            <div className="flex items-center space-x-2">
              <i className="fas fa-map-marker-alt text-primary"></i>
              <Input 
                type="text" 
                placeholder="Nhập địa điểm"
                value={searchParams.location}
                onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Ngày</label>
            <div className="flex items-center space-x-2">
              <i className="far fa-calendar-alt text-primary"></i>
              <Input 
                type="date" 
                value={searchParams.date}
                onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Thời gian</label>
            <div className="flex items-center space-x-2">
              <i className="far fa-clock text-primary"></i>
              <Select
                value={searchParams.time}
                onValueChange={(value) => setSearchParams({...searchParams, time: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Bất kỳ</SelectItem>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSearch}
          className="w-full bg-primary hover:bg-indigo-700 text-white"
        >
          <i className="fas fa-search mr-2"></i> Tìm sân
        </Button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark mb-6">
          {isLoading ? "Đang tìm kiếm sân..." : 
            searchResults.length > 0 
              ? `${searchResults.length} sân cầu lông phù hợp` 
              : "Không tìm thấy sân cầu lông phù hợp"}
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((court, index) => (
              <CourtCard 
                key={court.id} 
                court={court} 
                availableSlots={generateRandomSlots(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="mb-4 text-gray-400">
              <i className="fas fa-search text-5xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy sân cầu lông</h3>
            <p className="text-gray-500 mb-4">
              Hãy thử thay đổi tiêu chí tìm kiếm của bạn để xem nhiều kết quả hơn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
