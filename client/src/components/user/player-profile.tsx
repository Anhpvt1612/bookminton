import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getSkillLevelLabel, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import PlayerForm from "./player-form";
import { type User, type PlayerRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface PlayerProfileProps {
  userId?: number;
}

export default function PlayerProfile({ userId }: PlayerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isCurrentUser = !userId || (currentUser && userId === currentUser.id);
  const profileUserId = userId || currentUser?.id;

  // Fetch user profile
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${profileUserId}`],
    enabled: !!profileUserId,
  });

  // Fetch player requests if viewing own profile
  const { data: playerRequests, isLoading: isLoadingRequests } = useQuery<PlayerRequest[]>({
    queryKey: ['/api/player-requests/user'],
    enabled: isCurrentUser,
  });

  // Mutation to delete player request
  const deleteRequest = useMutation({
    mutationFn: async (requestId: number) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/player-requests/${requestId}/status`, 
        { status: "expired" }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/player-requests/user'] });
      toast({
        title: "Thành công",
        description: "Yêu cầu tìm bạn chơi đã được hủy",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể hủy yêu cầu. Vui lòng thử lại.",
      });
    },
  });

  if (isLoadingUser) {
    return (
      <div className="animate-pulse">
        <div className="h-40 bg-gray-200 rounded-t-lg mb-16"></div>
        <div className="px-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="flex space-x-2 mb-6">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl text-gray-400 mb-4">
          <i className="fas fa-user-slash"></i>
        </div>
        <h2 className="text-2xl font-bold mb-2">Người dùng không tồn tại</h2>
        <p className="text-gray-600">Không tìm thấy thông tin người chơi này.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      {isEditing ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Chỉnh sửa thông tin cá nhân</h2>
          <PlayerForm
            user={user}
            onSuccess={() => {
              setIsEditing(false);
              queryClient.invalidateQueries({ queryKey: [`/api/users/${profileUserId}`] });
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-blue-600">
            <div className="absolute -bottom-16 left-6">
              <div className="rounded-full w-32 h-32 border-4 border-white bg-white overflow-hidden">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            
            {isCurrentUser && (
              <div className="absolute top-4 right-4">
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-100"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit mr-2"></i>
                  Chỉnh sửa
                </Button>
              </div>
            )}
          </div>

          <div className="pt-20 px-6 pb-6">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="flex items-center text-gray-600 mt-1 mb-4">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span>{user.location}</span>
            </div>

            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">
                {user.isCourtOwner ? "Chủ sân" : "Người chơi"}
              </Badge>
              {!user.isCourtOwner && user.skillLevel && (
                <Badge variant="outline">
                  Trình độ: {getSkillLevelLabel(user.skillLevel)}
                </Badge>
              )}
            </div>
          </div>

          {isCurrentUser && (
            <Tabs defaultValue="requests" className="px-6 pb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="requests">Yêu cầu tìm bạn chơi</TabsTrigger>
                <TabsTrigger value="bookings">Lịch sử đặt sân</TabsTrigger>
              </TabsList>
              
              <TabsContent value="requests">
                {isLoadingRequests ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      </div>
                    ))}
                  </div>
                ) : playerRequests && playerRequests.length > 0 ? (
                  <div className="space-y-4">
                    {playerRequests
                      .filter(req => req.status === "active")
                      .map((request) => (
                        <Card key={request.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">
                                  {request.location}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {formatDate(request.date)} • {request.timeRange}
                                </p>
                                {request.message && (
                                  <p className="text-gray-700 mt-2">{request.message}</p>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteRequest.mutate(request.id)}
                              >
                                <i className="fas fa-trash-alt mr-1"></i>
                                Hủy
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <i className="far fa-calendar-times text-3xl mb-2"></i>
                    <p>Bạn chưa có yêu cầu tìm bạn chơi nào</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="bookings">
                {/* Bookings history would go here */}
                <div className="text-center py-6 text-gray-500">
                  <i className="far fa-calendar-check text-3xl mb-2"></i>
                  <p>Xem lịch sử đặt sân trong mục "Đặt sân của tôi"</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </Card>
  );
}
