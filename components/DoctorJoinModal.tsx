import { useState } from 'react';
import { X, Search, UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { getDoctorByNPI } from '@/app/api/dbOperations/dbOperations.route';

interface DoctorJoinModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface NPIResult {
  npi: string;
  name: string;
  credential: string;
  specialty: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phoneNumber: string;
}

export function DoctorJoinModal({ onClose, onSuccess }: DoctorJoinModalProps) {
  const [step, setStep] = useState<'search' | 'verify' | 'create'>('search');
  const [npiNumber, setNpiNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [npiResult, setNpiResult] = useState<NPIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    specialty: '',
    about: '',
    yearsExperience: '',
    acceptTerms: false
  });

  const handleNPISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!npiNumber || npiNumber.length !== 10) {
      setError('Please enter a valid 10-digit NPI number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getDoctorByNPI(npiNumber);
      if (response.success && response.doctor) {
        setNpiResult(response.doctor);
        setFormData(prev => ({
          ...prev,
          name: response.doctor.name,
          specialty: response.doctor.specialty
        }));
        setStep('verify');
      } else {
        setError('NPI number not found or invalid. Please check and try again.');
      }
    } catch (err) {
      console.error('NPI lookup error:', err);
      setError('Failed to lookup NPI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

   
      
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl">Join MedMatch - It's Free!</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Claim your professional profile and connect with patients
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'search' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Find Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your NPI number to search for your existing medical profile
                </p>
              </div>

              <form onSubmit={handleNPISearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="npi">NPI Number</Label>
                  <Input
                    id="npi"
                    type="text"
                    placeholder="Enter your 10-digit NPI number"
                    value={npiNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNpiNumber(value);
                      setError(null);
                    }}
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your National Provider Identifier is a unique 10-digit number assigned to healthcare providers
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading || npiNumber.length !== 10}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search NPI Registry
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Don't have an NPI number? You can{' '}
                  <Button variant="link" className="p-0 h-auto text-xs">
                    apply for one here
                  </Button>
                </p>
              </div>
            </div>
          )}

          {step === 'verify' && npiResult && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium">Profile Found!</h3>
                <p className="text-sm text-muted-foreground">
                  Is this your professional information?
                </p>
              </div>

              <Card className="border-2 border-green-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{npiResult.name} {npiResult.credential}</h4>
                    <Badge variant="secondary">NPI: {npiResult.npi}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{npiResult.specialty}</p>
                  <div className="text-sm">
                    <p>{npiResult.location.address}</p>
                    <p>{npiResult.location.city}, {npiResult.location.state} {npiResult.location.zipCode}</p>
                    <p>{npiResult.phoneNumber}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('search')} className="flex-1">
                  Not Me - Search Again
                </Button>
                <Button onClick={() => setStep('create')} className="flex-1">
                  Yes, This Is Me
                </Button>
              </div>
            </div>
          )}

          {step === 'create' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium">Create Your Account</h3>
                <p className="text-sm text-muted-foreground">
                  Complete your profile to start connecting with patients
                </p>
              </div>

              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">About Me (Optional)</Label>
                  <textarea
                    id="about"
                    className="w-full min-h-20 px-3 py-2 border border-input bg-background rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tell patients about your practice, approach, and experience..."
                    value={formData.about}
                    onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years in Practice</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{' '}
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Terms of Service
                    </Button>{' '}
                    and{' '}
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Privacy Policy
                    </Button>
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep('verify')} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Profile'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}