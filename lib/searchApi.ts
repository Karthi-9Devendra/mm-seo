import { specializations } from "@/data/specializations";

const LAMBDA_URL =
  "https://r2xwa5uj63ugze4u2pkdgbqiaq0utfsk.lambda-url.eu-north-1.on.aws/";

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export async function osBulkIndex(index: string, documents: any[]) {
  // Filter out documents with all null fields

  console.log("body", {
    operation: "bulkIndex",
    index,
    body: documents,
  });
  try {
    const res = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "bulkIndex",
        index,
        body: documents, // Only send valid docs
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorBody}`);
    }
    console.log("RES", res);

    return await res.json();
  } catch (error) {
    console.error("Bulk index failed:", error);
    throw error;
  }
}

export async function osSearch(index: string, query: any) {
  console.log("OpenSearch search");
  try {
    const res = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "search",
        index,
        body: query,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // Lambda JSON
    const lambdaData: any = await res.json();

    // body is already an object in your case
    const osResponse = lambdaData.body;

    // // Hits may be directly under osResponse or under osResponse.body
    // const hits = osResponse?.hits?.hits || osResponse?.body?.hits?.hits || [];

    // console.log("✅ Parsed OpenSearch hits", hits);

    // return {
    //   items: hits.map((hit: any) => {
    //     const src = hit._source || {};
    //     return {
    //       _id: hit._id,
    //       id: src.id,
    //       npi: src.npi || "",
    //       firstName: src.user?.firstName || src.firstName || "",
    //       lastName: src.user?.lastName || src.lastName || "",
    //       user: src.user || {},
    //       state: src.state || "",
    //       city: src.city || "",
    //       specialization: src.specialization,
    //     };
    //   }),
    //   total: osResponse?.hits?.total?.value || 0
    // };
    return osResponse;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}


export async function osIndex(index: string, document: any, id?: string) {
  console.log("OpenSearch index");
  try {
    const res = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "index", // Changed from 'action' to 'operation'
        index,
        body: document, // Changed from 'documents' to 'body'
        ...(id && { id }), // Conditionally add id if provided
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: LambdaResponse = await res.json();
    const result = JSON.parse(data.body); // Parse the body string
    console.log("OpenSearch index res", result);
    return result;
  } catch (error) {
    console.error("Index error:", error);
    return null;
  }
}

export async function osGet(index: string, id: string) {
  console.log("OpenSearch get");
  try {
    const res = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get",
        index,
        id,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: LambdaResponse = await res.json();
    const document = JSON.parse(data.body); // Parse the body string
    console.log("OpenSearch get res", document);
    return document;
  } catch (error) {
    console.error("Get error:", error);
    return null;
  }
}

export async function osDelete(index: string, id: string) {
  console.log("OpenSearch delete");
  try {
    const res = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "delete",
        index,
        id,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: LambdaResponse = await res.json();
    const result = JSON.parse(data.body); // Parse the body string
    console.log("OpenSearch delete res", result);
    return result;
  } catch (error) {
    console.error("Delete error:", error);
    return null;
  }
}