import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATIONS = {
  purple: ['Baiyappanahalli', 'Swami Vivekananda Road', 'Indiranagar', 'Halasuru', 'Trinity', 'MG Road', 'Cubbon Park', 'Vidhana Soudha', 'Sir M Visvesvaraya', 'Majestic', 'Chickpet', 'KR Market', 'National College', 'Lalbagh', 'South End Circle', 'Jayanagar', 'RV Road', 'Banashankari', 'Jaya Prakash Nagar', 'Yelachenahalli'],
  green: ['Nagasandra', 'Dasarahalli', 'Jalahalli', 'Peenya Industry', 'Peenya', 'Goraguntepalya', 'Yeshwanthpur', 'Sandal Soap Factory', 'Mahalakshmi', 'Rajajinagar', 'Kuvempu Road', 'Srirampura', 'Mantri Square', 'Majestic', 'Chickpet'],
  yellow: ['RV Road', 'Jayanagar', 'South End Circle', 'Lalbagh', 'National College', 'KR Market', 'Chickpet', 'Majestic']
};

const ALL_STATIONS = [...new Set([...STATIONS.purple, ...STATIONS.green, ...STATIONS.yellow])].sort();

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    age: '',
    gender: '',
    profile_photo: '',
    organization_type: '',
    organization_name: '',
    organization_email: '',
    department: '',
    designation: '',
    home_station: '',
    work_station: '',
    commute_times: { morning: '', evening: '' },
    travel_days: [],
    privacy_settings: {
      profile_visibility: 'everyone',
      show_full_name: true,
      show_age: true,
      show_profile_photo: true,
      show_organization: true
    }
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API}/profile`, formData, { withCredentials: true });
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">Step {step} of 4</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in" data-testid="onboarding-step-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={formData.full_name} onChange={(e) => updateField('full_name', e.target.value)} placeholder="Enter your full name" data-testid="full-name-input" />
              </div>

              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => {
                  updateField('date_of_birth', e.target.value);
                  const age = new Date().getFullYear() - new Date(e.target.value).getFullYear();
                  updateField('age', age);
                }} data-testid="dob-input" />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => updateField('gender', val)}>
                  <SelectTrigger data-testid="gender-select">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in" data-testid="onboarding-step-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Organization Details</h2>
              
              <div>
                <Label htmlFor="org_type">Organization Type</Label>
                <Select value={formData.organization_type} onValueChange={(val) => updateField('organization_type', val)}>
                  <SelectTrigger data-testid="org-type-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="org_name">Organization Name</Label>
                <Input id="org_name" value={formData.organization_name} onChange={(e) => updateField('organization_name', e.target.value)} placeholder="e.g., Infosys, Christ University" data-testid="org-name-input" />
              </div>

              <div>
                <Label htmlFor="org_email">Organization Email (for verification)</Label>
                <Input id="org_email" type="email" value={formData.organization_email} onChange={(e) => updateField('organization_email', e.target.value)} placeholder="your.name@organization.com" data-testid="org-email-input" />
              </div>

              <div>
                <Label htmlFor="department">Department/Branch (Optional)</Label>
                <Input id="department" value={formData.department} onChange={(e) => updateField('department', e.target.value)} placeholder="e.g., Engineering, CSE" />
              </div>

              <div>
                <Label htmlFor="designation">Designation/Year (Optional)</Label>
                <Input id="designation" value={formData.designation} onChange={(e) => updateField('designation', e.target.value)} placeholder="e.g., Software Engineer, 2nd Year" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in" data-testid="onboarding-step-3">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Commute Preferences</h2>
              
              <div>
                <Label htmlFor="home_station">Home Station</Label>
                <Select value={formData.home_station} onValueChange={(val) => updateField('home_station', val)}>
                  <SelectTrigger data-testid="home-station-select">
                    <SelectValue placeholder="Select your home station" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATIONS.map(station => (
                      <SelectItem key={station} value={station}>{station}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="work_station">Work/College Station</Label>
                <Select value={formData.work_station} onValueChange={(val) => updateField('work_station', val)}>
                  <SelectTrigger data-testid="work-station-select">
                    <SelectValue placeholder="Select your destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATIONS.map(station => (
                      <SelectItem key={station} value={station}>{station}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Usual Commute Times</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="morning" className="text-sm">Morning</Label>
                    <Input id="morning" type="time" value={formData.commute_times.morning} onChange={(e) => updateField('commute_times', { ...formData.commute_times, morning: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="evening" className="text-sm">Evening</Label>
                    <Input id="evening" type="time" value={formData.commute_times.evening} onChange={(e) => updateField('commute_times', { ...formData.commute_times, evening: e.target.value })} />
                  </div>
                </div>
              </div>

              <div>
                <Label>Regular Travel Days</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const days = formData.travel_days.includes(day) 
                          ? formData.travel_days.filter(d => d !== day)
                          : [...formData.travel_days, day];
                        updateField('travel_days', days);
                      }}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                        formData.travel_days.includes(day)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in" data-testid="onboarding-step-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
              <p className="text-gray-600 mb-6">You're in control of what others can see</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <Label htmlFor="show_full_name">Show Full Name</Label>
                  <Checkbox 
                    id="show_full_name" 
                    checked={formData.privacy_settings.show_full_name}
                    onCheckedChange={(checked) => updateField('privacy_settings', { ...formData.privacy_settings, show_full_name: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <Label htmlFor="show_age">Show Age</Label>
                  <Checkbox 
                    id="show_age" 
                    checked={formData.privacy_settings.show_age}
                    onCheckedChange={(checked) => updateField('privacy_settings', { ...formData.privacy_settings, show_age: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <Label htmlFor="show_organization">Show Organization</Label>
                  <Checkbox 
                    id="show_organization" 
                    checked={formData.privacy_settings.show_organization}
                    onCheckedChange={(checked) => updateField('privacy_settings', { ...formData.privacy_settings, show_organization: checked })}
                  />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-purple-900">You can change these settings anytime from your profile</p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} data-testid="back-btn">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} className="ml-auto bg-purple-600 hover:bg-purple-700" data-testid="next-btn">
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="ml-auto bg-green-600 hover:bg-green-700" data-testid="finish-btn">
                Start Discovering <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
