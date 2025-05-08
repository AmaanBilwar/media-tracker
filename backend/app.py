from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient
from typing import List, Dict, Any

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS to allow all origins and methods
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client.movietracker
watch_status_collection = db.watch_status

# Create indexes for watch status collection
watch_status_collection.create_index([
    ("userId", 1),
    ("contentId", 1),
    ("contentType", 1)
], unique=True)

# TMDB API configuration
TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

# MyAnimeList API configuration
MAL_CLIENT_ID = os.getenv('MAL_CLIENT_ID')
MAL_BASE_URL = 'https://api.myanimelist.net/v2'

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the API"})

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    try:
        # Search for shows using TVmaze API
        response = requests.get(f"https://api.tvmaze.com/search/shows?q={query}")
        response.raise_for_status()
        shows = response.json()
        
        # Format the response to match our frontend expectations
        formatted_shows = []
        for show in shows:
            show_data = show.get('show', {})
            formatted_shows.append({
                "id": str(show_data.get('id', '')),
                "title": show_data.get('name', ''),
                "posterUrl": show_data.get('image', {}).get('medium', '/placeholder.svg?height=450&width=300'),
                "rating": show_data.get('rating', {}).get('average', 0) or 0,
                "year": show_data.get('premiered', '')[:4] if show_data.get('premiered') else '',
                "summary": show_data.get('summary', ''),
                "genres": show_data.get('genres', []),
                "status": show_data.get('status', ''),
                "type": "show"
            })
        
        # In /api/search, after formatting each show, fetch and attach seasons from TMDB
        for show in formatted_shows:
            if show['type'] == 'show' and show['id']:
                try:
                    tmdb_show_url = f"{TMDB_BASE_URL}/tv/{show['id']}?api_key={TMDB_API_KEY}&language=en-US"
                    show_response = requests.get(tmdb_show_url)
                    show_response.raise_for_status()
                    show_data = show_response.json()
                    seasons = []
                    for season in show_data.get('seasons', []):
                        seasons.append({
                            'seasonNumber': season.get('season_number', 1),
                            'episodeCount': season.get('episode_count', 0),
                            'name': season.get('name', f"Season {season.get('season_number', 1)}")
                        })
                    show['seasons'] = seasons
                except Exception as e:
                    print(f"Error fetching seasons for show {show['id']}: {e}")
        
        return jsonify({"results": formatted_shows})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching data from TVmaze API: {str(e)}"}), 500

@app.route('/api/shows/<show_id>', methods=['GET'])
def get_show(show_id):
    try:
        # Get show details using TVmaze API
        response = requests.get(f"https://api.tvmaze.com/shows/{show_id}")
        response.raise_for_status()
        show_data = response.json()
        
        # Format the response to match our frontend expectations
        formatted_show = {
            "id": str(show_data.get('id', '')),
            "title": show_data.get('name', ''),
            "posterUrl": show_data.get('image', {}).get('medium', '/placeholder.svg?height=450&width=300'),
            "rating": show_data.get('rating', {}).get('average', 0) or 0,
            "year": show_data.get('premiered', '')[:4] if show_data.get('premiered') else '',
            "summary": show_data.get('summary', ''),
            "genres": show_data.get('genres', []),
            "status": show_data.get('status', ''),
            "type": "show"
        }
        # Fetch seasons from TMDB
        try:
            tmdb_show_url = f"{TMDB_BASE_URL}/tv/{show_id}?api_key={TMDB_API_KEY}&language=en-US"
            show_response = requests.get(tmdb_show_url)
            show_response.raise_for_status()
            show_data_tmdb = show_response.json()
            seasons = []
            for season in show_data_tmdb.get('seasons', []):
                seasons.append({
                    'seasonNumber': season.get('season_number', 1),
                    'episodeCount': season.get('episode_count', 0),
                    'name': season.get('name', f"Season {season.get('season_number', 1)}")
                })
            formatted_show['seasons'] = seasons
        except Exception as e:
            print(f"Error fetching seasons for show {show_id}: {e}")
        return jsonify(formatted_show)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching data from TVmaze API: {str(e)}"}), 500

# New endpoints for watch status management

@app.route('/api/watch-status', methods=['GET'])
def get_watch_status():
    user_id = request.args.get('userId')
    content_id = request.args.get('contentId')
    content_type = request.args.get('contentType')  # 'movie' or 'show'
    
    if not user_id or not content_id or not content_type:
        return jsonify({"error": "userId, contentId, and contentType are required"}), 400
    
    try:
        status = watch_status_collection.find_one({
            "userId": user_id,
            "contentId": content_id,
            "contentType": content_type
        })
        
        if status:
            # Convert ObjectId to string for JSON serialization
            status['_id'] = str(status['_id'])
            return jsonify(status)
        else:
            return jsonify({"status": "none"})
    except Exception as e:
        return jsonify({"error": f"Error fetching watch status: {str(e)}"}), 500

@app.route('/api/watch-status', methods=['POST'])
def update_watch_status():
    data = request.json
    user_id = data.get('userId')
    content_id = data.get('contentId')
    content_type = data.get('contentType')  # 'movie' or 'show'
    status = data.get('status')  # 'currently_watching', 'watch_later', 'watched', 'rewatch'
    
    if not user_id or not content_id or not content_type or not status:
        return jsonify({"error": "userId, contentId, contentType, and status are required"}), 400
    
    if status not in ['currently_watching', 'watch_later', 'watched', 'rewatch', 'none']:
        return jsonify({"error": "Invalid status value"}), 400
    
    try:
        # Check if status already exists
        existing = watch_status_collection.find_one({
            "userId": user_id,
            "contentId": content_id,
            "contentType": content_type
        })
        
        if existing:
            # Update existing status
            if status == 'none':
                # Remove the status if 'none' is selected
                watch_status_collection.delete_one({
                    "userId": user_id,
                    "contentId": content_id,
                    "contentType": content_type
                })
                return jsonify({"message": "Status removed successfully"})
            else:
                # Update the status
                watch_status_collection.update_one(
                    {"userId": user_id, "contentId": content_id, "contentType": content_type},
                    {"$set": {"status": status}}
                )
                return jsonify({"message": "Status updated successfully"})
        else:
            # Create new status
            if status != 'none':
                watch_status_collection.insert_one({
                    "userId": user_id,
                    "contentId": content_id,
                    "contentType": content_type,
                    "status": status
                })
                return jsonify({"message": "Status created successfully"})
            else:
                return jsonify({"message": "No action needed"})
    except Exception as e:
        return jsonify({"error": f"Error updating watch status: {str(e)}"}), 500

@app.route('/api/watch-status/batch', methods=['GET'])
def get_batch_watch_status():
    user_id = request.args.get('userId')
    content_ids = request.args.getlist('contentIds')
    content_type = request.args.get('contentType')  # 'movie' or 'show'
    
    if not user_id or not content_ids or not content_type:
        return jsonify({"error": "userId, contentIds, and contentType are required"}), 400
    
    try:
        statuses = list(watch_status_collection.find({
            "userId": user_id,
            "contentId": {"$in": content_ids},
            "contentType": content_type
        }))
        
        # Convert ObjectId to string for JSON serialization
        for status in statuses:
            status['_id'] = str(status['_id'])
        
        return jsonify({"statuses": statuses})
    except Exception as e:
        return jsonify({"error": f"Error fetching batch watch status: {str(e)}"}), 500

# Add user-specific watch status routes
@app.route('/users/<user_id>/watch-status/<content_type>/<content_id>', methods=['GET', 'PUT', 'OPTIONS'])
def user_watch_status(user_id, content_type, content_id):
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    # GET request to retrieve watch status
    if request.method == 'GET':
        try:
            status = watch_status_collection.find_one({
                "userId": user_id,
                "contentId": content_id,
                "contentType": content_type
            })
            
            if status:
                return jsonify({
                    "status": status.get("status", "none"),
                    "lastSeason": status.get("lastSeason"),
                    "lastEpisode": status.get("lastEpisode")
                })
            else:
                return jsonify({"status": "none"})
        except Exception as e:
            print(f"Error fetching watch status: {str(e)}")
            return jsonify({"error": f"Error fetching watch status: {str(e)}"}), 500
    
    # PUT request to update watch status
    elif request.method == 'PUT':
        try:
            data = request.json
            status = data.get('status')  # 'currently_watching', 'watch_later', 'watched', 'rewatch', 'none'
            last_season = data.get('lastSeason')
            last_episode = data.get('lastEpisode')
            
            if not status:
                return jsonify({"error": "Status is required"}), 400
            
            if status not in ['currently_watching', 'watch_later', 'watched', 'rewatch', 'none']:
                return jsonify({"error": "Invalid status value"}), 400
            
            if status == 'none':
                # Remove the status if 'none' is selected
                result = watch_status_collection.delete_one({
                    "userId": user_id,
                    "contentId": content_id,
                    "contentType": content_type
                })
                if result.deleted_count > 0:
                    return jsonify({"message": "Status removed successfully"})
                return jsonify({"message": "No status to remove"})
            else:
                # Use upsert to either update existing or insert new status in one operation
                update_data = {"status": status}
                if last_season is not None:
                    update_data["lastSeason"] = last_season
                if last_episode is not None:
                    update_data["lastEpisode"] = last_episode
                
                result = watch_status_collection.update_one(
                    {
                        "userId": user_id,
                        "contentId": content_id,
                        "contentType": content_type
                    },
                    {
                        "$set": update_data
                    },
                    upsert=True
                )
                return jsonify({"message": "Status updated successfully"})
        except Exception as e:
            print(f"Error updating watch status: {str(e)}")
            return jsonify({"error": f"Error updating watch status: {str(e)}"}), 500

# Add batch watch status route for user-specific content
@app.route('/users/<user_id>/watch-status/batch', methods=['GET', 'OPTIONS'])
def user_batch_watch_status(user_id):
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        content_ids = request.args.getlist('contentIds')
        content_type = request.args.get('contentType')  # 'movie' or 'show'
        
        if not content_ids or not content_type:
            return jsonify({"error": "contentIds and contentType are required"}), 400
        
        statuses = list(watch_status_collection.find({
            "userId": user_id,
            "contentId": {"$in": content_ids},
            "contentType": content_type
        }))
        
        # Convert to a map of contentId -> status
        status_map = {}
        for status in statuses:
            status_map[status['contentId']] = status['status']
        
        # Add 'none' for any contentIds that don't have a status
        for content_id in content_ids:
            if content_id not in status_map:
                status_map[content_id] = 'none'
        
        return jsonify(status_map)
    except Exception as e:
        print(f"Error fetching batch watch status: {str(e)}")
        return jsonify({"error": f"Error fetching batch watch status: {str(e)}"}), 500

@app.route('/users/<user_id>/watch-status/<content_type>', methods=['GET'])
def get_content_by_status(user_id, content_type):
    status = request.args.get('status')
    
    if not status:
        return jsonify({"error": "status parameter is required"}), 400
    
    if status not in ['currently_watching', 'watch_later', 'watched', 'rewatch']:
        return jsonify({"error": "Invalid status value"}), 400
    
    try:
        print(f"Fetching {content_type}s with status '{status}' for user {user_id}")
        
        # Get all content IDs with the specified status
        status_entries = list(watch_status_collection.find({
            "userId": user_id,
            "contentType": content_type,
            "status": status
        }))
        
        print(f"Found {len(status_entries)} entries in database")
        
        if not status_entries:
            return jsonify({f"{content_type}s": []})
        
        # Extract content IDs
        content_ids = [entry['contentId'] for entry in status_entries]
        print(f"Content IDs: {content_ids}")
        
        # Initialize the content list
        content_list = []
        
        # Fetch content details based on type
        for content_id in content_ids:
            try:
                if content_type == 'movie':
                    print(f"Fetching movie details for ID: {content_id}")
                    response = requests.get(
                        f"{TMDB_BASE_URL}/movie/{content_id}?api_key={TMDB_API_KEY}&language=en-US"
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    content_list.append({
                        "id": str(data['id']),
                        "title": data['title'],
                        "posterUrl": data['poster_path'] and f"https://image.tmdb.org/t/p/w500{data['poster_path']}" or "/placeholder.svg?height=450&width=300",
                        "rating": data['vote_average'] or 0,
                        "year": data['release_date'][:4] if data.get('release_date') else "",
                        "summary": data.get('overview', ''),
                        "genres": [genre['name'] for genre in data.get('genres', [])],
                        "type": "movie"
                    })
                    print(f"Successfully fetched movie: {data['title']}")
                else:  # show
                    print(f"Fetching show details for ID: {content_id}")
                    response = requests.get(
                        f"{TMDB_BASE_URL}/tv/{content_id}?api_key={TMDB_API_KEY}&language=en-US"
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    content_list.append({
                        "id": str(data['id']),
                        "title": data['name'],
                        "posterUrl": data['poster_path'] and f"https://image.tmdb.org/t/p/w500{data['poster_path']}" or "/placeholder.svg?height=450&width=300",
                        "rating": data['vote_average'] or 0,
                        "year": data['first_air_date'][:4] if data.get('first_air_date') else "",
                        "summary": data.get('overview', ''),
                        "genres": [genre['name'] for genre in data.get('genres', [])],
                        "type": "show"
                    })
                    print(f"Successfully fetched show: {data['name']}")
            except requests.exceptions.RequestException as e:
                print(f"Error fetching {content_type} {content_id}: {str(e)}")
                continue
        
        print(f"Returning {len(content_list)} {content_type}s")
        return jsonify({f"{content_type}s": content_list})
    except Exception as e:
        print(f"Error in get_content_by_status: {str(e)}")
        return jsonify({"error": f"Error fetching content by status: {str(e)}"}), 500

def get_tmdb_content(content_id: str, content_type: str) -> Dict[str, Any]:
    """Get content from TMDB."""
    try:
        endpoint = f"{TMDB_BASE_URL}/{'movie' if content_type == 'movie' else 'tv'}/{content_id}"
        response = requests.get(f"{endpoint}?api_key={TMDB_API_KEY}&language=en-US")
        response.raise_for_status()
        data = response.json()
        
        # Format the response
        return {
            "id": str(data['id']),
            "title": data.get('title') or data.get('name'),
            "posterUrl": data.get('poster_path') and f"https://image.tmdb.org/t/p/w500{data['poster_path']}" or "/placeholder.svg?height=450&width=300",
            "rating": data.get('vote_average', 0),
            "year": (data.get('release_date') or data.get('first_air_date', ''))[:4],
            "summary": data.get('overview', ''),
            "genres": [genre['name'] for genre in data.get('genres', [])],
            "type": content_type
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {content_type} {content_id}: {str(e)}")
        return None

@app.route('/users/<user_id>/watch-status/all', methods=['GET'])
def get_all_content(user_id):
    """Get all content (movies and shows) for all statuses in a single request."""
    try:
        print(f"Fetching all content for user {user_id}")
        
        # Initialize response structure
        response = {
            "movies": {
                "currently_watching": [],
                "watch_later": [],
                "watched": [],
                "rewatch": [],
                "none": []
            },
            "shows": {
                "currently_watching": [],
                "watch_later": [],
                "watched": [],
                "rewatch": [],
                "none": []
            },
            "anime": {
                "currently_watching": [],
                "watch_later": [],
                "watched": [],
                "rewatch": [],
                "none": []
            }
        }
        
        # Get all watch status entries for the user
        status_entries = list(watch_status_collection.find({"userId": user_id}))
        print(f"Found {len(status_entries)} total status entries")
        
        # Group content IDs by type and status
        content_groups = {}
        for entry in status_entries:
            content_type = entry['contentType']
            status = entry['status']
            content_id = entry['contentId']
            
            if content_type not in content_groups:
                content_groups[content_type] = {}
            if status not in content_groups[content_type]:
                content_groups[content_type][status] = []
            
            content_groups[content_type][status].append(content_id)
            print(f"Added {content_type} {content_id} with status {status}")
        
        print(f"Content groups: {content_groups}")
        
        # Fetch content for each group
        for content_type, status_groups in content_groups.items():
            print(f"Processing {content_type} content")
            for status, content_ids in status_groups.items():
                print(f"Processing {len(content_ids)} {content_type}s with status {status}")
                content_list = []
                for content_id in content_ids:
                    try:
                        if content_type == 'anime':
                            print(f"Fetching anime details for ID: {content_id}")
                            # Handle anime content differently
                            headers = {'X-MAL-CLIENT-ID': MAL_CLIENT_ID}
                            anime_response = requests.get(
                                f"{MAL_BASE_URL}/anime/{content_id}",
                                params={'fields': 'id,title,main_picture,mean,start_date,synopsis,genres,num_episodes'},
                                headers=headers
                            )
                            anime_response.raise_for_status()
                            anime_data = anime_response.json()
                            
                            anime_content = {
                                "id": str(anime_data['id']),
                                "title": anime_data['title'],
                                "posterUrl": anime_data.get('main_picture', {}).get('medium', '/placeholder.svg?height=450&width=300'),
                                "rating": anime_data.get('mean', 0),
                                "year": anime_data.get('start_date', '')[:4] if anime_data.get('start_date') else '',
                                "summary": anime_data.get('synopsis', ''),
                                "genres": [genre['name'] for genre in anime_data.get('genres', [])],
                                "type": "anime",
                                "episodes": anime_data.get('num_episodes', 0)
                            }
                            print(f"Successfully fetched anime: {anime_content['title']}")
                            content_list.append(anime_content)
                        else:
                            # Always fetch show details from TMDB for shows to get seasons
                            content = get_tmdb_content(content_id, content_type)
                            if content_type == 'show':
                                # Fetch seasons for the show
                                tmdb_show_url = f"{TMDB_BASE_URL}/tv/{content_id}?api_key={TMDB_API_KEY}&language=en-US"
                                show_response = requests.get(tmdb_show_url)
                                show_response.raise_for_status()
                                show_data = show_response.json()
                                seasons = []
                                for season in show_data.get('seasons', []):
                                    seasons.append({
                                        'seasonNumber': season.get('season_number', 1),
                                        'episodeCount': season.get('episode_count', 0),
                                        'name': season.get('name', f"Season {season.get('season_number', 1)}")
                                    })
                                content['seasons'] = seasons
                            if content:
                                content_list.append(content)
                    except requests.exceptions.RequestException as e:
                        print(f"Error fetching {content_type} {content_id}: {str(e)}")
                        continue
                    except Exception as e:
                        print(f"Unexpected error fetching {content_type} {content_id}: {str(e)}")
                        continue
                
                # Handle plural form correctly
                if content_type == 'anime':
                    response['anime'][status] = content_list
                    print(f"Added {len(content_list)} anime to {status} status")
                else:
                    response[content_type + 's'][status] = content_list
        
        print("Final response structure:", response)
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in get_all_content: {str(e)}")
        return jsonify({"error": f"Error fetching content: {str(e)}"}), 500

# Anime endpoints
@app.route('/api/anime/popular', methods=['GET'])
def get_popular_anime():
    try:
        headers = {
            'X-MAL-CLIENT-ID': MAL_CLIENT_ID
        }
        response = requests.get(
            f"{MAL_BASE_URL}/anime/ranking",
            params={'ranking_type': 'all', 'limit': 24, 'fields': 'id,title,main_picture,mean,start_date,synopsis,genres,num_episodes'},
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        
        # Format the response to match our frontend expectations
        formatted_anime = []
        for anime in data.get('data', []):
            anime_data = anime.get('node', {})
            formatted_anime.append({
                "id": str(anime_data.get('id', '')),
                "title": anime_data.get('title', ''),
                "posterUrl": anime_data.get('main_picture', {}).get('medium', '/placeholder.svg?height=450&width=300'),
                "rating": anime_data.get('mean', 0) or 0,
                "year": anime_data.get('start_date', '')[:4] if anime_data.get('start_date') else '',
                "summary": anime_data.get('synopsis', ''),
                "genres": [genre.get('name', '') for genre in anime_data.get('genres', [])],
                "status": anime_data.get('status', ''),
                "type": "anime",
                "episodes": anime_data.get('num_episodes', 0)
            })
        
        return jsonify({"results": formatted_anime})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching data from MyAnimeList API: {str(e)}"}), 500

@app.route('/api/anime/search', methods=['GET'])
def search_anime():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    try:
        headers = {
            'X-MAL-CLIENT-ID': MAL_CLIENT_ID
        }
        response = requests.get(
            f"{MAL_BASE_URL}/anime",
            params={'q': query, 'limit': 24, 'fields': 'id,title,main_picture,mean,start_date,synopsis,genres,num_episodes'},
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        
        # Format the response to match our frontend expectations
        formatted_anime = []
        for anime in data.get('data', []):
            anime_data = anime.get('node', {})
            formatted_anime.append({
                "id": str(anime_data.get('id', '')),
                "title": anime_data.get('title', ''),
                "posterUrl": anime_data.get('main_picture', {}).get('medium', '/placeholder.svg?height=450&width=300'),
                "rating": anime_data.get('mean', 0) or 0,
                "year": anime_data.get('start_date', '')[:4] if anime_data.get('start_date') else '',
                "summary": anime_data.get('synopsis', ''),
                "genres": [genre.get('name', '') for genre in anime_data.get('genres', [])],
                "status": anime_data.get('status', ''),
                "type": "anime",
                "episodes": anime_data.get('num_episodes', 0)
            })
        
        return jsonify({"results": formatted_anime})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching data from MyAnimeList API: {str(e)}"}), 500

@app.route('/api/anime/<anime_id>', methods=['GET'])
def get_anime_details(anime_id):
    try:
        headers = {
            'X-MAL-CLIENT-ID': MAL_CLIENT_ID
        }
        response = requests.get(
            f"{MAL_BASE_URL}/anime/{anime_id}",
            params={'fields': 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,nsfw,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics'},
            headers=headers
        )
        response.raise_for_status()
        anime_data = response.json()
        
        # Format the response to match our frontend expectations
        formatted_anime = {
            "id": str(anime_data.get('id', '')),
            "title": anime_data.get('title', ''),
            "posterUrl": anime_data.get('main_picture', {}).get('medium', '/placeholder.svg?height=450&width=300'),
            "rating": anime_data.get('mean', 0) or 0,
            "year": anime_data.get('start_date', '')[:4] if anime_data.get('start_date') else '',
            "summary": anime_data.get('synopsis', ''),
            "genres": [genre.get('name', '') for genre in anime_data.get('genres', [])],
            "status": anime_data.get('status', ''),
            "type": "anime",
            "episodes": anime_data.get('num_episodes', 0),
            "season": anime_data.get('start_season', {}).get('season', ''),
            "season_year": anime_data.get('start_season', {}).get('year', ''),
            "source": anime_data.get('source', ''),
            "studios": [studio.get('name', '') for studio in anime_data.get('studios', [])]
        }
        
        return jsonify(formatted_anime)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error fetching data from MyAnimeList API: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False  # Set to False in production
    )
