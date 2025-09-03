// app/api/check-valkey/route.ts
import { NextResponse } from 'next/server';
import Redis from "ioredis";

export async function GET() {
  const config = {
    host: "medmatch-dr-hcb6i5.serverless.eun1.cache.amazonaws.com",
    port: 6379,
    tls: {
      // Required settings for AWS Serverless Valkey
      rejectUnauthorized: false,
      servername: "medmatch-dr-hcb6i5.serverless.eun1.cache.amazonaws.com"
    },
    connectTimeout: 3000,
    maxRetriesPerRequest: 0, // Disable retries for health checks
    enableReadyCheck: true,
    socket: {
      tls: true,
      keepAlive: 5000
    }
  };

  const redisClient = new Redis(config);

  try {
    // Test connection with timeout
    const pingResponse = await Promise.race([
      redisClient.ping(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 3s')), 3000)
      )
    ]);

    return NextResponse.json({
      status: "success",
      message: "Connected to Valkey",
      response: pingResponse,
      connection: {
        host: config.host,
        port: config.port,
        status: redisClient.status
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: "Connection failed",
      error: error.message,
      solution: {
        description: "Connection works in AWS CloudShell but not in Next.js",
        steps: [
          "1. Verify VPC/network configuration if running in AWS",
          "2. Check if application needs to be in same VPC as Valkey",
          "3. Ensure security groups allow traffic from your app's IP",
          "4. Try with these exact TLS settings"
        ],
        configUsed: config
      }
    }, { status: 503 });

  } finally {
    if (redisClient.status === 'ready') {
      await redisClient.quit();
    }
  }
}

export const dynamic = 'force-dynamic';