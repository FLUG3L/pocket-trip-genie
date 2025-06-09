
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
      // First, ensure we have some sample data
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
    // Check if we have posts
    const { data: existingPosts } = await supabase
      .from('posts')
      .select('id')
      .limit(1);

    if (!existingPosts || existingPosts.length === 0) {
      // Create sample users and posts
      const sampleUsers = [
        { id: '123e4567-e89b-12d3-a456-426614174001', email: 'sarah@example.com', full_name: 'Sarah Chen' },
        { id: '123e4567-e89b-12d3-a456-426614174002', email: 'mike@example.com', full_name: 'Mike Johnson' },
        { id: '123e4567-e89b-12d3-a456-426614174003', email: 'emma@example.com', full_name: 'Emma Wilson' }
      ];

      // Insert sample users
      for (const sampleUser of sampleUsers) {
        await supabase.from('users').upsert(sampleUser);
      }

      // Insert sample posts
      const samplePosts = [
        {
          user_id: sampleUsers[0].id,
          content: "Just arrived in Tokyo! The cherry blossoms are absolutely stunning this time of year. Can't wait to explore all the amazing temples and try some authentic ramen! 🌸🍜",
          likes_count: 15,
          location: { city: 'Tokyo', country: 'Japan' }
        },
        {
          user_id: sampleUsers[1].id,
          content: "Amazing sunset view from Santorini! Nothing beats the Greek islands for a romantic getaway. The blue and white architecture is just breathtaking. Highly recommend! 🌅🏛️",
          likes_count: 23,
          location: { city: 'Santorini', country: 'Greece' }
        },
        {
          user_id: sampleUsers[2].id,
          content: "Street food tour in Bangkok was incredible! Tried pad thai from a local vendor and it was the best I've ever had. The flavors here are out of this world! 🥢🌶️",
          likes_count: 18,
          location: { city: 'Bangkok', country: 'Thailand' }
        },
        {
          user_id: sampleUsers[0].id,
          content: "Hiking the Inca Trail to Machu Picchu was challenging but so worth it! The views are absolutely magnificent. This is definitely a bucket list destination! 🏔️⛰️",
          likes_count: 31,
          location: { city: 'Cusco', country: 'Peru' }
        },
        {
          user_id: sampleUsers[1].id,
          content: "Paris is always a good idea! Spent the afternoon at the Louvre and evening by the Seine. The city of lights never disappoints. Already planning my next visit! 🗼✨",
          likes_count: 12,
          location: { city: 'Paris', country: 'France' }
        }
      ];

      await supabase.from('posts').insert(samplePosts);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: newPost,
      });

    if (!error) {
      setNewPost('');
      refetch();
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

        {posts?.length === 0 && (
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
