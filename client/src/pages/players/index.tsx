import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { skillLevels, formatDate, getSkillLevelLabel } from "@/lib/utils";
import PlayerCard from "@/components/user/player-card";
import ChatBox from "@/components/chat/chat-box";
import { type User, type PlayerRequest } from "@shared/schema";

export default function Players() {
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    location: "",
    date: new Date().toISOString().split('T')[0],
    timeRange: "18:00 - 20:00",
    message: ""
  });
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all player requests
  const { data: playerRequests, isLoading: isLoadingRequests } = useQuery<PlayerRequest[]>({
    queryKey: ['/api/player-requests'],
  });

  // Fetch all users (for player listing)
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Create new player request
  const createRequest = useMutation({
    mutationFn: async (requestData: Partial<PlayerRequest>) => {
      const res = await apiRequest("POST", "/api/player-requests", requestData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/player-requests'] });
      setShowRequestForm(false);
      toast({
        title: "Yêu cầu đã được tạo",
        description: "Yêu cầu tìm bạn chơi đã được đăng thành công!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Không thể tạo yêu cầu",
        description: error.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
    }
  });

  const handleCreateRequest = () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để đăng yêu cầu tìm bạn chơi.",
      });
      return;
    }
    
    createRequest.mutateAsync(requestData);
  };

  const handleContactPlayer = (player: User) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để liên hệ với người chơi khác.",
      });
      return;
    }
    
    setSelectedPlayer(player);
  };

  // Filter regular users who aren't court owners
  const players = users?.filter(u => !u.isCourtOwner) || [];

  return (
    <>
      <Helmet>
        <title>Tìm bạn chơi cầu lông | BadmintonHub</title>
        <meta
          name="description"
          content="Tìm bạn chơi cầu lông phù hợp với thời gian và trình độ của bạn. Đăng thông tin tìm bạn chơi hoặc liên hệ trực tiếp với người chơi khác."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-2">Tìm bạn chơi cầu lông</h2>
                  <p className="text-gray-600">
                    Đăng thông tin tìm bạn chơi hoặc liên hệ trực tiếp với người chơi khác
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-indigo-700 mb-6"
                  onClick={() => setShowRequestForm(true)}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Đăng tin tìm bạn chơi
                </Button>
                
                <div>
                  <h3 className="font-semibold mb-3">Yêu cầu tìm bạn chơi</h3>
                  
                  {isLoadingRequests ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        </div>
                      ))}
                    </div>
                  ) : playerRequests && playerRequests.length > 0 ? (
                    <div className="space-y-4">
                      {playerRequests.map((request) => (
                        <div 
                          key={request.id} 
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center mb-2">
                            <div className="flex-shrink-0 mr-3">
                              {request.user && request.user.avatarUrl ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                  <img 
                                    src={request.user.avatarUrl} 
                                    alt={request.user.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-semibold">
                                  {request.user?.name?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {request.user?.name || "Người chơi"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {request.user?.skillLevel && getSkillLevelLabel(request.user.skillLevel)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <i className="fas fa-map-marker-alt mr-1"></i>
                              <span>{request.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <i className="far fa-calendar-alt mr-1"></i>
                              <span>{formatDate(request.date)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <i className="far fa-clock mr-1"></i>
                              <span>{request.timeRange}</span>
                            </div>
                          </div>
                          
                          {request.message && (
                            <p className="text-sm text-gray-700 border-t pt-2 mt-2">
                              {request.message}
                            </p>
                          )}
                          
                          {request.user && request.user.id !== user?.id && (
                            <div className="mt-3">
                              <Button 
                                size="sm" 
                                className="w-full bg-primary hover:bg-indigo-700"
                                onClick={() => handleContactPlayer(request.user!)}
                              >
                                <i className="far fa-envelope mr-1"></i>
                                Liên hệ
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <i className="far fa-calendar-times text-3xl mb-2"></i>
                      <p>Không có yêu cầu tìm bạn chơi nào</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Danh sách người chơi</h2>
            
            {isLoadingUsers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 border border-t-0 rounded-b-lg">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {players.map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onContactClick={handleContactPlayer}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <i className="fas fa-users text-4xl text-gray-400 mb-3"></i>
                <h3 className="text-lg font-semibold mb-1">Không tìm thấy người chơi</h3>
                <p className="text-gray-600">
                  Không có người chơi nào trong hệ thống.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialog for creating player request */}
      <Dialog 
        open={showRequestForm} 
        onOpenChange={setShowRequestForm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng tin tìm bạn chơi</DialogTitle>
            <DialogDescription>
              Tạo yêu cầu tìm bạn chơi cầu lông theo địa điểm và thời gian của bạn
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Địa điểm</label>
              <Input
                placeholder="Nhập địa điểm bạn muốn chơi"
                value={requestData.location}
                onChange={(e) => setRequestData({...requestData, location: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày</label>
              <Input
                type="date"
                value={requestData.date}
                onChange={(e) => setRequestData({...requestData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Khung giờ</label>
              <Select
                value={requestData.timeRange}
                onValueChange={(value) => setRequestData({...requestData, timeRange: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khung giờ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6:00 - 8:00">6:00 - 8:00</SelectItem>
                  <SelectItem value="8:00 - 10:00">8:00 - 10:00</SelectItem>
                  <SelectItem value="10:00 - 12:00">10:00 - 12:00</SelectItem>
                  <SelectItem value="12:00 - 14:00">12:00 - 14:00</SelectItem>
                  <SelectItem value="14:00 - 16:00">14:00 - 16:00</SelectItem>
                  <SelectItem value="16:00 - 18:00">16:00 - 18:00</SelectItem>
                  <SelectItem value="18:00 - 20:00">18:00 - 20:00</SelectItem>
                  <SelectItem value="20:00 - 22:00">20:00 - 22:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <Textarea
                placeholder="Thêm thông tin về trình độ, yêu cầu đối tác..."
                value={requestData.message}
                onChange={(e) => setRequestData({...requestData, message: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button 
              className="bg-primary hover:bg-indigo-700"
              onClick={handleCreateRequest}
              disabled={!requestData.location || !requestData.date}
            >
              Đăng tin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for chat */}
      <Dialog 
        open={!!selectedPlayer} 
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      >
        <DialogContent className="p-0 max-w-md">
          {selectedPlayer && (
            <ChatBox 
              recipient={selectedPlayer} 
              onClose={() => setSelectedPlayer(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
