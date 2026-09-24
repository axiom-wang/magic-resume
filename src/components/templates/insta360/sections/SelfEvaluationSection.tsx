import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { INSTA } from "../tokens";

interface SelfEvaluationSectionProps {
    content?: string;
    globalSettings?: GlobalSettings;
    showTitle?: boolean;
    /** sidebar = 侧栏引言区（黄色引号装饰、无标题线）；default = 单栏旧渲染路径 */
    variant?: "default" | "sidebar";
}

const SelfEvaluationSection = ({ content, globalSettings, showTitle = true, variant = "default" }: SelfEvaluationSectionProps) => {
    if (variant === "sidebar") {
        // 侧栏引言区：黄色大引号 + 富文本，无 SectionTitle（参考图的「保持好奇」区块）。
        // 空内容不渲染（index.tsx 侧栏入口已用 hasMeaningfulRichTextContent 判空）。
        return (
            <SectionWrapper sectionId="selfEvaluation" style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}>
                <Quote size={28} fill={INSTA.yellow} color={INSTA.yellow} strokeWidth={0} aria-hidden />
                <motion.div className="text-baseFont" layout="position"
                    style={{
                        fontSize: `${globalSettings?.baseFontSize || 14}px`,
                        lineHeight: globalSettings?.lineHeight || 1.6,
                        color: INSTA.graphite,
                        marginTop: "8px",
                    }}
                    dangerouslySetInnerHTML={{ __html: normalizeRichTextContent(content) }}
                />
            </SectionWrapper>
        );
    }

    return (
        <SectionWrapper sectionId="selfEvaluation" style={{ marginTop: `${globalSettings?.sectionSpacing || 24}px` }}>
            <SectionTitle type="selfEvaluation" globalSettings={globalSettings} showTitle={showTitle} />
            <motion.div style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}>
                <motion.div className="text-baseFont" layout="position"
                    style={{ fontSize: `${globalSettings?.baseFontSize || 14}px`, lineHeight: globalSettings?.lineHeight || 1.6 }}
                    dangerouslySetInnerHTML={{ __html: normalizeRichTextContent(content) }}
                />
            </motion.div>
        </SectionWrapper>
    );
};

export default SelfEvaluationSection;
