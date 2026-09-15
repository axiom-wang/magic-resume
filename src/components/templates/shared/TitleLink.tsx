import { getProjectLinkHref } from "@/lib/projectLink";

export function TitleLink({ link, label }: { link?: string; label?: string }) {
  const href = getProjectLinkHref(link);
  if (!href) return <>{label}</>;
  return (
    <a className="resume-title-link" href={href} target="_blank" rel="noopener noreferrer"
      title={href} onClick={(event) => event.stopPropagation()}>
      {label}<span className="resume-title-link-icon" aria-hidden="true">↗</span>
    </a>
  );
}
