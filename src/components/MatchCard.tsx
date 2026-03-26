'use client';

import { useState } from 'react';

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

interface MatchCardProps {
  match: Match;
  username: string | null;
  onPredict: (matchId: string, team: 'A' | 'B') => Promise<void>;
}

export default function MatchCard({ match, username, onPredict }: MatchCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userPrediction = match.predictions.find((p) => p.username === username);
  const isPredictionClosed = new Date() > new Date(match.startTime);
  const hasResult = match.winner !== null;

  const handlePredict = async () => {
    if (!selectedTeam || !username) return;

    setLoading(true);
    setError(null);

    try {
      await onPredict(match.id, selectedTeam);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit prediction');
    } finally {
      setLoading(false);
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

  const getWinnerTeamName = () => {
    if (!match.winner) return null;
    return match.winner === 'A' ? match.teamA : match.teamB;
  };

  const isPredictionCorrect = userPrediction && hasResult && userPrediction.predictedTeam === match.winner;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Match Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3">
        <div className="flex items-center justify-between text-white text-sm">
          <span className="flex items-center">
            <span className="mr-2">📅</span>
            {formatTime(match.startTime)}
          </span>
          {hasResult && (
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              RESULT
            </span>
          )}
          {isPredictionClosed && !hasResult && (
            <span className="bg-red-400 text-white px-2 py-1 rounded-full text-xs font-bold">
              CLOSED
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Team A */}
          <button
            onClick={() => !userPrediction && !isPredictionClosed && setSelectedTeam('A')}
            disabled={!!userPrediction || isPredictionClosed}
            className={`flex-1 py-3 px-2 rounded-lg text-center transition-all ${
              selectedTeam === 'A'
                ? 'bg-blue-600 text-white scale-105'
                : userPrediction?.predictedTeam === 'A'
                ? hasResult && isPredictionCorrect
                  ? 'bg-green-500 text-white'
                  : 'bg-red-400 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            } ${(!userPrediction && !isPredictionClosed) ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
          >
            <div className="font-semibold text-sm sm:text-base">{match.teamA}</div>
            {userPrediction?.predictedTeam === 'A' && (
              <div className="text-xs mt-1">Your Pick</div>
            )}
          </button>

          {/* VS */}
          <div className="px-4 flex flex-col items-center">
            <span className="text-gray-400 font-bold text-sm">VS</span>
            {hasResult && (
              <div className="text-xs text-green-600 font-semibold mt-1">
                🏆 {getWinnerTeamName()}
              </div>
            )}
          </div>

          {/* Team B */}
          <button
            onClick={() => !userPrediction && !isPredictionClosed && setSelectedTeam('B')}
            disabled={!!userPrediction || isPredictionClosed}
            className={`flex-1 py-3 px-2 rounded-lg text-center transition-all ${
              selectedTeam === 'B'
                ? 'bg-blue-600 text-white scale-105'
                : userPrediction?.predictedTeam === 'B'
                ? hasResult && isPredictionCorrect
                  ? 'bg-green-500 text-white'
                  : 'bg-red-400 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            } ${(!userPrediction && !isPredictionClosed) ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
          >
            <div className="font-semibold text-sm sm:text-base">{match.teamB}</div>
            {userPrediction?.predictedTeam === 'B' && (
              <div className="text-xs mt-1">Your Pick</div>
            )}
          </button>
        </div>

        {/* Prediction Status */}
        {userPrediction && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            isPredictionCorrect 
              ? 'bg-green-100 text-green-800' 
              : hasResult 
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
          }`}>
            {isPredictionCorrect ? (
              <div className="font-semibold">✅ Correct! +10 points</div>
            ) : hasResult ? (
              <div className="font-semibold">❌ Wrong prediction</div>
            ) : (
              <div className="font-semibold">
                🔮 Predicted: {userPrediction.predictedTeam === 'A' ? match.teamA : match.teamB}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {!userPrediction && !isPredictionClosed && (
          <div className="mt-4">
            {error && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm text-center">
                ✅ Prediction submitted!
              </div>
            )}
            <button
              onClick={handlePredict}
              disabled={!selectedTeam || loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                selectedTeam && !loading
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Prediction'}
            </button>
          </div>
        )}

        {/* Closed Message */}
        {!userPrediction && isPredictionClosed && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center text-gray-600">
            🔒 Predictions closed for this match
          </div>
        )}

        {/* Prediction Count */}
        <div className="mt-3 text-center text-sm text-gray-500">
          {match.predictions.length} prediction{match.predictions.length !== 1 ? 's' : ''} made
        </div>
      </div>
    </div>
  );
}
