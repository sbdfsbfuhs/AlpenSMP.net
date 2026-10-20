import { freshStamp } from "@/lib/alpen/staff";

export function Neu({ ts, updatedAt }: { ts?: number; updatedAt?: number }) {
  if (!freshStamp(ts, updatedAt)) return null;
  return <span className="ml-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">Neu</span>;
}
