export async function fetchApi(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Error: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("❌ Fetch Error:", error.message);
    throw error;
  }
}
