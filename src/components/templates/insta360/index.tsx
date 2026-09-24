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
import { hasMeaningfulRichTextContent } from "@/lib/richText";
import { INSTA } from "./tokens";

interface Insta360TemplateProps {
    data: ResumeData;
    template: ResumeTemplate;
}

/**
 * 影石 Insta360 模板（双栏品牌版式）。
 *
 * 布局参考影石招聘简历视觉：左窄侧栏（浅灰底：品牌字标 / 照片 / 姓名 / 联系方式 /
 * 自我评价引言）+ 右侧白色圆角主卡（内容板块，黄色序号徽章标题）。
 *
 * 实现要点：
 * - 双栏用 <table>（tableLayout: fixed），与 modern 模板同理——打印 / 导出分页时
 *   单元格背景能跨页延续，flex 双栏会在分页处断裂。
 * - td 不支持圆角，主栏白卡的圆角由 td 内部的 div 承担；td 自身铺页面底色（mist），
 *   跨页时灰底延续、白卡圆角只在首段顶部 / 末段底部出现（可接受的退化）。
 * - basic 与 selfEvaluation 钉死在侧栏（忽略 menuSections 的 order）；其余板块按
 *   order 在主栏渲染并自动编号 01 / 02 / 03…。
 * - 装饰一律用背景色 / border，不用 box-shadow（导出与打印链路强制 box-shadow: none）。
 */
const Insta360Template: React.FC<Insta360TemplateProps> = ({ data, template }) => {
    const { colorScheme } = template;
    const enabledSections = data.menuSections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

    const sectionSpacing = data.globalSettings?.sectionSpacing;
    const basicSection = enabledSections.find((s) => s.id === "basic");
    const selfEvalSection = enabledSections.find((s) => s.id === "selfEvaluation");
    const showSidebarSelfEval = Boolean(selfEvalSection) && hasMeaningfulRichTextContent(data.selfEvaluationContent);
    // 主栏板块 = 除 basic / selfEvaluation 外，按 menuSections 顺序
    const mainSections = enabledSections.filter((s) => s.id !== "basic" && s.id !== "selfEvaluation");

    const renderSection = (sectionId: string, titleIndex?: string) => {
        switch (sectionId) {
            case "basic":
                return <BaseInfo basic={data.basic} globalSettings={data.globalSettings} template={template} />;
            case "experience":
                return <ExperienceSection experiences={data.experience} globalSettings={data.globalSettings} titleIndex={titleIndex} />;
            case "education":
                return <EducationSection education={data.education} globalSettings={data.globalSettings} titleIndex={titleIndex} />;
            case "skills":
                return <SkillSection skill={data.skillContent} globalSettings={data.globalSettings} titleIndex={titleIndex} />;
            case "projects":
                return <ProjectSection projects={data.projects} globalSettings={data.globalSettings} titleIndex={titleIndex} />;
            case "certificates":
                return (
                    <SectionWrapper sectionId="certificates" style={{ marginTop: `${sectionSpacing || 24}px` }}>
                        <SectionTitle type="certificates" globalSettings={data.globalSettings} index={titleIndex} />
                        <CertificatesSection certificates={data.certificates} />
                    </SectionWrapper>
                );
            case "selfEvaluation":
                return <SelfEvaluationSection content={data.selfEvaluationContent} globalSettings={data.globalSettings} variant="sidebar" />;
            default:
                if (sectionId in data.customData) {
                    const sectionTitle = data.menuSections.find((s) => s.id === sectionId)?.title || sectionId;
                    return <CustomSection title={sectionTitle} sectionId={sectionId} items={data.customData[sectionId]} globalSettings={data.globalSettings} titleIndex={titleIndex} />;
                }
                return null;
        }
    };

    return (
        <table
            className="w-full border-collapse"
            style={{
                height: `calc(297mm - ${(data.globalSettings?.pagePadding || 32) * 2}px)`,
                tableLayout: "fixed",
                backgroundColor: colorScheme.background,
                color: colorScheme.text,
                fontFamily: INSTA.sans,
            }}
        >
            <tbody>
                <tr>
                    {/* 侧栏：浅灰底，纵向 basic → 自我评价引言 */}
                    <td
                        className="align-top"
                        style={{ width: "34%", backgroundColor: INSTA.mist, padding: "28px 24px" }}
                    >
                        {basicSection && renderSection("basic")}
                        {showSidebarSelfEval && renderSection("selfEvaluation")}
                    </td>
                    {/* 主栏：td 铺页面底色（跨页延续），白卡圆角由内部 div 承担 */}
                    <td
                        className="align-top"
                        style={{ width: "66%", backgroundColor: INSTA.mist, padding: "20px 20px 20px 12px" }}
                    >
                        <div
                            style={{
                                backgroundColor: INSTA.paper,
                                borderRadius: "16px",
                                padding: "28px",
                                minHeight: "100%",
                            }}
                        >
                            {mainSections.map((section, i) => (
                                <div
                                    key={section.id}
                                    // 首个板块抵消自身 sectionSpacing marginTop，与白卡顶部对齐
                                    style={i === 0 ? { marginTop: `${-(sectionSpacing || 24)}px` } : undefined}
                                >
                                    {renderSection(section.id, String(i + 1).padStart(2, "0"))}
                                </div>
                            ))}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};

export default Insta360Template;
