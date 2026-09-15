import { useMemo } from "react";
import { GlobalSettings } from "@/types/resume";
import { useTemplateContext } from "../../TemplateContext";
import { useResumeStore } from "@/store/useResumeStore";
import { KAMI } from "../tokens";

interface SectionTitleProps {
  globalSettings?: GlobalSettings;
  type: string;
  title?: string;
  showTitle?: boolean;
}

const SectionTitle = ({
  type,
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
        borderBottom: `0.5px solid ${KAMI.border}`,
        // 与经典模板一致的标题度量：padding-bottom 8px + margin-bottom = 段落间距
        paddingBottom: "8px",
        marginBottom: `${globalSettings?.paragraphSpacing ?? 12}px`,
      }}
    >
      <h3
        className="font-medium tracking-wide"
        style={{
          fontSize: `${globalSettings?.headerSize || 18}px`,
          color: KAMI.nearBlack,
          fontWeight: 500,
          lineHeight: 1.25,
        }}
      >
        {renderTitle}
      </h3>
    </div>
  );
};

export default SectionTitle;
