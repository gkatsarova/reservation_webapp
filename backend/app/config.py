import os
from dotenv import load_dotenv
from pathlib import Path

if os.environ.get('RAILWAY_ENVIRONMENT') is None:
    env_path = Path(__file__).resolve().parents[1] / '.env'
    load_dotenv(env_path)

class Config:
    raw_uri = os.environ.get('DATABASE_URL', 'sqlite:///:memory:')
    
    if raw_uri and raw_uri.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = raw_uri.replace("postgres://", "postgresql://", 1)
    else:
        SQLALCHEMY_DATABASE_URI = raw_uri
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
    
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
        
class TestingConfig(Config):
    TESTING = True
    test_uri = os.getenv('TEST_DATABASE_URL', 'sqlite:///:memory:')
    
    if test_uri and test_uri.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = test_uri.replace("postgres://", "postgresql://", 1)
    else:
        SQLALCHEMY_DATABASE_URI = test_uri
        
    DEBUG = False