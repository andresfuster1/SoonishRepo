import { useState, useEffect, useRef } from 'react';
import { usePosts } from '../../contexts/PostsContext';
import { useAuth } from '../../contexts/AuthContext';
import { Map, MapPin, Users, Clock, Calendar, Plane } from 'lucide-react';
import googleMaps from '../../services/googleMaps';
import apiService from '../../services/apiService';

// Real Google Maps component
const GoogleMapComponent = ({ posts, onMarkerClick, mapCenter = { lat: 40.7128, lng: -74.0060 } }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const postTypeConfig = {
    micro: { icon: Clock, color: '#4DA6FF' },
    event: { icon: Calendar, color: '#6C4AB6' },
    travel: { icon: Plane, color: '#FF6F61' }
  };

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const mapInstance = await googleMaps.createMap(mapRef.current, {
          center: mapCenter,
          zoom: 10,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        if (mapInstance) {
          setMap(mapInstance);
        }
      } catch (error) {
        console.warn('Failed to initialize Google Maps:', error);
      }
    };

    initMap();
  }, [mapCenter]);

  // Listen for location updates from other components
  useEffect(() => {
    const handleLocationUpdate = (event) => {
      if (map && event.detail?.location?.lat && event.detail?.location?.lng) {
        const { lat, lng } = event.detail.location;
        map.setCenter({ lat, lng });
        map.setZoom(15);
        
        // Add a temporary marker for the new location
        const tempMarker = googleMaps.addMarker(map, { lat, lng }, {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#A8E6CF',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 10
          },
          title: event.detail.location.name || 'New Location',
          animation: google.maps.Animation.DROP
        });
        
        // Remove the temporary marker after 5 seconds
        setTimeout(() => {
          if (tempMarker) tempMarker.setMap(null);
        }, 5000);
      }
    };

    window.addEventListener('locationUpdate', handleLocationUpdate);
    return () => window.removeEventListener('locationUpdate', handleLocationUpdate);
  }, [map]);

  useEffect(() => {
    if (!map || !posts.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    // Add markers for posts with locations
    posts.filter(post => post.location?.lat && post.location?.lng).forEach(post => {
      const config = postTypeConfig[post.type];
      
      // Create custom marker icon
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: config.color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8
      };

      const marker = googleMaps.addMarker(map, {
        lat: post.location.lat,
        lng: post.location.lng
      }, {
        icon: markerIcon,
        title: post.title
      });

      if (marker) {
        // Create info window
        const infoWindow = googleMaps.createInfoWindow(`
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${post.title}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${post.location.name}</p>
            <p style="margin: 0; font-size: 11px; color: #999;">
              ${new Date(post.startTime).toLocaleDateString()}
            </p>
          </div>
        `);

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onMarkerClick) onMarkerClick(post);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Auto-fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
      
      // Don't zoom in too much for single markers
      if (newMarkers.length === 1) {
        map.setZoom(Math.min(map.getZoom(), 15));
      }
    }
  }, [map, posts]);

  return <div ref={mapRef} className="w-full h-full" />;
};

// Fallback Mock Google Maps component
const MockGoogleMap = ({ posts, onMarkerClick }) => {
  const mapRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const postTypeConfig = {
    micro: { icon: Clock, color: 'bg-sky-500' },
    event: { icon: Calendar, color: 'bg-twilight-500' },
    travel: { icon: Plane, color: 'bg-coral-500' }
  };

  return (
    <div className="relative w-full h-full bg-lunar-100 rounded-lg overflow-hidden">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-mint-100">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button className="w-8 h-8 bg-lunar-100 hover:bg-lunar-200 rounded flex items-center justify-center text-sm font-bold text-twilight-700">
          +
        </button>
        <button className="w-8 h-8 bg-lunar-100 hover:bg-lunar-200 rounded flex items-center justify-center text-sm font-bold text-twilight-700">
          −
        </button>
      </div>

      {/* Mock Markers */}
      {posts.filter(post => post.location).map((post, index) => {
        const config = postTypeConfig[post.type];
        const Icon = config.icon;
        
        // Mock positioning based on index
        const left = 20 + (index * 15) % 60;
        const top = 20 + (index * 20) % 60;
        
        return (
          <div
            key={post.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${left}%`, top: `${top}%` }}
            onClick={() => setSelectedPost(post)}
          >
            <div className={`w-10 h-10 ${config.color} rounded-full shadow-lg flex items-center justify-center border-2 border-white hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            
            {/* Tooltip */}
            {selectedPost?.id === post.id && (
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-3 min-w-48 z-10 border border-lunar-200">
                <div className="text-sm font-medium text-twilight-900 mb-1">{post.title}</div>
                <div className="text-xs text-twilight-600 mb-2">{post.location.name}</div>
                <div className="text-xs text-twilight-500">
                  {new Date(post.startTime).toLocaleDateString()}
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
              </div>
            )}
          </div>
        );
      })}

      {/* Click outside to close tooltip */}
      <div 
        className="absolute inset-0" 
        onClick={() => setSelectedPost(null)}
      />

      {/* Map Attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-twilight-500 bg-white/80 px-2 py-1 rounded">
        Mock Map View - Add Google Maps API key to enable real maps
      </div>
    </div>
  );
};

export default function MapView() {
  const { posts, loading } = usePosts();
  const { userProfile } = useAuth();
  const [filter, setFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [useRealMap, setUseRealMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });

  // Check if Google Maps API is available
  useEffect(() => {
    const checkGoogleMaps = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      console.log('MapView: Checking Google Maps API...', apiKey ? 'Key found' : 'No key');
      
      if (apiKey && apiKey !== 'your_google_maps_key_when_ready') {
        try {
          console.log('MapView: Initializing Google Maps...');
          await googleMaps.initialize();
          console.log('MapView: Google Maps initialized successfully');
          setUseRealMap(true);
        } catch (error) {
          console.warn('Google Maps not available, using mock map:', error);
          setUseRealMap(false);
        }
      } else {
        console.log('MapView: Using mock map - no valid API key');
        setUseRealMap(false);
      }
    };
    
    checkGoogleMaps();

    // Listen for location updates from other components
    const handleLocationUpdate = (event) => {
      if (event.detail?.location?.lat && event.detail?.location?.lng) {
        const { lat, lng } = event.detail.location;
        setMapCenter({ lat, lng });
      }
    };

    window.addEventListener('locationUpdate', handleLocationUpdate);
    return () => window.removeEventListener('locationUpdate', handleLocationUpdate);
  }, []);

  const filteredPosts = posts.filter(post => {
    if (!post.location) return false;
    if (filter === 'all') return true;
    return post.type === filter;
  });

  const postCounts = {
    all: posts.filter(p => p.location).length,
    micro: posts.filter(p => p.location && p.type === 'micro').length,
    event: posts.filter(p => p.location && p.type === 'event').length,
    travel: posts.filter(p => p.location && p.type === 'travel').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twilight-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-lunar-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-twilight-500 to-sky-500 rounded-full flex items-center justify-center">
              <Map className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-twilight-900">Map View</h1>
              <p className="text-sm text-twilight-600">
                {filteredPosts.length} plans with locations
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', icon: MapPin },
              { key: 'micro', label: 'Micro', icon: Clock },
              { key: 'event', label: 'Events', icon: Calendar },
              { key: 'travel', label: 'Travel', icon: Plane },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-twilight-100 text-twilight-700'
                    : 'text-twilight-600 hover:text-twilight-900 hover:bg-lunar-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <span className="bg-lunar-200 text-twilight-700 px-1.5 py-0.5 rounded-full text-xs">
                  {postCounts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {filteredPosts.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-lunar-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-lunar-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-12 h-12 text-lunar-400" />
              </div>
              <h3 className="text-lg font-medium text-twilight-900 mb-2">No locations to show</h3>
              <p className="text-twilight-600">
                {filter === 'all' 
                  ? 'Add location details to your plans to see them on the map'
                  : `No ${filter} plans with locations found`
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {useRealMap ? (
              <GoogleMapComponent 
                posts={filteredPosts}
                onMarkerClick={setSelectedPost}
                mapCenter={mapCenter}
              />
            ) : (
              <MockGoogleMap 
                posts={filteredPosts}
                onMarkerClick={setSelectedPost}
              />
            )}
            
            {/* Location search overlay for quick navigation */}
            <div className="absolute top-4 right-4 w-72">
              <div className="bg-white rounded-lg shadow-lg p-3 border border-lunar-200">
                <div className="flex items-center space-x-2 text-sm text-twilight-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Quick Location Search</span>
                </div>
                <input
                  type="text"
                  placeholder="Search location to center map..."
                  className="w-full px-3 py-2 text-sm border border-lunar-300 rounded-md focus:outline-none focus:ring-2 focus:ring-twilight-500 bg-white text-twilight-900 placeholder-lunar-500"
                  onKeyPress={async (e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      try {
                        const locations = await apiService.searchLocations(e.target.value);
                        if (locations.length > 0) {
                          const location = locations[0];
                          window.dispatchEvent(new CustomEvent('locationUpdate', {
                            detail: { location }
                          }));
                          e.target.value = '';
                        }
                      } catch (error) {
                        console.error('Location search failed:', error);
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Map status indicator */}
            <div className="absolute bottom-2 left-2 text-xs text-twilight-500 bg-white/80 px-2 py-1 rounded">
              {useRealMap ? 'Google Maps' : 'Mock Map View - Add Google Maps API key for real maps'}
            </div>
          </>
        )}

        {/* Sidebar with post list */}
        <div className="absolute top-4 left-4 w-80 max-h-96 bg-white rounded-lg shadow-lg overflow-hidden border border-lunar-200">
          <div className="p-4 border-b border-lunar-200">
            <h3 className="font-medium text-twilight-900">Upcoming Plans</h3>
          </div>
          <div className="overflow-y-auto max-h-80">
            {filteredPosts.slice(0, 10).map((post) => {
              const postTypeConfig = {
                micro: { icon: Clock, color: 'text-sky-600 bg-sky-100' },
                event: { icon: Calendar, color: 'text-twilight-600 bg-twilight-100' },
                travel: { icon: Plane, color: 'text-coral-600 bg-coral-100' }
              };
              
              const config = postTypeConfig[post.type];
              const Icon = config.icon;
              
              return (
                <div
                  key={post.id}
                  className="p-4 border-b border-lunar-100 hover:bg-sky-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-twilight-900 truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs text-twilight-600 truncate">
                        {post.location.name}
                      </p>
                      <p className="text-xs text-twilight-500">
                        {new Date(post.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
