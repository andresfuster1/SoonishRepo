import { Loader } from '@googlemaps/js-api-loader';

class GoogleMapsService {
  constructor() {
    this.loader = null;
    this.map = null;
    this.placesService = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('Google Maps API key check:', apiKey ? 'Found' : 'Missing');
    
    if (!apiKey || apiKey === 'your_google_maps_key_when_ready') {
      console.warn('Google Maps API key not configured');
      return;
    }

    this.loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    try {
      await this.loader.load();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
    }
  }

  async createMap(element, options = {}) {
    await this.initialize();
    if (!this.initialized) return null;

    const defaultOptions = {
      center: { lat: 40.7128, lng: -74.0060 }, // NYC default
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    this.map = new google.maps.Map(element, { ...defaultOptions, ...options });
    this.placesService = new google.maps.places.PlacesService(this.map);
    return this.map;
  }

  async searchPlaces(query, location = null) {
    await this.initialize();
    if (!this.initialized || !this.placesService) return [];

    return new Promise((resolve, reject) => {
      const request = {
        query,
        fields: ['name', 'geometry', 'place_id', 'formatted_address', 'types']
      };

      if (location) {
        request.location = location;
        request.radius = 50000; // 50km radius
      }

      this.placesService.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const places = results.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            types: place.types
          }));
          resolve(places);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  async geocodeAddress(address) {
    await this.initialize();
    if (!this.initialized) return null;

    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  addMarker(map, position, options = {}) {
    if (!this.initialized) return null;

    return new google.maps.Marker({
      position,
      map,
      ...options
    });
  }

  createInfoWindow(content) {
    if (!this.initialized) return null;

    return new google.maps.InfoWindow({
      content
    });
  }
}

export default new GoogleMapsService();
