import { X, Smartphone, Download, Star, Shield, Stethoscope, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import Image from 'next/image';

interface AppDownloadModalProps {
  onClose: () => void;
}

export function AppDownloadModal({ onClose }: AppDownloadModalProps) {
  const handleDownloadAndroid = () => {
    // Replace with actual Google Play Store link
    window.open('https://play.google.com/store/apps/details?id=com.medmatchnetwork.patient', '_blank');
  };

  const handleDownloadiOS = () => {
    // Replace with actual App Store link
    window.open('https://apps.apple.com/us/app/medmatchnet/id6471358944', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-blue-200 shadow-2xl">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">MedMatchNetwork</CardTitle>
                <p className="text-sm text-blue-600">Patient Mobile App</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* App Features */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-3">📱 Get the MedMatchNetwork App</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Access our complete medical directory, book appointments, and chat with Edha - your AI nurse assistant - right from your mobile device.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                <span>Find Doctors</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span>Book Appointments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-purple-500" />
                <span>Ask Edha 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="h-4 w-4 text-cyan-500" />
                <span>Mobile Friendly</span>
              </div>
            </div>

            {/* App Rating */}
            <div className="flex items-center justify-center gap-2 py-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" /> {/* half star effect */}
                  <Star className="h-4 w-4 text-yellow-400" /> {/* empty star */}
                </div>
              </div>
              <span className="font-medium text-blue-800">3.7</span>
              {/* <span className="text-sm text-blue-600">• 50K+ Downloads</span> */}
            </div>
          </div>

          <Separator />

          {/* Download Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium text-center">Choose Your Platform</h4>

            {/* Android Download */}
            <Button
              onClick={handleDownloadAndroid}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">Download on</div>
                  <div className="text-lg font-bold -mt-1">Google Play</div>
                </div>
              </div>
            </Button>

            {/* iOS Download */}
            <Button
              onClick={handleDownloadiOS}
              className="w-full bg-black hover:bg-gray-800 text-white h-12"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">Download on the</div>
                  <div className="text-lg font-bold -mt-1">App Store</div>
                </div>
              </div>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>HIPAA Compliant • Secure • Free Download</span>
            </div>
            <p className="text-xs text-blue-600">
              Join 50,000+ patients who trust MedMatchNetwork for their healthcare needs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}