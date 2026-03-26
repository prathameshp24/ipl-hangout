'use client';

import { useState, useEffect } from 'react';

interface UsernameModalProps {
  onSubmit: (username: string) => void;
}

export default function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('ipl_username');
    if (!storedUsername) {
      setIsVisible(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 2) return;

    localStorage.setItem('ipl_username', username.trim());
    onSubmit(username.trim());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🏏</div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to IPL Predictor!</h2>
          <p className="text-gray-600 mt-2">Enter your name to start predicting</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name or nickname"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
            autoFocus
            minLength={2}
            maxLength={20}
          />
          <button
            type="submit"
            disabled={username.trim().length < 2}
            className={`w-full mt-4 py-3 rounded-xl font-semibold text-lg transition-all ${
              username.trim().length >= 2
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Predicting 🚀
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Your name will be stored locally and used for the leaderboard
        </p>
      </div>
    </div>
  );
}
