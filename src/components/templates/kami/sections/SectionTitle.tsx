import { TitleLink } from "../../shared/TitleLink";
import { useMemo } from "react";
import { GlobalSettings } from "@/types/resume";
import { useTemplateContext } from "../../TemplateContext";
import { useResumeStore } from "@/store/useResumeStore";
import { KAMI } from "../tokens";

interface SectionTitleProps {
  globalSettings?: GlobalSettings;
  type: string;
    sectionId?: string;
  title?: string;
  showTitle?: boolean;
}

const SectionTitle = ({
  type,
  sectionId,
  title,
  globalSettings,
  showTitle = true,
}: SectionTitleProps) => {
  const { activeResume } = useResumeStore();
  const templateContext = useTemplateContext();
  const menuSections =
    templateContext?.menuSections ?? activeResume?.menuSections ?? [];

  const renderTitle = useMemo(() => {
    if (type === "custom") return title;
    return menuSections.find((s) => s.id === type)?.title;
  }, [menuSections, type, title]);

  if (!showTitle) return null;

  return (
    <div
      className="flex w-full items-baseline justify-between gap-2"
      style={{
        borderBottom: `1px solid ${KAMI.rule}`,
        // 与经典模板一致的标题度量：padding-bottom 8px + margin-bottom = 段落间距
        paddingBottom: "8px",
        marginBottom: `${globalSettings?.paragraphSpacing ?? 12}px`,
      }}
    >
      <h3
        className="font-medium"
        style={{
          fontSize: `${globalSettings?.headerSize || 18}px`,
          color: KAMI.nearBlack,
          fontWeight: 500,
        }}
      >
        <span><TitleLink link={menuSections.find((s) => s.id === (sectionId ?? type))?.link} label={renderTitle} /></span>
      </h3>
    </div>
  );
};

export default SectionTitle;
