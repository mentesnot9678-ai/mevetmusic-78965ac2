import { useRef } from "react";
import { FolderPlus, Plus } from "lucide-react";
import { useLibrary } from "@/store/library";
import { toast } from "sonner";

export function AddMusic({ compact = false }: { compact?: boolean }) {
  const filesRef = useRef<HTMLInputElement>(null);
  const dirRef = useRef<HTMLInputElement>(null);
  const addFiles = useLibrary((s) => s.addFiles);

  const handle = async (list: FileList | null) => {
    if (!list?.length) return;
    const before = useLibrary.getState().tracks.length;
    await addFiles([...list]);
    const added = useLibrary.getState().tracks.length - before;
    toast.success(added ? `Added ${added} track${added === 1 ? "" : "s"}` : "No new audio found");
  };

  return (
    <>
      <input
        ref={filesRef}
        type="file"
        accept="audio/*"
        multiple
        hidden
        onChange={(e) => handle(e.target.files)}
      />
      <input
        ref={dirRef}
        type="file"
        hidden
        multiple
        // @ts-expect-error non-standard directory picker attributes
        webkitdirectory="true"
        directory="true"
        onChange={(e) => handle(e.target.files)}
      />
      {compact ? (
        <button
          onClick={() => filesRef.current?.click()}
          aria-label="Add music"
          className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <Plus className="size-5" />
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => filesRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Add songs
          </button>
          <button
            onClick={() => dirRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-semibold"
          >
            <FolderPlus className="size-4" /> Add folder
          </button>
        </div>
      )}
    </>
  );
}
