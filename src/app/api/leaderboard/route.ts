import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/leaderboard - Get leaderboard with total points per user
export async function GET() {
  try {
    // Get all predictions with match info
    const predictions = await prisma.prediction.findMany({
      include: {
        match: {
          select: {
            winner: true,
          },
        },
      },
    });

    // Calculate points for each user
    const userPoints = new Map<string, number>();
    const userPredictions = new Map<string, number>();

    for (const prediction of predictions) {
      const currentPoints = userPoints.get(prediction.username) || 0;
      const currentCount = userPredictions.get(prediction.username) || 0;
      
      userPoints.set(prediction.username, currentPoints + prediction.points);
      userPredictions.set(prediction.username, currentCount + 1);
    }

    // Convert to array and sort
    const leaderboard = Array.from(userPoints.entries())
      .map(([username, totalPoints]) => ({
        username,
        totalPoints,
        predictionsCount: userPredictions.get(username) || 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
