"use client";

import { 
  FileText, 
  Download, 
  Eye, 
  ShieldCheck, 
  FileCode, 
  FileImage,
  Upload,
  Search,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

const mockFiles: DataFile[] = [
  { id: "1", name: "Corporate_Articles_of_Incorporation.pdf", size: "2.4 MB", type: "pdf", uploadedAt: "2024-05-10", uploadedBy: "Legal Dept" },
  { id: "2", name: "Financial_Statement_Q1_2024.xlsx", size: "1.1 MB", type: "excel", uploadedAt: "2024-05-12", uploadedBy: "Audit Team" },
  { id: "3", name: "IP_Asset_Register.pdf", size: "850 KB", type: "pdf", uploadedAt: "2024-05-14", uploadedBy: "Seller" },
  { id: "4", name: "Source_Code_Bundle_V2.zip", size: "128 MB", type: "zip", uploadedAt: "2024-05-15", uploadedBy: "Dev Team" },
];

export function FileVault() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            <p className="kicker text-success">Clearance Level: Authorized</p>
          </div>
          <h2 className="font-display text-[36px] font-bold tracking-tight italic">Document Vault</h2>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" className="font-mono text-[11px] uppercase tracking-widest border-border">
            <History className="w-3 h-3 mr-2" />
            Audit Trail
          </Button>
          <Button variant="primary" className="font-mono text-[11px] uppercase tracking-widest">
            <Upload className="w-3 h-3 mr-2" />
            Upload Entity
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-border">
        <div className="p-4 border-b border-border bg-muted/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Filter vault documents..."
              className="w-full bg-bg border border-border pl-12 pr-4 py-2 text-[13px] outline-none focus:border-accent"
            />
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/5">
              <th className="text-left p-6 font-mono text-[10px] uppercase tracking-widest text-muted">Document Name</th>
              <th className="text-left p-6 font-mono text-[10px] uppercase tracking-widest text-muted">Entity / Size</th>
              <th className="text-left p-6 font-mono text-[10px] uppercase tracking-widest text-muted">Registry Date</th>
              <th className="p-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockFiles.map((file) => (
              <tr key={file.id} className="hover:bg-muted/5 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-bg border border-border flex items-center justify-center text-muted group-hover:text-accent transition-colors">
                      {file.type === "pdf" ? <FileText className="w-5 h-5" /> : 
                       file.type === "zip" ? <FileCode className="w-5 h-5" /> : 
                       <FileImage className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold">{file.name}</p>
                      <p className="text-[11px] font-mono text-muted uppercase tracking-tighter">Checksum: SHA-256 Valid</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <p className="text-[13px] font-bold">{file.uploadedBy}</p>
                  <p className="text-[11px] font-mono text-muted tabular-nums">{file.size}</p>
                </td>
                <td className="p-6">
                  <p className="text-[13px] font-bold font-mono">{file.uploadedAt}</p>
                  <p className="text-[11px] font-mono text-muted uppercase">UTC Registry</p>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-muted hover:text-accent">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted hover:text-accent">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-6 bg-accent text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-accent-fg" />
            <p className="text-[12px] font-mono font-bold uppercase tracking-widest">
              End-to-End Encryption Active
            </p>
          </div>
          <p className="text-[11px] text-accent-fg/80 font-mono italic">
            Vault synchronized with regional legal nodes.
          </p>
        </div>
      </div>
    </div>
  );
}
