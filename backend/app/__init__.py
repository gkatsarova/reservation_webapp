from flask import Flask
from .config import Config
from .extensions import db, jwt, api, migrate

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

    return app