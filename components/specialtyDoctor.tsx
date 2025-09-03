"use client";
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Users, Award, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getPaginatedCities } from "@/data/cities";
import DoctorList from './DoctorList';
import { Doctor } from '@/types';
import { searchSpecificCity } from '@/app/api/dbOperations/dbOperations.route';
import { osSearch } from '@/app/api/search/search.route';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { citiesDropdown } from '@/data/cities_dropdown';

type PageProps = {
  searchParams: { q?: string; page?: string; city?: string; specialty?: string };
};

export default function SpecialtyDoctors({ searchParams }: PageProps) {
  const router = useRouter();
  const params = useSearchParams();
  const specialtyParam = searchParams.specialty || "";
  const specialty = specialtyParam.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

  const [loading, setLoading] = useState(true);
  const [dropdownLoader, setDropdownLoader] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [citiesData, setCitiesData] = useState<{ name: string; slug: string }[] | undefined>(undefined);
  const [allCitiesData, setAllCitiesData] = useState<{ name: string; slug: string }[] | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState(searchParams.q || "");
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialty);

  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null>(null);
  const itemsPerPage = 12;

  const displaySpecialty = specialty.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());


  useEffect(() => {
    setCitiesData(citiesDropdown);
    setAllCitiesData(citiesDropdown);
    callSearchAPI();
  }, []);

  const callSearchAPI = useCallback(
    async (page = 1, searchValue?: string, cityValue?: string, specialtyValue?: string) => {
      setLoading(true);
      try {
        const currentSearchTerm = searchValue ?? searchTerm;
        const currentCity = cityValue ?? selectedCity;
        const currentSpecialty = specialtyValue ?? selectedSpecialty;

        const terms = [];
        if (currentSearchTerm.trim()) terms.push(currentSearchTerm.trim());
        if (currentCity.trim()) terms.push(currentCity.trim());
        if (currentSpecialty.trim()) terms.push(currentSpecialty.trim());

        const body = {
          query: {
            bool: {
              must: terms.map((term) => ({
                multi_match: {
                  query: term,
                  fields: [
                    "firstName",
                    "lastName",
                    "user.firstName",
                    "user.lastName",
                    "state",
                    "city",
                    "specialization",
                    "npi"
                  ],
                  operator: "and",
                },
              })),
            }
          },
        };

        const res = await osSearch("doctors", body);
        setDoctors(res.results || []);
        setPagination({
          currentPage: page,
          totalPages: res.totalPages || 0,
          totalItems: res.totalItems || 0,
          itemsPerPage,
        });
      } catch (err) {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    }, []);

  const updateQueryParams = (newParams: Record<string, string>) => {
    const qParams = new URLSearchParams(params.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "all-cities" && value !== "all-specialties") {
        qParams.set(key, value);
      } else {
        qParams.delete(key);
      }
    });
    router.push(`?${qParams.toString()}`);
  };

  const filteredDoctors = doctors;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading {displaySpecialty} specialists...</p>
      </div>
    );
  }

  // --- City search and dropdown logic ported from all_doc.tsx ---
  const handleCityChange = (city: string) => {
    const normalizedCity = city === "all-cities" ? "" : city;
    setSelectedCity(normalizedCity);
    if (city === "all-cities") {
      setCitySearchTerm("");
      if (allCitiesData) setCitiesData(allCitiesData);
    }
    updateQueryParams({ q: searchTerm, city: normalizedCity, specialty: selectedSpecialty });
    callSearchAPI(1, searchTerm, normalizedCity, selectedSpecialty);
  };
  const handlePageChange = (page: number) => {
    updateQueryParams({ q: searchTerm, city: selectedCity, specialty: selectedSpecialty, page: String(page) });
    callSearchAPI(page, searchTerm, selectedCity, selectedSpecialty);
  };

  const handleCitySearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && citySearchTerm.trim()) {
      e.preventDefault();
      e.stopPropagation();
      setDropdownLoader(true);
      try {
        const result = await searchSpecificCity(citySearchTerm.trim());
        if (result && !result.error) {
          const searchedCity = {
            id: result.id,
            name: result.name,
            slug: result.slug,
            state_key: result.state_key,
          };
          console.log("orlendo city",result)
          setCitiesData((prev) => [searchedCity, ...(prev ?? [])]);
        } else {
          setCitiesData([{ name: "No such city found", slug: "not-found" }]);
        }
      } catch (error) {
        setCitiesData([{ name: "No such city found", slug: "not-found" }]);
      } finally {
        setDropdownLoader(false);
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateQueryParams({ q: searchTerm, city: selectedCity, specialty: selectedSpecialty });
      callSearchAPI(1, searchTerm, selectedCity, selectedSpecialty);
    }
  };

  // --- Main render ---
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.push('/specialtiesDirectory')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Specialties
      </Button>

      <div className="mb-12">
        <h1 className="text-3xl font-bold text-primary mb-2">
          {displaySpecialty} Doctors {selectedCity ? `in ${selectedCity.replace(/-/g, ' ')}` : ''}
        </h1>
        <div className="flex items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>{filteredDoctors.length} specialists available</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Board-certified experts</span>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search doctors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10"
          />
        </div>
        <Select value={selectedCity} onValueChange={handleCityChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
         <SelectContent className=" max-h-70 overflow-y-auto max-w-50">
            <div className="px-2 py-2 sticky top-0 bg-white z-10" tabIndex={-1}>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search cities..."
                  value={citySearchTerm}
                  onChange={(e) => {
                    setCitySearchTerm(e.target.value);
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      (e.nativeEvent as any).stopImmediatePropagation?.();
                      handleCitySearch(e);
                    }
                  }}
                  className="pl-8 h-8 text-sm"
                  autoComplete="off"
                />
                {dropdownLoader && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </span>
                )}
              </div>
            </div>
            <SelectItem value="all-cities">All Cities</SelectItem>
            {citiesData?.map((city, index) => {
              if (city.slug === "not-found") {
                return (
                  <SelectItem
                    key="not-found"
                    value="not-found"
                    disabled
                    className="text-gray-400 italic"
                  >
                    {city.name}
                  </SelectItem>
                );
              }
              return (
                <SelectItem key={`${city.slug}-${index}`} value={city.slug}>
                  {city.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <p className="mb-6 text-muted-foreground">
      </p>
      {pagination && <div className="mb-6">
        <p className="text-muted-foreground">
          {pagination?.totalItems || 0} doctors found
        </p>
      </div>}
      {filteredDoctors.length > 0 ? (
        <div className="grid gap-6 z-[0]">
          <DoctorList
            doctors={filteredDoctors}
            state={''}
            city={selectedCity || ''}
            specialization={specialty}
            displaySearchBar={false}
          />
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                {pagination.currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Previous
                  </button>
                )}

                <span className="px-3 py-2 text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                {pagination.currentPage < pagination.totalPages && (
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No {specialty.toLowerCase()} specialists found for the current filters.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setSelectedSpecialty("");
              setSelectedCity("");
              updateQueryParams({ q: "", city: "", specialty: "" });
              callSearchAPI(1, "", "", "");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}