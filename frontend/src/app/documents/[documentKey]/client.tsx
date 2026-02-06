"use client";

export const dynamic = "force-dynamic";

import { useParams, useSearchParams } from "next/navigation";
import { BACKEND_API_ENDPOINT } from "@/constants";

export default function DocumentPage() {
  const { documentKey } = useParams<{ documentKey: string }>();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const filename = searchParams.get("filename");

  if (source === "assistant") {
  return (
    <div className="flex flex-1 flex-col overflow-hidden animate-fade-in">
      <iframe
        src={`/api/backend${BACKEND_API_ENDPOINT.DOCUMENTS}/${documentKey}?filename=${filename}`}
        className="flex-1 border-0"
      />
    </div>
  );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden animate-fade-in">
      <embed 
        src={`https://${decodeURIComponent(documentKey)}`} 
        type="application/pdf"
        className="flex-1 border-0"
      />
    </div>
  );

}
