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

/**
 * 结构与间距度量对齐经典模板（逐条 marginTop = 段落间距、标题列 flex-[1.5]、
 * 日期列 shrink-0 右对齐、副标题与正文的顺序/mt 完全一致），配色沿用 kami tokens。
 */
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
  const flexLayout = globalSettings?.flexibleHeaderLayout;

  return (
    <SectionWrapper
      sectionId={sectionId}
      style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}
    >
      <SectionTitle
        title={title}
        type="custom"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item) => (
          <motion.div
            key={item.id}
            layout="position"
            style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}
          >
            <motion.div layout="position" className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 ${flexLayout ? "" : "flex-[1.5]"}`}
              >
                <h4
                  className="font-medium"
                  style={{
                    fontSize: `${globalSettings?.subheaderSize || 16}px`,
                    color: KAMI.nearBlack,
                  }}
                >
                  {item.title}
                </h4>
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
                  {item.subtitle}
                </motion.div>
              )}
              <span
                className={`shrink-0 ${flexLayout ? "ml-auto" : "flex-1 text-right"}`}
                style={{
                  fontSize: `${globalSettings?.subheaderSize || 16}px`,
                  color: KAMI.stone,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatDateString(item.dateRange, locale)}
              </span>
            </motion.div>
            {!centerSubtitle && item.subtitle && (
              <motion.div
                layout="position"
                className="mt-1"
                style={{
                  fontSize: `${globalSettings?.subheaderSize || 16}px`,
                  color: KAMI.olive,
                }}
              >
                {item.subtitle}
              </motion.div>
            )}
            {item.description && (
              <motion.div
                layout="position"
                className="mt-1"
                style={{
                  fontSize: `${globalSettings?.baseFontSize || 14}px`,
                  lineHeight: globalSettings?.lineHeight || 1.6,
                  color: KAMI.nearBlack,
                }}
                dangerouslySetInnerHTML={{
                  __html: normalizeRichTextContent(item.description),
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default CustomSection;
