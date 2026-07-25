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

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  globalSettings,
  showTitle = true,
}) => {
  const locale = useLocale();
  const visibleExperiences = experiences?.filter((exp) => exp.visible);
  const centerSubtitle = globalSettings?.centerSubtitle;
  const themeColor = globalSettings?.themeColor || KAMI.brand;

  return (
    <SectionWrapper
      sectionId="experience"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 22}px` }}
    >
      <SectionTitle
        type="experience"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        <div
          className="flex flex-col"
          style={{ marginTop: `${globalSettings?.paragraphSpacing || 14}px` }}
        >
          {visibleExperiences?.map((exp) => (
            <motion.div
              key={exp.id}
              layout="position"
              className="py-2.5 first:pt-1"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <h4
                    className="font-medium"
                    style={{
                      fontSize: `${globalSettings?.subheaderSize || 15}px`,
                      color: KAMI.nearBlack,
                      fontWeight: 500,
                    }}
                  >
                    {exp.company}
                  </h4>
                  {centerSubtitle && exp.position && (
                    <span
                      style={{
                        fontSize: `${(globalSettings?.subheaderSize || 15) - 1}px`,
                        color: KAMI.olive,
                      }}
                    >
                      {exp.position}
                    </span>
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
                  {formatDateString(exp.date, locale)}
                </div>
              </div>

              {exp.position && !centerSubtitle && (
                <div
                  className="mt-1 inline-block rounded px-2 py-0.5"
                  style={{
                    fontSize: `${(globalSettings?.subheaderSize || 15) - 3}px`,
                    color: themeColor,
                    fontWeight: 500,
                    backgroundColor: KAMI.brandTint,
                  }}
                >
                  {exp.position}
                </div>
              )}

              {exp.details && (
                <motion.div
                  layout="position"
                  className="mt-2 prose prose-sm max-w-none prose-p:my-1 [&>ul]:mt-1 [&>ul]:pl-4 [&>ul>li]:my-0.5"
                  dangerouslySetInnerHTML={{
                    __html: normalizeRichTextContent(exp.details),
                  }}
                  style={{
                    fontSize: `${globalSettings?.baseFontSize || 13}px`,
                    lineHeight: globalSettings?.lineHeight || 1.5,
                    color: KAMI.nearBlack,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default ExperienceSection;
