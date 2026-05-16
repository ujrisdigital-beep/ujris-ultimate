"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Trash2, ExternalLink, ChevronLeft } from "lucide-react";
import { formatDate, fileSize } from "@/lib/utils";
import toast from "react-hot-toast";

interface Evidence {
  id: string; originalName: string; mimeType: string; fileSize: number;
  type: string; uploadedAt: string; storageKey: string;
}

interface Props {
  caseData: { id: string; title: string; evidence: Evidence[] };
}

export default function DocumentsClient({ caseData }: Props) {
  const [items, setItems]       = useState<Evidence[]>(caseData.evidence);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);

  const CHUNK = 5 * 1024 * 1024;

  async function uploadFile(file: File) {
    const totalChunks = Math.ceil(file.size / CHUNK);
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let lastEvidence: Evidence | null = null;

    for (let i = 0; i < totalChunks; i++) {
      const blob = file.slice(i * CHUNK, (i + 1) * CHUNK);
      const fd = new FormData();
      fd.append("file", new File([blob], file.name, { type: file.type }));
      fd.append("caseId", caseData.id);
      fd.append("chunk", String(i));
      fd.append("total", String(totalChunks));
      fd.append("uploadId", uploadId);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProgress(Math.round(((i + 1) / totalChunks) * 100));
      if (data.evidence) lastEvidence = data.evidence;
    }
    return lastEvidence;
  }

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    setUploading(true);
    setProgress(0);
    try {
      for (const file of accepted) {
        const ev = await uploadFile(file);
        if (ev) setItems(prev => [ev, ...prev]);
        toast.success(`${file.name} uploaded`);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [caseData.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 500 * 1024 * 1024,
  });

  async function deleteEvidence(id: string) {
    await fetch(`/api/evidence/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(e => e.id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/case/${caseData.id}`} className="flex items-center gap-1 text-sm text-[#7A8FA6] hover:text-[#C9A84C] mb-3">
          <ChevronLeft className="w-4 h-4" /> Back to case
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="w-6 h-6 text-[#C9A84C]" /> Evidence Vault
        </h1>
        <p className="text-[#7A8FA6] text-sm mt-1">{caseData.title}</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-8 ${isDragActive ? "border-[#C9A84C] bg-[#C9A84C]/5" : "border-white/20 hover:border-white/40"}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-[#7A8FA6]" />
        <p className="text-[#EEF2F7] font-medium">{isDragActive ? "Drop files here" : "Drag files here or click to browse"}</p>
        <p className="text-xs text-[#7A8FA6] mt-1">PDF, Word, images, audio, video — up to 500MB per file</p>
      </div>

      {uploading && (
        <div className="mb-6 card">
          <p className="text-sm text-[#7A8FA6] mb-2">Uploading… {progress}%</p>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-[#C9A84C] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Evidence list */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-10 h-10 text-[#7A8FA6] mx-auto mb-3" />
            <p className="text-[#7A8FA6]">No evidence uploaded yet.</p>
          </div>
        ) : items.map(ev => (
          <div key={ev.id} className="card flex items-center gap-4">
            <FileText className="w-8 h-8 text-[#C9A84C] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#EEF2F7] truncate">{ev.originalName}</p>
              <p className="text-xs text-[#7A8FA6]">{ev.type} · {fileSize(ev.fileSize)} · {formatDate(ev.uploadedAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              {ev.storageKey && (
                <a href={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "")}/storage/v1/object/public/ujris-evidence/${ev.storageKey}`}
                  target="_blank" rel="noreferrer"
                  className="p-2 text-[#7A8FA6] hover:text-[#C9A84C] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button onClick={() => deleteEvidence(ev.id)}
                className="p-2 text-[#7A8FA6] hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
