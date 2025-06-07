
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, MapPin } from 'lucide-react';

export function CommunityTab() {
  const samplePosts = [
    {
      id: 1,
      user: 'Sarah Chen',
      avatar: '👩‍🦱',
      location: 'Chiang Mai, Thailand',
      content: 'Amazing sunrise at Doi Suthep! The temple is absolutely stunning at this time of day. Highly recommend getting there early to avoid crowds.',
      image: '/placeholder.svg',
      likes: 42,
      comments: 8,
      timeAgo: '2h',
    },
    {
      id: 2,
      user: 'Mike Johnson',
      avatar: '👨‍🦲',
      location: 'Phuket, Thailand',
      content: 'Found this hidden gem beach on the west coast. Crystal clear water and almost no tourists!',
      image: '/placeholder.svg',
      likes: 28,
      comments: 5,
      timeAgo: '4h',
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Community</h1>
        <p className="text-gray-600">Discover travel stories from fellow explorers</p>
      </div>
      
      {/* Stories Section */}
      <div className="px-4">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <div className="flex flex-col items-center min-w-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl">➕</span>
              </div>
            </div>
            <span className="text-xs mt-1">Your Story</span>
          </div>
          
          {['🏔️', '🏖️', '🏛️', '🍜', '🎭'].map((emoji, index) => (
            <div key={index} className="flex flex-col items-center min-w-16">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl">{emoji}</span>
                </div>
              </div>
              <span className="text-xs mt-1">Live</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {samplePosts.map((post) => (
          <Card key={post.id} className="mx-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-lg">{post.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{post.user}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {post.location}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{post.timeAgo}</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="mb-3">{post.content}</p>
              
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-gray-400">📸 Travel Photo</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Heart className="h-5 w-5 mr-1" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <MessageCircle className="h-5 w-5 mr-1" />
                    {post.comments}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
