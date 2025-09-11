import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { FileText, Award, TrendingUp, Users } from 'lucide-react';

const ResumeAnalytics = ({ dateRange = 30 }) => {
  const [resumeStats, setResumeStats] = useState({
    totalAnalyzed: 0,
    averageScore: 0,
    totalUploaded: 0,
    completionRate: 0,
    scoreDistribution: {},
    industryBreakdown: {},
    trendData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumeStats();
  }, [dateRange]);

  const fetchResumeStats = async () => {
    try {
      setLoading(true);

      // Fetch all profiles with resume data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const totalUploaded = profiles.filter(p => p.resume_url).length;
      const analyzedProfiles = profiles.filter(p => p.ats_score !== null);
      const totalAnalyzed = analyzedProfiles.length;
      
      // Calculate average score
      const averageScore = totalAnalyzed > 0 
        ? analyzedProfiles.reduce((sum, p) => sum + p.ats_score, 0) / totalAnalyzed 
        : 0;

      // Calculate completion rate
      const completionRate = totalUploaded > 0 ? (totalAnalyzed / totalUploaded) * 100 : 0;

      // Score distribution
      const scoreRanges = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
      };

      analyzedProfiles.forEach(profile => {
        const score = profile.ats_score;
        if (score <= 20) scoreRanges['0-20']++;
        else if (score <= 40) scoreRanges['21-40']++;
        else if (score <= 60) scoreRanges['41-60']++;
        else if (score <= 80) scoreRanges['61-80']++;
        else scoreRanges['81-100']++;
      });

      // Industry breakdown
      const industryStats = profiles
        .filter(p => p.industry && p.ats_score !== null)
        .reduce((acc, profile) => {
          if (!acc[profile.industry]) {
            acc[profile.industry] = { count: 0, totalScore: 0 };
          }
          acc[profile.industry].count++;
          acc[profile.industry].totalScore += profile.ats_score;
          return acc;
        }, {});

      const industryBreakdown = Object.entries(industryStats).map(([industry, stats]) => ({
        industry,
        count: stats.count,
        avgScore: Math.round(stats.totalScore / stats.count)
      })).sort((a, b) => b.count - a.count);

      // Trend data (daily analysis count)
      const trendData = [];
      for (let i = dateRange - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayAnalyses = profiles.filter(p => 
          p.ats_score !== null && 
          p.updated_at && 
          p.updated_at.startsWith(dateStr)
        ).length;

        trendData.push({
          date: dateStr,
          analyses: dayAnalyses
        });
      }

      setResumeStats({
        totalAnalyzed,
        averageScore: Math.round(averageScore * 10) / 10,
        totalUploaded,
        completionRate: Math.round(completionRate),
        scoreDistribution: scoreRanges,
        industryBreakdown,
        trendData
      });

    } catch (error) {
      console.error('Error fetching resume stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const maxAnalyses = Math.max(...resumeStats.trendData.map(d => d.analyses));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Resume Analytics</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{resumeStats.totalAnalyzed}</p>
                <p className="text-sm text-gray-600">Analyzed</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-600">{resumeStats.averageScore}</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{resumeStats.totalUploaded}</p>
                <p className="text-sm text-gray-600">Uploaded</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{resumeStats.completionRate}%</p>
                <p className="text-sm text-gray-600">Completion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Trend */}
        {resumeStats.trendData.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Daily Analysis Trend</h4>
            <div className="h-32 flex items-end space-x-1 bg-gray-50 p-4 rounded-lg">
              {resumeStats.trendData.slice(-14).map((day, index) => (
                <div className="flex-1 flex flex-col items-center" key={index}>
                  <div
                    className="bg-blue-500 rounded-t w-full min-h-[4px]"
                    style={{
                      height: `${Math.max((day.analyses / (maxAnalyses || 1)) * 100, 3)}%`
                    }}
                    title={`${day.date}: ${day.analyses} analyses`}
                  />
                  <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Score Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h4>
        <div className="space-y-3">
          {Object.entries(resumeStats.scoreDistribution).map(([range, count]) => (
            <div key={range} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 text-sm font-medium text-gray-600">{range}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${resumeStats.totalAnalyzed > 0 ? (count / resumeStats.totalAnalyzed) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Top Industries</h4>
        <div className="space-y-3">
          {resumeStats.industryBreakdown.slice(0, 8).map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium text-gray-700">{item.industry}</p>
                <p className="text-xs text-gray-500">{item.count} resumes</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">Score: {item.avgScore}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-semibold text-green-800 mb-2">High Performers</h5>
            <p className="text-sm text-green-700">
              {resumeStats.scoreDistribution['81-100']} resumes ({((resumeStats.scoreDistribution['81-100'] / (resumeStats.totalAnalyzed || 1)) * 100).toFixed(1)}%) scored 81-100
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h5 className="font-semibold text-yellow-800 mb-2">Needs Improvement</h5>
            <p className="text-sm text-yellow-700">
              {resumeStats.scoreDistribution['0-20'] + resumeStats.scoreDistribution['21-40']} resumes ({(((resumeStats.scoreDistribution['0-20'] + resumeStats.scoreDistribution['21-40']) / (resumeStats.totalAnalyzed || 1)) * 100).toFixed(1)}%) scored below 40
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalytics;