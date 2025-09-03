
import SpecialtyDoctors from "@/components/specialtyDoctor";

export default async function DoctorSearchPage ({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; city?: string; specialty?: string }> }) {
  
  const params = await searchParams;

  return <SpecialtyDoctors searchParams={params}/>;
};

