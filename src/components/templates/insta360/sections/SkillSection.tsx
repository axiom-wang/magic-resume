import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";

interface SkillSectionProps {
    skill?: string;
    globalSettings?: GlobalSettings;
    showTitle?: boolean;
    /** 主栏自动序号（"01"…），透传给 SectionTitle 的黄色徽章 */
    titleIndex?: string;
}

const SkillSection = ({ skill, globalSettings, showTitle = true, titleIndex }: SkillSectionProps) => {
    return (
        <SectionWrapper sectionId="skills" style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}>
            <SectionTitle type="skills" globalSettings={globalSettings} showTitle={showTitle} index={titleIndex} />
            <motion.div style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}>
                <motion.div className="text-baseFont" layout="position"
                    style={{ fontSize: `${globalSettings?.baseFontSize || 14}px`, lineHeight: globalSettings?.lineHeight || 1.6 }}
                    dangerouslySetInnerHTML={{ __html: normalizeRichTextContent(skill) }}
                />
            </motion.div>
        </SectionWrapper>
    );
};

export default SkillSection;
