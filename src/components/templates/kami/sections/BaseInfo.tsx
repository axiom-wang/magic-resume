import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { cn, formatDateString } from "@/lib/utils";
import {
  BasicInfo,
  getBorderRadiusValue,
  GlobalSettings,
} from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import SectionWrapper from "../../shared/SectionWrapper";
import { getHeaderSpaceStyle } from "../../shared/headerSpacing";
import { useTranslations, useLocale } from "@/i18n/compat/client";
import GithubContribution from "@/components/shared/GithubContribution";
import {
  getCustomFieldDisplayText,
  getCustomFieldHref,
  shouldShowCustomFieldLabelPrefix,
} from "@/lib/customField";
import { KAMI } from "../tokens";

interface BaseInfoProps {
  basic: BasicInfo | undefined;
  globalSettings: GlobalSettings | undefined;
  template?: ResumeTemplate;
}

const BaseInfo = ({
  basic = {} as BasicInfo,
  globalSettings,
}: BaseInfoProps) => {
  const t = useTranslations("workbench");
  const locale = useLocale();
  const useIconMode = globalSettings?.useIconMode ?? false;
  const layout = basic?.layout || "left";
  const themeColor = globalSettings?.themeColor || KAMI.brand;

  const getIcon = (iconName: string | undefined) => {
    const IconComponent = Icons[
      iconName as keyof typeof Icons
    ] as React.ElementType;
    return IconComponent ? (
      // 图标尺寸与经典模板一致（14px→16px），避免行盒高度不同
      <IconComponent className="mt-[0.2em] h-4 w-4 shrink-0" />
    ) : null;
  };

  const getOrderedFields = React.useMemo(() => {
    if (!basic.fieldOrder) {
      return [
        {
          key: "email",
          value: basic.email,
          icon: basic.icons?.email || "Mail",
          label: "电子邮箱",
          visible: true,
          custom: false,
        },
      ].filter((item) => Boolean(item.value && item.visible));
    }
    return basic.fieldOrder
      .filter(
        (field) =>
          field.visible !== false &&
          field.key !== "name" &&
          field.key !== "title"
      )
      .map((field) => ({
        key: field.key,
        value:
          field.key === "birthDate" && basic[field.key]
            ? formatDateString(basic[field.key] as string, locale)
            : (basic[field.key] as string),
        icon: basic.icons?.[field.key] || "User",
        label: field.label,
        visible: field.visible,
        custom: field.custom,
      }))
      .filter((item) => Boolean(item.value));
  }, [basic, locale]);

  const allFields = [
    ...getOrderedFields,
    ...(basic.customFields
      ?.filter(
        (field) =>
          field.visible !== false && Boolean(getCustomFieldDisplayText(field))
      )
      .map((field) => ({
        key: field.id,
        value: getCustomFieldDisplayText(field),
        icon: field.icon,
        label: field.label,
        visible: true,
        custom: true,
        displayLabel: field.displayLabel,
        href: getCustomFieldHref(field),
      })) || []),
  ];

  const nameField = basic.fieldOrder?.find((f) => f.key === "name") || {
    key: "name",
    label: "姓名",
    visible: true,
  };
  const titleField = basic.fieldOrder?.find((f) => f.key === "title") || {
    key: "title",
    label: "职位",
    visible: true,
  };

  // 与经典模板一致：photoConfig.visible 用真值判断（编辑器写入的 DEFAULT_CONFIG.visible 恒为 true）
  const showPhoto = Boolean(basic.photo) && basic.photoConfig?.visible;

  const PhotoComponent = showPhoto && (
    <motion.div layout="position" className="shrink-0">
      <div
        style={{
          width: `${basic.photoConfig?.width || 100}px`,
          height: `${basic.photoConfig?.height || 100}px`,
          borderRadius: getBorderRadiusValue(
            basic.photoConfig || {
              borderRadius: "none",
              customBorderRadius: 0,
            }
          ),
          overflow: "hidden",
          border: `0.5px solid ${KAMI.border}`,
        }}
      >
        <img
          src={basic.photo}
          alt={`${basic.name}'s photo`}
          className="h-full w-full object-cover"
        />
      </div>
    </motion.div>
  );

  /**
   * 顶部布局与经典模板保持一致：
   * 左侧「头像 + 姓名/职位」，右侧「两列信息网格」。
   * 只对齐结构，视觉仍沿用 kami 的衬线字体与纸感配色。
   * fields 用「按内容宽度收缩的两列 + 贴向外侧内容边界」：避免等宽列在右侧留下大块空白，
   * 多出来的空间变成「姓名 ↔ 字段块」的间距（left 贴右、right 贴左，保持镜像对称）
   */
  const layoutStyles = {
    left: {
      container: "flex items-center justify-between gap-6",
      leftContent: "flex items-center gap-6 shrink-0 min-w-0 max-w-[42%]",
      fields:
        "grid flex-1 min-w-0 grid-cols-[auto_auto] gap-x-6 gap-y-2 justify-end content-start",
      nameTitle: "text-left min-w-0 max-w-[16rem] flex-1",
    },
    right: {
      container: "flex items-center justify-between gap-6 flex-row-reverse",
      leftContent:
        "flex flex-row-reverse justify-start items-center gap-6 shrink-0 min-w-0 max-w-[42%]",
      fields:
        "grid flex-1 min-w-0 grid-cols-[auto_auto] gap-x-6 gap-y-2 justify-start content-start",
      nameTitle: "text-right min-w-0 max-w-[16rem] flex-1",
    },
    center: {
      container: "flex flex-col items-center gap-3",
      leftContent: "flex flex-col items-center gap-4",
      fields: "w-full flex justify-center items-center flex-wrap gap-3",
      nameTitle: "text-center min-w-0 max-w-full",
    },
  };

  const styles =
    layoutStyles[layout as keyof typeof layoutStyles] || layoutStyles.left;

  return (
    <SectionWrapper sectionId="basic" style={getHeaderSpaceStyle()}>
      {/* 头部（基本信息）不出分割线，避免与第一个板块标题的线重复 */}
      <div className={cn(styles.container, "w-full")}>
        <div className={styles.leftContent}>
          {PhotoComponent}
          <div className={cn("flex flex-col", styles.nameTitle)}>
            {nameField.visible !== false && basic[nameField.key] && (
              <motion.h1
                layout="position"
                className="whitespace-normal break-normal [overflow-wrap:normal]"
                style={{
                  // 字号/行高/字距与经典模板一致（34px→30px、去掉 1.1 行高与 0.04em 字距）
                  fontSize: "30px",
                  fontWeight: 500,
                  color: KAMI.nearBlack,
                }}
              >
                {basic[nameField.key] as string}
              </motion.h1>
            )}
            {titleField.visible !== false && basic[titleField.key] && (
              <motion.p
                layout="position"
                className="whitespace-normal break-normal [overflow-wrap:normal]"
                style={{
                  // 与经典模板一致：18px、无上边距、行高继承
                  fontSize: "18px",
                  fontWeight: 500,
                  color: themeColor,
                }}
              >
                {basic[titleField.key] as string}
              </motion.p>
            )}
          </div>
        </div>

        <motion.div
          layout="position"
          className={styles.fields}
          style={{
            // 与经典模板一致：字段字号用 baseFontSize 原值（不再 -1）
            fontSize: `${globalSettings?.baseFontSize || 14}px`,
            color: KAMI.stone,
            lineHeight: 1.5,
            maxWidth: layout === "center" ? "none" : "600px",
          }}
        >
          {allFields.map((item) => {
            const customFieldHref =
              item.custom && "href" in item && typeof item.href === "string"
                ? item.href
                : null;

            const VALUE_CLASS = "min-w-0 [overflow-wrap:anywhere]";

            const valueNode = customFieldHref ? (
              <a
                href={customFieldHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${VALUE_CLASS} underline decoration-transparent hover:decoration-current`}
                style={{ color: KAMI.darkWarm }}
              >
                {item.value}
              </a>
            ) : item.key === "email" ? (
              <a
                href={`mailto:${item.value}`}
                className={`${VALUE_CLASS} underline decoration-transparent hover:decoration-current`}
                style={{ color: KAMI.darkWarm }}
              >
                {item.value}
              </a>
            ) : (
              <span className={VALUE_CLASS} style={{ color: KAMI.darkWarm }}>
                {item.value}
              </span>
            );

            return (
              // 与经典模板一致：值节点是 flex 直接子元素（不再多包一层 inline span），
              // 图标模式间距 gap-1、文字标签模式 gap-2
              <motion.div key={item.key} className="flex min-w-0 items-start">
                {useIconMode ? (
                  <div className="flex min-w-0 items-start gap-1">
                    <span style={{ color: themeColor }}>
                      {getIcon(item.icon)}
                    </span>
                    {valueNode}
                  </div>
                ) : (
                  <div className="flex min-w-0 items-start gap-2">
                    {!item.custom && (
                      <span className="shrink-0" style={{ color: KAMI.olive }}>
                        {t(`basicPanel.basicFields.${item.key}`)}
                      </span>
                    )}
                    {item.custom && shouldShowCustomFieldLabelPrefix(item) && (
                      <span className="shrink-0" style={{ color: KAMI.olive }}>
                        {item.label}
                      </span>
                    )}
                    {valueNode}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {basic.githubContributionsVisible && (
        <GithubContribution
          className="mt-2"
          githubKey={basic.githubKey}
          username={basic.githubUseName}
        />
      )}
    </SectionWrapper>
  );
};

export default BaseInfo;
