"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function UploadSolutionBlock({
  onSubmit,
  errorMessage
}: {
  onSubmit: (input: { files: File[]; comment: string }) => Promise<void>;
  errorMessage?: string | null;
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
    <Card className="bg-[#fffdf9]">
      <h3 className="text-lg font-semibold text-[#243041]">Загрузка решения</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Добавь одно или несколько фото решения. На проверку уйдут условие задания, фото условия, критерии, эталон и твои изображения.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          Добавить фото решения
        </Button>
        <Button type="button" variant="ghost" onClick={() => setFiles([])} disabled={files.length === 0}>
          Очистить всё
        </Button>
      </div>

      {previews.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {previews.map((item, index) => (
            <div key={`${item.file.name}-${item.file.size}`} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <Image src={item.url} alt={item.file.name} fill className="object-cover" unoptimized />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white"
                onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <Textarea
        className="mt-4"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Комментарий к решению: что вызвало трудности, где сомневаешься, что хочешь перепроверить"
      />

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-[#ecc0c0] bg-[#fff2f2] px-4 py-3 text-sm text-[#a34b4b]">{errorMessage}</div>
      ) : null}

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
        {pending ? "Отправляем на проверку..." : "Отправить решение на проверку"}
      </Button>
    </Card>
  );
}
