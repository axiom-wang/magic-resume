import React, { useEffect, useMemo, useState } from "react";
import ResumeTemplateComponent from "../templates";
import { cn } from "@/lib/utils";
import { normalizeFontFamily } from "@/utils/fonts";
import type { ResumeData } from "@/types/resume";
import {
  TEMPLATE_PREVIEW_HEIGHT_PX,
  TEMPLATE_PREVIEW_WIDTH_PX,
  getTemplateById,
} from "@/lib/templatePreview";
import {
  RESUME_EXPORT_READY_ATTRIBUTE,
  RESUME_EXPORT_ROOT_ATTRIBUTE,
} from "@/lib/resumeExport";

const readInjectedResume = (): ResumeData | null => {
  if (typeof window === "undefined") return null;
  return window.__MAGIC_RESUME_DATA__ ?? null;
};

const IframeResumeExportViewer = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(() =>
    readInjectedResume()
  );

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const isSnapshotMode = searchParams?.get("snapshot") === "1";

  useEffect(() => {
    if (resumeData) return;

    const existing = readInjectedResume();
    if (existing) {
      setResumeData(existing);
      return;
    }

    const onReady = () => {
      const next = readInjectedResume();
      if (next) setResumeData(next);
    };

    window.addEventListener("magic-resume-data-ready", onReady);
    const timer = window.setInterval(() => {
      const next = readInjectedResume();
      if (next) {
        setResumeData(next);
        window.clearInterval(timer);
      }
    }, 50);

    return () => {
      window.removeEventListener("magic-resume-data-ready", onReady);
      window.clearInterval(timer);
    };
  }, [resumeData]);

  const template = useMemo(
    () => getTemplateById(resumeData?.templateId ?? "kami"),
    [resumeData?.templateId]
  );

  const selectedFontFamily = normalizeFontFamily(
    resumeData?.globalSettings?.fontFamily ?? template.defaultFontFamily
  );
  const pagePadding =
    resumeData?.globalSettings?.pagePadding ?? template.spacing.contentPadding;
  const backgroundColor = template.colorScheme.background || "#ffffff";

  if (!resumeData) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm text-neutral-500"
        style={{ backgroundColor }}
      >
        Waiting for resume data…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full min-h-screen overflow-hidden",
        isSnapshotMode
          ? "flex items-start justify-start p-0"
          : "flex items-start justify-center"
      )}
      style={{ backgroundColor }}
    >
      <div
        {...{
          [RESUME_EXPORT_ROOT_ATTRIBUTE]: "",
          [RESUME_EXPORT_READY_ATTRIBUTE]: "1",
        }}
        className={cn(
          "relative origin-top-left",
          isSnapshotMode ? "" : "mx-auto"
        )}
        style={{
          width: `${TEMPLATE_PREVIEW_WIDTH_PX}px`,
          minWidth: `${TEMPLATE_PREVIEW_WIDTH_PX}px`,
          height: isSnapshotMode
            ? `${TEMPLATE_PREVIEW_HEIGHT_PX}px`
            : undefined,
          minHeight: `${TEMPLATE_PREVIEW_HEIGHT_PX}px`,
          overflow: isSnapshotMode ? "hidden" : "visible",
          fontFamily: selectedFontFamily,
          padding: `${pagePadding}px`,
          backgroundColor,
          color: template.colorScheme.text,
        }}
      >
        <ResumeTemplateComponent data={resumeData} template={template} />
      </div>
    </div>
  );
};

export default IframeResumeExportViewer;
