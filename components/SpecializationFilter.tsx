'use client';


import { Search, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';

interface Specialty {
  definition: string;
  classification: string;
  name: string;
  description: string;
  icon: string;
  commonConditions: string[];
  doctorCount: number;
}
interface featuredSpecialty {
  classification: string;
  definition: string;
  featured?: boolean;
  icon: string; // Emoji or SVG component
}


interface SpecialtyDirectoryProps {
  specializations: Specialty[];
  featuredSpecialties: featuredSpecialty[];
  state: string;
  city: string;
  pagination?: {
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  searchTerm?: string;
  totalCount?: number;
}



export function SpecialtyDirectory({
  specializations,
  state,
  city,
  searchTerm = '',
  pagination,
  totalCount,
  featuredSpecialties,
}: SpecialtyDirectoryProps) {
  console.log(pagination,"featuredSpecialties pagination:");

  
  const [localSearch, setLocalSearch] = useState(searchTerm);
  

  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Medical Specialties</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find the right medical specialist for your health needs. Browse our comprehensive directory of medical specialties in {city}, {state}.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <form method="get" className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            name="search"
            placeholder={`Search in ${totalCount || specializations.length} specializations...`}
            // defaultValue={searchTerm}
            className="pl-12 h-14 text-lg"
          />
          <input type="hidden" name="page" value="1" />
           {searchTerm && (
             <Link
               href={`/${state}/${city}?page=1`}
               className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
               aria-label="Clear search"
             >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </Link>
           )}
        </form>
      </div>

      {/* Featured Specialties */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8">Featured Specialties</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSpecialties.filter(s => s.classification).map(specialty => (
            <Link 
              key={String(specialty.classification)}
              href={`/${state}/${city}/${typeof specialty.classification === 'string' ? specialty.classification.toLowerCase().replace(/\s+/g, '-') : ''}`}
              className="block"
            >
              <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{specialty.icon}</div>
                  <h3 className="font-semibold mb-2">{specialty.classification}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{specialty.definition}</p>
                  {/* <div className="flex items-center justify-center gap-1 text-sm text-primary">
                    <Users className="h-4 w-4" />
                    <span>{40} doctors</span>
                  </div> */}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* All Specialties */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">All Specialties</h2>
         <div className="relative ml-[10px]">
            <form
              onSubmit={e => {
                e.preventDefault();
                const url = new URL(window.location.href);
                if (localSearch) {
                  url.searchParams.set('search', localSearch);
                } else {
                  url.searchParams.delete('search');
                }
                url.searchParams.set('page', '1');
                window.location.href = url.toString();
              }}
            >
              <Input
                type="text"
                placeholder="Search specialties..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="h-10 w-64 pr-10"
                // autoComplete="off"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    const url = new URL(window.location.href);
                    url.searchParams.delete('search');
                    url.searchParams.set('page', '1');
                    window.location.href = url.toString();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  aria-label="Clear search"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          </div>
          <div className="flex-1" />
          <p className="text-muted-foreground ml-4">
            {totalCount} found
          </p>
        </div>
       

        {specializations.length > 0 ? (
          <div className="grid gap-6">
            {specializations.map(specialty1 => (
               <Link 
                key={`${specialty1.classification}-${specialty1.name}`}
                href={`/${state}/${city}/${specialty1.classification ? specialty1.classification.toLowerCase().replace(/\s+/g, '-') : ''}`}
                className="block"
              >
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl font-bold">
                          {(() => {
                            const words = specialty1.classification.split(' ');
                            const first = words[0]?.[0] || '';
                            const last = words.length > 1 ? words[words.length - 1][0] : '';
                            return (first + last).toUpperCase();
                          })()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-primary mb-2">{specialty1.classification}</h3>
                            <p className="text-muted-foreground mb-4">{specialty1.definition}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                        {/* <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Common Conditions Treated:</h4>
                            <div className="flex flex-wrap gap-2">
                              {specialty1.commonConditions.map((condition, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                              {specialty.commonConditions.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{specialty.commonConditions.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{40} doctors available</span>
                            </div>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No specialties found matching your search "{searchTerm}".</p>
            <Button asChild variant="outline">
              <Link href={`/${state}/${city}?page=1`}>Clear Search</Link>
            </Button>
          </div>
        )}

        {/* Pagination for All Specialties */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="inline-flex -space-x-px rounded-md " aria-label="Pagination">
              <Button
                variant="outline"
                className="rounded-l-md"
                asChild
                disabled={pagination.currentPage === 1}
              >
                <Link href={`?page=${pagination.currentPage - 1}`}>Previous</Link>
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={pagination.currentPage === i + 1 ? 'default' : 'outline'}
                  asChild
                  className='mx-1'
                >
                  <Link href={`?page=${i + 1}`}>{i + 1}</Link>
                </Button>
              ))}
              <Button
                variant="outline"
                className="rounded-r-md"
                asChild
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <Link href={`?page=${pagination.currentPage + 1}`}>Next</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
      
      {/* Call to Action */}
      <div className="mt-16 text-center">
        <Card className="bg-gradient-to-r from-primary/5 to-cyan/5 border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold mb-4">Can't Find Your Specialty?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our directory is constantly growing. If you're a medical professional looking to join our network, we'd love to have you.
            </p>
            <Button asChild>
              <Link href="https://app.medmatchnetwork.com/signup/register">Join Our Network</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}