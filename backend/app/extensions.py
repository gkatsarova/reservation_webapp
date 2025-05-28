from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

api = Api(
    title='Restaurant Reservation API',
    version='1.0',
    description='API for managing restaurant reservations',
    doc='/swagger/', 
    prefix='/api',   
    authorizations={
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'Add "Bearer &lt;your token&gt;"'
        }
    }
)

