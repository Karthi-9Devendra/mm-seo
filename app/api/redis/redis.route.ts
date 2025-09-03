import { fetchApi } from "../index";

export async function redisGet(key: string) {
    const response = await fetchApi(`/redis/${key}`, { method: "GET"});
    return response.data;
}

export async function redisSet(key: string, value: any) {
    const body: any = { value };
    const response = await fetchApi(`/redis/${key}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

   return response.data;
}