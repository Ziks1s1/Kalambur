"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function UploadSolutionBlock({
  onSubmit
}: {
  onSubmit: (input: { files: File[]; comment: string }) => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previews = files.map((file) => ({
    file,
    url: URL.createObjectURL(file)
  }));

  return (
    <Card>
      <h3 className="text-base font-semibold">Загрузка решения</h3>
      <p className="mt-2 text-sm text-slate-500">Добавь фото решения и комментарий, если хочешь пояснить ход мыслей.</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
      />

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          Выбрать фото
        </Button>
        <Button variant="ghost" onClick={() => setFiles([])} disabled={files.length === 0}>
          Очистить
        </Button>
      </div>

      {previews.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {previews.map((item) => (
            <div key={`${item.file.name}-${item.file.size}`} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <Image src={item.url} alt={item.file.name} fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      ) : null}

      <Textarea className="mt-4" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Комментарий к решению" />

      <Button
        className="mt-4"
        fullWidth
        disabled={files.length === 0 || pending}
        onClick={async () => {
          setPending(true);
          try {
            await onSubmit({ files, comment });
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "Отправляем..." : "Отправить на проверку"}
      </Button>
    </Card>
  );
}
