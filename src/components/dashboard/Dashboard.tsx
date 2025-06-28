
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, Target, Clock, Star, TrendingUp, Calendar } from 'lucide-react';

interface UserStats {
  total_cards: number;
  cards_mastered: number;
  current_streak: number;
  longest_streak: number;
  total_study_time_minutes: number;
  points: number;
  level: number;
  last_study_date: string;
}

interface StudySession {
  id: string;
  total_cards: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy_percentage: number;
  duration_minutes: number;
  session_date: string;
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        // Load user stats
        const { data: userStats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setStats(userStats);

        // Load recent study sessions
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('session_date', { ascending: false })
          .limit(7);

        setRecentSessions(sessions || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  const chartConfig = {
    accuracy: {
      label: "Accuracy %",
      color: "#2563EB",
    },
    duration: {
      label: "Duration (min)",
      color: "#10B981",
    },
  };

  const chartData = recentSessions.map((session, index) => ({
    session: `Session ${recentSessions.length - index}`,
    accuracy: Math.round(session.accuracy_percentage || 0),
    duration: session.duration_minutes || 0,
  }));

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Header */}
      <div className="bg-[#1C2541] border-b border-[#2563EB]/20 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-[#93A5CF] mt-1">Welcome back, {user?.email}</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-[#2563EB]/30"
            >
              Back to App
            </Button>
            <Button onClick={signOut} variant="outline" className="border-red-500/30 text-red-400">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1C2541] border-[#2563EB]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#93A5CF]">Total Cards</CardTitle>
              <Target className="h-4 w-4 text-[#2563EB]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_cards || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1C2541] border-[#2563EB]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#93A5CF]">Current Streak</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
              <p className="text-xs text-[#93A5CF]">
                Best: {stats?.longest_streak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1C2541] border-[#2563EB]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#93A5CF]">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats?.total_study_time_minutes || 0) / 60)}h
              </div>
              <p className="text-xs text-[#93A5CF]">
                {stats?.total_study_time_minutes || 0} minutes total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1C2541] border-[#2563EB]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#93A5CF]">Level</CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {stats?.level || 1}</div>
              <p className="text-xs text-[#93A5CF]">
                {stats?.points || 0} points
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#1C2541] border-[#2563EB]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Performance
              </CardTitle>
              <CardDescription className="text-[#93A5CF]">
                Your accuracy over the last 7 sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="session" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#2563EB" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="text-center text-[#93A5CF] py-8">
                  No study sessions yet. Start practicing to see your progress!
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1C2541] border-[#2563EB]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Study Duration
              </CardTitle>
              <CardDescription className="text-[#93A5CF]">
                Time spent in recent sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="session" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="duration" fill="#10B981" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="text-center text-[#93A5CF] py-8">
                  No study sessions yet. Start practicing to see your progress!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="bg-[#1C2541] border-[#2563EB]/20">
          <CardHeader>
            <CardTitle>Recent Study Sessions</CardTitle>
            <CardDescription className="text-[#93A5CF]">
              Your latest practice sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-[#0A0E27] rounded-lg">
                    <div>
                      <p className="font-medium">
                        {session.correct_answers}/{session.total_cards} correct
                      </p>
                      <p className="text-sm text-[#93A5CF]">
                        {new Date(session.session_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#2563EB]">
                        {Math.round(session.accuracy_percentage || 0)}%
                      </p>
                      <p className="text-sm text-[#93A5CF]">
                        {session.duration_minutes}min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-[#93A5CF] py-8">
                No study sessions yet. Start practicing to see your history!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
