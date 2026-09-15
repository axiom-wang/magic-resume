import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Education, GlobalSettings } from "@/types/resume";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { useLocale } from "@/i18n/compat/client";
import {
  hasMeaningfulRichTextContent,
  normalizeRichTextContent,
} from "@/lib/richText";
import { formatDateRange } from "@/lib/utils";
import { KAMI } from "../tokens";

interface EducationSectionProps {
  education?: Education[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

/**
 * 结构与间距度量对齐经典模板（逐条 marginTop = 段落间距、学校名 flex-[1.5]、
 * 日期列 shrink-0 右对齐、正文 mt-1），配色与字体仍沿用 kami 的纸感 tokens。
 */
const EducationSection = ({
  education,
  globalSettings,
  showTitle = true,
}: EducationSectionProps) => {
  const locale = useLocale();
  const visibleEducation = education?.filter((edu) => edu.visible);
  const centerSubtitle = globalSettings?.centerSubtitle;
  const flexLayout = globalSettings?.flexibleHeaderLayout;

  return (
    <SectionWrapper
      sectionId="education"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}
    >
      <SectionTitle
        type="education"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        {visibleEducation?.map((edu) => (
          <motion.div
            key={edu.id}
            layout="position"
            style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}
          >
            <motion.div layout="position" className="flex items-center gap-2">
              <div
                className={`font-medium ${flexLayout ? "" : "flex-[1.5]"}`}
                style={{
                  fontSize: `${globalSettings?.subheaderSize || 16}px`,
                  color: KAMI.nearBlack,
                }}
              >
                {edu.school}
              </div>
              {centerSubtitle && (
                <motion.div
                  layout="position"
                  className={flexLayout ? "ml-[16px]" : "flex-1"}
                  style={{
                    fontSize: `${globalSettings?.subheaderSize || 16}px`,
                    color: KAMI.olive,
                  }}
                >
                  {[edu.major, edu.degree].filter(Boolean).join(" · ")}
                  {edu.gpa && ` · GPA ${edu.gpa}`}
                </motion.div>
              )}
              <span
                className={`shrink-0 ${flexLayout ? "ml-auto" : "flex-1 text-right"}`}
                suppressHydrationWarning
                style={{
                  fontSize: `${globalSettings?.subheaderSize || 16}px`,
                  color: KAMI.stone,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatDateRange(edu.startDate, edu.endDate, locale)}
              </span>
            </motion.div>
            {!centerSubtitle && (
              <motion.div
                layout="position"
                className="mt-1"
                style={{
                  fontSize: `${globalSettings?.subheaderSize || 16}px`,
                  color: KAMI.olive,
                }}
              >
                {[edu.major, edu.degree].filter(Boolean).join(" · ")}
                {edu.gpa && ` · GPA ${edu.gpa}`}
              </motion.div>
            )}
            {hasMeaningfulRichTextContent(edu.description) && (
              <motion.div
                layout="position"
                className="mt-1"
                style={{
                  fontSize: `${globalSettings?.baseFontSize || 14}px`,
                  lineHeight: globalSettings?.lineHeight || 1.6,
                  color: KAMI.nearBlack,
                }}
                dangerouslySetInnerHTML={{
                  __html: normalizeRichTextContent(edu.description),
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default EducationSection;
