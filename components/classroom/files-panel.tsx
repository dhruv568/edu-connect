"use client";

import React, { useRef, useState } from "react";
import { ClassroomFileItem } from "@/types/classroom";
import { Folder, Upload, FileText, Image, File, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilesPanelProps {
  files: ClassroomFileItem[];
  sessionId: string;
  isTeacher: boolean;
  onUploadFile: (file: File) => Promise<void>;
  onClose: () => void;
}

export function FilesPanel({
  files,
  sessionId,
  isTeacher,
  onUploadFile,
  onClose,
}: FilesPanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      await onUploadFile(selectedFile);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string, fileName: string) => {
    if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
      return <FileText className="h-5 w-5 text-red-400 shrink-0" />;
    }
    if (mimeType.includes("image") || /\.(png|jpe?g)$/i.test(fileName)) {
      return <Image className="h-5 w-5 text-emerald-400 shrink-0" />;
    }
    return <File className="h-5 w-5 text-blue-400 shrink-0" />;
  };

  return (
    <div className="w-full h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Class Materials</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-semibold"
        >
          Close
        </button>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3 bg-red-500/15 border-b border-red-500/30 text-red-200 text-xs font-medium">
          {uploadError}
        </div>
      )}

      {/* Teacher Upload Action */}
      {isTeacher && (
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx"
            className="hidden"
          />
          <Button
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-10 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading Material..." : "Upload Class Material"}
          </Button>
          <p className="text-[10px] text-slate-500 text-center mt-1.5">
            Supported: PDF, Images, Word & PowerPoint (Max 10MB)
          </p>
        </div>
      )}

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {files.length > 0 ? (
          files.map((file) => (
            <div
              key={file.id}
              className="bg-slate-800/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  {getFileIcon(file.mimeType, file.fileName)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{file.fileName}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              {/* Download Action */}
              <a
                href={`/api/classroom/${sessionId}/files/${file.id}/download`}
                target="_blank"
                rel="noreferrer"
                download={file.fileName}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Download Material"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-500 py-8">
            <Folder className="h-8 w-8 text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">No class materials shared yet</p>
            <p className="text-[11px] text-slate-500 max-w-[200px]">
              {isTeacher
                ? "Upload lecture notes, slides, or worksheets for your students."
                : "Your teacher hasn't uploaded any class files yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
