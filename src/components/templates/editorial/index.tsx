import React from "react";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import BaseInfo from "./sections/BaseInfo";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import ProjectSection from "./sections/ProjectSection";
import SkillSection from "./sections/SkillSection";
import SelfEvaluationSection from "./sections/SelfEvaluationSection";
import CustomSection from "./sections/CustomSection";
import SectionTitle from "./sections/SectionTitle";
import SectionWrapper from "../shared/SectionWrapper";
import CertificatesSection from "../shared/CertificatesSection";
import { getHeaderNextSectionStyle } from "../shared/headerSpacing";

interface EditorialTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const EditorialTemplate: React.FC<EditorialTemplateProps> = ({ data, template }) => {
  const { colorScheme } = template;
  const enabledSections = data.menuSections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  // 顶栏（basic）与下方第一个板块之间的间距固定由 BaseInfo 提供，
  // 这里抵消该板块自身的 sectionSpacing marginTop（editorial 各 section 的 fallback 是 32），
  // 同时把 basic 外层 wrapper 的 mb-1(4px) 归零，保证总留白恰好 HEADER_BOTTOM_SPACE
  const sectionSpacing = data.globalSettings?.sectionSpacing;
  const basicIndex = enabledSections.findIndex((s) => s.id === "basic");
  const headerNextSectionId = basicIndex >= 0 ? enabledSections[basicIndex + 1]?.id : undefined;

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "basic":
        return <BaseInfo basic={data.basic} globalSettings={data.globalSettings} />;
      case "experience":
        return <ExperienceSection experiences={data.experience} globalSettings={data.globalSettings} />;
      case "education":
        return <EducationSection education={data.education} globalSettings={data.globalSettings} />;
      case "projects":
        return <ProjectSection projects={data.projects} globalSettings={data.globalSettings} />;
      case "skills":
        return <SkillSection skill={data.skillContent} globalSettings={data.globalSettings} />;
      case "selfEvaluation":
        return <SelfEvaluationSection content={data.selfEvaluationContent} globalSettings={data.globalSettings} />;
      case "certificates":
        return (
          <SectionWrapper sectionId="certificates" className="w-full" style={{ marginTop: `${data.globalSettings?.sectionSpacing || 32}px` }}>
            <SectionTitle type="certificates" globalSettings={data.globalSettings} />
            <CertificatesSection certificates={data.certificates} />
          </SectionWrapper>
        );
      default:
        if (sectionId in data.customData) {
          const sectionTitle = data.menuSections.find((s) => s.id === sectionId)?.title || sectionId;
          return <CustomSection title={sectionTitle} sectionId={sectionId} items={data.customData[sectionId]} globalSettings={data.globalSettings} />;
        }
        return null;
    }
  };

  return (
    <div
      className="flex flex-col min-h-[297mm] text-[#1a1a1a] editorial-print-container"
      style={{
        backgroundColor: colorScheme.background || "#FFFFFF",
        color: colorScheme.text || "#1a1a1a",
        margin: `-${data.globalSettings?.pagePadding || 0}px`,
        padding: `${data.globalSettings?.pagePadding || 0}px`,
        paddingTop: `${(data.globalSettings?.pagePadding || 0) + 16}px`,
      }}
    >
      {enabledSections.map((section) => (
        <div
          key={section.id}
          className="w-full mb-1 border-none ring-0"
          style={
            section.id === "basic"
              ? { marginBottom: 0 }
              : section.id === headerNextSectionId
                ? getHeaderNextSectionStyle(sectionSpacing, 32)
                : undefined
          }
        >
          {renderSection(section.id)}
        </div>
      ))}
    </div>
  );
};

export default EditorialTemplate;
