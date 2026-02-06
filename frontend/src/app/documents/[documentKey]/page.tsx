import { Suspense } from "react";
import DocumentPage from "./client";

export default function Page() {
  return (
    <Suspense>
      <DocumentPage />
    </Suspense>
  );
}
