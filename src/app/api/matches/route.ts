import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/matches - Fetch all matches
export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { startTime: 'asc' },
      include: {
        predictions: {
          select: {
            username: true,
            predictedTeam: true,
          },
        },
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
