class TicketmasterService {
  constructor() {
    this.apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY;
    this.baseUrl = 'https://app.ticketmaster.com/discovery/v2';
  }

  isConfigured() {
    return this.apiKey && this.apiKey !== 'your_ticketmaster_key_when_ready';
  }

  async searchEvents(params = {}) {
    if (!this.isConfigured()) {
      console.warn('Ticketmaster API key not configured');
      return { events: [], page: { totalElements: 0 } };
    }

    const defaultParams = {
      apikey: this.apiKey,
      size: 20,
      sort: 'date,asc'
    };

    const queryParams = new URLSearchParams({ ...defaultParams, ...params });
    
    try {
      const response = await fetch(`${this.baseUrl}/events.json?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Ticketmaster API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatEventsResponse(data);
    } catch (error) {
      console.error('Ticketmaster search failed:', error);
      return { events: [], page: { totalElements: 0 } };
    }
  }

  async searchEventsByLocation(city, radius = 50, startDate = null) {
    const params = {
      city,
      radius: `${radius}mi`,
      unit: 'miles'
    };

    if (startDate) {
      params.startDateTime = startDate;
    }

    return this.searchEvents(params);
  }

  async searchEventsByKeyword(keyword, city = null, startDate = null, endDate = null) {
    const params = {
      keyword
    };

    if (city) {
      params.city = city;
    }

    if (startDate) {
      params.startDateTime = startDate;
    }

    if (endDate) {
      params.endDateTime = endDate;
    }

    return this.searchEvents(params);
  }

  async getEventDetails(eventId) {
    if (!this.isConfigured()) {
      console.warn('Ticketmaster API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}.json?apikey=${this.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`Ticketmaster API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatEvent(data);
    } catch (error) {
      console.error('Failed to get event details:', error);
      return null;
    }
  }

  formatEventsResponse(data) {
    if (!data._embedded?.events) {
      return { events: [], page: { totalElements: 0 } };
    }

    return {
      events: data._embedded.events.map(event => this.formatEvent(event)),
      page: data.page
    };
  }

  formatEvent(event) {
    const venue = event._embedded?.venues?.[0];
    const location = venue?.location;
    
    return {
      id: event.id,
      name: event.name,
      description: event.info || event.pleaseNote || '',
      url: event.url,
      startDate: event.dates?.start?.dateTime || event.dates?.start?.localDate,
      endDate: event.dates?.end?.dateTime || event.dates?.end?.localDate,
      timezone: event.dates?.timezone,
      status: event.dates?.status?.code,
      venue: venue ? {
        name: venue.name,
        address: venue.address?.line1,
        city: venue.city?.name,
        state: venue.state?.stateCode,
        country: venue.country?.countryCode,
        location: location ? {
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude)
        } : null
      } : null,
      categories: event.classifications?.map(c => ({
        segment: c.segment?.name,
        genre: c.genre?.name,
        subGenre: c.subGenre?.name
      })) || [],
      priceRanges: event.priceRanges || [],
      images: event.images?.map(img => ({
        url: img.url,
        width: img.width,
        height: img.height,
        ratio: img.ratio
      })) || [],
      ticketLimit: event.ticketLimit,
      accessibility: event.accessibility,
      ageRestrictions: event.ageRestrictions
    };
  }

  // Enhanced search with better location and date handling
  async searchEventsAdvanced(params = {}) {
    const searchParams = { ...params };
    
    // Handle different location formats
    if (params.location) {
      if (typeof params.location === 'string') {
        searchParams.city = params.location;
      } else if (params.location.name) {
        searchParams.city = params.location.name;
      } else if (params.location.city) {
        searchParams.city = params.location.city;
      }
      delete searchParams.location;
    }

    // Format date properly for Ticketmaster API
    if (params.startDate) {
      const date = new Date(params.startDate);
      if (!isNaN(date.getTime())) {
        searchParams.startDateTime = date.toISOString().split('T')[0] + 'T00:00:00Z';
      }
      delete searchParams.startDate;
    }

    return this.searchEvents(searchParams);
  }

  // Helper method to get events for Soonish posts
  async getEventsForPost(searchTerm, location = null, startDate = null) {
    const searchParams = {
      keyword: searchTerm,
      size: 15,
      sort: 'date,asc'
    };

    // Handle location parameter
    if (location) {
      if (typeof location === 'string') {
        searchParams.city = location;
      } else if (location.name) {
        // Extract city name from location string
        const cityMatch = location.name.match(/([^,]+)/);
        searchParams.city = cityMatch ? cityMatch[1].trim() : location.name;
      }
    }

    // Handle date parameter
    if (startDate) {
      searchParams.startDateTime = startDate;
    }

    const events = await this.searchEvents(searchParams);

    return events.events.map(event => ({
      id: event.id,
      title: event.name,
      description: event.description || event.info || `${event.categories[0]?.genre || 'Event'} at ${event.venue?.name || 'TBD'}`,
      startTime: event.startDate,
      endTime: event.endDate,
      location: event.venue ? {
        name: `${event.venue.name}${event.venue.city ? `, ${event.venue.city}` : ''}`,
        lat: event.venue.location?.lat,
        lng: event.venue.location?.lng,
        address: event.venue.address,
        city: event.venue.city,
        state: event.venue.state
      } : null,
      metadata: {
        ticketLink: event.url,
        venue: event.venue?.name,
        category: event.categories[0]?.genre || 'Event',
        priceRange: event.priceRanges[0] ? 
          `$${event.priceRanges[0].min} - $${event.priceRanges[0].max}` : null,
        eventId: event.id,
        status: event.status,
        accessibility: event.accessibility,
        ageRestrictions: event.ageRestrictions,
        images: event.images?.filter(img => img.ratio === '16_9' || img.ratio === '4_3')?.[0]?.url
      }
    }));
  }

  // Get events by coordinates (lat/lng)
  async getEventsByCoordinates(lat, lng, radius = 25, keyword = null) {
    const params = {
      latlong: `${lat},${lng}`,
      radius: `${radius}mi`,
      unit: 'miles',
      size: 20
    };

    if (keyword) {
      params.keyword = keyword;
    }

    return this.searchEvents(params);
  }
}

export default new TicketmasterService();
