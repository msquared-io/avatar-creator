"use client";

import dynamic from "next/dynamic";

const PreviewApp = dynamic(() => import("../../PreviewApp"), { ssr: false });

export function ClientOnly() {
  return <PreviewApp />;
}
