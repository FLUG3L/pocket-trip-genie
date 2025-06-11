
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, Users, Camera, Bookmark } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  location?: any;
  media_urls?: string[];
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
          media_urls,
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
          },
          { 
            id: '55555555-5555-5555-5555-555555555555', 
            email: 'nina@example.com', 
            full_name: 'Nina Thai',
            preferences: { onboardingCompleted: true }
          },
          { 
            id: '66666666-6666-6666-6666-666666666666', 
            email: 'david@example.com', 
            full_name: 'David Kim',
            preferences: { onboardingCompleted: true }
          },
          { 
            id: '77777777-7777-7777-7777-777777777777', 
            email: 'lisa@example.com', 
            full_name: 'Lisa Park',
            preferences: { onboardingCompleted: true }
          },
          { 
            id: '88888888-8888-8888-8888-888888888888', 
            email: 'james@example.com', 
            full_name: 'James Brown',
            preferences: { onboardingCompleted: true }
          }
        ];

        // Insert sample users
        for (const sampleUser of sampleUsers) {
          await supabase.from('users').upsert(sampleUser, { onConflict: 'id' });
        }

        // Insert sample posts with diverse content and images
        const samplePosts = [
          {
            user_id: sampleUsers[0].id,
            content: "วิวดอยแม่ฮ่องสอน ช่วงฟ้าใสๆ แบบนี้ สวยจนหยุดหายใจ 🌄 เส้นทางขึ้นมาค่อนข้างท้าทาย แต่คุ้มมากกับวิวที่ได้เห็น! อากาศเย็นสบาย มีหมอกบางๆ ลอยอยู่ ทำให้รู้สึกเหมือนอยู่บนสวรรค์เลย ✨",
            likes_count: 127,
            location: { city: 'Pai', state: 'Mae Hong Son', country: 'Thailand' },
            media_urls: ['/lovable-uploads/6228deba-95bf-4212-8117-31ab7eb736f1.png']
          },
          {
            user_id: sampleUsers[1].id,
            content: "เช้านี้ที่วัดพระธาตุดอยสุเทพ 🏛️ บรรยากาศเงียบสงบ แสงแรกของวันส่องผ่านต้นไผ่ สวยงามมาก นักท่องเที่ยวยังไม่มาเยอะ เลยได้ภาพสวยๆ แบบนี้มา การมาเวลาเช้าๆ ก่อน 7 โมง คุ้มมากจริงๆ!",
            likes_count: 89,
            location: { city: 'Chiang Mai', country: 'Thailand' },
            media_urls: []
          },
          {
            user_id: sampleUsers[2].id,
            content: "กิน Tom Yum ที่ดีที่สุดในชีวิต!! 🍲🔥 ร้านเล็กๆ ในตรอกย่านเยาวราช รสชาติเข้มข้น เปรี้ยว เผ็ด จัดจ้าน ตรงใจคนไทยแท้ๆ เจ้าของร้านใจดีมาก เล่าประวัติของสูตรที่สืบทอดมา 3 รุ่น 60 บาทเท่านั้น แต่อร่อยกว่าโรงแรม 5 ดาวเยอะ!",
            likes_count: 156,
            location: { city: 'Bangkok', country: 'Thailand' },
            media_urls: []
          },
          {
            user_id: sampleUsers[3].id,
            content: "จังหวัดกระบี่ สวยจนต้องมาอีก! 🏖️ หาดไร่เลย์ น้ำใสใกล้จะใส ปลาเยอะมาก ดำน้ำดูปะการังสวยงาม โขดหินปูนที่น่าอัศจรรย์ และที่สำคัญ คนท้องถิ่นเป็นมิตรมาก ช่วยเหลือกันดี ตอนนี้กำลังวางแผนจะกลับมาใน 6 เดือน!",
            likes_count: 203,
            location: { city: 'Krabi', country: 'Thailand' },
            media_urls: []
          },
          {
            user_id: sampleUsers[4].id,
            content: "สนุกมากกับการทำอาหารไทยที่เชียงใหม่! 👩‍🍳 เรียนทำแกงเขียวหวาน ต้มยำกุ้ง และข้าวเหนียวมะม่วง เริ่มจากการเด็ดผักสมุนไพรเองจากสวน จนถึงการปรุงรสให้ได้รสชาติที่แท้จริง คุณครูสอนดีมาก อธิบายวิธีและเคล็ดลับที่ทำให้อาหารอร่อย 🌶️🥭",
            likes_count: 94,
            location: { city: 'Chiang Mai', country: 'Thailand' },
            media_urls: []
          },
          {
            user_id: sampleUsers[5].id,
            content: "เกาะสมุยช่วงนี้สวยมาก! 🌴 หาดละไมเงียบสงบ น้ำทะเลใส ลมเซาะ สายลมเย็นสบาย นั่งดื่มน้ำมะพร้าวเย็นๆ ดูพระอาทิตย์ตก บรรยากาศแบบนี้ทำให้ลืมความวุ่นวายในเมืองใหญ่ ธรรมชาติยังสวยงามมาก ไม่มีการพัฒนาเกินไป",
            likes_count: 178,
            location: { city: 'Koh Samui', state: 'Surat Thani', country: 'Thailand' },
            media_urls: []
          },
          {
            user_id: sampleUsers[6].id,
            content: "ถนนข้าวสาร ย่านเก่าของกรุงเทพ 🏛️ เดินเล่นย้อนยุคในตรอกเล็กๆ เจอร้านขายของเก่า ร้านอาหารประจำท้องถิ่น และผู้คนที่อัธยาศัยดี การมาเที่ยวแบบนี้ทำให้เข้าใจวิถีชีวิตของคนกรุงเทพได้มากกว่าเดินเซ็นเตอร์ มีเสน่ห์แบบที่ไม่เหมือนใคร 🚶‍♀️",
            likes_count: 67,
            location: { city: 'Bangkok', country: 'Thailand' },
            media_urls: []
          },
          {
            user_id: sampleUsers[7].id,
            content: "อุทยานแห่งชาติเขาใหญ่ ประสบการณ์ที่ไม่ลืม! 🦌 เจอสัตว์ป่าเยอะมาก เสียงนกร้องเพราะ อากาศเย็นสบาย และที่ประทับใจที่สุดคือเจอครอบครัวลิงแสมที่เล่นกันอย่างสนุกสนาน ป่าไผ่สวยงาม น้ำตกใส ธรรมชาติสมบูรณ์มาก ใครชอบธรรมชาติต้องมา! 🌿",
            likes_count: 142,
            location: { city: 'Khao Yai', state: 'Nakhon Ratchasima', country: 'Thailand' },
            media_urls: []
          },
          {
            user_id: sampleUsers[0].id,
            content: "ตลาดน้ำดำเนินสะดวก วัฒนธรรมไทยแท้ๆ! 🛶 ขึ้นเรือหางยาวเที่ยวชมวิถีชีวิตริมคลอง ซื้อผลไม้สดจากแม่ค้าบนเรือ กิน ข้าวเหนียวมะม่วง แกงส้มปลาช่อน รสชาติดั้งเดิม บรรยากาศดีมาก คนไทยและต่างชาติมาเที่ยวพร้อมกัน บรรยากาศอบอุ่น",
            likes_count: 188,
            location: { city: 'Ratchaburi', country: 'Thailand' },
            media_urls: []
          },
          {
            user_id: sampleUsers[1].id,
            content: "ช่วงพระอาทิตย์ตกที่เขาตะเกียบ ประจวบคีรีขันธ์ 🌅 สีฟ้าทะเลผสมกับสีแสงแดดส้ม สวยงามมาก ลิงมาเล่นใกล้ๆ ไม่ดุ แต่ระวังของกิน อุณหภูมิเย็นสบาย ลมทะเลพัดเบาๆ จุดชมวิวนี้ไม่แพง แต่ได้ประสบการณ์มีค่ามาก วิวมหาสมุทรสวยจริงๆ",
            likes_count: 134,
            location: { city: 'Prachuap Khiri Khan', country: 'Thailand' },
            media_urls: []
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
          <Card key={post.id} className="bg-white overflow-hidden">
            {/* Post Image */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="relative">
                <img 
                  src={post.media_urls[0]} 
                  alt="Post image"
                  className="w-full h-64 object-cover"
                />
                <button className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/30 transition-colors">
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>
            )}
            
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
                          <span>
                            {post.location.city}
                            {post.location.state && `, ${post.location.state}`}
                            {post.location.country && `, ${post.location.country}`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between text-gray-500">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                    <span className="font-medium">{post.likes_count}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>212</span>
                  </button>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Bookmark className="h-5 w-5" />
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
