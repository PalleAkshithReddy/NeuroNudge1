import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Brain, Heart, Clock, Star, Upload } from 'lucide-react';

export type Achievement = {
  icon: any;
  title: string;
  description: string;
  earned: boolean;
  color: string;
  image?: string; // For user-uploaded badges
};

export const ProgressBadges = () => {
  const [badges, setBadges] = useState<Achievement[]>([]);
  const [stats, setStats] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Simulate fetching achievements and stats
  useEffect(() => {
    // Replace with real API calls
    fetch('/api/user/achievements')
      .then(res => res.json())
      .then(data => setBadges(data.badges));
    fetch('/api/user/stats')
      .then(res => res.json())
      .then(data => setStats(data.stats));
  }, []);

  // Simulate course completion event
  const handleCourseComplete = (courseTitle: string) => {
    setBadges(prev =>
      prev.map(b =>
        b.title === courseTitle ? { ...b, earned: true } : b
      )
    );
    // Optionally send update to backend
    // fetch('/api/user/achievements', { method: 'POST', body: ... })
  };

  // Handle badge image upload
  const handleBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>, badgeIdx: number) => {
    setUploading(true);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBadges(prev =>
          prev.map((b, idx) =>
            idx === badgeIdx ? { ...b, image: reader.result as string } : b
          )
        );
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Stats</h3>
        <div className="space-y-3">
          {stats.length === 0 ? (
            <div className="text-gray-400">Loading stats...</div>
          ) : (
            stats.map((stat: any) => (
              <div key={stat.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{stat.label}</span>
                <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Achievement Badges */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
        <div className="space-y-4">
          {badges.length === 0 ? (
            <div className="text-gray-400">Loading achievements...</div>
          ) : (
            badges.map((badge, idx) => (
              <div
                key={badge.title}
                className={`p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 ${
                  badge.earned
                    ? `bg-gradient-to-r ${badge.color} text-white shadow-lg animate-pulse`
                    : 'bg-gray-100/50 text-gray-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  badge.earned ? 'bg-white/20' : 'bg-gray-300'
                }`}>
                  {badge.image ? (
                    <img src={badge.image} alt="badge" className="w-8 h-8 rounded-full" />
                  ) : (
                    <badge.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{badge.title}</h4>
                  <p className={`text-xs ${badge.earned ? 'text-white/80' : 'text-gray-500'}`}>
                    {badge.description}
                  </p>
                </div>
                {badge.earned && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    Earned
                  </Badge>
                )}
                {/* Upload badge image */}
                {badge.earned && (
                  <label className="ml-2 cursor-pointer flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleBadgeUpload(e, idx)}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Weekly Goal */}
      <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Weekly Goal</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Study Hours</span>
            <span className="font-semibold">12 / 20 hrs</span>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 w-3/5 animate-progress"></div>
          </div>
          <p className="text-xs text-blue-100">8 hours to go this week!</p>
        </div>
      </Card>
    </div>
  );
};