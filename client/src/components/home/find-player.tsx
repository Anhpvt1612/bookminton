import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getSkillLevelLabel } from "@/lib/utils";
import { type User } from "@shared/schema";

export default function FindPlayer() {
  const { data: players } = useQuery<User[]>({
    queryKey: ['/api/auth/users'],
    staleTime: 60000, // 1 minute
  });

  // Display the first 3 players
  const displayPlayers = players?.slice(0, 3) || [];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <img 
              src="https://pixabay.com/get/gb6c91c1efbd0c6ca45b9d045828c105b52ec8ad735aef40ac74ad03341aa8117ae0de2280d8b08f4dab6df44a30ce09fe2cd19f62b15d033eec51f2f7fa74206_1280.jpg" 
              alt="Tìm bạn chơi cầu lông" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-dark mb-4">Tìm bạn chơi cầu lông</h2>
            <p className="text-gray-600 mb-6">
              Bạn muốn chơi cầu lông nhưng không có đối tác? Đừng lo lắng! Với tính năng tìm bạn chơi của BadmintonHub, bạn có thể kết nối với những người chơi khác gần bạn và cùng trình độ.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              {displayPlayers.length > 0 ? (
                displayPlayers.map((player, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-4 last:mb-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={player.avatarUrl || "https://via.placeholder.com/100"} 
                        alt={player.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{player.name}</h4>
                      <div className="text-sm text-gray-500">
                        {getSkillLevelLabel(player.skillLevel)} • {player.location}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 mb-4 last:mb-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 animate-pulse rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <Link href="/players">
              <Button className="w-full md:w-auto bg-primary hover:bg-indigo-700 text-white px-6 py-3">
                Tìm bạn chơi ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
