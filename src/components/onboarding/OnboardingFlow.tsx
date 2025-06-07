import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const TRAVEL_STYLES = [
  { id: 'nature', label: 'Nature & Adventure', emoji: '🏔️' },
  { id: 'food', label: 'Food & Culture', emoji: '🍜' },
  { id: 'city', label: 'City & Urban', emoji: '🏙️' },
  { id: 'chill', label: 'Relaxation', emoji: '🏖️' },
  { id: 'history', label: 'History & Museums', emoji: '🏛️' },
  { id: 'nightlife', label: 'Nightlife & Entertainment', emoji: '🎭' },
];

const BUDGET_RANGES = [
  { value: 1000, label: 'Budget (Under ฿1,000/day)' },
  { value: 2500, label: 'Mid-range (฿1,000-2,500/day)' },
  { value: 5000, label: 'Premium (฿2,500-5,000/day)' },
  { value: 10000, label: 'Luxury (฿5,000+/day)' },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState([2500]);
  const [tripDuration, setTripDuration] = useState([3]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const preferences = {
        travelStyles: selectedStyles,
        budgetRange: budgetRange[0],
        preferredTripDuration: tripDuration[0],
        onboardingCompleted: true,
      };

      const { error } = await supabase
        .from('users')
        .update({ preferences })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Welcome to PocketTrip!",
        description: "Your preferences have been saved. Let's start exploring!",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">What's your travel style?</CardTitle>
          <p className="text-muted-foreground">Select all that interest you</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {TRAVEL_STYLES.map((style) => (
              <Button
                key={style.id}
                variant={selectedStyles.includes(style.id) ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center"
                onClick={() => toggleStyle(style.id)}
              >
                <span className="text-2xl mb-1">{style.emoji}</span>
                <span className="text-sm">{style.label}</span>
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => setStep(2)} 
            className="w-full"
            disabled={selectedStyles.length === 0}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Budget Preference</CardTitle>
          <p className="text-muted-foreground">What's your typical daily budget?</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">
                Daily Budget: ฿{budgetRange[0].toLocaleString()}
              </Label>
              <Slider
                value={budgetRange}
                onValueChange={setBudgetRange}
                max={10000}
                min={500}
                step={250}
                className="mt-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Budget</span>
                <span>Luxury</span>
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-medium">
                Preferred Trip Duration: {tripDuration[0]} days
              </Label>
              <Slider
                value={tripDuration}
                onValueChange={setTripDuration}
                max={14}
                min={1}
                step={1}
                className="mt-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Day trips</span>
                <span>Extended stays</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button onClick={handleComplete} className="flex-1" disabled={loading}>
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
