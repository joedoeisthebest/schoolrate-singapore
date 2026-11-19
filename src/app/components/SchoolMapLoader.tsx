
"use client";

import dynamic from "next/dynamic";

const SchoolMap = dynamic(() => import("./SchoolMap"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
      Loading school map...
    </div>
  ),
});

export default SchoolMap;
