import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (will be undefined if no API key)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Banter templates as fallback
const positiveBanter = [
  "🏆 Legend! You called it like a true cricket genius!",
  "🔥 What a prediction! Are you secretly Dhoni in disguise?",
  "✨ Crystal ball much? Your prediction skills are insane!",
  "🎯 Bullseye! You deserve a commentator's job!",
  "👑 King/Queen of predictions! The IPL trophy has your name on it!",
  "🚀 Out of this world prediction! NASA wants to hire you!",
  "💎 Pure gold! Your cricket intuition is unmatched!",
  "⚡ Lightning fast brain! Commentators are taking notes!",
];

const negativeBanter = [
  "😅 Oops! Maybe stick to watching, not predicting?",
  "🤡 Clown behavior! Even a coin flip would've done better!",
  "💀 Your prediction died faster than a T20 powerplay collapse!",
  "🙈 Blindfolded monkeys would've predicted better!",
  "📉 Your prediction accuracy is lower than a team chasing 200!",
  "🗑️ Trash talk to your predictions, they deserved it!",
  "😭 Crying in the club! Better luck next match!",
  "🪨 Even a stone would've predicted better than you!",
];

function getRandomBanter(type: 'positive' | 'negative'): string {
  const banter = type === 'positive' ? positiveBanter : negativeBanter;
  return banter[Math.floor(Math.random() * banter.length)];
}

// POST /api/banter - Generate banter for a prediction result
export async function POST(request: Request) {
  try {
    const { predictedTeam, actualWinner, teamA, teamB } = await request.json();

    if (!predictedTeam || !actualWinner || !teamA || !teamB) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isCorrect = predictedTeam === actualWinner;
    const predictedTeamName = predictedTeam === 'A' ? teamA : teamB;
    const winnerTeamName = actualWinner === 'A' ? teamA : teamB;

    // Try OpenAI if available, otherwise use fallback
    if (openai) {
      try {
        const prompt = isCorrect
          ? `Generate a short, funny, positive cricket banter line (max 15 words) for a fan who correctly predicted ${predictedTeamName} would win. Make it celebratory and IPL-themed.`
          : `Generate a short, funny, playful roast (max 15 words) for a fan who predicted ${predictedTeamName} but ${winnerTeamName} won. Keep it light-hearted and cricket-themed.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
          temperature: 0.8,
        });

        const banter = response.choices[0]?.message?.content?.trim();
        if (banter) {
          return NextResponse.json({
            banter,
            isCorrect,
            source: 'ai',
          });
        }
      } catch (aiError) {
        console.warn('OpenAI failed, using fallback:', aiError);
        // Fall through to fallback
      }
    }

    // Fallback banter
    const banter = getRandomBanter(isCorrect ? 'positive' : 'negative');
    return NextResponse.json({
      banter,
      isCorrect,
      source: 'fallback',
    });
  } catch (error) {
    console.error('Error generating banter:', error);
    return NextResponse.json(
      { error: 'Failed to generate banter' },
      { status: 500 }
    );
  }
}
