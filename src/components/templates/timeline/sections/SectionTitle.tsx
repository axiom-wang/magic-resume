import { TitleLink } from "../../shared/TitleLink";
import { useMemo } from "react";
import { GlobalSettings } from "@/types/resume";
import { useTemplateContext } from "../../TemplateContext";
import { useResumeStore } from "@/store/useResumeStore";

interface SectionTitleProps {
    globalSettings?: GlobalSettings;
    type: string;
    sectionId?: string;
    title?: string;
    showTitle?: boolean;
}

const SectionTitle = ({ type, sectionId, title, globalSettings, showTitle = true }: SectionTitleProps) => {
    const { activeResume } = useResumeStore();
    const templateContext = useTemplateContext();
    const menuSections = templateContext?.menuSections ?? activeResume?.menuSections ?? [];

    const renderTitle = useMemo(() => {
        if (type === "custom") return title;
        return menuSections.find((s) => s.id === type)?.title;
    }, [menuSections, type, title]);

    const themeColor = globalSettings?.themeColor;
    if (!showTitle) return null;

    // Timeline SectionTitle is rendered by the template wrapper (renderTimelineItem)
    // This is a minimal fallback for basic section
    return (
        <div
            className="text-xl font-bold mb-4"
            style={{
                color: themeColor,
                fontSize: `${globalSettings?.headerSize || 20}px`,
            }}
        >
            <span><TitleLink link={menuSections.find((s) => s.id === (sectionId ?? type))?.link} label={renderTitle} /></span>
        </div>
    );
};

export default SectionTitle;
