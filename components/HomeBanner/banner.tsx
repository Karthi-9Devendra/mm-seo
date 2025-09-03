"use client";   

import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DoctorJoinModal } from '../DoctorJoinModal';

const banner = () => {  
    const router = useRouter();
    const [showJoinModal, setShowJoinModal] = useState(false);
    return(
        <div>
          {showJoinModal && (
            <DoctorJoinModal onClose={() => setShowJoinModal(false)} />
          )}
         <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 items-center">
              {/* Main Demo Section */}
              <div className="text-center md:text-left lg:col-span-2">
                <h2 className="text-xl font-semibold text-primary mb-2">🎯 Demo Our SEO-Optimized Directory</h2>
                <p className="text-muted-foreground mb-4">
                  Experience our comprehensive platform: Browse by state → city → specialty → subspecialty → doctor profiles. 
                  Try the pathway to Dr. Kelly Forman in Orlando's Pediatric Dermatology.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => {
                        router.push("/florida/33990/social-worker/kelly-bujnicki-1407123300");
                    }}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    View Dr. Kelly bujnicki Profile
                  </Button>
                  <Button 
                    onClick={() => {
                       router.push("/florida");
                    }}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    Browse Florida
                  </Button>
                  <Button 
                    onClick={() => {
                      router.push("/specialtiesDirectory");
                    }}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                     Specialties
                  </Button>
                </div>
              </div>
              
              {/* Doctor Join Section */}
              <div className="text-center md:text-right">
                <h3 className="text-lg font-semibold text-primary mb-2">👩‍⚕️ Are you a doctor?</h3>
                <p className="text-muted-foreground mb-4">
                  Claim your free professional profile and connect with patients looking for your expertise.
                </p>
                <Button 
                  onClick={() => setShowJoinModal(true)}
                  variant="outline"
                  className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Claim Your Free Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
    )
}
export default banner;