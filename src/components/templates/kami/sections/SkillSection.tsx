import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { KAMI } from "../tokens";

interface SkillSectionProps {
  skill?: string;
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

/**
 * 结构与间距度量对齐经典模板（marginTop = 段落间距、baseFontSize/lineHeight 兜底一致），
 * 配色与字体仍沿用 kami tokens。
 */
const SkillSection = ({
  skill,
  globalSettings,
  showTitle = true,
}: SkillSectionProps) => {
  return (
    <SectionWrapper
      sectionId="skills"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}
    >
      <SectionTitle
        type="skills"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <motion.div
        style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}
      >
        <motion.div
          layout="position"
          style={{
            fontSize: `${globalSettings?.baseFontSize || 14}px`,
            lineHeight: globalSettings?.lineHeight || 1.6,
            color: KAMI.nearBlack,
          }}
          dangerouslySetInnerHTML={{
            __html: normalizeRichTextContent(skill),
          }}
        />
      </motion.div>
    </SectionWrapper>
  );
};

export default SkillSection;
