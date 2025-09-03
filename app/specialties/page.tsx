import SpecialtyPage from "./SpecialityPage";

export default async function Specialty({ params }: { params: Promise<{specialty: string; city?: string; state?: string;}> }) {
  const param = await params;

  return <SpecialtyPage param={param} />
}