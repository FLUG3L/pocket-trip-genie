
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, Users, Camera } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  location?: any;
  users: {
    full_name: string;
    avatar_url?: string;
  };
}

export function CommunityTab() {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      await createSamplePostsIfNeeded();
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          location,
          users (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!user,
  });

  const createSamplePostsIfNeeded = async () => {
    try {
      // Check if we have posts
      const { data: existingPosts } = await supabase
        .from('posts')
        .select('id')
        .limit(1);

      if (!existingPosts || existingPosts.length === 0) {
        // Create sample users first
        const sampleUsers = [
          { 
            id: '11111111-1111-1111-1111-111111111111', 
            email: 'sarah@example.com', 
            full_name: 'Sarah Chen',
            preferences: { onboardingCompleted: true }
          },
          { 
            id: '22222222-2222-2222-2222-222222222222', 
            email: 'mike@example.com', 
            full_name: 'Mike Johnson',
            preferences: { onboardingCompleted: true }
          },
          { 
            id: '33333333-3333-3333-3333-333333333333', 
            email: 'emma@example.com', 
            full_name: 'Emma Wilson',
            preferences: { onboardingCompleted: true }
          },
          { 
            id: '44444444-4444-4444-4444-444444444444', 
            email: 'alex@example.com', 
            full_name: 'Alex Rodriguez',
            preferences: { onboardingCompleted: true }
          }
        ];

        // Insert sample users
        for (const sampleUser of sampleUsers) {
          await supabase.from('users').upsert(sampleUser, { onConflict: 'id' });
        }

        // Insert sample posts with Chiang Mai and Bangkok content
        const samplePosts = [
          {
            user_id: sampleUsers[0].id,
            content: "Just spent an amazing week in Chiang Mai! 🏛️ The temples are absolutely breathtaking, especially Wat Phra That Doi Suthep with its golden pagoda and stunning city views. The night markets are incredible - tried the most authentic Khao Soi at a local spot. The people are so welcoming and the mountain air is so refreshing! Can't wait to go back! ✨",
            likes_count: 28,
            location: { city: 'Chiang Mai', country: 'Thailand' }
          },
          {
            user_id: sampleUsers[1].id,
            content: "Bangkok is absolutely insane in the best way possible! 🏙️ Started my day at the Grand Palace (mind-blowing architecture), then took a longtail boat through the floating markets. Ended up at Chatuchak Weekend Market where I got lost for 4 hours and tried the most amazing street food. The energy of this city is unmatched! 🛺🍜",
            likes_count: 35,
            location: { city: 'Bangkok', country: 'Thailand' }
          },
          {
            user_id: sampleUsers[2].id,
            content: "Chiang Mai's Sunday Walking Street is pure magic! 🎨 Spent the entire evening browsing handmade crafts, watching street performers, and eating my weight in mango sticky rice. The local artists are incredibly talented - picked up some beautiful paintings and silver jewelry. This city has such a creative soul! 🌸",
            likes_count: 22,
            location: { city: 'Chiang Mai', country: 'Thailand' }
          },
          {
            user_id: sampleUsers[3].id,
            content: "Bangkok street food tour was the highlight of my trip! 🔥 From 40-baht Pad Thai that was better than any restaurant to boat noodles that cost 15 baht per bowl. Discovered this hidden gem in Chinatown serving the best Tom Yum I've ever had. My taste buds are still dancing! Pro tip: always eat where the locals eat! 🍲",
            likes_count: 41,
            location: { city: 'Bangkok', country: 'Thailand' }
          },
          {
            user_id: sampleUsers[0].id,
            content: "Took a cooking class in Chiang Mai and learned to make authentic Thai curry from scratch! 👩‍🍳 Started by picking fresh herbs from the garden, then learned the secrets of curry paste. The instructor was amazing and now I can recreate these flavors at home. Already planning my next trip back to learn more recipes! 🌶️",
            likes_count: 19,
            location: { city: 'Chiang Mai', country: 'Thailand' }
          },
          {
            user_id: sampleUsers[1].id,
            content: "Just witnessed the most incredible sunset from a rooftop bar in Bangkok! 🌅 The city lights stretching endlessly, the Chao Phraya River winding through the urban jungle, and the perfect mix of traditional and modern architecture. This city never fails to amaze me. Already booking my next trip! 🏙️✨",
            likes_count: 33,
            location: { city: 'Bangkok', country: 'Thailand' }
          }
        ];

        const { error: postsError } = await supabase.from('posts').insert(samplePosts);
        if (postsError) {
          console.error('Error creating sample posts:', postsError);
        } else {
          console.log('Sample posts created successfully');
        }
      }
    } catch (error) {
      console.error('Error in createSamplePostsIfNeeded:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPost,
        });

      if (!error) {
        setNewPost('');
        refetch();
      } else {
        console.error('Error creating post:', error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-32">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Community</h1>
        <p className="text-gray-600">Share your travel experiences</p>
      </div>

      {/* Create Post */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your travel story..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <button className="flex items-center space-x-1 hover:text-blue-500">
                <Camera className="h-4 w-4" />
                <span>Photo</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-500">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </button>
            </div>
            <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts?.map((post) => (
          <Card key={post.id} className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {post.users.full_name?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {post.users.full_name || 'Anonymous'}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{post.location.city}, {post.location.country}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-800 mb-4">{post.content}</p>
              <div className="flex items-center space-x-6 text-gray-500">
                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span>{post.likes_count}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>Comment</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!posts || posts.length === 0) && (
          <Card className="text-center py-8">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share your travel experience!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
