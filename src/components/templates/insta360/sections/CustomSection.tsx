import { AnimatePresence, motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings, CustomItem } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";
import { INSTA } from "../tokens";

interface CustomSectionProps {
    sectionId: string;
    title: string;
    items: CustomItem[];
    globalSettings?: GlobalSettings;
    showTitle?: boolean;
    /** 主栏自动序号（"01"…），透传给 SectionTitle 的黄色徽章 */
    titleIndex?: string;
}

const CustomSection = ({ sectionId, title, items, globalSettings, showTitle = true, titleIndex }: CustomSectionProps) => {
    const locale = useLocale();
    const visibleItems = items?.filter((item) => item.visible && (item.title || item.description));
    const centerSubtitle = globalSettings?.centerSubtitle;
    const flexLayout = globalSettings?.flexibleHeaderLayout;

    return (
        <SectionWrapper sectionId={sectionId} style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}>
            <SectionTitle title={title} type="custom" sectionId={sectionId} globalSettings={globalSettings} showTitle={showTitle} index={titleIndex} />
            <AnimatePresence mode="popLayout">
                {visibleItems.map((item) => (
                    <motion.div key={item.id} layout="position" style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}>
                        <motion.div layout="position" className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 ${flexLayout ? "" : "flex-[1.5]"}`}>
                                <h4 className="font-bold" style={{ fontSize: `${globalSettings?.subheaderSize || 16}px` }}>{item.title}</h4>
                            </div>
                            {centerSubtitle && (
                                <motion.div layout="position" className={`text-subtitleFont ${flexLayout ? "ml-[16px]" : "flex-1"}`} style={{ fontSize: `${globalSettings?.subheaderSize || 16}px`, color: INSTA.graphite }}>
                                    {item.subtitle}
                                </motion.div>
                            )}
                            <span className={`text-subtitleFont shrink-0 whitespace-nowrap ${flexLayout ? "ml-auto" : "flex-1 text-right"}`} style={{ fontSize: `${globalSettings?.subheaderSize || 16}px`, color: INSTA.graphite }}>
                                {formatDateString(item.dateRange, locale)}
                            </span>
                        </motion.div>
                        {!centerSubtitle && item.subtitle && (
                            <motion.div layout="position" className="text-subtitleFont mt-1" style={{ fontSize: `${globalSettings?.subheaderSize || 16}px`, color: INSTA.graphite }}>{item.subtitle}</motion.div>
                        )}
                        {item.description && (
                            <motion.div layout="position" className="mt-1 text-baseFont"
                                style={{ fontSize: `${globalSettings?.baseFontSize || 14}px`, lineHeight: globalSettings?.lineHeight || 1.6 }}
                                dangerouslySetInnerHTML={{ __html: normalizeRichTextContent(item.description) }}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </SectionWrapper>
    );
};

export default CustomSection;
