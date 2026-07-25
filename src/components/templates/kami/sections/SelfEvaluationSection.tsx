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

const SelfEvaluationSection = ({
  content,
  globalSettings,
  showTitle = true,
}: SelfEvaluationSectionProps) => {
  return (
    <SectionWrapper
      sectionId="selfEvaluation"
      style={{ marginTop: `${globalSettings?.sectionSpacing || 22}px` }}
    >
      <SectionTitle
        type="selfEvaluation"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <motion.div
        style={{ marginTop: `${globalSettings?.paragraphSpacing || 14}px` }}
      >
        <motion.div
          layout="position"
          className="rounded px-3 py-2.5 prose prose-sm max-w-none prose-p:my-1 [&>ul]:mt-1 [&>ul]:pl-4 [&>ul>li]:my-0.5"
          style={{ backgroundColor: KAMI.brandTint }}
        >
          <div
            style={{
              fontSize: `${globalSettings?.baseFontSize || 13}px`,
              lineHeight: globalSettings?.lineHeight || 1.5,
              color: KAMI.olive,
            }}
            dangerouslySetInnerHTML={{
              __html: normalizeRichTextContent(content),
            }}
          />
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
};

export default SelfEvaluationSection;
