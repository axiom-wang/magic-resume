import { TitleLink } from "../../shared/TitleLink";
import { useMemo } from "react";
import { GlobalSettings } from "@/types/resume";
import { useTemplateContext } from "../../TemplateContext";
import { useResumeStore } from "@/store/useResumeStore";
import { INSTA } from "../tokens";

interface SectionTitleProps {
    globalSettings?: GlobalSettings;
    type: string;
    sectionId?: string;
    title?: string;
    showTitle?: boolean;
    /** 主栏板块的自动序号（"01"…），传入时渲染黄色圆角徽章 */
    index?: string;
}

/** 各板块的英文副标题（装饰性小字）；custom 板块无映射，不显示 */
const EN_SUBTITLE: Record<string, string> = {
    education: "EDUCATION",
    experience: "WORK EXPERIENCE",
    projects: "PROJECTS",
    skills: "SKILLS",
    certificates: "CERTIFICATES",
    selfEvaluation: "SELF EVALUATION",
};

/**
 * 板块标题（双栏主栏版）：黄色圆角序号徽章 + 中文标题 + 灰色英文小标题 + 浅灰分隔线。
 *
 * 徽章用 inline-flex + 背景色实现（不用 box-shadow——导出/打印链路会强制清除）。
 * 标题文字固定墨黑（不跟随主题色），让影石黄成为全页唯一强调色。
 */
const SectionTitle = ({ type, sectionId, title, globalSettings, showTitle = true, index }: SectionTitleProps) => {
    const { activeResume } = useResumeStore();
    const templateContext = useTemplateContext();
    const menuSections = templateContext?.menuSections ?? activeResume?.menuSections ?? [];

    const renderTitle = useMemo(() => {
        if (type === "custom") return title;
        return menuSections.find((s) => s.id === type)?.title;
    }, [menuSections, type, title]);

    if (!showTitle) return null;

    const enSubtitle = EN_SUBTITLE[type];

    return (
        <div style={{ marginBottom: `${globalSettings?.paragraphSpacing}px` }}>
            <div className="flex items-center gap-2">
                {index && (
                    <span
                        className="inline-flex items-center justify-center font-bold shrink-0"
                        style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "6px",
                            backgroundColor: INSTA.yellow,
                            color: INSTA.ink,
                            fontSize: "13px",
                        }}
                    >
                        {index}
                    </span>
                )}
                <h3 className="font-bold" style={{ fontSize: `${globalSettings?.headerSize || 18}px`, color: INSTA.ink }}>
                    <TitleLink link={menuSections.find((s) => s.id === (sectionId ?? type))?.link} label={renderTitle} />
                </h3>
                {enSubtitle && (
                    <span className="uppercase tracking-wider" style={{ fontSize: "11px", color: INSTA.graphite }}>
                        {enSubtitle}
                    </span>
                )}
            </div>
            <div style={{ height: "1px", backgroundColor: INSTA.hairline, marginTop: "8px" }} />
        </div>
    );
};

export default SectionTitle;
