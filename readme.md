# Amaan's Media Tracker

A modern web application for tracking TV shows, movies, and anime. Built with Next.js, Flask, and MongoDB.

## Features

- Track TV shows, movies, and anime
- Search content across multiple platforms (TVmaze, TMDB, MyAnimeList)
- User authentication and personalized watch lists
- Real-time status updates
- Responsive and modern UI

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Clerk for authentication
- SWR for data fetching

### Backend
- Flask
- MongoDB
- Python 3.x
- TVmaze API
- TMDB API
- MyAnimeList API

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.x
- MongoDB
- API keys for TMDB and MyAnimeList

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/media-tracker.git
cd media-tracker
```

2. Set up the backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
MONGO_URI=your_mongodb_uri
TMDB_API_KEY=your_tmdb_api_key
MAL_CLIENT_ID=your_mal_client_id
```

5. Start the development servers:
```bash
# Terminal 1 (Backend)
cd backend
flask run

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
media-tracker/
├── backend/
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/               # React components and pages
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
└── README.md
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.