"use client";
import { Button } from "@/components/ui/button";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getAllSpecializations, getPaginatedSpecializations } from "@/data/specializations";
import { citiesDropdown } from "@/data/cities_dropdown";
import DoctorList from "./DoctorList";
import { useRouter, useSearchParams } from "next/navigation";
import { osSearch } from "@/app/api/search/search.route";
import { searchSpecificCity } from "@/app/api/dbOperations/dbOperations.route";

type PageProps = {
  searchParams: { q?: string; page?: string; city?: string; specialty?: string };
};
interface DoctorDetail {
  doctor: {
    id: number;
    npi: number;
    firstName: string;
    lastName: string;
    state: string;
    city: string;
    specialization: string;
    user: {
      firstName: string;
      lastName: string;
    }

  }
};


const AllDoc = ({ searchParams }: PageProps) => {
  const router = useRouter();
  const params = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.q || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    searchParams.specialty || ""
  );
  const [selectedCity, setSelectedCity] = useState(
    searchParams.city || ""
  );
  const [loading, setLoading] = useState(true);
  const [dropdownLoader, setDropdownLoader] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [citiesData, setCitiesData] = useState<{ name: string; slug: string }[] | undefined>(undefined);
  const [citySearchTerm, setCitySearchTerm] = useState(""); // Search term for cities
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState(""); // Search term for specialties
  const [allCitiesData, setAllCitiesData] = useState<{ name: string; slug: string }[] | undefined>(undefined);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null>(null);
  const allSpecializations = getAllSpecializations();
  // allSpecializations is expected to be an array of all specializations
  const allSpecialties = allSpecializations.map(spec => spec.classification);
  const specialties = allSpecialties.filter(specialty =>
    specialty.toLowerCase().includes(specialtySearchTerm.toLowerCase())
  );

  // Filter cities client-side to maintain focus on dropdown
  const cities = citiesData
    ? citiesData
      .filter(city => city.name.toLowerCase().includes(citySearchTerm.toLowerCase()))
      .map(city => city.name)
    : [];

  const itemsPerPage = 12;
  useEffect(() => {
    setCitiesData(citiesDropdown);
    setAllCitiesData(citiesDropdown);
  }, []);
  const callSearchAPI = useCallback(
    async (
      page = 1,
      searchValue?: string,
      cityValue?: string,
      specialtyValue?: string
    ) => {
      setLoading(true);
      try {
        // Stopwords list
        const stopwords = ["in", "at", "the", "of", "and", "on", "for"];

        // Use provided values or fallback to state
        const currentSearchTerm = searchValue ?? searchTerm;
        const currentCity = cityValue ?? selectedCity;
        const currentSpecialty = specialtyValue ?? selectedSpecialty;

        // Collect all inputs into a single string
        const rawTerms = [
          currentSearchTerm,
          currentCity,
          currentSpecialty,
        ].filter(Boolean);

        // Split into words and filter stopwords
        const terms = rawTerms
          .flatMap((val) => val.trim().split(/\s+/))
          .filter(
            (term) =>
              term.trim() && !stopwords.includes(term.toLowerCase())
          );
        console.log(terms);

        const from = (page - 1) * itemsPerPage;

        const body = {
          from,
          size: itemsPerPage,
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
                    "npi",
                  ],
                  operator: "and",
                },
              })),
            },
          },
        };

        const res = await osSearch("doctors", body);
        console.log("Search API response:", res);

        setDoctors(res.results || []);
        setPagination({
          currentPage: page,
          totalPages: res.totalPages || 0,
          totalItems: res.totalItems || 0,
          itemsPerPage,
        });
      } catch (err) {
        console.error("Search failed:", err);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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

  useEffect(() => {
    const hasQuery =
      (searchParams.q && searchParams.q.trim() !== "") ||
      (searchParams.city && searchParams.city !== "") ||
      (searchParams.specialty && searchParams.specialty !== "");

    if (hasQuery) {
      callSearchAPI();
    } else {
      initialLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialLoad = async () => {
    try {
      const res = await osSearch("doctors", { query: { match_all: {} } })
      setDoctors(res.results || []);
      console.log("Initial load doctors111111111111111111:", res);
    } catch (error) {
      console.log("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateQueryParams({ q: searchTerm, city: selectedCity, specialty: selectedSpecialty });
      callSearchAPI(1, searchTerm, selectedCity, selectedSpecialty);
    }
  };


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


  const handleSpecialtyChange = (specialty: string) => {
    const normalizedSpecialty = specialty === "all-specialties" ? "" : specialty;
    setSelectedSpecialty(normalizedSpecialty);
    updateQueryParams({ q: searchTerm, city: selectedCity, specialty: normalizedSpecialty });
    callSearchAPI(1, searchTerm, selectedCity, normalizedSpecialty);
  };

  const handlePageChange = (page: number) => {
    updateQueryParams({ q: searchTerm, city: selectedCity, specialty: selectedSpecialty, page: String(page) });
    callSearchAPI(page, searchTerm, selectedCity, selectedSpecialty);
  };


  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
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

          setCitiesData((prev) => [searchedCity, ...(prev ?? [])]);
          // Do NOT call handleCityChange here. Wait for user to select from dropdown.
        } else {
          console.log(result.error || "City not found");
          setCitiesData([{ name: "No such city found", slug: "not-found" }]);
        }
      } catch (error) {
        console.error("City search failed:", error);
        setCitiesData([{ name: "No such city found", slug: "not-found" }]);
      } finally {
        setDropdownLoader(false);
      }
    }
  };


  return (
    <>
      {loading ? (<div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 mr-2 animate-spin text-black" />
        <p>Loading Doctors...</p>
      </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2">Find the Right Doctor for You</h1>
            <p className="text-muted-foreground">
              Search through our comprehensive directory of board-certified physicians
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by doctor name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent className=" max-h-70 overflow-y-auto max-w-50">
                  {/* Search bar at the top of specialties dropdown */}
                  <div className="px-2 py-2 sticky top-0 bg-white z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search specialties..."
                        value={specialtySearchTerm}
                        onChange={(e) => {
                          setSpecialtySearchTerm(e.target.value);
                          e.stopPropagation(); // Prevent event bubbling to avoid dropdown closing
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing on click
                        onKeyDown={(e) => e.stopPropagation()} // Prevent keyboard events from bubbling
                        className="pl-8 h-8 text-sm"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <SelectItem value="all-specialties">All Specialties</SelectItem>
                  {specialties.map((specialty, index) => (
                    <SelectItem key={`${specialty}-${index}`} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className=" max-h-70 overflow-y-auto max-w-50">
                  {/* Search bar at the top of city dropdown */}
                  <div
                    className="px-2 py-2 sticky top-0 bg-white z-10"
                    tabIndex={-1} 
                  >
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
                            handleSearchSubmit(e);
                          }
                        }}
                        className="pl-8 h-8 text-sm pr-8"
                        autoComplete="off"
                      />
                      {/* Cross button to clear city search */}
                      {citySearchTerm && !dropdownLoader && (
                        <button
                          type="button"
                          onClick={() => {
                            setCitySearchTerm("");
                            console.log(allCitiesData, "allCitiesData in clear");
                            if (allCitiesData) setCitiesData(allCitiesData);

                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                          aria-label="Clear city search"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {dropdownLoader && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </span>
                      )}
                    </div>
                  </div>

                  <SelectItem value="all-cities">All Cities</SelectItem>

                  {/* Show 'No such city found' only if searching and no cities match */}
                  {citySearchTerm && !dropdownLoader && (!citiesData || citiesData.length === 0) && (
                    <SelectItem
                      key="not-found"
                      value="not-found"
                      disabled
                      className="text-gray-400 italic"
                    >
                      No such city found
                    </SelectItem>
                  )}

                  {citiesData?.map((city, index) => (
                    <SelectItem key={`${city.slug}-${index}`} value={city.slug}>
                      {city.name}
                    </SelectItem>
                  ))}

                </SelectContent>
              </Select>

            </div>
          </div>

          {/* Results Count */}
          {pagination && <div className="mb-6">
            <p className="text-muted-foreground">
              {pagination?.totalItems || 0} doctors found
            </p>
          </div>}

          {/* Doctor Cards */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 mr-2 animate-spin text-black" />
              <p>Loading Doctors...</p>
            </div>
          ) : (
            <div className="grid gap-6 z-[0]">
              <DoctorList
                doctors={doctors}
                state=""
                city=""
                specialization=""
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
          )}


          {doctors.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No doctors found matching your criteria.</p>
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
      )}

    </>
  )
}

export default AllDoc;