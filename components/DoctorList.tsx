'use client';
import { useState } from 'react';
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Doctor } from '@/types';
import { AppointmentBooking } from './appointmentBook';
import Image from 'next/image';


type DoctorListProps = {
  doctors: Doctor[];
  state: string;
  city: string;
  specialization: string;
  searchTerm?: string;
  totalCount?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  displaySearchBar: boolean
};

export default function DoctorList({ doctors, state, city, specialization, searchTerm = '', totalCount, pagination, displaySearchBar = true }: DoctorListProps) {
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [showBooking, setShowBooking] = useState(false);




  // Use doctorDetails if available, else fallback to doctors
  const displayDoctors = doctors;
  console.log(displayDoctors, "doctors fetched by NPI122121212");

  return (
    <div>
      {/* Search Filter */}
      {displaySearchBar && (
        <div className="mb-6 max-w-md mx-auto">
          <div className="relative">
            <form method="get" className="w-full">
              <input
                type="text"
                name="search"
                placeholder={`Search in ${totalCount || doctors.length} doctors...`}
                defaultValue={searchTerm}
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
              />
              <input type="hidden" name="page" value="1" />
            </form>


            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {displayDoctors.map((doctor) => {
          const firstName = doctor.user?.firstName || doctor.firstName || '';
          const lastName = doctor.user?.lastName || doctor.lastName || '';
          const doctorName = `${firstName} ${lastName}`.trim() || 'Doctor';
          const npi = doctor.npi;

          return (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow z-[0]">
              <CardContent className="p-6 z-0">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Doctor Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={doctor?.imageUrl || "/no.jpg"} // fall back image
                      width={60}
                      height={60}
                      alt={`Dr. ${doctorName}`}
                      className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                    />
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        {/* Name + NPI */}
                        <h3 className="text-primary">{doctorName}</h3>
                        <Badge variant="secondary" className="w-fit">Board Certified</Badge>
                      </div>

                      {/* Specialization dynamic */}
                      <p className="text-muted-foreground my-2 md:my-0">
                        {(specialization.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || doctor.specialization || doctor?.providerTaxonomies?.[0].taxonomy?.specialization || ' ').toUpperCase()}
                      </p>

                      {/* Hardcoded rating */}
                      <div className="grid md:items-center md:gap-4 gap-2 md:mt-2">
                        {/* <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                        <span className="text-muted-foreground">(32 reviews)</span>
                      </div> */}

                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Available Appointments
                        </Badge>
                        <div className="flex  items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {(doctor?.addresses?.[1]?.cityName
                              ? doctor.addresses[1].cityName.replace(/\b\w/g, (l: string) => l.toUpperCase())
                              : doctor?.city
                                ? doctor.city.replace(/\b\w/g, (l: string) => l.toUpperCase())
                                : ''
                            )}
                            {doctor?.state ? `, ${doctor.state.toUpperCase()}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>


                    <div className="md:flex hidden flex-col sm:flex-row gap-3 ">
                      <Link
                        href={`/${state || doctor.state}/${city || doctor.addresses?.[1]?.cityName || doctor.city}/${specialization || doctor.specialization || doctor?.providerTaxonomies?.[0].taxonomy?.specialization}/${doctorName.toLowerCase().replace(/\s+/g, "-")}-${npi}`}
                        className="flex-1 sm:flex-none"
                      >
                        <Button className="w-full">View Profile</Button>
                      </Link>
                      <a
                        className="flex-1 sm:flex-none border rounded p-1 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                        href={`tel:${doctor.addresses?.[1]?.telephoneNumber || ''}`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Office
                      </a>
                    </div>
                  </div>
                  <div className=" md:grid-cols-2 hidden gap-4 md:grid">
                    <div className="space-y-2">
                      {/* <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>12 years in practice</span>
                      </div> */}
                      <div className="flex md:hidden items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {(doctor?.addresses?.[1]?.cityName
                            ? doctor.addresses[1].cityName.replace(/\b\w/g, (l: string) => l.toUpperCase())
                            : doctor?.city
                              ? doctor.city.replace(/\b\w/g, (l: string) => l.toUpperCase())
                              : ''
                          )}
                          {doctor?.state ? `, ${doctor.state.toUpperCase()}` : ''}
                        </span>
                      </div>
                      {/* <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>4 insurance plans accepted</span>
                      </div> */}
                    </div>

                    <div className="space-y-2 md:w-60 w-full flex flex-col items-end">
                      {/* <button
                        onClick={() => {
                          setBookingDoctor(doctor);
                          setShowBooking(true);
                        }}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded w-full md:w-auto"
                      >
                        Book an Appointment
                      </button> */}
                      {/* <div className=" md:hidden flex items-center gap-2 text-sm mt-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.city?.replace(/\b\w/g, (l: string) => l.toUpperCase())}, {doctor.state.toUpperCase()}</span>
                      </div> */}
                      {doctor.addresses?.[1]?.firstLineAddress &&
                        <p className="text-xs text-muted-foreground text-right break-words">
                          <span className="font-semibold">Location:</span> {doctor.addresses?.[1]?.firstLineAddress}
                          {doctor.addresses?.[1]?.secondLineAddress && <span> {doctor.addresses?.[1]?.secondLineAddress}</span>}
                        </p>
                      }
                    </div>
                  </div>
                  <div className="flex md:hidden flex-col sm:flex-row gap-3 ">
                    <div className="space-y-2 w-full">
                      {/* <button
                        onClick={() => {
                          setBookingDoctor(doctor);
                          setShowBooking(true);
                        }}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded w-full"
                      >
                        Book an Appointment
                      </button> */}



                    </div>
                    <Link
                      href={`/${state || doctor.state}/${city || doctor.addresses?.[1]?.cityName || doctor.city}/${specialization || doctor.specialization || doctor?.providerTaxonomies?.[0].taxonomy?.specialization}/${doctorName.toLowerCase().replace(/\s+/g, "-")}-${npi}`}
                      className="flex-1 sm:flex-none"
                    >
                      <Button className="w-full">View Profile</Button>
                    </Link>
                    <a
                      className="flex-1 sm:flex-none border rounded p-1 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                      href={`tel:${doctor.addresses?.[1]?.telephoneNumber || ''}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Office
                    </a>
                  </div>

                </div>

                {/* Appointment Booking Modal */}

              </CardContent>
            </Card>
          );
        })}


      </div>
      {bookingDoctor && (
        <AppointmentBooking
          doctor={bookingDoctor}
          user={bookingDoctor.user}
          onClose={() => setBookingDoctor(null)}
          onSuccess={() => setBookingDoctor(null)}
        />
      )}


      {doctors.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No doctors found matching "{searchTerm}"</p>
          <a
            href={`/${state}/${city}/${specialization}?page=1`}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Clear search
          </a>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            {pagination.currentPage > 1 && (
              <a
                href={`/${state}/${city}/${specialization}?page=${pagination.currentPage - 1}${searchTerm ? `&search=${searchTerm}` : ''}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                Previous
              </a>
            )}

            <span className="px-3 py-2 text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            {pagination.currentPage < pagination.totalPages && (
              <a
                href={`/${state}/${city}/${specialization}?page=${pagination.currentPage + 1}${searchTerm ? `&search=${searchTerm}` : ''}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}