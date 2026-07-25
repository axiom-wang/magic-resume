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

const SkillSection = ({
  skill,
  globalSettings,
  showTitle = true,
}: SkillSectionProps) => {
  return (
    <SectionWrapper
      sectionId="skills"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 22}px` }}
    >
      <SectionTitle
        type="skills"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <motion.div
        style={{ marginTop: `${globalSettings?.paragraphSpacing || 14}px` }}
      >
        <motion.div
          className="prose prose-sm max-w-none prose-p:my-1 prose-strong:font-medium prose-ul:my-1 prose-li:my-0.5 [&>ul]:pl-4"
          layout="position"
          style={{
            fontSize: `${globalSettings?.baseFontSize || 13}px`,
            lineHeight: globalSettings?.lineHeight || 1.5,
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
