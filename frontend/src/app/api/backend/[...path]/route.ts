import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {

  const credentials = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const token = credentials ? jwt.sign(credentials, process.env.NEXTAUTH_SECRET!) : "unauthenticated";
  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const { path } = await context.params;
  const backendApiPath = path.join("/");
  const searchQuery = req.nextUrl.search;


  const response = await fetch(
    `${process.env.BACKEND_URL}/${backendApiPath}${searchQuery}`,
    {
      method: "GET",
      headers
    }
  );

  const contentType = response.headers.get("content-type") || "";

  // JSON
  if (contentType.includes("application/json")) {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }

  // STREAMING
  if (contentType.includes("text/event-stream") || response.body) {
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }

  // FILE / BINARY
  const buffer = await response.arrayBuffer();
  return new NextResponse(buffer, {
    status: response.status,
    headers: response.headers,
  });
}


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {

  const credentials = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const token = credentials ? jwt.sign(credentials, process.env.NEXTAUTH_SECRET!) : "unauthenticated";
  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const { path } = await context.params;
  const backendApiPath = path.join("/");
  const searchQuery = req.nextUrl.search;

  const response = await fetch(
    `${process.env.BACKEND_URL}/${backendApiPath}${searchQuery}`,
    {
      method: "POST",
      headers,
      body: req.body,
      duplex: "half"
    } as RequestInit & { duplex: string }
  );


  const contentType = response.headers.get("content-type") || "";

  // JSON
  if (contentType.includes("application/json")) {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }

  // STREAMING
  if (contentType.includes("text/event-stream") || response.body) {
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }

  // FILE / BINARY
  const buffer = await response.arrayBuffer();
  return new NextResponse(buffer, {
    status: response.status,
    headers: response.headers,
  });
}


export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {

  const credentials = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const token = credentials ? jwt.sign(credentials, process.env.NEXTAUTH_SECRET!) : "unauthenticated";
  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const { path } = await context.params;
  const backendApiPath = path.join("/");
  const searchQuery = req.nextUrl.search;

  const response = await fetch(
    `${process.env.BACKEND_URL}/${backendApiPath}${searchQuery}`,
    {
      method: "PATCH",
      headers,
      body: req.body,
    }
  );

  if (response.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });


}


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {

  const credentials = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const token = credentials ? jwt.sign(credentials, process.env.NEXTAUTH_SECRET!) : "unauthenticated";
  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const { path } = await context.params;
  const backendApiPath = path.join("/");
  const searchQuery = req.nextUrl.search;

  const response = await fetch(
    `${process.env.BACKEND_URL}/${backendApiPath}${searchQuery}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (response.status === 204) {
    return new Response(null, { status: 204 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });

}
