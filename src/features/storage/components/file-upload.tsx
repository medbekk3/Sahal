"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFileUseCase } from "@/application/use-cases/storage/upload-file";
import { container } from "@/infrastructure/di/container";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

export function FileUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const path = `uploads/${user.id}/${Date.now()}-${file.name}`;
      const result = await uploadFileUseCase(container.getStorageService(), path, file);
      setLastUrl(result.url);
      toast({ title: "اكتمل الرفع", description: file.name });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل الرفع",
        description: error instanceof Error ? error.message : "حاول مرة أخرى",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
      <Button variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="ms-2 h-4 w-4" />
        {uploading ? "جارٍ الرفع..." : "ارفع إلى Firebase Storage"}
      </Button>
      {lastUrl && (
        <p className="truncate text-xs text-muted-foreground">
          آخر ملف مرفوع:{" "}
          <a href={lastUrl} target="_blank" rel="noreferrer" className="text-primary underline">
            {lastUrl}
          </a>
        </p>
      )}
    </div>
  );
}
