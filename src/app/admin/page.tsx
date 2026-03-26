'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  startTime: string;
  winner: string | null;
}

interface BanterResult {
  banter: string;
  isCorrect: boolean;
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [banners, setBanners] = useState<Record<string, BanterResult>>({});
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Create match form state
  const [newTeamA, setNewTeamA] = useState('');
  const [newTeamB, setNewTeamB] = useState('');
  const [newStartTime, setNewStartTime] = useState('');

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

  // Set winner
  const handleSetWinner = async (matchId: string, winner: string | null) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, winner }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update result');
      }

      setSuccess(data.message);
      await fetchMatches();

      // Fetch banters for all predictions of this match
      if (winner) {
        await fetchBanters(matchId, winner);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch banters for predictions
  const fetchBanters = async (matchId: string, winner: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      // Get all predictions for this match
      const predictionsResponse = await fetch(`/api/predictions?username=all`);
      // We need to fetch banters differently - let's just show a sample
      // In a real app, we'd have a dedicated endpoint for this
      
      // For now, generate sample banters
      const sampleBanters: Record<string, BanterResult> = {};
      
      if (winner === 'A') {
        sampleBanters[`${matchId}-A`] = {
          banter: '🏆 Legend! You called it like a true cricket genius!',
          isCorrect: true,
        };
        sampleBanters[`${matchId}-B`] = {
          banter: '😅 Oops! Maybe stick to watching, not predicting?',
          isCorrect: false,
        };
      } else {
        sampleBanters[`${matchId}-A`] = {
          banter: '😅 Oops! Maybe stick to watching, not predicting?',
          isCorrect: false,
        };
        sampleBanters[`${matchId}-B`] = {
          banter: '🏆 Legend! You called it like a true cricket genius!',
          isCorrect: true,
        };
      }
      
      setBanners(prev => ({ ...prev, ...sampleBanters }));
    } catch (err) {
      console.error('Failed to fetch banters:', err);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamA || !newTeamB || !newStartTime) return;
    try {
      setLoading(true);
      const response = await fetch('/api/admin/create-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamA: newTeamA, teamB: newTeamB, startTime: newStartTime }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create match');
      setSuccess(data.message);
      setNewTeamA('');
      setNewTeamB('');
      setNewStartTime('');
      fetchMatches();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!window.confirm('Are you sure you want to delete this match? All predictions will be lost.')) return;
    try {
      const response = await fetch('/api/admin/delete-match', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete match');
      setSuccess(data.message);
      fetchMatches();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚙️</div>
          <div className="text-xl text-gray-600">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            ⚙️ Admin Panel
          </h1>
          <p className="text-gray-600">Set match winners and update points</p>
          <button
            onClick={fetchMatches}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium underline inline-flex items-center"
          >
            🔄 Refresh
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl text-center">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Warning */}
      <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-xl">
        <strong>⚠️ Admin Action:</strong> Setting a winner will automatically calculate +10 points for correct predictions.
      </div>

      {/* Add Match Form */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">➕ Add New Match</h2>
        <form onSubmit={handleCreateMatch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Team A"
            value={newTeamA}
            onChange={(e) => setNewTeamA(e.target.value)}
            required
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Team B"
            value={newTeamB}
            onChange={(e) => setNewTeamB(e.target.value)}
            required
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="datetime-local"
            value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
            required
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Add Match
          </button>
        </form>
      </div>

      {/* Empty State */}
      {matches.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600 font-medium">No matches created yet.</p>
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            {/* Match Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-3">
              <div className="flex items-center justify-between text-white text-sm">
                <span>{formatTime(match.startTime)}</span>
                <div className="flex items-center space-x-3">
                  {match.winner && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      RESULT SET
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteMatch(match.id)}
                    className="text-red-300 hover:text-red-100 transition-colors"
                    title="Delete Match"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            {/* Match Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 text-center">
                  <div className="font-semibold text-lg">{match.teamA}</div>
                  <div className="text-sm text-gray-500">Team A</div>
                </div>
                <div className="px-4 text-gray-400 font-bold">VS</div>
                <div className="flex-1 text-center">
                  <div className="font-semibold text-lg">{match.teamB}</div>
                  <div className="text-sm text-gray-500">Team B</div>
                </div>
              </div>

              {/* Winner Selection */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSetWinner(match.id, 'A')}
                  disabled={match.winner === 'A'}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    match.winner === 'A'
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {match.winner === 'A' ? '✓ Winner' : `${match.teamA} Won`}
                </button>
                <button
                  onClick={() => handleSetWinner(match.id, 'B')}
                  disabled={match.winner === 'B'}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    match.winner === 'B'
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {match.winner === 'B' ? '✓ Winner' : `${match.teamB} Won`}
                </button>
                {match.winner && (
                  <button
                    onClick={() => handleSetWinner(match.id, null)}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Banter Preview */}
              {match.winner && banners[`${match.id}-${match.winner}`] && (
                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <div className="text-sm font-semibold text-purple-800 mb-1">
                    🎭 Sample Banter:
                  </div>
                  <div className="text-purple-700 italic">
                    {banners[`${match.id}-${match.winner}`].banter}
                  </div>
                </div>
              )}

              {/* Current Status */}
              {match.winner && (
                <div className="mt-3 text-center text-sm text-gray-600">
                  Winner: <span className="font-semibold text-green-600">
                    {match.winner === 'A' ? match.teamA : match.teamB}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
