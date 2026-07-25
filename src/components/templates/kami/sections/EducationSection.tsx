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

const EducationSection = ({
  education,
  globalSettings,
  showTitle = true,
}: EducationSectionProps) => {
  const locale = useLocale();
  const visibleEducation = education?.filter((edu) => edu.visible);
  const centerSubtitle = globalSettings?.centerSubtitle;

  return (
    <SectionWrapper
      sectionId="education"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 22}px` }}
    >
      <SectionTitle
        type="education"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        <div
          className="flex flex-col"
          style={{ marginTop: `${globalSettings?.paragraphSpacing || 14}px` }}
        >
          {visibleEducation?.map((edu, index) => (
            <motion.div
              key={edu.id}
              layout="position"
              className="py-2.5 first:pt-1"
              style={{
                borderBottom:
                  index < (visibleEducation?.length || 0) - 1
                    ? `0.3px dotted ${KAMI.border}`
                    : undefined,
              }}
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
                    {edu.school}
                  </h4>
                  {centerSubtitle && (
                    <span
                      style={{
                        fontSize: `${(globalSettings?.subheaderSize || 15) - 1}px`,
                        color: KAMI.olive,
                      }}
                    >
                      {[edu.major, edu.degree].filter(Boolean).join(" · ")}
                      {edu.gpa && ` · GPA ${edu.gpa}`}
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
                  suppressHydrationWarning
                >
                  {formatDateRange(edu.startDate, edu.endDate, locale)}
                </div>
              </div>

              {!centerSubtitle && (
                <div
                  className="mt-1"
                  style={{
                    fontSize: `${(globalSettings?.subheaderSize || 15) - 2}px`,
                    color: KAMI.olive,
                  }}
                >
                  {[edu.major, edu.degree].filter(Boolean).join(" · ")}
                  {edu.gpa && ` · GPA ${edu.gpa}`}
                </div>
              )}

              {hasMeaningfulRichTextContent(edu.description) && (
                <motion.div
                  layout="position"
                  className="mt-2 prose prose-sm max-w-none prose-p:my-1 [&>ul]:mt-1 [&>ul]:pl-4 [&>ul>li]:my-0.5"
                  dangerouslySetInnerHTML={{
                    __html: normalizeRichTextContent(edu.description),
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

export default EducationSection;
