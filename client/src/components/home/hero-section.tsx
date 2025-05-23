import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timeRanges } from "@/lib/utils";

export default function HeroSection() {
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: "",
    date: new Date().toISOString().split('T')[0],
    time: "any"
  });

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
    
    navigate(`/courts?${queryParams.toString()}`);
  };

  return (
    <section className="bg-gray-900 text-white relative">
      {/* Hero background image */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      <img 
        src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
        alt="Sân cầu lông chuyên nghiệp" 
        className="w-full h-full object-cover absolute inset-0"
      />
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tìm và đặt sân cầu lông dễ dàng</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">Khám phá hàng trăm sân cầu lông gần bạn và đặt sân ngay hôm nay</p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-xl p-4 text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 border-b md:border-b-0 md:border-r pb-3 md:pb-0 md:pr-3">
                <i className="fas fa-map-marker-alt text-primary text-xl"></i>
                <div className="flex-1">
                  <label className="block text-xs text-left font-medium text-gray-600">Địa điểm</label>
                  <Input 
                    type="text" 
                    placeholder="Chọn địa điểm" 
                    className="w-full text-left focus:outline-none border-0 p-0"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 border-b md:border-b-0 md:border-r pb-3 md:pb-0 md:pr-3">
                <i className="far fa-calendar-alt text-primary text-xl"></i>
                <div className="flex-1">
                  <label className="block text-xs text-left font-medium text-gray-600">Ngày</label>
                  <Input 
                    type="date" 
                    className="w-full text-left focus:outline-none border-0 p-0"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <i className="far fa-clock text-primary text-xl"></i>
                <div className="flex-1">
                  <label className="block text-xs text-left font-medium text-gray-600">Thời gian</label>
                  <Select
                    value={searchParams.time}
                    onValueChange={(value) => setSearchParams({...searchParams, time: value})}
                  >
                    <SelectTrigger className="w-full border-0 p-0 h-auto focus:ring-0">
                      <SelectValue placeholder="Bất kỳ" />
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
            
            <div className="mt-4">
              <Button 
                className="w-full bg-primary hover:bg-indigo-700 text-white py-3 h-12 text-base"
                onClick={handleSearch}
              >
                <i className="fas fa-search mr-2"></i> Tìm sân
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
