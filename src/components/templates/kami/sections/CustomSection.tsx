import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings, CustomItem } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";
import { KAMI } from "../tokens";

interface CustomSectionProps {
  sectionId: string;
  title: string;
  items: CustomItem[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const CustomSection = ({
  sectionId,
  title,
  items,
  globalSettings,
  showTitle = true,
}: CustomSectionProps) => {
  const locale = useLocale();
  const visibleItems = items?.filter(
    (item) => item.visible && (item.title || item.description)
  );
  const centerSubtitle = globalSettings?.centerSubtitle;
  const themeColor = globalSettings?.themeColor || KAMI.brand;

  return (
    <SectionWrapper
      sectionId={sectionId}
      style={{ marginTop: `${globalSettings?.sectionSpacing || 22}px` }}
    >
      <SectionTitle
        title={title}
        type="custom"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        <div
          className="flex flex-col"
          style={{ marginTop: `${globalSettings?.paragraphSpacing || 14}px` }}
        >
          {visibleItems.map((item) => (
            <motion.div
              key={item.id}
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
                    {item.title}
                  </h4>
                  {centerSubtitle && item.subtitle && (
                    <span
                      style={{
                        fontSize: `${(globalSettings?.subheaderSize || 15) - 1}px`,
                        color: KAMI.olive,
                      }}
                    >
                      {item.subtitle}
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
                  {formatDateString(item.dateRange, locale)}
                </div>
              </div>

              {!centerSubtitle && item.subtitle && (
                <div
                  className="mt-1 inline-block rounded px-2 py-0.5"
                  style={{
                    fontSize: `${(globalSettings?.subheaderSize || 15) - 3}px`,
                    color: themeColor,
                    fontWeight: 500,
                    backgroundColor: KAMI.brandTint,
                  }}
                >
                  {item.subtitle}
                </div>
              )}

              {item.description && (
                <motion.div
                  layout="position"
                  className="mt-2 prose prose-sm max-w-none prose-p:my-1 [&>ul]:mt-1 [&>ul]:pl-4 [&>ul>li]:my-0.5"
                  dangerouslySetInnerHTML={{
                    __html: normalizeRichTextContent(item.description),
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

export default CustomSection;
