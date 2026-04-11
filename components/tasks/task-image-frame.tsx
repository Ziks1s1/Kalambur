type TaskImageFrameProps = {
  src: string;
  alt: string;
};

export function TaskImageFrame({ src, alt }: TaskImageFrameProps) {
  return (
    <div className="w-full">
      <div className="inline-flex max-w-full overflow-hidden rounded-3xl border border-[#e8dccf] bg-[#f8f2ea] p-2">
        <img src={src} alt={alt} className="block h-auto max-h-[80vh] w-auto max-w-full rounded-[1.25rem]" loading="lazy" />
      </div>
    </div>
  );
}
