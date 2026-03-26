# IPL Prediction Game 🏏

A minimal web app for predicting IPL match winners, earning points, and competing on a leaderboard.

## Features

- **Match Predictions**: Predict winners for upcoming IPL matches
- **Leaderboard**: Track your points against friends
- **Admin Panel**: Set match results and auto-calculate points
- **Banter System**: Get funny messages for correct/wrong predictions

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: None (username stored in localStorage)

## Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed the database with matches
npx prisma db seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
ipl-prediction/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script for matches
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── matches/   # GET /api/matches
│   │   │   ├── predictions/ # POST, GET /api/predictions
│   │   │   ├── leaderboard/ # GET /api/leaderboard
│   │   │   ├── admin/     # PUT /api/admin
│   │   │   └── banter/    # POST /api/banter
│   │   ├── page.tsx       # Home page (match list)
│   │   ├── leaderboard/   # Leaderboard page
│   │   └── admin/         # Admin panel
│   ├── components/        # React components
│   └── lib/
│       └── prisma.ts      # Prisma client
└── package.json
```

## Database Schema

### Match
- `id`: String (cuid)
- `teamA`: String
- `teamB`: String
- `startTime`: DateTime
- `winner`: String? ("A", "B", or null)

### Prediction
- `id`: String (cuid)
- `username`: String
- `matchId`: String
- `predictedTeam`: String ("A" or "B")
- `points`: Int (default 0)
- Unique constraint: (username, matchId)

## Scoring System

- **+10 points**: Correct prediction
- **0 points**: Wrong prediction

## API Endpoints

### `GET /api/matches`
Returns all matches with predictions.

### `POST /api/predictions`
Create a prediction.
```json
{
  "username": "John",
  "matchId": "cmn7...",
  "predictedTeam": "A"
}
```

### `GET /api/predictions?username=John`
Get user's predictions.

### `GET /api/leaderboard`
Get leaderboard sorted by total points.

### `PUT /api/admin`
Set match winner and update points.
```json
{
  "matchId": "cmn7...",
  "winner": "A"
}
```

### `POST /api/banter`
Generate banter for prediction result.
```json
{
  "predictedTeam": "A",
  "actualWinner": "B",
  "teamA": "Mumbai Indians",
  "teamB": "Chennai Super Kings"
}
```

## Environment Variables

Copy `.env.example` to `.env`:

```bash
# Optional: OpenAI API key for AI-generated banter
OPENAI_API_KEY=your_key_here
```

If no API key is provided, the app uses fallback banter templates.

## Rules

1. One prediction per user per match
2. Predictions close when match starts
3. Points are auto-calculated when admin sets winner

## License

MIT
