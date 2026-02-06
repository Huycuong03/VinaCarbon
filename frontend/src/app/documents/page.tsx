import { Suspense } from "react";
import SearchPage from "./client";

export default function Page() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
