- `next.config.ts` = config = env variables + build instructions
- routing = file system = under `/app` folder
- page routing
  - examples
    - `/app/page.tsx` = `/`
    - `/app/about/page.tsx` = `/about`
    - `/app/about/loading.tsx` = `/about` when loading
    - `/app/products/[id].tsx`
  - every components are server-side by default
  - but browser features (clicks, react hooks) require client-side components
    - add `"use client";` to set component as client-side
- api routing = nextjs allow api endpoints = under `/app/api` folder
  - examples
    - `/app/api/auth/route.ts` = `/api/auth` endpoint
    ```typescript
    import { NextResponse } from "next/server";
    export async function GET(request: Request) {
        const response = NextResponse.json({
            data: []
        }); 
        return response
    }
    ``` 
- fetching data
  - client-side conponents = sync func -> run async func inside `useEffect`
  - server-side components = set as async func -> run async func directly
-  use `import Image from "next/image";` for optimized image rendering
-  

- Community Data Schema
- 