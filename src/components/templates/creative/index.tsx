import React from "react";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import BaseInfo from "./sections/BaseInfo";
import GithubContribution from "@/components/shared/GithubContribution";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import ProjectSection from "./sections/ProjectSection";
import SkillSection from "./sections/SkillSection";
import SelfEvaluationSection from "./sections/SelfEvaluationSection";
import CustomSection from "./sections/CustomSection";
import SectionTitle from "./sections/SectionTitle";
import SectionWrapper from "../shared/SectionWrapper";
import CertificatesSection from "../shared/CertificatesSection";
import { HEADER_BOTTOM_SPACE } from "../shared/headerSpacing";


interface CreativeTemplateProps {
    data: ResumeData;
    template: ResumeTemplate;
}

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ data, template }) => {
    const { colorScheme } = template;
    const enabledSections = data.menuSections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

    const basicSection = enabledSections.find((s) => s.id === "basic");
    const otherSections = enabledSections.filter((s) => s.id !== "basic");

    // 顶栏（basic）与下方第一个板块之间的间距固定为 HEADER_BOTTOM_SPACE，不受「模块间距」影响。
    // creative 的顶栏是带背景色的独立色块，所以这段固定留白要落在色块**外面**（色块自身 py-8 保持不变），
    // 否则第一个板块会紧贴色块下边缘。
    const headerNextSectionId = otherSections[0]?.id;

    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case "experience":
                return <ExperienceSection experiences={data.experience} globalSettings={data.globalSettings} />;
            case "education":
                return <EducationSection education={data.education} globalSettings={data.globalSettings} />;
            case "skills":
                return <SkillSection skill={data.skillContent} globalSettings={data.globalSettings} />;
            case "projects":
                return <ProjectSection projects={data.projects} globalSettings={data.globalSettings} />;
            case "certificates":
                return (
                    <SectionWrapper sectionId="certificates" style={{ marginTop: `${data.globalSettings?.sectionSpacing || 24}px` }}>
                        <SectionTitle type="certificates" globalSettings={data.globalSettings} />
                        <CertificatesSection certificates={data.certificates} />
                    </SectionWrapper>
                );

            case "selfEvaluation":
                return <SelfEvaluationSection content={data.selfEvaluationContent} globalSettings={data.globalSettings} />;
            default:
                if (sectionId in data.customData) {
                    const title = data.menuSections.find((s) => s.id === sectionId)?.title || sectionId;
                    return <CustomSection title={title} sectionId={sectionId} items={data.customData[sectionId]} globalSettings={data.globalSettings} />;
                }
                return null;
        }
    };

    return (
        <div className="flex flex-col w-full min-h-screen" style={{ backgroundColor: colorScheme.background, color: colorScheme.text }}>
            {/* Top colored header block */}
            {basicSection && (
                <div className="w-full relative py-8 px-4 rounded-b-3xl pr-0" style={{ backgroundColor: data.globalSettings.themeColor, color: "#ffffff" }}>
                    <div className="relative z-10 w-full">
                        <BaseInfo basic={data.basic} globalSettings={data.globalSettings} template={template} />
                        {data.basic.githubContributionsVisible && (
                            <GithubContribution className="mt-2 text-white" githubKey={data.basic.githubKey} username={data.basic.githubUseName} />
                        )}
                    </div>
                </div>
            )}
            {/* Content sections */}
            <div className=" w-full w-max-4xl mx-auto">
                {otherSections.map((section) => (
                    <div
                        key={section.id}
                        style={
                            section.id === headerNextSectionId
                                ? { marginTop: `${HEADER_BOTTOM_SPACE}px` }
                                : undefined
                        }
                    >
                        {renderSection(section.id)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreativeTemplate;
