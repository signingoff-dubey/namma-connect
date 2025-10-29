import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Shield, Bell, Eye, Lock, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`, { withCredentials: true });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySetting = async (setting, value) => {
    try {
      const updatedSettings = {
        ...profile.privacy_settings,
        [setting]: value
      };
      await axios.post(
        `${API}/profile`,
        { ...profile, privacy_settings: updatedSettings },
        { withCredentials: true }
      );
      setProfile({ ...profile, privacy_settings: updatedSettings });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  const privacySettings = profile?.privacy_settings || {};

  return (
    <div className="min-h-screen bg-gray-50" data-testid="settings-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Privacy & Safety */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Privacy & Safety</h2>
                <p className="text-sm text-gray-600">Control what others can see</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="show_full_name" className="font-medium">Show Full Name</Label>
                <p className="text-xs text-gray-500">Display your complete name</p>
              </div>
              <Switch 
                id="show_full_name"
                checked={privacySettings.show_full_name !== false}
                onCheckedChange={(val) => updatePrivacySetting('show_full_name', val)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="show_age" className="font-medium">Show Age</Label>
                <p className="text-xs text-gray-500">Display your age to others</p>
              </div>
              <Switch 
                id="show_age"
                checked={privacySettings.show_age !== false}
                onCheckedChange={(val) => updatePrivacySetting('show_age', val)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="show_profile_photo" className="font-medium">Show Profile Photo</Label>
                <p className="text-xs text-gray-500">Make your photo visible</p>
              </div>
              <Switch 
                id="show_profile_photo"
                checked={privacySettings.show_profile_photo !== false}
                onCheckedChange={(val) => updatePrivacySetting('show_profile_photo', val)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="show_organization" className="font-medium">Show Organization</Label>
                <p className="text-xs text-gray-500">Display your workplace/school</p>
              </div>
              <Switch 
                id="show_organization"
                checked={privacySettings.show_organization !== false}
                onCheckedChange={(val) => updatePrivacySetting('show_organization', val)}
              />
            </div>

            <div className="pt-2">
              <Label className="font-medium mb-2 block">Profile Visibility</Label>
              <Select 
                value={privacySettings.profile_visibility || 'everyone'}
                onValueChange={(val) => updatePrivacySetting('profile_visibility', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone on my route</SelectItem>
                  <SelectItem value="organization">Only my organization</SelectItem>
                  <SelectItem value="verified">Only verified users</SelectItem>
                  <SelectItem value="nobody">Nobody (invisible mode)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">Manage your alerts</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="font-medium">Connection Requests</Label>
                <p className="text-xs text-gray-500">Get notified of new connections</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="font-medium">Waves</Label>
                <p className="text-xs text-gray-500">Alert when someone waves at you</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="font-medium">Messages</Label>
                <p className="text-xs text-gray-500">New message notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* About & Help */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 space-y-1">
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-3 transition">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Help & Support</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-3 transition">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Privacy Policy</span>
              </div>
            </button>
            <div className="py-3 px-3">
              <p className="text-xs text-gray-500">MetroConnect v1.0.0</p>
              <p className="text-xs text-gray-500 mt-1">Made with ❤️ for Bangalore Metro commuters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
