import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/predictions - Create a prediction
export async function POST(request: Request) {
  try {
    const { username, matchId, predictedTeam } = await request.json();

    // Validate input
    if (!username || !matchId || !predictedTeam) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate predicted team
    if (!['A', 'B'].includes(predictedTeam)) {
      return NextResponse.json(
        { error: 'Invalid team selection' },
        { status: 400 }
      );
    }

    // Fetch the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Check if prediction window is closed
    if (new Date() > match.startTime) {
      return NextResponse.json(
        { error: 'Prediction window closed' },
        { status: 403 }
      );
    }

    // Create prediction (unique constraint handles one per user per match)
    const prediction = await prisma.prediction.create({
      data: {
        username,
        matchId,
        predictedTeam,
      },
    });

    return NextResponse.json(prediction);
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already predicted for this match' },
        { status: 409 }
      );
    }

    console.error('Error creating prediction:', error);
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    );
  }
}

// GET /api/predictions - Get user's predictions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username required' },
        { status: 400 }
      );
    }

    const predictions = await prisma.prediction.findMany({
      where: { username },
      include: {
        match: {
          select: {
            id: true,
            teamA: true,
            teamB: true,
            startTime: true,
            winner: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
