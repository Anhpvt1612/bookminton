import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSkillLevelLabel } from "@/lib/utils";
import { type User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface PlayerCardProps {
  player: User;
  onContactClick: (player: User) => void;
}

export default function PlayerCard({ player, onContactClick }: PlayerCardProps) {
  const { user: currentUser } = useAuth();
  const isCurrentUser = currentUser?.id === player.id;

  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-blue-600">
        <div className="absolute -bottom-10 left-4">
          <div className="rounded-full w-20 h-20 border-4 border-white bg-white overflow-hidden">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white text-2xl font-bold">
                {player.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-12 pb-4">
        <div className="mb-4">
          <h3 className="font-semibold text-lg">{player.name}</h3>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span>{player.location}</span>
          </div>
        </div>

        <div className="mb-4">
          <Badge variant="secondary" className="mr-2">
            {getSkillLevelLabel(player.skillLevel)}
          </Badge>
          {player.bio && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{player.bio}</p>
          )}
        </div>

        {!isCurrentUser && (
          <Button 
            className="w-full bg-primary hover:bg-indigo-700"
            onClick={() => onContactClick(player)}
          >
            <i className="far fa-envelope mr-2"></i>
            Liên hệ
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
