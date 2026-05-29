import os
import sys
import zipfile

# Add parent directory to path so we can import Config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import Config

# Configure Kaggle credentials programmatically
os.environ['KAGGLE_USERNAME'] = "shuvam776"
# Ensure the key is correct (both full token and raw hex work)
os.environ['KAGGLE_KEY'] = "17f7223b8f837a899e39e952055ab3ad"

def download_and_extract_datasets():
    """
    Downloads the 5 required datasets from Kaggle using the Kaggle API
    and extracts them to backend/data/raw/
    """
    print("Initializing Kaggle API and downloading datasets...")
    
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        print("Kaggle API successfully authenticated.")
    except Exception as e:
        print(f"Error authenticating Kaggle API: {e}")
        print("Please check your network and Kaggle credentials.")
        return False

    # Define the 6 datasets to download
    datasets = {
        'cholera': 'imdevskp/cholera-outbreak-dataset',
        'symptoms': 'itachi9604/disease-symptom-description-dataset',
        'rainfall': 'rajanand/rainfall-in-india',
        'flood': 'anubhavsaraf/flood-prediction-dataset',
        'global_flood': 'hasibalmuzdadid/global-flood-dataset',
        'disasters': 'brsdincer/all-natural-disasters-19002021-eosdis'
    }
    
    # Raw directory path
    raw_dir = os.path.join(Config.DATA_DIR, 'raw')
    os.makedirs(raw_dir, exist_ok=True)
    print(f"Downloading files to raw directory: {raw_dir}")
    
    for name, path in datasets.items():
        dest_folder = os.path.join(raw_dir, name)
        os.makedirs(dest_folder, exist_ok=True)
        
        print(f"\n--- Downloading dataset '{name}' ({path}) ---")
        try:
            # Download dataset files
            api.dataset_download_files(path, path=dest_folder, unzip=False)
            print(f"Successfully downloaded '{name}' zip package.")
            
            # Find download zip file and extract
            zip_file = None
            for file in os.listdir(dest_folder):
                if file.endswith('.zip'):
                    zip_file = os.path.join(dest_folder, file)
                    break
            
            if zip_file:
                print(f"Extracting {zip_file} to {dest_folder}...")
                with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                    zip_ref.extractall(dest_folder)
                print(f"Successfully unzipped '{name}' files.")
                # Clean up zip file
                os.remove(zip_file)
            else:
                # If already unzipped by the library
                print(f"Dataset '{name}' already unzipped or empty zip.")
                
        except Exception as e:
            print(f"Error downloading or unzipping '{name}': {e}")
            
    print("\nKaggle datasets download and extraction pipeline finished successfully!")
    return True

if __name__ == '__main__':
    download_and_extract_datasets()
