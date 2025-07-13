from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from database import db
import os
from bson import ObjectId
from pathlib import Path
from pydantic import BaseModel
import regex

load_dotenv()

db_client = AsyncIOMotorClient()

router = APIRouter()

users_collection = db["users"]
history_collection = db["watched-videos"]
likes_dislikes_collection = db["likes_dislikes"]
preferences_collection = db["preferences"]

csv_path = Path.cwd() / "training_data" / "data.csv"

preferences_map = { 0: "pop", 1: "rock", 2: "rap", 3: "electronic", 4: "bollywood", 5: "classical", 6: "jazz", 7: "lo-fi", 8: "devotional" }

mood_map = {
    "happy": ["pop", "lo-fi", "bollywood"],
    "sad": ["classical", "lo-fi", "pop"],
    "angry": ["rock", "rap", "electronic"],
    "neutral": ["lo-fi", "jazz"],
    "surprised": ["pop", "electronic", "rock"],
    "disgusted": ["classical", "jazz"],
    "fearful": ["classical"]
}

known_genres = [i for i in preferences_map.values()]

def normalize_genre(genre: str) -> str:
    genre = genre.lower()
    genre = genre.strip()
    genre = regex.sub(r'\bmusic\b', '', genre)  
    genre = regex.sub(r'[^a-zA-Z0-9\s]', '', genre)  
    genre = regex.sub(r'\s+', ' ', genre)  
    return genre.strip()


def extract_genres_from_input(prompt: str, known_genres: list[str]) -> list[str]:
    prompt = prompt.lower()
    matched_genres = []

    for genre in known_genres:
        if genre.lower() in prompt:
            matched_genres.append(genre)

    return matched_genres


def extract_genres_from_mood(mood: str, known_genres: list[str]) -> list[str]:
    mood = mood.lower()
    matched_genres = []

    for mood in mood_map:
        matched_genres.extend(mood_map[mood])

    return matched_genres

class PromptRecommendationRequest(BaseModel):
    prompt: str

class MoodRecommendationRequest(BaseModel):
    image: str

class QueryGenerator:
    def __init__(self, csv_path: Path):
        self.queries = []
        self._train(csv_path)

    def _train(self, csv_path: Path):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.multioutput import MultiOutputRegressor
        from sklearn.linear_model import Ridge
        import pandas as pd

        df = pd.read_csv(csv_path)
        self.queries = df["query"].tolist()
        genres = df["genre"].tolist()

           
        self.genre_vectorizer = TfidfVectorizer()
        self.query_vectorizer = TfidfVectorizer()

        X = self.genre_vectorizer.fit_transform(genres)
        Y = self.query_vectorizer.fit_transform(self.queries).toarray()

           
        self.model = MultiOutputRegressor(Ridge())
        self.model.fit(X, Y)


        self._X = X
        self._Y = Y
        
    def generate_query_0(self, all_genres: list):

        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.multioutput import MultiOutputRegressor
        from sklearn.linear_model import Ridge
        from sklearn.pipeline import Pipeline
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        import pandas as pd

        history_genres = [normalize_genre(g) for g in all_genres[0]]
        liked_genres = [normalize_genre(g) for g in all_genres[1]]
        disliked_genres = [normalize_genre(g) for g in all_genres[2]]
        preferred_genres = [normalize_genre(g) for g in all_genres[3]]
        prompt_genres = [normalize_genre(g) for g in all_genres[4]]

        final_history_genres = []
        final_liked_genres = []
        final_disliked_genres = []
        final_preferred_genres = []
        final_prompt_genres = []

        for item in history_genres:
            if isinstance(item, list):
                final_history_genres.extend(item)
            else:
                final_history_genres.append(item)
        
        for item in liked_genres:
            if isinstance(item, list):
                final_liked_genres.extend(item)
            else:
                final_liked_genres.append(item)
        
        for item in disliked_genres:
            if isinstance(item, list):
                final_disliked_genres.extend(item)
            else:
                final_disliked_genres.append(item)

        for item in preferred_genres:
            if isinstance(item, list):
                final_preferred_genres.extend(item)
            else:
                final_preferred_genres.append(item)

        for item in prompt_genres:
            if isinstance(item, list):
                final_prompt_genres.extend(item)
            else:
                final_prompt_genres.append(item)

        

        if not history_genres:
            if not preferred_genres:
                if not(prompt_genres):
                    search_query = "best songs"
                    return search_query
            else:
                final_genres = preferred_genres[:]
                    

        else:

            history_weight = 4
            liked_weight = 6
            disliked_weight = -6 
            preferred_weight = 6 
            prompt_weight = 8
        
            final_genres = []

            for genre in final_history_genres:
                for i in range(history_weight):
                    final_genres.append(genre)
            
            for genre in final_liked_genres:
                for i in range(liked_weight):
                    final_genres.append(genre)
            
            for genre in final_disliked_genres:
                for i in range(disliked_weight):
                    final_genres.append(genre)

            for genre in final_preferred_genres:
                for i in range(preferred_weight):
                    final_genres.append(genre)

            for genre in final_prompt_genres:
                for i in range(prompt_weight):
                    final_genres.append(genre)


            input_text = " ".join(final_genres)
            print("A: ", input_text)
            x_input = self.genre_vectorizer.transform([input_text])
            y_pred = self.model.predict(x_input)

            print("y_pred:", y_pred)

            
            similarity = cosine_similarity([y_pred[0]], self._Y)
            best_idx = np.argmax(similarity)
            return self.queries[best_idx]

    def generate_query_1(self, all_genres: list):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.multioutput import MultiOutputRegressor
        from sklearn.linear_model import Ridge
        from sklearn.pipeline import Pipeline
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        import pandas as pd

        history_genres = [normalize_genre(g) for g in all_genres[0]]
        liked_genres = [normalize_genre(g) for g in all_genres[1]]
        disliked_genres = [normalize_genre(g) for g in all_genres[2]]
        preferred_genres = [normalize_genre(g) for g in all_genres[3]]
        mood_genres = [normalize_genre(g) for g in all_genres[4]]

        final_history_genres = []
        final_liked_genres = []
        final_disliked_genres = []
        final_preferred_genres = []
        final_mood_genres = []

        for item in history_genres:
            if isinstance(item, list):
                final_history_genres.extend(item)
            else:
                final_history_genres.append(item)
        
        for item in liked_genres:
            if isinstance(item, list):
                final_liked_genres.extend(item)
            else:
                final_liked_genres.append(item)
        
        for item in disliked_genres:
            if isinstance(item, list):
                final_disliked_genres.extend(item)
            else:
                final_disliked_genres.append(item)

        for item in preferred_genres:
            if isinstance(item, list):
                final_preferred_genres.extend(item)
            else:
                final_preferred_genres.append(item)

        for item in mood_genres:
            if isinstance(item, list):
                final_mood_genres.extend(item)
            else:
                final_mood_genres.append(item)

        

        if not history_genres:
            if not preferred_genres:
                final_genres = final_mood_genres[:]
            else:
                final_genres = preferred_genres[:]
                    
        else:
            history_weight = 4
            liked_weight = 4
            disliked_weight = -4 
            preferred_weight = 4 
            mood_weight = 12
        
            final_genres = []

            for genre in final_history_genres:
                for i in range(history_weight):
                    final_genres.append(genre)
            
            for genre in final_liked_genres:
                for i in range(liked_weight):
                    final_genres.append(genre)
            
            for genre in final_disliked_genres:
                for i in range(disliked_weight):
                    final_genres.append(genre)

            for genre in final_preferred_genres:
                for i in range(preferred_weight):
                    final_genres.append(genre)

            for genre in final_mood_genres:
                for i in range(mood_weight):
                    final_genres.append(genre)


            input_text = " ".join(final_genres)
            print("A: ", input_text)
            x_input = self.genre_vectorizer.transform([input_text])
            y_pred = self.model.predict(x_input)

            print("y_pred:", y_pred)

            
            similarity = cosine_similarity([y_pred[0]], self._Y)
            best_idx = np.argmax(similarity)
            return self.queries[best_idx]


        


async def get_user_genres(email: str, input: str, face: bool):
    user = await users_collection.find_one({ "email": email })
    if not user:
        return { "error": "User not found" }

    user_id = user["_id"]

    history_cursor = history_collection.find({ "user_id": user_id })
    history_docs = await history_cursor.to_list(length=20)

    history_genres = []
    for doc in history_docs:
        for video in doc.get("videos", [])[ : 20]:
            history_genres.extend(video.get("genres", []))

    likes_dislikes_cursor = likes_dislikes_collection.find({ "user_id": user_id })
    liked_docs = await likes_dislikes_cursor.to_list(length = 20)

    liked_genres = []
    for doc in liked_docs:
        for video in doc.get("likedVideos", [])[ : 20]:
            liked_genres.extend(video.get("genres", []))

    disliked_docs = liked_docs

    print(disliked_docs)

    disliked_genres = []
    for doc in disliked_docs:
        for video in doc.get("dislikedVideos", [])[ : 20]:
            disliked_genres.extend(video.get("genres", []))

    preferences_cursor = preferences_collection.find({"user_id": user_id})
    preferences_doc = await preferences_cursor.to_list(length = 20)
    
    preferred_genres = []

    count = 0
    for doc in preferences_doc:
        for genre in doc.get("genres", []):
            if(genre.get("isTrue") == True):
                preferred_genres.append(preferences_map[genre.get("number")])

    if not face:
        input_genres = extract_genres_from_input(input, known_genres)
    else:
        input_genres = extract_genres_from_mood(input, known_genres)

    all_genres = [history_genres, liked_genres, disliked_genres, preferred_genres, input_genres]

    return all_genres


def detect_mood(image):
    import base64
    import cv2
    import numpy as np
    from deepface import DeepFace  

    image_data = base64.b64decode(image.split(",")[1])
    np_arr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    result = DeepFace.analyze(
        img_path = img,
        actions = ['emotion'],
        detector_backend = 'opencv',
        enforce_detection = False
        )

    mood = result[0]['dominant_emotion']

    print("***Detected mood *** : ", mood)

    return mood
   


query_gen = QueryGenerator(csv_path=csv_path)


@router.post("/recommend_0/{email}")
async def recommend_0(email: str, request: PromptRecommendationRequest):
    text_prompt = request.prompt.strip()
    all_genres = await get_user_genres(email, text_prompt, False)
    
    search_query = query_gen.generate_query_0(all_genres)

    return search_query

@router.post("/recommend_1/{email}")
async def recommend_1(email: str, request: MoodRecommendationRequest):
    image = request.image
    mood = detect_mood(image)
    all_genres = await get_user_genres(email, mood, True)

    search_query = query_gen.generate_query_1(all_genres)

    return search_query

    







    
    
    
    

   




    

    

        
        


   






