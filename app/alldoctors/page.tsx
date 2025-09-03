import Alldoc from "@/components/all_doc";


export default async function AllDocPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; city?: string; specialty?: string }> }) {
  // Await searchParams before using
  const params = await searchParams;

  return <Alldoc searchParams={params}/>;
}