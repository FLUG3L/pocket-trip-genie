
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Trophy, MapPin, Users, Star, LogOut } from 'lucide-react';

export function ProfileTab() {
  const { user, signOut } = useAuth();

  const stats = [
    { label: 'Places Visited', value: '12', icon: '📍' },
    { label: 'Countries', value: '3', icon: '🌍' },
    { label: 'Trips Planned', value: '8', icon: '✈️' },
    { label: 'Reviews', value: '24', icon: '⭐' },
  ];

  const achievements = [
    { title: 'First Trip', emoji: '🎯', unlocked: true },
    { title: 'Social Butterfly', emoji: '🦋', unlocked: true },
    { title: 'Explorer', emoji: '🗺️', unlocked: false },
    { title: 'Foodie', emoji: '🍜', unlocked: true },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Profile</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">👤</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user?.user_metadata?.full_name || 'Travel Explorer'}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                  <Badge variant="secondary">Bronze Tier</Badge>
                  <span className="ml-2 text-sm text-gray-600">850 points</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-semibold">42</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">38</p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Travel Stats */}
      <div className="px-4">
        <h3 className="font-semibold mb-3">Travel Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4">
        <h3 className="font-semibold mb-3">Achievements</h3>
        <div className="grid grid-cols-4 gap-3">
          {achievements.map((achievement, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                  : 'bg-gray-200'
              }`}>
                <span className="text-xl">{achievement.emoji}</span>
              </div>
              <p className="text-xs">{achievement.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-4">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Users className="h-5 w-5 mr-3" />
            Friends & Followers
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Star className="h-5 w-5 mr-3" />
            My Reviews
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <MapPin className="h-5 w-5 mr-3" />
            Saved Places
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
