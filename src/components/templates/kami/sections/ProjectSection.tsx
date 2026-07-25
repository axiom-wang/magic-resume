import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { Project, GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";
import { getProjectLinkMeta } from "@/lib/projectLink";
import { KAMI } from "../tokens";

interface ProjectSectionProps {
  projects: Project[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({
  projects,
  globalSettings,
  showTitle = true,
}) => {
  const locale = useLocale();
  const visibleProjects = projects?.filter((p) => p.visible);
  const centerSubtitle = globalSettings?.centerSubtitle;
  const themeColor = globalSettings?.themeColor || KAMI.brand;

  return (
    <SectionWrapper
      sectionId="projects"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 22}px` }}
    >
      <SectionTitle
        type="projects"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <motion.div
        layout="position"
        className="flex flex-col"
        style={{ marginTop: `${globalSettings?.paragraphSpacing || 14}px` }}
      >
        <AnimatePresence mode="popLayout">
          {visibleProjects.map((project) => {
            const projectLink = getProjectLinkMeta(project, {
              preferFullUrl: centerSubtitle,
            });

            return (
              <motion.div
                key={project.id}
                layout="position"
                className="py-2.5 first:pt-1"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h4
                      className="font-medium"
                      style={{
                        fontSize: `${globalSettings?.subheaderSize || 15}px`,
                        color: KAMI.nearBlack,
                        fontWeight: 500,
                      }}
                    >
                      {project.name}
                    </h4>
                    {centerSubtitle && project.role && (
                      <span
                        style={{
                          fontSize: `${(globalSettings?.subheaderSize || 15) - 1}px`,
                          color: KAMI.olive,
                        }}
                      >
                        {project.role}
                      </span>
                    )}
                    {projectLink && (
                      <a
                        href={projectLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1"
                        title={projectLink.title}
                        style={{
                          fontSize: "11px",
                          color: themeColor,
                        }}
                      >
                        <Icons.ExternalLink className="h-3 w-3 shrink-0" />
                        <span>{projectLink.label}</span>
                      </a>
                    )}
                  </div>
                  <div
                    className="ml-auto shrink-0"
                    style={{
                      fontSize: `${Math.max((globalSettings?.baseFontSize || 13) - 1, 11)}px`,
                      color: KAMI.stone,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatDateString(project.date, locale)}
                  </div>
                </div>

                {project.role && !centerSubtitle && (
                  <div
                    className="mt-1 inline-block rounded px-2 py-0.5"
                    style={{
                      fontSize: `${(globalSettings?.subheaderSize || 15) - 3}px`,
                      color: themeColor,
                      fontWeight: 500,
                      backgroundColor: KAMI.brandTint,
                    }}
                  >
                    {project.role}
                  </div>
                )}

                {project.description && (
                  <motion.div
                    layout="position"
                    className="mt-2 prose prose-sm max-w-none prose-p:my-1 [&>ul]:mt-1 [&>ul]:pl-4 [&>ul>li]:my-0.5"
                    style={{
                      fontSize: `${globalSettings?.baseFontSize || 13}px`,
                      lineHeight: globalSettings?.lineHeight || 1.5,
                      color: KAMI.nearBlack,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: normalizeRichTextContent(project.description),
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </SectionWrapper>
  );
};

export default ProjectSection;
