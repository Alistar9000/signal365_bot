import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export function GuideLink() {
  return (
    <Link to="/mini-app/guide" className="guide-link" aria-label="راهنما">
      <BookOpen size={13} />
      راهنما
    </Link>
  );
}

export default function PageHeader({ title, subtitle, action }) {
  return (
    <header className="animate-fade-up mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-lg font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[11px] leading-5 text-muted">{subtitle}</p>
        )}
      </div>
      {action ?? <GuideLink />}
    </header>
  );
}
