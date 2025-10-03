class AmadeusService {
  constructor() {
    this.apiKey = import.meta.env.VITE_AMADEUS_API_KEY;
    this.apiSecret = import.meta.env.VITE_AMADEUS_API_SECRET;
    this.baseUrl = 'https://test.api.amadeus.com/v1'; // Use production URL for live
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  isConfigured() {
    return this.apiKey && 
           this.apiSecret && 
           this.apiKey !== 'your_amadeus_api_key_here' &&
           this.apiSecret !== 'your_amadeus_api_secret_here';
  }

  async getAccessToken() {
    if (!this.isConfigured()) {
      console.warn('Amadeus API credentials not configured');
      return null;
    }

    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Amadeus access token:', error);
      return null;
    }
  }

  async makeRequest(endpoint, params = {}) {
    const token = await this.getAccessToken();
    if (!token) return null;

    const queryParams = new URLSearchParams(params);
    const url = `${this.baseUrl}${endpoint}?${queryParams}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Amadeus API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Amadeus API request failed:', error);
      return null;
    }
  }

  async searchFlights(origin, destination, departureDate, returnDate = null, adults = 1) {
    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults
    };

    if (returnDate) {
      params.returnDate = returnDate;
    }

    const data = await this.makeRequest('/shopping/flight-offers', params);
    
    if (!data?.data) return [];

    return data.data.map(offer => this.formatFlightOffer(offer));
  }

  async searchAirports(keyword) {
    const data = await this.makeRequest('/reference-data/locations', {
      keyword,
      subType: 'AIRPORT,CITY'
    });

    if (!data?.data) return [];

    return data.data.map(location => ({
      code: location.iataCode,
      name: location.name,
      city: location.address?.cityName,
      country: location.address?.countryName,
      type: location.subType
    }));
  }

  async getCitySearch(keyword) {
    const data = await this.makeRequest('/reference-data/locations/cities', {
      keyword
    });

    if (!data?.data) return [];

    return data.data.map(city => ({
      code: city.iataCode,
      name: city.name,
      country: city.address?.countryName,
      region: city.address?.regionCode
    }));
  }

  formatFlightOffer(offer) {
    const itinerary = offer.itineraries[0];
    const segment = itinerary.segments[0];
    
    return {
      id: offer.id,
      price: {
        total: offer.price.total,
        currency: offer.price.currency
      },
      departure: {
        airport: segment.departure.iataCode,
        time: segment.departure.at
      },
      arrival: {
        airport: segment.arrival.iataCode,
        time: segment.arrival.at
      },
      airline: segment.carrierCode,
      flightNumber: `${segment.carrierCode}${segment.number}`,
      duration: itinerary.duration,
      stops: itinerary.segments.length - 1,
      aircraft: segment.aircraft?.code,
      bookingClass: segment.cabin || 'ECONOMY'
    };
  }

  // Helper method to get travel suggestions for Soonish posts
  async getTravelSuggestions(fromCity, toCity, departureDate, returnDate = null) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      // Search for airports in the cities
      const [fromAirports, toAirports] = await Promise.all([
        this.searchAirports(fromCity),
        this.searchAirports(toCity)
      ]);

      if (fromAirports.length === 0 || toAirports.length === 0) {
        return [];
      }

      const fromCode = fromAirports[0].code;
      const toCode = toAirports[0].code;

      const flights = await this.searchFlights(fromCode, toCode, departureDate, returnDate);

      return flights.slice(0, 5).map(flight => ({
        id: flight.id,
        title: `Flight to ${toCity}`,
        description: `${flight.airline} ${flight.flightNumber} - ${flight.price.total} ${flight.price.currency}`,
        startTime: flight.departure.time,
        endTime: flight.arrival.time,
        location: {
          name: `${fromCity} → ${toCity}`,
          lat: null, // Would need geocoding for exact coordinates
          lng: null
        },
        metadata: {
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          price: `${flight.price.total} ${flight.price.currency}`,
          duration: flight.duration,
          stops: flight.stops,
          bookingClass: flight.bookingClass
        }
      }));
    } catch (error) {
      console.error('Travel suggestions failed:', error);
      return [];
    }
  }
}

export default new AmadeusService();
