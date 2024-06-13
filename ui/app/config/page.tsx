import PageContainer from "@/components/shared/PageContainer";
import React from "react";

export default function Test() {
  return (
    <div className="w-full flex justify-center">
      <PageContainer>
        <h1 className="text-2xl font-bold">My Homepage</h1>
        <p className="mt-4">Welcome to my homepage!</p>
      </PageContainer>

      {/* Table */}
      {/* https://github.com/sadmann7/shadcn-table?tab=readme-ov-file */}
    </div>
  );
}
