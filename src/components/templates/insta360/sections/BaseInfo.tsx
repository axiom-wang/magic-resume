import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { formatDateString } from "@/lib/utils";
import { BasicInfo, getBorderRadiusValue, GlobalSettings } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import SectionWrapper from "../../shared/SectionWrapper";
import { useTranslations, useLocale } from "@/i18n/compat/client";
import GithubContribution from "@/components/shared/GithubContribution";
import { getCustomFieldDisplayText, getCustomFieldHref, shouldShowCustomFieldLabelPrefix } from "@/lib/customField";
import { INSTA, INSTA_BRAND } from "../tokens";

interface BaseInfoProps {
    basic: BasicInfo | undefined;
    globalSettings: GlobalSettings | undefined;
    template?: ResumeTemplate;
}

/**
 * 侧栏版基本信息（双栏版式）：纵向排列——
 *   品牌字标 → 分隔线 → 照片 → 姓名 / 职位 → 字段列表 → Github 贡献图。
 *
 * basic.layout（left/center/right）在侧栏中无意义，固定纵向，不再读取。
 * 装饰一律用背景色 / border，不用 box-shadow（导出与打印链路强制 box-shadow: none）。
 */
const BaseInfo = ({ basic = {} as BasicInfo, globalSettings }: BaseInfoProps) => {
    const t = useTranslations("workbench");
    const locale = useLocale();
    const useIconMode = globalSettings?.useIconMode ?? false;

    const getIcon = (iconName: string | undefined) => {
        const IconComponent = Icons[iconName as keyof typeof Icons] as React.ElementType;
        return IconComponent ? <IconComponent className="mt-[0.2em] h-4 w-4 shrink-0" style={{ color: INSTA.ink }} /> : null;
    };

    const getOrderedFields = React.useMemo(() => {
        if (!basic.fieldOrder) {
            return [{ key: "email", value: basic.email, icon: basic.icons?.email || "Mail", label: "电子邮箱", visible: true, custom: false }]
                .filter((item) => Boolean(item.value && item.visible));
        }
        return basic.fieldOrder
            .filter((field) => field.visible !== false && field.key !== "name" && field.key !== "title")
            .map((field) => ({
                key: field.key, value: field.key === "birthDate" && basic[field.key] ? formatDateString(basic[field.key] as string, locale) : (basic[field.key] as string),
                icon: basic.icons?.[field.key] || "User", label: field.label, visible: field.visible, custom: field.custom,
            }))
            .filter((item) => Boolean(item.value));
    }, [basic]);

    const allFields = [
        ...getOrderedFields,
        ...(basic.customFields?.filter((field) => field.visible !== false && Boolean(getCustomFieldDisplayText(field))).map((field) => ({
            key: field.id, value: getCustomFieldDisplayText(field), icon: field.icon, label: field.label, visible: true, custom: true, displayLabel: field.displayLabel, href: getCustomFieldHref(field),
        })) || []),
    ];

    const nameField = basic.fieldOrder?.find((f) => f.key === "name") || { key: "name", label: "姓名", visible: true };
    const titleField = basic.fieldOrder?.find((f) => f.key === "title") || { key: "title", label: "职位", visible: true };

    return (
        <SectionWrapper sectionId="basic">
            <div className="flex flex-col gap-5">
                {/* ① 品牌字标（固定装饰，不参与编辑） */}
                <div className="flex flex-col gap-1 select-none">
                    <span className="font-bold" style={{ fontSize: "18px", color: INSTA.ink }}>
                        {INSTA_BRAND.wordmarkA}
                        <span style={{ backgroundColor: INSTA.yellow, padding: "0 2px" }}>{INSTA_BRAND.wordmarkB}</span>
                        {" "}{INSTA_BRAND.wordmarkZh}
                    </span>
                    <span style={{ fontSize: "11px", color: INSTA.graphite }}>{INSTA_BRAND.sloganZh}</span>
                    <span className="tracking-widest" style={{ fontSize: "9px", color: INSTA.graphite }}>{INSTA_BRAND.sloganEn}</span>
                </div>
                <div style={{ height: 1, backgroundColor: INSTA.hairline }} />

                {/* ② 照片：侧栏放宽默认尺寸，maxWidth 兜底防溢出 */}
                {basic.photo && basic.photoConfig?.visible && (
                    <motion.div layout="position" style={{ maxWidth: "100%" }}>
                        <div style={{
                            width: `${basic.photoConfig?.width || 140}px`,
                            height: `${basic.photoConfig?.height || 140}px`,
                            maxWidth: "100%",
                            borderRadius: getBorderRadiusValue(basic.photoConfig || { borderRadius: "medium", customBorderRadius: 0 }),
                            overflow: "hidden",
                        }}>
                            <img src={basic.photo} alt={`${basic.name}'s photo`} className="w-full h-full object-cover" />
                        </div>
                    </motion.div>
                )}

                {/* ③ 姓名 + 职位 */}
                <div className="flex flex-col gap-1">
                    {nameField.visible !== false && basic[nameField.key] && (
                        <motion.h1 layout="position" className="font-bold whitespace-normal break-normal [overflow-wrap:normal]" style={{ fontSize: "30px", color: INSTA.ink }}>
                            {basic[nameField.key] as string}
                        </motion.h1>
                    )}
                    {titleField.visible !== false && basic[titleField.key] && (
                        <motion.h2 layout="position" className="whitespace-normal break-normal [overflow-wrap:normal]" style={{ fontSize: "16px", color: INSTA.graphite }}>
                            {basic[titleField.key] as string}
                        </motion.h2>
                    )}
                </div>

                {/* ④ 字段列表：纵向排列，图标在左 */}
                <motion.div layout="position" className="flex flex-col gap-2" style={{ fontSize: `${globalSettings?.baseFontSize || 14}px`, color: INSTA.graphite }}>
                    {allFields.map((item) => {
                        const customFieldHref = item.custom && "href" in item && typeof item.href === "string" ? item.href : null;

                        return (
                        <motion.div key={item.key} className="flex min-w-0 items-start text-baseFont">
                            {useIconMode ? (
                                <div className="flex min-w-0 items-start gap-1">
                                    {getIcon(item.icon)}
                                    {item.key === "email" ? <a href={`mailto:${item.value}`} className="min-w-0 underline [overflow-wrap:anywhere]">{item.value}</a> : customFieldHref ? <a href={customFieldHref} target="_blank" rel="noopener noreferrer" className="min-w-0 underline [overflow-wrap:anywhere]">{item.value}</a> : <span className="min-w-0 [overflow-wrap:anywhere]">{item.value}</span>}
                                </div>
                            ) : (
                                <div className="flex min-w-0 items-start gap-2">
                                    {!item.custom && <span className="shrink-0">{t(`basicPanel.basicFields.${item.key}`)}:</span>}
                                    {item.custom && shouldShowCustomFieldLabelPrefix(item) && <span className="shrink-0">{item.label}:</span>}
                                    {customFieldHref ? <a href={customFieldHref} target="_blank" rel="noopener noreferrer" className="min-w-0 underline [overflow-wrap:anywhere]" suppressHydrationWarning>{item.value}</a> : <span className="min-w-0 [overflow-wrap:anywhere]" suppressHydrationWarning>{item.value}</span>}
                                </div>
                            )}
                        </motion.div>
                    )})}
                </motion.div>

                {/* ⑤ Github 贡献图（窄栏防溢出） */}
                {basic.githubContributionsVisible && (
                    <div className="overflow-hidden">
                        <GithubContribution githubKey={basic.githubKey} username={basic.githubUseName} />
                    </div>
                )}
            </div>
        </SectionWrapper>
    );
};

export default BaseInfo;
