import { Project } from "@/types/resume";

// Website-only links used by section and project headings.
export const getProjectLinkHref = (link?: string) => {
  const value = link?.trim();
  if (!value || /\s/.test(value)) return null;
  if (/^[a-z][a-z\d+\-.]*:/i.test(value) && !/^https?:\/\//i.test(value)) return null;
  try {
    const url = new URL(value.startsWith("//") ? `https:${value}` : /^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!url.hostname || url.username || url.password || !["https:", "http:"].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
};

export const getProjectLinkLabel = (
  project: Pick<Project, "link" | "linkLabel">,
  options?: { preferFullUrl?: boolean }
) => {
  const customLabel = project.linkLabel?.trim();
  if (customLabel) return customLabel;

  const originalLink = project.link?.trim();
  if (!originalLink) return "";

  if (options?.preferFullUrl) {
    return originalLink;
  }

  const href = getProjectLinkHref(originalLink);
  if (!href) return originalLink;

  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return originalLink;
  }
};

export const getProjectLinkMeta = (
  project: Pick<Project, "link" | "linkLabel">,
  options?: { preferFullUrl?: boolean }
) => {
  const href = getProjectLinkHref(project.link);
  if (!href) return null;

  return {
    href,
    label: getProjectLinkLabel(project, options),
    title: project.link?.trim() || href,
  };
};
