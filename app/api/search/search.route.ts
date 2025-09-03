import { fetchApi } from "../index";

export async function osBulkIndex(index: string, documents: any[]) {
  const response = await fetchApi(`/search/bulkIndex`, {
    method: "POST",
    body: JSON.stringify({ index, documents }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function osSearch(index: string, query: any) {
  const response = await fetchApi(`/search/os-search`, {
    method: "POST",
    body: JSON.stringify({ index, query }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function osIndex(index: string, document: any, id?: string) {
  const body: any = { index, document };
  if (id) body.id = id;

  const response = await fetchApi(`/search/index`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function osGet(index: string, id: string) {
  const response = await fetchApi(`/search/get`, {
    method: "POST",
    body: JSON.stringify({ index, id }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function osDelete(index: string, id: string) {
  const response = await fetchApi(`/search/delete`, {
    method: "POST",
    body: JSON.stringify({ index, id }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}
