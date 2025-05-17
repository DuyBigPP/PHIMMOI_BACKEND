import json
import requests
import time
from pathlib import Path
import concurrent.futures
import os
from tqdm import tqdm
from datetime import datetime

# Create data directory if it doesn't exist
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

def fetch_movie_details(slug):
    url = f"https://phimapi.com/phim/{slug}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"\nError fetching {slug}: {response.status_code}")
            return None
    except Exception as e:
        print(f"\nException fetching {slug}: {str(e)}")
        return None

def save_movies_to_json(movies, file_index):
    output_file = DATA_DIR / f"movie_details_{file_index}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(movies, f, ensure_ascii=False, indent=2)
    print(f"\nSaved {len(movies)} movies to {output_file}")

def get_processed_slugs():
    processed_slugs = set()
    for file in DATA_DIR.glob("movie_details_*.json"):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for movie in data:
                    if movie.get('movie', {}).get('slug'):
                        processed_slugs.add(movie['movie']['slug'])
        except Exception as e:
            print(f"\nError reading {file}: {str(e)}")
    return processed_slugs

def process_single_movie(movie):
    slug = movie['slug']
    movie_details = fetch_movie_details(slug)
    time.sleep(0.05)  # Reduced delay to 0.05 seconds
    return movie_details if movie_details and movie_details.get('status') else None

def format_time(seconds):
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    return f"{int(hours)}h {int(minutes)}m {int(seconds)}s"

def main():
    start_time = time.time()
    print(f"Starting at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Read the initial movie list
    with open('movie.json', 'r', encoding='utf-8') as f:
        initial_movies = json.load(f)
    
    # Get already processed slugs
    processed_slugs = get_processed_slugs()
    
    # Filter out already processed movies
    movies_to_process = [m for m in initial_movies if m['slug'] not in processed_slugs]
    total_movies = len(movies_to_process)
    print(f"Found {total_movies} movies to process")
    print(f"Already processed: {len(processed_slugs)} movies")
    
    # Calculate the next file index
    existing_files = list(DATA_DIR.glob("movie_details_*.json"))
    file_index = max([int(f.stem.split('_')[-1]) for f in existing_files], default=0) + 1
    
    all_movie_details = []
    max_workers = 20  # Increased number of parallel threads
    successful_fetches = 0
    failed_fetches = 0
    
    with tqdm(total=total_movies, desc="Processing movies", unit="movie") as pbar:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_movie = {executor.submit(process_single_movie, movie): movie for movie in movies_to_process}
            
            # Process completed tasks
            for future in concurrent.futures.as_completed(future_to_movie):
                movie = future_to_movie[future]
                movie_details = future.result()
                
                if movie_details:
                    successful_fetches += 1
                    all_movie_details.append(movie_details)
                    
                    # Save to file when we reach 200 movies
                    if len(all_movie_details) >= 200:
                        save_movies_to_json(all_movie_details, file_index)
                        all_movie_details = []
                        file_index += 1
                else:
                    failed_fetches += 1
                
                # Update progress bar with additional info
                elapsed_time = time.time() - start_time
                movies_per_second = successful_fetches / elapsed_time if elapsed_time > 0 else 0
                estimated_total_time = total_movies / movies_per_second if movies_per_second > 0 else 0
                remaining_time = estimated_total_time - elapsed_time
                
                pbar.set_postfix({
                    'Success': successful_fetches,
                    'Failed': failed_fetches,
                    'Speed': f"{movies_per_second:.1f} movies/s",
                    'ETA': format_time(remaining_time)
                })
                pbar.update(1)
    
    # Save any remaining movies
    if all_movie_details:
        save_movies_to_json(all_movie_details, file_index)
    
    # Print final statistics
    total_time = time.time() - start_time
    print(f"\nProcessing completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total time: {format_time(total_time)}")
    print(f"Successfully processed: {successful_fetches} movies")
    print(f"Failed to process: {failed_fetches} movies")
    print(f"Average speed: {successful_fetches/total_time:.1f} movies/second")

if __name__ == "__main__":
    main() 