import pytest
from sqlalchemy_utils import database_exists, create_database
from app import create_app, db
from app.config import TestingConfig

@pytest.fixture(scope='session')
def app():
    test_db_url = TestingConfig.SQLALCHEMY_DATABASE_URI
    
    if not database_exists(test_db_url):
        create_database(test_db_url)
        print(f"Created test database: {test_db_url}")
    
    app = create_app(TestingConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='session')
def client(app):
    return app.test_client()