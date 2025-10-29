import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, Calendar, Play, Square } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ALL_STATIONS = ['Baiyappanahalli', 'Swami Vivekananda Road', 'Indiranagar', 'Halasuru', 'Trinity', 'MG Road', 'Cubbon Park', 'Vidhana Soudha', 'Sir M Visvesvaraya', 'Majestic', 'Chickpet', 'KR Market', 'National College', 'Lalbagh', 'South End Circle', 'Jayanagar', 'RV Road', 'Banashankari', 'Yelachenahalli', 'Nagasandra', 'Peenya', 'Yeshwanthpur'].sort();

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStartTrip, setShowStartTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({
    from_station: '',
    to_station: '',
    line: 'purple'
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API}/trips`, { withCredentials: true });
      setTrips(response.data);
      setActiveTrip(response.data.find(t => t.active));
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrip = async () => {
    if (!newTrip.from_station || !newTrip.to_station) {
      toast.error('Please select both stations');
      return;
    }

    try {
      await axios.post(`${API}/trips`, newTrip, { withCredentials: true });
      toast.success('Trip started!');
      setShowStartTrip(false);
      fetchTrips();
    } catch (error) {
      toast.error('Failed to start trip');
    }
  };

  const endTrip = async (tripId) => {
    try {
      await axios.put(`${API}/trips/${tripId}`, { active: false }, { withCredentials: true });
      toast.success('Trip ended!');
      fetchTrips();
    } catch (error) {
      toast.error('Failed to end trip');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" data-testid="trips-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-sm text-gray-600 mt-1">Track your metro journeys</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Active Trip */}
        {activeTrip && (
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white mb-6 shadow-lg" data-testid="active-trip">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
                  <p className="text-sm font-medium">Currently Traveling</p>
                </div>
                <h2 className="text-2xl font-bold">{activeTrip.from_station} → {activeTrip.to_station}</h2>
                <p className="text-purple-200 text-sm mt-1">{activeTrip.line.charAt(0).toUpperCase() + activeTrip.line.slice(1)} Line</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => endTrip(activeTrip.id)}
                data-testid="end-trip-btn"
              >
                <Square className="w-4 h-4 mr-2" /> End Trip
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Started at {new Date(activeTrip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        )}

        {/* Start New Trip */}
        {!activeTrip && (
          <div className="mb-6">
            {!showStartTrip ? (
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-6"
                onClick={() => setShowStartTrip(true)}
                data-testid="start-trip-btn"
              >
                <Play className="w-5 h-5 mr-2" /> Start New Trip
              </Button>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Your Journey</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">From Station</label>
                    <Select value={newTrip.from_station} onValueChange={(val) => setNewTrip({...newTrip, from_station: val})}>
                      <SelectTrigger data-testid="from-station-select">
                        <SelectValue placeholder="Select starting station" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATIONS.map(station => (
                          <SelectItem key={station} value={station}>{station}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">To Station</label>
                    <Select value={newTrip.to_station} onValueChange={(val) => setNewTrip({...newTrip, to_station: val})}>
                      <SelectTrigger data-testid="to-station-select">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATIONS.map(station => (
                          <SelectItem key={station} value={station}>{station}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Metro Line</label>
                    <Select value={newTrip.line} onValueChange={(val) => setNewTrip({...newTrip, line: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purple">Purple Line</SelectItem>
                        <SelectItem value="green">Green Line</SelectItem>
                        <SelectItem value="yellow">Yellow Line</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setShowStartTrip(false)} className="flex-1">Cancel</Button>
                    <Button onClick={startTrip} className="flex-1 bg-purple-600 hover:bg-purple-700" data-testid="confirm-start-btn">Start Journey</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trip History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip History</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : trips.filter(t => !t.active).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No trip history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.filter(t => !t.active).map((trip, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100" data-testid={`trip-history-${index}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{trip.from_station} → {trip.to_station}</h4>
                      <p className="text-sm text-gray-600 mt-1">{trip.line.charAt(0).toUpperCase() + trip.line.slice(1)} Line</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(trip.start_time).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="trips" />
    </div>
  );
};

export default Trips;
