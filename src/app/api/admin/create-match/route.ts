import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/create-match - Create a new match
export async function POST(request: Request) {
  try {
    const { teamA, teamB, startTime } = await request.json();

    // Validate input
    if (!teamA || !teamB || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields: teamA, teamB, startTime' },
        { status: 400 }
      );
    }

    // Validate team names are not empty
    if (teamA.trim() === '' || teamB.trim() === '') {
      return NextResponse.json(
        { error: 'Team names cannot be empty' },
        { status: 400 }
      );
    }

    // Validate date is in the future or valid
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Create the match
    const match = await prisma.match.create({
      data: {
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        startTime: startDate,
      },
    });

    return NextResponse.json({
      match,
      message: 'Match created successfully!',
    });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}
