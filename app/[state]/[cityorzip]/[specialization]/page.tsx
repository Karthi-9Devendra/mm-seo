import { getDoctorsByLocationAndSpecialization } from "@/app/api/dbOperations/dbOperations.route";
import DoctorList from "../../../../components/DoctorList";
import { getStates, getSpecializationByClassification } from "@/data/db";
import Link from "next/link";

type Doctor = { 
  id: string; 
  name?: string; 
  user?: { firstName?: string; lastName?: string }; 
  npi?: string;
  firstName?: string;
  lastName?: string;
};

interface PageProps {
  params: Promise<{
    state: string;
    cityorzip: string;
    specialization: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function SpecializationPage({ params, searchParams }: { params: Promise<PageProps['params']>, searchParams: Promise<PageProps['searchParams']> }) {
  const [{ state, cityorzip, specialization }, { page: pageStr = '1', search = '' }] = await Promise.all([params, searchParams]);
  const page = parseInt(pageStr);
  
  const decodedSlug = decodeURIComponent(specialization);
  // Convert kebab-case back to original format for database query
  const decodedSpecialization = decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const states = await getStates() as any[];
  const stateData = states.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === state);
  console.log('State lookup:', { state, stateData, states: states.map(s => ({ name: s.name, slug: s.name.toLowerCase().replace(/\s+/g, '-') })) });
  const isZipCode = /^\d{5}$/.test(cityorzip);

  // Get specialization definition
  let specializationData = null;
  try {
    specializationData = await getSpecializationByClassification(decodedSpecialization);
  } catch (error) {
    console.error('Failed to fetch specialization data:', error);
  }

  if (!state || !cityorzip || !specialization) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <Link href={`/${state}/${cityorzip}`} className="text-blue-600 hover:text-blue-800">
              Return to Specializations
            </Link>
          </div>
        </div>
      </main>
    );
  }

  let doctorsData: any = { doctors: [], pagination: null };
  let error = null;

  try {
    const stateKey = stateData?.key;
    if (stateKey) {
      doctorsData = await getDoctorsByLocationAndSpecialization(stateKey, cityorzip, decodedSpecialization, page, 20, search);
      console.log(doctorsData);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'An error occurred';
  }

  const displayName = isZipCode ? `Zip Code ${cityorzip}` : cityorzip.replace(/^\w/, (c) => c.toUpperCase());
  const pageTitle = isZipCode 
    ? `Doctors for ${decodedSpecialization} in ${displayName}`
    : `${decodedSpecialization}s in ${displayName}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
          <p className="text-xl text-gray-600 mb-4">
            {isZipCode 
              ? `Find doctors by specialization and zip code in ${stateData?.name || state}`
              : `Find the best ${decodedSpecialization.toLowerCase()} doctors near you`
            }
          </p>
          {specializationData?.definition && (
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">
                {specializationData.definition}
              </p>
            </div>
          )}
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              href={`/${state}/${cityorzip}/${specialization}`} 
              className="text-blue-600 hover:text-blue-800"
            >
              Try Again
            </Link>
          </div>
        ) : doctorsData.doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {isZipCode 
                ? `No doctors found for this specialization and zip code.`
                : `No doctors found in this specialization.`
              }
            </p>
          </div>
        ) : (
          <div className="z-[0]">
            <div className="mb-6 text-center">
              <p className="text-lg text-gray-600">Doctors ({doctorsData.pagination?.totalItems || doctorsData.doctors.length})</p>
            </div>
            <DoctorList 
              doctors={doctorsData.doctors} 
              state={state}
              city={cityorzip}
              specialization={decodedSpecialization}
              pagination={doctorsData.pagination}
              searchTerm={search}
              totalCount={doctorsData.pagination?.totalItems}
              displaySearchBar={true}
            />
          </div>
        )}
      </div>
    </main>
  );
}