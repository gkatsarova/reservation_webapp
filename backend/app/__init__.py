from flask import Flask
from .config import Config
from .extensions import db, jwt, api, migrate
from .routes.health import health_bp
from flask_cors import CORS
from flask import Flask, request

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    api.init_app(app)
    migrate.init_app(app, db)

    from .routes.auth import ns as auth_ns
    from .routes.venues import ns as venues_ns
    from .routes.reservations import ns as reservations_ns

    api.add_namespace(auth_ns)
    api.add_namespace(venues_ns)
    api.add_namespace(reservations_ns)

    app.register_blueprint(health_bp)

    CORS(app, resources={r"/api/*": {"origins": ["http://localhost", "http://localhost:80", "http://localhost:3000", "http://localhost:3000"]}}, supports_credentials=True)

    @app.after_request
    def after_request(response):
        if request.method == "OPTIONS":
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    return app