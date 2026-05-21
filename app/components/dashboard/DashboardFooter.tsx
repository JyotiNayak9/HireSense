interface DashboardFooterProps {
  copyright: string;
  links?: string[];
}

export default function DashboardFooter({
  copyright,
  links = [],
}: DashboardFooterProps) {
  return (
    <footer className="mx-auto mt-10 flex max-w-[1120px] flex-col gap-4 border-t border-slate-200 px-5 py-6 text-[11px] font-semibold text-[#061b55] md:flex-row md:items-center md:justify-between md:px-7">
      <p>{copyright}</p>
      {links.length > 0 && (
        <div className="flex gap-7">
          {links.map((link) => (
            <span key={link}>{link}</span>
          ))}
        </div>
      )}
    </footer>
  );
}
