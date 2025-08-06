# 🎵 MusiSense.ai

MusiSense is an AI-powered music recommendation app that provides music recommendations based on the user's preferences.

## 🚀 Live

Check it here: https://musisenseai.vercel.app

## ✨ Features

- 🎧 Genre-based music/song recommendations
- 💻 Personalized search query generation using AI (scikit-learn and TF-IDF)
- 💾 Stores user preferences, likes, dislikes and listen history in a MongoDB database
- 🎶 Allows playlist generation and editing
- 🎥 Mood based recommendations using facial expression detection

## ⚙️ Tech Stack

**Frontend:** React (Vite), Tailwind CSS
**Backend:** Node.js, Express.js, FastAPI (Python), MongoDB
**ML/AI:** TF-IDF + Ridge Regression (scikit-learn)
**Deployment:** Vercel (Frontend), Render (backend)

## Getting Started

Clone the repo and run frontend and backend locally:

### Frontend Setup:

```
cd client
npm start
```

### Node Backend Setup:

```
cd server
npm start
```

### FastAPI Backend Setup:

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
fastapi dev main.py
```

🧑‍💻 Made by

Naman Sharma
