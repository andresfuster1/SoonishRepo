import googleMaps from './googleMaps';
import ticketmaster from './ticketmaster';
import amadeus from './amadeus';

class APIService {
  constructor() {
    this.googleMaps = googleMaps;
    this.ticketmaster = ticketmaster;
    this.amadeus = amadeus;
  }

  // Check which APIs are configured
  getConfiguredAPIs() {
    return {
      googleMaps: this.googleMaps.initialized || import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'your_google_maps_key_when_ready',
      ticketmaster: this.ticketmaster.isConfigured(),
      amadeus: this.amadeus.isConfigured()
    };
  }

  // Enhanced location search using Google Places
  async searchLocations(query) {
    try {
      const places = await this.googleMaps.searchPlaces(query);
      return places.map(place => ({
        id: place.id,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        type: 'place'
      }));
    } catch (error) {
      console.warn('Google Places search failed, using fallback:', error);
      // Fallback to basic location object
      return [{
        id: Date.now().toString(),
        name: query,
        address: query,
        lat: null,
        lng: null,
        type: 'manual'
      }];
    }
  }

  // Search events using Ticketmaster
  async searchEvents(query, city = null, date = null) {
    try {
      const events = await this.ticketmaster.getEventsForPost(query, city, date);
      return events.map(event => ({
        ...event,
        type: 'event',
        source: 'ticketmaster'
      }));
    } catch (error) {
      console.warn('Ticketmaster search failed:', error);
      return [];
    }
  }

  // Search travel options using Amadeus
  async searchTravel(fromCity, toCity, departureDate, returnDate = null) {
    try {
      const travels = await this.amadeus.getTravelSuggestions(fromCity, toCity, departureDate, returnDate);
      return travels.map(travel => ({
        ...travel,
        type: 'travel',
        source: 'amadeus'
      }));
    } catch (error) {
      console.warn('Amadeus search failed:', error);
      return [];
    }
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address) {
    try {
      return await this.googleMaps.geocodeAddress(address);
    } catch (error) {
      console.warn('Geocoding failed:', error);
      return null;
    }
  }

  // Create a map instance
  async createMap(element, options = {}) {
    try {
      return await this.googleMaps.createMap(element, options);
    } catch (error) {
      console.warn('Map creation failed:', error);
      return null;
    }
  }

  // Add markers to a map
  addMapMarker(map, position, options = {}) {
    try {
      return this.googleMaps.addMarker(map, position, options);
    } catch (error) {
      console.warn('Marker creation failed:', error);
      return null;
    }
  }

  // Enhanced post creation with API suggestions
  async getPostSuggestions(type, query, location = null, date = null) {
    const suggestions = [];

    switch (type) {
      case 'event':
        const events = await this.searchEvents(query, location, date);
        suggestions.push(...events);
        break;

      case 'travel':
        if (location && query) {
          const travels = await this.searchTravel(location, query, date);
          suggestions.push(...travels);
        }
        break;

      case 'micro':
        // For micro plans, just enhance with location data
        if (query) {
          const locations = await this.searchLocations(query);
          suggestions.push(...locations.map(loc => ({
            title: `Quick plan at ${loc.name}`,
            location: loc,
            type: 'micro',
            source: 'location'
          })));
        }
        break;
    }

    return suggestions;
  }

  // Check for overlapping locations between posts
  calculateDistance(pos1, pos2) {
    if (!pos1.lat || !pos1.lng || !pos2.lat || !pos2.lng) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  // Find overlapping posts based on location and time
  findOverlaps(userPosts, friendPosts, maxDistance = 5, maxTimeHours = 2) {
    const overlaps = [];

    userPosts.forEach(userPost => {
      if (!userPost.location?.lat || !userPost.location?.lng) return;

      friendPosts.forEach(friendPost => {
        if (!friendPost.location?.lat || !friendPost.location?.lng) return;

        const distance = this.calculateDistance(userPost.location, friendPost.location);
        if (distance === null || distance > maxDistance) return;

        const timeDiff = Math.abs(
          new Date(userPost.startTime) - new Date(friendPost.startTime)
        ) / (1000 * 60 * 60); // Hours

        if (timeDiff <= maxTimeHours) {
          overlaps.push({
            userPost,
            friendPost,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            timeDifference: Math.round(timeDiff * 10) / 10
          });
        }
      });
    });

    return overlaps;
  }
}

export default new APIService();
