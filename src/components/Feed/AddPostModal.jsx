import { useState, useEffect } from 'react';
import { usePosts } from '../../contexts/PostsContext';
import { X, Clock, Calendar, Plane, MapPin, Search } from 'lucide-react';
import apiService from '../../services/apiService';
import EventSearch from './EventSearch';

const postTypes = [
  { 
    id: 'micro', 
    label: 'Micro Plan', 
    icon: Clock, 
    description: 'Quick plans for the next 24 hours',
    color: 'from-sky-500 to-sky-600'
  },
  { 
    id: 'event', 
    label: 'Event', 
    icon: Calendar, 
    description: 'Concerts, parties, meetups',
    color: 'from-twilight-500 to-coral-500'
  },
  { 
    id: 'travel', 
    label: 'Travel', 
    icon: Plane, 
    description: 'Trips and travel plans',
    color: 'from-coral-500 to-coral-600'
  }
];

export default function AddPostModal({ isOpen, onClose }) {
  const [selectedType, setSelectedType] = useState('micro');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState({ name: '', lat: null, lng: null });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventSearchEnabled, setEventSearchEnabled] = useState(false);
  
  const { addPost } = usePosts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        type: selectedType,
        title,
        description,
        startTime,
        endTime: endTime || null,
        location: location.name ? location : null,
        metadata: {}
      };

      await addPost(postData);
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setLocation({ name: '', lat: null, lng: null });
      setSelectedType('micro');
      setEventSearchEnabled(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
    
    setLoading(false);
  };

  // Search for locations using Google Places API
  const searchLocations = async (query) => {
    if (!query.trim()) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    try {
      const suggestions = await apiService.searchLocations(query);
      setLocationSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
      setShowLocationSuggestions(true);
    } catch (error) {
      console.warn('Location search failed:', error);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  // Handle location input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (location.name) {
        searchLocations(location.name);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [location.name]);

  const selectLocation = (suggestion) => {
    setLocation({
      name: suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lng
    });
    setShowLocationSuggestions(false);
  };

  // Handle event selection from EventSearch
  const handleEventSelect = (eventData) => {
    setTitle(eventData.title);
    setDescription(eventData.description);
    setStartTime(eventData.startTime ? new Date(eventData.startTime).toISOString().slice(0, 16) : '');
    setEndTime(eventData.endTime ? new Date(eventData.endTime).toISOString().slice(0, 16) : '');
    if (eventData.location) {
      setLocation(eventData.location);
    }
    setEventSearchEnabled(false);
  };

  // Update location when it changes to update map
  useEffect(() => {
    if (location.lat && location.lng) {
      // Trigger map update by dispatching a custom event
      window.dispatchEvent(new CustomEvent('locationUpdate', {
        detail: { location }
      }));
    }
  }, [location]);

  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    const maxDate = new Date();
    if (selectedType === 'micro') {
      maxDate.setHours(maxDate.getHours() + 24);
    } else {
      maxDate.setFullYear(maxDate.getFullYear() + 1);
    }
    return maxDate.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-twilight-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-lunar-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-lunar-200">
          <h2 className="text-xl font-semibold text-twilight-900">Add a Plan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-lunar-100 rounded-full transition-colors text-lunar-500 hover:text-twilight-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-twilight-700 mb-3">
              What type of plan?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedType === type.id
                        ? 'border-twilight-500 bg-twilight-50 shadow-md'
                        : 'border-lunar-300 hover:border-sky-400 hover:bg-sky-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-twilight-900">{type.label}</h3>
                        <p className="text-sm text-twilight-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title / Event Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-twilight-700">
                {selectedType === 'event' ? 'Event' : 'Title'} *
              </label>
              {selectedType === 'event' && (
                <button
                  type="button"
                  onClick={() => setEventSearchEnabled(!eventSearchEnabled)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
                >
                  {eventSearchEnabled ? 'Manual Entry' : 'Search Events'}
                </button>
              )}
            </div>
            
            {selectedType === 'event' && eventSearchEnabled ? (
              <EventSearch
                onEventSelect={handleEventSelect}
                location={location}
                placeholder="Search for concerts, shows, sports events..."
                className="mb-4"
              />
            ) : (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-lunar-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 focus:border-transparent bg-white text-twilight-900 placeholder-lunar-500"
                placeholder={selectedType === 'event' ? 'Event name or search above' : 'What are you planning?'}
                required
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-twilight-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-lunar-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 focus:border-transparent bg-white text-twilight-900 placeholder-lunar-500 resize-none"
              placeholder="Add more details..."
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-twilight-700 mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={getMinDateTime()}
              max={getMaxDateTime()}
              className="w-full px-3 py-2 border border-lunar-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 focus:border-transparent bg-white text-twilight-900"
              required
            />
          </div>

          {/* End Time (optional for micro plans) */}
          {selectedType !== 'micro' && (
            <div>
              <label className="block text-sm font-medium text-twilight-700 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={startTime || getMinDateTime()}
                className="w-full px-3 py-2 border border-lunar-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 focus:border-transparent bg-white text-twilight-900"
              />
            </div>
          )}

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-twilight-700">
                Location
              </label>
              {location.lat && location.lng && (
                <span className="text-xs text-mint-600 font-medium flex items-center">
                  <div className="w-2 h-2 bg-mint-500 rounded-full mr-1 animate-pulse"></div>
                  Coordinates found
                </span>
              )}
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lunar-500" />
              <input
                type="text"
                value={location.name}
                onChange={(e) => setLocation({ ...location, name: e.target.value })}
                onFocus={() => location.name && setShowLocationSuggestions(true)}
                className="w-full pl-10 pr-3 py-2 border border-lunar-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 focus:border-transparent bg-white text-twilight-900 placeholder-lunar-500"
                placeholder={selectedType === 'event' ? 'Event venue or city' : 'Where is this happening?'}
              />
              
              {/* Location Suggestions */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-lunar-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-sky-50 focus:bg-sky-50 focus:outline-none border-b border-lunar-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-lunar-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-twilight-900 truncate">
                            {suggestion.name}
                          </div>
                          {suggestion.address && (
                            <div className="text-xs text-twilight-500 truncate">
                              {suggestion.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-lunar-300 text-twilight-700 rounded-lg hover:bg-lunar-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title || !startTime}
              className="flex-1 bg-gradient-to-r from-twilight-500 to-sky-500 text-white py-2 px-4 rounded-lg font-medium hover:from-twilight-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-twilight-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
