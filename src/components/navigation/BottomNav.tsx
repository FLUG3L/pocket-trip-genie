
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Compass, Map, ShoppingBag, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Community', icon: Home, emoji: '👥' },
    { id: 'recommend', label: 'Discover', icon: Compass, emoji: '🧭' },
    { id: 'plan', label: 'Plan', icon: Map, emoji: '🗺️' },
    { id: 'bookings', label: 'Bookings', icon: ShoppingBag, emoji: '🛒' },
    { id: 'profile', label: 'Profile', icon: User, emoji: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              isActive ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
            <span className="text-xs">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
