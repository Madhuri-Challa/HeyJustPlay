export function RoomCodeBadge({ code }: { code: string }) {
  return (
    <div className="rounded-lg border border-mint/50 bg-mint/10 px-4 py-3 text-center">
      <p className="text-xs font-bold uppercase text-mint">Room Code</p>
      <p className="mt-1 font-mono text-3xl font-black tracking-[0.22em] text-white">{code}</p>
    </div>
  );
}
