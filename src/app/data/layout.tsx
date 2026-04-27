export default function DataLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full overflow-y-auto bg-stone-50">{children}</div>;
}
