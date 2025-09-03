import { SpecialtiesDirectoryUi } from "@/components/specialtiesdirectoryui";
import { getPaginatedSpecializations, getFeaturedSpecializations } from "@/data/specializations";

// Define the expected search params
interface SearchParams {
  page?: string;
  search?: string;
}

// Define default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_ITEMS_PER_PAGE = 20;

export default async function SpecialtiesDirectoryPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const awaitedSearchParams = await searchParams;

  const page = awaitedSearchParams?.page ? parseInt(awaitedSearchParams.page) : DEFAULT_PAGE;
  const itemsPerPage = DEFAULT_ITEMS_PER_PAGE;
  const search = awaitedSearchParams?.search || '';

  const specializationsData = getPaginatedSpecializations(page, itemsPerPage, search);
  const featuredSpecialties = getFeaturedSpecializations().map(s => ({
    ...s,
    featured: s.featured ?? false,
  }));

  console.log('Specializations Data:', specializationsData);

  // You can set these statically or fetch from somewhere else
  const state = '';
  const city = '';

  return (
      <SpecialtiesDirectoryUi
        specializations={specializationsData.specializations}
        state={state}
        city={city}
        pagination={specializationsData.pagination}
        searchTerm={search}
        totalCount={specializationsData.pagination?.totalItems || specializationsData.specializations.length}
        featuredSpecialties={featuredSpecialties}
      />
  );
}