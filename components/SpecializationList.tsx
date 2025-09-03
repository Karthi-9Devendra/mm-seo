import { getFeaturedSpecializations, getPaginatedSpecializations } from "@/data/specializations";
import {SpecialtyDirectory} from "./SpecializationFilter";

type SpecializationListProps = { 
  state: string; 
  city: string;
  searchParams?: any;
};

export default async function SpecializationList({ state, city, searchParams }: SpecializationListProps) {
  let specializationsData: any = { specializations: [], pagination: null };
  
  try {
    const params = searchParams ? await searchParams : {};
    const page = parseInt(params?.page || '1');
    const search = params?.search || '';
    
    // Use static specializations data instead of database query
    specializationsData = getPaginatedSpecializations(page, 20, search);
  } catch (error) {
    console.error('Failed to fetch specializations:', error);
    specializationsData = { specializations: [], pagination: null };
  }

  const params = searchParams ? await searchParams : {};
  const search = params?.search || '';
  const featuredSpecialties = getFeaturedSpecializations().map(s => ({
    ...s,
    featured: s.featured ?? false,
  }));
  return <SpecialtyDirectory 
    specializations={specializationsData.specializations}
    featuredSpecialties={featuredSpecialties}
    state={state}
    city={city}
    pagination={specializationsData.pagination}
    searchTerm={search}
    totalCount={specializationsData.pagination?.totalItems || specializationsData.specializations.length} />;
}