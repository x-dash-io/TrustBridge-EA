"use client";

import { useState } from "react";
import { NDAGate } from "@/components/transactions/data-room/nda-gate";
import { FileVault } from "@/components/transactions/data-room/file-vault";
import { Kicker } from "@/components/ui/kicker";

export default function DataRoomPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-4">
      <div className="mb-12">
        <Kicker>Data Room — Secure Node 04</Kicker>
        <h1 className="font-display text-[42px] font-bold tracking-tight">Legal Repository</h1>
      </div>

      {!isAuthorized ? (
        <NDAGate 
          transactionTitle="Domain Acquisition: scale.ai" 
          onAccept={() => setIsAuthorized(true)} 
        />
      ) : (
        <FileVault />
      )}
    </div>
  );
}
