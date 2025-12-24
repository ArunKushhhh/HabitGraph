import { Loader2 } from "lucide-react";

export function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="h-screen flex items-center gap-2 justify-center text-sm">
      <Loader2 className="animate-spin size-4" />
      <h1>{text}</h1>
    </div>
  );
}
