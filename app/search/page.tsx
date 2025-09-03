import SearchPage from "./SearchPage";

export default async function SPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  // Await searchParams before using
  const params = await searchParams;

  return <SearchPage searchParams={params} />;
}
