from abc import ABC, abstractmethod
from ..models import Venue, VenueType

class VenueCreator(ABC):
    @abstractmethod
    def create_venue(self, **kwargs):
        pass

class RestaurantCreator(VenueCreator):
    def create_venue(self, **kwargs):
        kwargs['venue_type'] = VenueType.RESTAURANT
        return Venue(**kwargs)

class BarCreator(VenueCreator):
    def create_venue(self, **kwargs):
        kwargs['venue_type'] = VenueType.BAR
        return Venue(**kwargs)

class CafeCreator(VenueCreator):
    def create_venue(self, **kwargs):
        kwargs['venue_type'] = VenueType.CAFE
        return Venue(**kwargs)

class VenueFactory:
    _creators = {
        'restaurant': RestaurantCreator(),
        'bar': BarCreator(),
        'cafe': CafeCreator()
    }

    @classmethod
    def create_venue(cls, venue_type: str, **kwargs):
        creator = cls._creators.get(venue_type.lower())
        if not creator:
            raise ValueError(f"Unknown venue type: {venue_type}")
        return creator.create_venue(**kwargs) 