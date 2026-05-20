"use client";

import { FaTools } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";

export default function ToolsPage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center space-y-6">
      <FaTools className="text-6xl text-gray-400" />
      <h1 className="text-3xl font-bold text-[#dd6b01]">Tools</h1>
      <p className="text-gray-500 text-center">
        This section will contain useful tools for future updates. Stay tuned!
      </p>
    </PageContainer>
  );
}
