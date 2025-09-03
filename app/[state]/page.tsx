import Link from "next/link";
import { states } from "@/data/state";
import CityDirectory from "@/components/CityDirectory";
import { getPaginatedCities } from "@/data/cities";

interface StateProps {
  params: Promise<{ state: string }>; // not Promise
  searchParams?: Promise<{ page?: string; search?: string }>; // not Promise
}

export default async function StatePage({ params, searchParams }: StateProps) {
  const { state } = await params;
  const searchParam = await searchParams;
  const slugifiedStateName = state.toLowerCase().replace(/\s+/g, '-');
  // const activeTab = (tab as 'cities' | 'zipcodes') || 'cities';
 const stateData = states.find(
    s => s.name.toLowerCase().replace(/\s+/g, '-') === slugifiedStateName
  );
  if (!state || !stateData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">State Not Found</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Return to States
            </Link>
          </div>
        </div>
      </main>
    );
  }
    
    let citiesData: any = { cities: [], pagination: null };
  try {
    if (stateData?.key) {
      const param = searchParam;
      const page = parseInt(param?.page || '1');
      const search = param?.search || '';
      
      // Use static cities data instead of database query
      citiesData = await getPaginatedCities(stateData.key, page, 20, search); 
    }
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    citiesData = { cities: [], pagination: null };
  }

  return (
   <CityDirectory state={stateData} searchParam={searchParam} citiesData={citiesData}/>
  );
}