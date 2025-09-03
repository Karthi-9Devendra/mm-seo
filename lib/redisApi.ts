export async function redisGet(key: string) {
  console.log("redis get", key);
  const res = await fetch(
    `https://ct5prl4j2lt6bcetrouaporg7q0uwelr.lambda-url.eu-north-1.on.aws`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          action: "get",
          key
      }),
    }
  );
  console.log("res", res);
  const data = await res.json();
  console.log("redis get res", data);

  if (data.value && typeof data.value === "string") {
    try {
      data.value = JSON.parse(data.value);
    } catch (e) {
      console.error("Failed to parse cached JSON", e);
    }
  }

  return data.value;
}

export async function redisSet(key: string, value: any) {
  console.log("redis set");
  const res = await fetch(
    `https://ct5prl4j2lt6bcetrouaporg7q0uwelr.lambda-url.eu-north-1.on.aws`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          action: "set",
          key,
          value,
      }),
    }
  );

  const data = await res.json();
  console.log("redis set res", data);
  return data.status;
}
