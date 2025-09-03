import { fetchApi } from "../index";

// 1. Doctor by NPI
export async function getDoctorByNPI(npi: string) {
  return fetchApi(`/db/doctor/npi/${npi}`);
}

// 2. Doctors by state + city/zip + specialization
export async function getDoctorsByLocationAndSpecialization(
  stateKey: string,
  cityOrZip: string,
  specialization: string,
  page?: number,
  limit?: number,
  searchTerm?: string
) {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (searchTerm) params.append("searchTerm", searchTerm);

  return fetchApi(
    `/db/doctors/${stateKey}/${cityOrZip}/${specialization}?${params.toString()}`
  );
}

// 3. All specializations
export async function getSpecializations(
  page?: number,
  limit?: number,
  searchTerm?: string
) {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (searchTerm) params.append("searchTerm", searchTerm);

  return fetchApi(`/db/specializations?${params.toString()}`);
}

// 4. Specialization by classification
export async function getSpecializationByClassification(classification: string) {
  return fetchApi(`/db/specialization/${classification}`);
}

// 5. Cities by state
export async function getCitiesByState(
  stateKey: string,
  page?: number,
  limit?: number,
  searchTerm?: string
) {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (searchTerm) params.append("searchTerm", searchTerm);

  return fetchApi(`/db/cities/${stateKey}?${params.toString()}`);
}

// 6. Zipcodes by state
export async function getZipCodesByState(
  stateKey: string,
  page?: number,
  limit?: number,
  searchTerm?: string
) {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (searchTerm) params.append("searchTerm", searchTerm);

  return fetchApi(`/db/zipcodes/${stateKey}?${params.toString()}`);
}

// 7. States list
export async function getStates() {
  return fetchApi(`/db/states`);
}

// 8. Cities simple by state
export async function getCitiesByStateSimple(stateKey: string, searchTerm?: string) {
  const params = new URLSearchParams();
  if (searchTerm) params.append("searchTerm", searchTerm);

  return fetchApi(`/db/cities-simple/${stateKey}?${params.toString()}`);
}

// 9. Cities from city_table
export async function getCitiesByStateFromCityTable(
  stateKey: string,
  page?: number,
  limit?: number,
  searchTerm?: string
) {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (searchTerm) params.append("searchTerm", searchTerm);

  return fetchApi(`/db/cities-from-table/${stateKey}?${params.toString()}`);
}

export async function searchSpecificCity(searchTerm: string) {
  const params = new URLSearchParams();
  if (searchTerm) params.append("searchTerm", searchTerm);

  return fetchApi(`/db/search-city?${params.toString()}`);
}