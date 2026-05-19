"use client";

import { useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";

const levels = ["HSC", "SSC", "Primary"];
const boards = ["Dhaka", "Chattogram", "Rajshahi", "Sylhet"];
const batches = ["2018-2019", "2019-2020", "2020-2021"];

export default function AssetsSetupPage() {
  const [level, setLevel] = useState(levels[0]);
  const [board, setBoard] = useState(boards[0]);
  const [batch, setBatch] = useState(batches[0]);

  return (
    <PageContainer className="space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01]">Assets Setup</h1>
      <p className="text-gray-500">Update levels, boards, batches, and other assets.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-gray-600 font-semibold mb-1">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full border border-[#dd6b01] rounded-lg px-3 py-2 outline-none"
          >
            {levels.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 font-semibold mb-1">Board</label>
          <select
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            className="w-full border border-[#dd6b01] rounded-lg px-3 py-2 outline-none"
          >
            {boards.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 font-semibold mb-1">Batch</label>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-full border border-[#dd6b01] rounded-lg px-3 py-2 outline-none"
          >
            {batches.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <button className="px-6 py-2 mt-6 bg-[#dd6b01] text-white rounded-lg hover:bg-orange-600 transition">
        Save Assets
      </button>
    </PageContainer>
  );
}
