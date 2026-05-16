"use client";

import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  label: string;
  onUpload: (file: File) => void;
  className?: string;
  accept?: Record<string, string[]>;
}

export function UploadZone({ label, onUpload, className, accept }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0) onUpload(files[0]);
    },
    accept: accept || {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const file = acceptedFiles[0];

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border border-dashed border-border p-12 text-center cursor-pointer transition-all hover:border-accent bg-surface",
        isDragActive && "border-accent bg-accent/5",
        file && "border-success/40 bg-success/5",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {!file && (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="kicker mb-1">{label}</p>
              <p className="text-[12px] text-muted font-sans">
                Drag and drop or click to upload
              </p>
            </div>
          </>
        )}
        {file && (
          <>
            <div className="w-10 h-10 bg-success/10 text-success flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="kicker text-success mb-1">File Captured</p>
              <p className="text-[12px] font-mono text-muted truncate max-w-[200px]">
                {file.name}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
