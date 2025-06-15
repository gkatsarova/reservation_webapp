from flask import Flask
from .config import Config
from .extensions import db, jwt, api, migrate
from .routes.health import health_bp
from flask_cors import CORS

def create_app(config_class=Config): 
    app = Flask(__name__)
    app.config.from_object(config_class)  

    db.init_app(app)
    jwt.init_app(app)
    api.init_app(app)
    migrate.init_app(app, db)

    from .routes.auth import ns as auth_ns
    from .routes.venues import ns as venues_ns
    from .routes.reservations import ns as reservations_ns

    api.add_namespace(auth_ns, path='/auth')
    api.add_namespace(venues_ns, path='/venues')
    api.add_namespace(reservations_ns, path='/reservations')

    app.register_blueprint(health_bp)

    CORS(app, 
         resources={r"/api/*": {
             "origins": ["http://localhost", "http://localhost:3000"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }},
         expose_headers=["Content-Type", "Authorization"]
    )

    return app