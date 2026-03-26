import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IPL 2026 Matches - Hardcoded for the MVP
const matches = [
  {
    teamA: 'Mumbai Indians',
    teamB: 'Chennai Super Kings',
    startTime: new Date('2026-03-28T19:30:00Z'),
  },
  {
    teamA: 'Royal Challengers Bangalore',
    teamB: 'Kolkata Knight Riders',
    startTime: new Date('2026-03-29T15:30:00Z'),
  },
  {
    teamA: 'Delhi Capitals',
    teamB: 'Rajasthan Royals',
    startTime: new Date('2026-03-30T19:30:00Z'),
  },
  {
    teamA: 'Sunrisers Hyderabad',
    teamB: 'Punjab Kings',
    startTime: new Date('2026-03-31T19:30:00Z'),
  },
  {
    teamA: 'Gujarat Titans',
    teamB: 'Lucknow Super Giants',
    startTime: new Date('2026-04-01T19:30:00Z'),
  },
  {
    teamA: 'Chennai Super Kings',
    teamB: 'Royal Challengers Bangalore',
    startTime: new Date('2026-04-02T19:30:00Z'),
  },
  {
    teamA: 'Mumbai Indians',
    teamB: 'Kolkata Knight Riders',
    startTime: new Date('2026-04-03T19:30:00Z'),
  },
  {
    teamA: 'Rajasthan Royals',
    teamB: 'Sunrisers Hyderabad',
    startTime: new Date('2026-04-04T15:30:00Z'),
  },
  {
    teamA: 'Punjab Kings',
    teamB: 'Delhi Capitals',
    startTime: new Date('2026-04-05T19:30:00Z'),
  },
  {
    teamA: 'Lucknow Super Giants',
    teamB: 'Gujarat Titans',
    startTime: new Date('2026-04-06T19:30:00Z'),
  },
];

async function main() {
  console.log('🌱 Seeding IPL matches...');

  // Clear existing data
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();

  // Create matches
  for (const match of matches) {
    await prisma.match.create({
      data: match,
    });
    console.log(`✅ Created: ${match.teamA} vs ${match.teamB}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
