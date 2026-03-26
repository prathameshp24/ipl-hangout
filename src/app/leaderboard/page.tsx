'use client';

import { useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  username: string;
  totalPoints: number;
  predictionsCount: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Load username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('ipl_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏆</div>
          <div className="text-xl text-gray-600">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-gray-600">Top predictors competing for glory!</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium underline"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Empty State */}
      {leaderboard.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 font-medium">No predictions yet.</p>
        </div>
      )}

      {/* Leaderboard List */}
      {leaderboard.length > 0 && (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = username === entry.username;
            return (
              <div
                key={entry.username}
                className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${
                  isCurrentUser
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-transparent'
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  {/* Rank */}
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold w-12 text-center ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-amber-600' :
                      'text-gray-600'
                    }`}>
                      {getRankEmoji(index)}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <div className={`font-semibold text-lg ${
                        isCurrentUser ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {entry.username}
                        {isCurrentUser && <span className="ml-2 text-sm">(You)</span>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.predictionsCount} prediction{entry.predictionsCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {entry.totalPoints}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>

                {/* Progress Bar */}
                {leaderboard.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                          index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                          'bg-gradient-to-r from-blue-400 to-blue-500'
                        }`}
                        style={{
                          width: `${leaderboard[0]?.totalPoints 
                            ? (entry.totalPoints / leaderboard[0].totalPoints) * 100 
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Your Stats */}
      {username && !leaderboard.find(e => e.username === username) && (
        <div className="mt-8 p-6 bg-gray-100 rounded-xl text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-600">
            Hey <span className="font-semibold">{username}</span>, start predicting to get on the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
}
