import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parents[1] / '.env'
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') 
    
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    required_env_vars = ['DATABASE_URL', 'JWT_SECRET_KEY']
    for var in required_env_vars:
        if not os.getenv(var):
            raise ValueError(f"The: {var}")