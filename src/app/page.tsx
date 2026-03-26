'use client';

import { useState, useEffect, useCallback } from 'react';
import MatchCard from '@/components/MatchCard';
import UsernameModal from '@/components/UsernameModal';

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  startTime: string;
  winner: string | null;
  predictions: Array<{
    username: string;
    predictedTeam: string;
  }>;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('ipl_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Fetch matches
  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch('/api/matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      setMatches(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Handle prediction
  const handlePredict = async (matchId: string, team: 'A' | 'B') => {
    if (!username) {
      throw new Error('Please enter your username first');
    }

    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        matchId,
        predictedTeam: team,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit prediction');
    }

    // Refresh matches to show updated prediction
    await fetchMatches();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏏</div>
          <div className="text-xl text-gray-600">Loading matches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <UsernameModal onSubmit={() => fetchMatches()} />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          🏆 IPL 2026 Predictions
        </h1>
        <p className="text-gray-600">
          {username ? (
            <span>Good luck, <span className="font-semibold text-blue-600">{username}</span>! 🍀</span>
          ) : (
            'Enter your name to start predicting'
          )}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-center">
          {error}
          <button
            onClick={fetchMatches}
            className="ml-2 underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Matches Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            username={username}
            onPredict={handlePredict}
          />
        ))}
      </div>

      {matches.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-600">No matches available. Ask admin to add matches.</p>
        </div>
      )}
    </div>
  );
}
