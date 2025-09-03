import SpecializationList from "../../../components/SpecializationList";
import { getStates } from "@/data/db";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    state: string;
    cityorzip: string;
  }>;
  searchParams?: Promise<{ page?: string; search?: string }> | undefined;
}

export default async function CityOrZipPage({ params, searchParams }: { params: Promise<PageProps['params']>, searchParams?: Promise<PageProps['searchParams']> }) {
  const { state, cityorzip } = await params;
  const states = await getStates() as any[];
  const stateData = states.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === state);
  
  // Check if the parameter is a zip code (numeric)
  const isZipCode = /^\d{5}$/.test(cityorzip);
  
  // For cities, create city data from URL parameter
  const cityData = isZipCode ? null : {
    name: cityorzip.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    slug: cityorzip
  };
  
  if (!state || !cityorzip) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <Link href={`/${state}`} className="text-blue-600 hover:text-blue-800">
              Return to State
            </Link>
          </div>
        </div>
      </main>
    );
  }



  const displayName = isZipCode ? `Zip Code ${cityorzip}` : cityData?.name || cityorzip;
  const pageTitle = isZipCode 
    ? `Specialities for Zip Code ${cityorzip}`
    : `Specialities in ${displayName}`;
  const pageDescription = isZipCode
    ? `Choose a specialization to find doctors in ${stateData?.name || state}, zip code ${cityorzip}.`
    : `Find doctors by specialization`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
        {/* <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
          <p className="text-xl text-gray-600">{pageDescription}</p>
        </div> */}
        <SpecializationList state={state} city={cityorzip} searchParams={searchParams} />
      </div>
    </main>
  );
}