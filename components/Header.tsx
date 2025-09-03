"use client";

import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { Download, Search, UserCheck } from "lucide-react";
import { Menu, User, Phone, Mail, LogOut, Calendar, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AuthModal } from "./authmodel";
import { AppDownloadModal } from "./AppDownloadModal";

export default function Header() {
  const pathname = usePathname();
  const user = null; // Replace with actual user state or context
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState(false);
  const [showEdhaAssistant, setShowEdhaAssistant] = useState(false);
  const isSearchPage = pathname.startsWith("/search");
  const router = useRouter();
  const handleSearchAction = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };
  return (
     <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto ">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                router.push("/");
              }}
            >
             <Image
              src="/logo.png"
              alt="MedMatch Logo"
              width={65}
              height={60}
              priority
            />

            <span className="text-xl font-bold text-primary">MedMatchNetwork</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={() => {
                  router.push("/");
                }}
                // className={currentPage === 'states' || currentPage === 'state' ? 'text-primary' : ''}
              >
                By State
              </Button>
              <Button 
                variant="ghost"
                onClick={() => {
                  router.push("/specialtiesDirectory");
                 
                }}
                // className={currentPage === 'specialties' || currentPage === 'specialty' || currentPage === 'subspecialty' ? 'text-primary' : ''}
              >
                Specialties
              </Button>
              <Button 
                variant="ghost"
                onClick={() => {
                  router.push("/alldoctors");
                }}
                // className={currentPage === 'directory' || currentPage === 'profile' ? 'text-primary' : ''}
              >
                All Doctors
              </Button>
                {/* <Button 
                variant="ghost" 
                onClick={() => setShowEdhaAssistant(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Ask Edha - 24/7 Nurse
              </Button> */}
              <Button 
                variant="ghost"
                onClick={() => setShowAppDownloadModal(true)}
                className="text-green-600 hover:text-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download App
              </Button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {/* Join MedMatch - Mobile */}
              <Button 
                variant="ghost" 
                size="sm" 
                // onClick={() => setShowJoinModal(true)}
                className="md:hidden text-cyan-600 hover:text-cyan-700"
              >
                <UserPlus className="h-4 w-4" />
              </Button>

              {/* {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 mr-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {/* {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'} */}
                      {/* </span>
                    </div>
                    <span className="text-sm font-medium">
                      user
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                  setShowAuthModal(true);
                }}>  */}
                    {/* <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => {
                  setShowAuthModal(true);
                }}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )} */}
               
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
       
          {showAuthModal && (
            <AuthModal 
              onClose={() => setShowAuthModal(false)} 
              onSuccess={() => setShowAuthModal(false)} 
            />
          )}
          {showAppDownloadModal && (
        <AppDownloadModal
          onClose={() => setShowAppDownloadModal(false)}
        />
      )}
      </header>
  );
}
