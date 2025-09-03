"use client";

export const majorCities = [
  { name: 'New York', state: 'NY', population: 8419600, topHospitals: ['NewYork-Presbyterian Hospital', 'Mount Sinai Hospital', 'NYU Langone Health'] },
]
import { useState, useEffect } from 'react';
import { Search, ArrowRight, Users, MapPin, Building, Star } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './ImageWithFallback';
import { states } from '../data/state';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StateData {
  name: string;
  key: string;
  description: string;
}

interface StatesDirectoryProps {
  onStateSelect?: (state: string) => void;
}

export function StatesDirectory({ onStateSelect }: StatesDirectoryProps) {
  const [statesData, setStatesData] = useState<{ [key: string]: StateData }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [topSearch, setTopSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const filteredStates = Object.entries(statesData).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Get only states with featured: true
  const featuredStates = states.filter(s => s.featured);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading healthcare directory...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleSearch = () => {
    if (!topSearch.trim()) return; // don't search empty
    router.push(`/alldoctors?q=${encodeURIComponent(topSearch.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      {/* SEO Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Find Doctors by State - MedMatch Network</h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-6">
          Discover top-rated physicians and medical specialists across all 50 states. Connect with board-certified doctors,
          read patient reviews, and book appointments with healthcare providers in your area.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span>✓ 50+ States Covered</span>
          <span>✓ Board-Certified Physicians</span>
          <span>✓ Patient Reviews & Ratings</span>
          <span>✓ Easy Online Booking</span>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search states, cities, or healthcare systems..."
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-12 h-14 text-lg"
          />
        </div>
      </div>

      {/* Featured States */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8">Featured Healthcare Destinations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredStates.map(state => {
            const slug = state.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Card
                key={state.name}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group"
                onClick={() => {
                  router.push(`/${slug}`);
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={(() => {
                      const name = state.name.toLowerCase();
                      if (name.includes('california')) return '/state/california.jpg';
                      if (name.includes('florida')) return '/state/florida.jpg';
                      if (name.includes('texas')) return '/state/texas.jpg';
                      if (name.includes('new york')) return '/state/new-york (2).jpg';
                      return '/states.jpg';
                    })()}
                    alt={`Healthcare in ${state.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{state.name}</h3>
                    <p className="text-sm opacity-90">{state.key}</p>
                  </div>
                </div>
                {<CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 line-clamp-2">{state.description}</p>
                  <div className="space-y-2">
                    {/*<div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-primary" />
                    <span>length of major cities</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Population: 40000</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-primary" />
                    <span>20 top hospitals</span>
                    </div>*/}
                  </div>
                </CardContent>}
              </Card>
            );
          })}
        </div>
      </div>

      {/* All States Directory */}
      <div>
        <div className="flex items-center mb-8">
          <h2 className="text-2xl font-semibold">Complete State Directory</h2>
          <div className="relative ml-[10px]">
            <Input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-10 w-64 pr-10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex-1" />
          <p className="text-muted-foreground ml-4">
            {states.length} {states.length === 1 ? 'state' : 'states'} found
          </p>
        </div>

        <div className="grid gap-4">
          {states
            .filter(state =>
              !searchTerm ||
              state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              state.key.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((state) => {
              const slug = state.name.toLowerCase().replace(/\s+/g, "-");
              return(
              <Card
                key={state.name}
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  router.push(`/${slug}`);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{state.key}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-primary mb-1">{state.name}</h3>
                          <p className="text-muted-foreground mb-3">{state.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>

                      {/* <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Major Cities:</span>
                        <p className="font-medium">{majorCities.slice(0, 3).map(city => city.name).join(', ')}</p>
                        {majorCities.length > 3 && (
                          <p className="text-xs text-primary">+{majorCities.length - 3} more cities</p>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Population:</span>
                        <p className="font-medium">{majorCities[0]?.population?.toLocaleString("en-US") ?? 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Top Hospitals:</span>
                        <p className="font-medium">{majorCities.reduce((acc, city) => acc + city.topHospitals.length, 0)} major facilities</p>
                      </div>
                    </div> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})}
       </div>

        {filteredStates.length === 0 && searchTerm && (
          <div className="text-center py-12">
            {/* <p className="text-muted-foreground mb-4">No states found matching your search.</p> */}
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="mt-16 space-y-12">
        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">How do I find doctors in my state?</h3>
                <p className="text-muted-foreground">
                  Simply click on your state above to browse all available cities and medical specialties.
                  You can search by location, specialty, or doctor name to find the right healthcare provider for your needs.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Are all doctors board-certified?</h3>
                <p className="text-muted-foreground">
                  We prioritize board-certified physicians in our directory. Each doctor's profile clearly indicates
                  their board certification status, medical school, residency, and any additional fellowships or specializations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Can I read patient reviews?</h3>
                <p className="text-muted-foreground">
                  Yes, patient reviews and ratings are displayed on each doctor's profile. These authentic reviews
                  help you make informed decisions about your healthcare provider selection.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">How do I book an appointment?</h3>
                <p className="text-muted-foreground">
                  Many doctors on our platform accept online appointment booking. You can also find contact information
                  to call their offices directly. Available appointment times are clearly marked on each profile.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Healthcare by Numbers */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Healthcare Directory by the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">50</div>
                <div className="text-sm text-muted-foreground">States Covered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Major Cities</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">120+</div>
                <div className="text-sm text-muted-foreground">Medical Specialties</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-sm text-muted-foreground">Healthcare Providers</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical Specialties Overview */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Medical Specialties Available</h2>
          <p className="text-muted-foreground mb-6">
            Our comprehensive directory includes physicians across all major medical specialties recognized by the American Medical Association:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "Family Medicine", "Internal Medicine", "Pediatrics", "Cardiology", "Dermatology", "Orthopedic Surgery",
              "Neurology", "Obstetrics and Gynecology", "Psychiatry", "Emergency Medicine", "Anesthesiology", "Radiology"
            ].map((specialty) => (
              <Link
                key={specialty}
                href={`/alldoctors?specialty=${encodeURIComponent(specialty)}`}
                className="block"
              >
                <Badge
                  variant="outline"
                  className="justify-center p-3 cursor-pointer hover:bg-primary/10 transition"
                >
                  {specialty}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}