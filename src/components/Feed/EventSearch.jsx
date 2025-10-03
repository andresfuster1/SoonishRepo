import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import apiService from '../../services/apiService';

export default function EventSearch({ 
  onEventSelect, 
  location = null, 
  className = "",
  placeholder = "Search for events..." 
}) {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search for events
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchEvents(query);
      } else {
        setEvents([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, location]);

  const searchEvents = async (searchTerm) => {
    setLoading(true);
    try {
      const cityName = location?.name || location?.city || null;
      const eventResults = await apiService.searchEvents(searchTerm, cityName);
      setEvents(eventResults.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(eventResults.length > 0);
    } catch (error) {
      console.error('Event search failed:', error);
      setEvents([]);
      setShowSuggestions(false);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || events.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < events.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && events[selectedIndex]) {
          selectEvent(events[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectEvent = (event) => {
    setQuery(event.title);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Convert event to post format
    const postData = {
      title: event.title,
      description: event.description || `${event.metadata?.category || 'Event'} at ${event.location?.name || 'TBD'}`,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      metadata: {
        ...event.metadata,
        eventId: event.id,
        source: 'ticketmaster'
      }
    };
    
    onEventSelect(postData);
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPriceRange = (priceRange) => {
    if (!priceRange) return '';
    return priceRange;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lunar-500" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-3 border border-lunar-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 focus:border-transparent bg-white text-twilight-900 placeholder-lunar-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-twilight-500"></div>
          </div>
        )}
      </div>

      {/* Event Suggestions */}
      {showSuggestions && events.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-lunar-300 rounded-lg mt-1 shadow-lg z-50 max-h-96 overflow-y-auto">
          {events.map((event, index) => (
            <div
              key={event.id}
              onClick={() => selectEvent(event)}
              className={`p-4 cursor-pointer border-b border-lunar-200 last:border-b-0 hover:bg-sky-50 transition-colors ${
                index === selectedIndex ? 'bg-twilight-50 border-l-4 border-l-twilight-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-twilight-500 to-coral-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-twilight-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-twilight-600 mb-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {event.location?.name || 'Location TBD'}
                  </p>
                  <p className="text-sm text-twilight-600 mb-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatEventDate(event.startTime)}
                  </p>
                  {event.metadata?.category && (
                    <span className="inline-block px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full">
                      {event.metadata.category}
                    </span>
                  )}
                </div>
                {event.metadata?.priceRange && (
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-mint-600">
                      {formatPriceRange(event.metadata.priceRange)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && events.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-lunar-300 rounded-lg mt-1 p-4 shadow-lg z-50">
          <div className="text-center text-twilight-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-lunar-400" />
            <p className="text-sm">No events found for "{query}"</p>
            <p className="text-xs mt-1">Try a different search term or check the location</p>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
