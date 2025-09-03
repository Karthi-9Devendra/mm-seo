"use client";
import {  Phone, Mail} from 'lucide-react'; 
import { Button } from './ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

 const Footer = () => {
  const router = useRouter();
  return (
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Image
                   src="/logo.png"
                   alt="MedMatch Logo"
                   width={65}
                   height={60}
                   priority
                   />
                </div>
                <span className="text-xl font-bold text-primary">MedMatchNetwork</span>
              </div>
              <p className="text-muted-foreground">
                Connect with the right healthcare providers in your area. Find doctors, read reviews, and book appointments.
              </p>
            </div>

            <div>
              <h3 className="mb-4">For Patients</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-muted-foreground"
                    onClick={() => {
                     router.push("/");
                    }}
                  >
                    Find by State
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-muted-foreground"
                    onClick={() => {
                      router.push("/specialtiesDirectory");
                    }}
                  >
                    Browse Specialties
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-muted-foreground"
                    onClick={() => {
                      router.push("/alldoctors");
                    }}
                  >
                    All Doctors
                  </Button>
                </li>
                {/* <li><Button variant="link" className="p-0 h-auto text-muted-foreground">Patient Reviews</Button></li> */}
              </ul>
            </div>

            <div>
              <h3 className="mb-4">For Doctors</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="https://app.medmatchnetwork.com/signup/register">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-muted-foreground"
                  
                  >
                    Join Our Network
                  </Button>
                  </Link>
                </li>
                <li>
                  <Link href="https://medmatchnetwork.com/">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-muted-foreground"
                  
                  >
                    Learn more
                  </Button>
                  </Link>
                </li>
                {/* <li><Button variant="link" className="p-0 h-auto text-muted-foreground">Update Profile</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-muted-foreground">Practice Management</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-muted-foreground">Resources</Button></li> */}
              </ul>
            </div>

            <div>
              <h3 className="mb-4">Contact</h3>
              <ul className="space-y-2 text-muted-foreground">
                 <li>
                  <Link href="https://medmatchnetwork.com/contact/">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-muted-foreground"
                  
                  >
                    Contact Us
                    
                  </Button>
                  </Link>
                </li>
                {/* <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span></span>
                </div> */}
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 MedMatchNetwork. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}
export default Footer;