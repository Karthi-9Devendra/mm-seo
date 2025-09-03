"use client";

import DoctorList from "@/components/DoctorList";
import SearchBar from "@/components/SearchBar";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { osSearch } from "../api/search/search.route";

type PageProps = {
  searchParams: { q?: string; page?: string };
};
export default function SearchPage({ searchParams }: PageProps) {
  const router = useRouter();

  const initialQ = searchParams.q || "";
  const initialPage = parseInt(searchParams.page || "1", 10);

  const [q, setQ] = useState(initialQ);
  const [page, setPage] = useState(initialPage);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const itemsPerPage = 12;
  const prevQRef = useRef(initialQ);

  useEffect(() => {
    const fetchResults = async () => {
      if (!q.trim()) {
        setSearchResults([]);
        setPagination(null);
        return;
      }

      setLoadingResults(true);

      try {
        const terms = q.trim().split(/\s+/);
        const stopwords = ["in", "at", "the", "of", "and", "on", "for"];
        const filteredTerms = terms.filter(
          (term) => term.trim() && !stopwords.includes(term.toLowerCase())
        );

        const from = (page - 1) * itemsPerPage;

        const searchResponse = await osSearch("doctors", {
          from,
          size: itemsPerPage,
          query: {
            bool: {
              must: filteredTerms.map((term) => ({
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
                  ],
                  operator: "and",
                },
              })),
            },
          },
        });

        setSearchResults(searchResponse.results);
        setPagination({
          currentPage: page,
          totalPages: searchResponse.totalPages || 0,
          totalItems: searchResponse.totalItems || 0,
          itemsPerPage,
        });
      } finally {
        setLoadingResults(false);
      }
    };

    fetchResults();
  }, [q, page]);

  const handleSearchAction = (searchTerm: string) => {
    if (searchTerm === prevQRef.current) {
      setPage(1); // Reset page without reload
    } else {
      prevQRef.current = searchTerm;
      setQ(searchTerm);
      setPage(1);
    }

    router.push(`/search?q=${encodeURIComponent(searchTerm)}&page=1`, {
      scroll: false,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/search?q=${encodeURIComponent(q)}&page=${newPage}`, {
      scroll: false,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-center flex-1 mb-10">
        <SearchBar
          defaultValue={q}
          placeholder="Search doctors by name, location, or speciality..."
          className="flex items-center w-[50%] rounded-full border border-gray-300 bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 pr-1"
          inputClassName="flex-1 px-6 py-4 text-lg outline-none"
          buttonClassName="p-4 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors duration-300 text-white flex items-center justify-center"
          icon={<Search size={22} />}
          onSearch={handleSearchAction}
        />
      </div>

      {loadingResults && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white/50 p-6 rounded-full shadow-xl flex items-center justify-center ring-4 ring-blue-600">
            <Image
              src="/logo.png"
              alt="MedMatch Logo"
              width={80}
              height={75}
              priority
              className="animate-spin-slow drop-shadow-lg"
            />
          </div>
        </div>
      )}

      {!loadingResults && q && searchResults.length === 0 && pagination && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 animate-fadeIn">
          <p className="text-lg">No doctors found for “{q}”.</p>
        </div>
      )}

      {!loadingResults && searchResults.length > 0 && (
        <div className="space-y-4 z-[0]">
          <DoctorList
            doctors={searchResults}
            state=""
            city=""
            specialization=""
            searchTerm={q}
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
    </div>
  );
}
