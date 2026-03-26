import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/result - Set match winner and update points
export async function PUT(request: Request) {
  try {
    const { matchId, winner } = await request.json();

    // Validate input
    if (!matchId || !['A', 'B', null].includes(winner)) {
      return NextResponse.json(
        { error: 'Invalid input. Winner must be "A", "B", or null' },
        { status: 400 }
      );
    }

    // Find the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { predictions: true },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Update match winner
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { winner },
    });

    // Update prediction points if winner is set
    if (winner) {
      // Update all correct predictions to +10 points
      await prisma.prediction.updateMany({
        where: {
          matchId,
          predictedTeam: winner,
        },
        data: { points: 10 },
      });

      // Ensure wrong predictions have 0 points
      await prisma.prediction.updateMany({
        where: {
          matchId,
          predictedTeam: { not: winner },
        },
        data: { points: 0 },
      });
    } else {
      // Reset points if winner is cleared
      await prisma.prediction.updateMany({
        where: { matchId },
        data: { points: 0 },
      });
    }

    return NextResponse.json({
      match: updatedMatch,
      message: winner ? `Winner set to ${winner === 'A' ? match.teamA : match.teamB}. Points updated!` : 'Winner cleared. Points reset.',
    });
  } catch (error) {
    console.error('Error updating match result:', error);
    return NextResponse.json(
      { error: 'Failed to update match result' },
      { status: 500 }
    );
  }
}
