import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Experience, GlobalSettings } from "@/types/resume";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";
import { KAMI } from "../tokens";

interface ExperienceSectionProps {
  experiences?: Experience[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

/**
 * 结构与间距度量对齐经典模板（逐条 marginTop = 段落间距、公司名 flex-[1.5]、
 * 日期列 shrink-0 右对齐），配色与字体仍沿用 kami 的纸感 tokens。
 */
const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  globalSettings,
  showTitle = true,
}) => {
  const locale = useLocale();
  const visibleExperiences = experiences?.filter((exp) => exp.visible);
  const centerSubtitle = globalSettings?.centerSubtitle;
  const flexLayout = globalSettings?.flexibleHeaderLayout;

  return (
    <SectionWrapper
      sectionId="experience"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}
    >
      <SectionTitle
        type="experience"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        {visibleExperiences?.map((exp) => (
          <motion.div
            key={exp.id}
            layout="position"
            style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}
          >
            <motion.div className="flex items-center gap-2">
              <div
                className={`font-medium ${flexLayout ? "" : "flex-[1.5]"}`}
                style={{
                  fontSize: `${globalSettings?.subheaderSize || 16}px`,
                  color: KAMI.nearBlack,
                }}
              >
                {exp.company}
              </div>
              {centerSubtitle && (
                <motion.div
                  className={flexLayout ? "ml-[16px]" : "flex-1"}
                  style={{
                    fontSize: `${globalSettings?.subheaderSize || 16}px`,
                    color: KAMI.olive,
                  }}
                >
                  {exp.position}
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
                {formatDateString(exp.date, locale)}
              </div>
            </motion.div>
            {exp.position && !centerSubtitle && (
              <motion.div
                style={{
                  fontSize: `${globalSettings?.subheaderSize || 16}px`,
                  color: KAMI.olive,
                }}
              >
                {exp.position}
              </motion.div>
            )}
            {exp.details && (
              <motion.div
                className="mt-1"
                dangerouslySetInnerHTML={{
                  __html: normalizeRichTextContent(exp.details),
                }}
                style={{
                  fontSize: `${globalSettings?.baseFontSize || 14}px`,
                  lineHeight: globalSettings?.lineHeight || 1.6,
                  color: KAMI.nearBlack,
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default ExperienceSection;
