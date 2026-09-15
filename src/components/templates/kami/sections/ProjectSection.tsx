import { TitleLink } from "../../shared/TitleLink";
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

/**
 * 结构与间距度量对齐经典模板（逐条 marginTop = 段落间距、项目名 flex-[1.5]、
 * 链接/日期列的 flex 占位与 centerSubtitle 分支完全一致），配色沿用 kami tokens。
 */
const ProjectSection: React.FC<ProjectSectionProps> = ({
  projects,
  globalSettings,
  showTitle = true,
}) => {
  const locale = useLocale();
  const visibleProjects = projects?.filter((p) => p.visible);
  const centerSubtitle = globalSettings?.centerSubtitle;
  const flexLayout = globalSettings?.flexibleHeaderLayout;
  const themeColor = globalSettings?.themeColor || KAMI.brand;

  return (
    <SectionWrapper
      sectionId="projects"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}
    >
      <SectionTitle
        type="projects"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <motion.div layout="position">
        <AnimatePresence mode="popLayout">
          {visibleProjects.map((project) => {
            const projectLink = project.linkDisplay === "superscript" ? null : getProjectLinkMeta(project, {
              preferFullUrl: centerSubtitle,
            });

            const linkNode = projectLink && (
              <a
                href={projectLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 ${flexLayout ? "" : "flex-1"}`}
                title={projectLink.title}
                style={{
                  fontSize: `${globalSettings?.subheaderSize || 16}px`,
                  color: themeColor,
                }}
              >
                <Icons.ExternalLink className="h-3 w-3 shrink-0" />
                <span>{projectLink.label}</span>
              </a>
            );

            return (
              <motion.div
                key={project.id}
                style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}
              >
                <motion.div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 ${flexLayout ? "" : "flex-[1.5]"}`}
                  >
                    <h3 data-project-title-link={project.linkDisplay === "superscript" || undefined}
                      className="font-medium"
                      style={{
                        fontSize: `${globalSettings?.subheaderSize || 16}px`,
                        color: KAMI.nearBlack,
                      }}
                    >
                      <TitleLink link={project.linkDisplay === "superscript" ? project.link : undefined} label={project.name} />
                    </h3>
                  </div>
                  {projectLink && !centerSubtitle && linkNode}
                  {!projectLink && !centerSubtitle && !flexLayout && (
                    <div className="flex-1" />
                  )}
                  {centerSubtitle && (
                    <motion.div
                      layout="position"
                      className={flexLayout ? "ml-[16px]" : "flex-1"}
                      style={{
                        fontSize: `${globalSettings?.subheaderSize || 16}px`,
                        color: KAMI.olive,
                      }}
                    >
                      {project.role}
                    </motion.div>
                  )}
                  <div
                    className={`shrink-0 ${flexLayout ? "ml-auto" : "flex-1 text-right"}`}
                    style={{
                      fontSize: `${globalSettings?.subheaderSize || 16}px`,
                      color: KAMI.stone,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatDateString(project.date, locale)}
                  </div>
                </motion.div>
                {project.role && !centerSubtitle && (
                  <motion.div
                    layout="position"
                    style={{
                      fontSize: `${globalSettings?.subheaderSize || 16}px`,
                      color: KAMI.olive,
                    }}
                  >
                    {project.role}
                  </motion.div>
                )}
                {projectLink && centerSubtitle && (
                  <a
                    href={projectLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                    title={projectLink.title}
                    style={{
                      fontSize: `${globalSettings?.subheaderSize || 16}px`,
                      color: themeColor,
                    }}
                  >
                    <Icons.ExternalLink className="h-3 w-3 shrink-0" />
                    <span>{projectLink.label}</span>
                  </a>
                )}
                {project.description && (
                  <motion.div
                    layout="position"
                    className="mt-1"
                    style={{
                      fontSize: `${globalSettings?.baseFontSize || 14}px`,
                      lineHeight: globalSettings?.lineHeight || 1.6,
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
