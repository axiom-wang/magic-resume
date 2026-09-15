import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { KAMI } from "../tokens";

interface SelfEvaluationSectionProps {
  content?: string;
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

/**
 * 结构与间距度量对齐经典模板：去掉原来的圆角色块（padding / 背景色会改变版面），
 * 与经典模板一样直接铺正文；字号与行高兜底一致，颜色沿用 kami tokens。
 */
const SelfEvaluationSection = ({
  content,
  globalSettings,
  showTitle = true,
}: SelfEvaluationSectionProps) => {
  return (
    <SectionWrapper
      sectionId="selfEvaluation"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}
    >
      <SectionTitle
        type="selfEvaluation"
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
            __html: normalizeRichTextContent(content),
          }}
        />
      </motion.div>
    </SectionWrapper>
  );
};

export default SelfEvaluationSection;
