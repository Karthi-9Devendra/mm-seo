import { redirect } from "next/navigation";

export default async function DoctorIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/doctor/profile?id=${id}`);
}
