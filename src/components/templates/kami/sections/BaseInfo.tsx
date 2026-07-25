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
      <IconComponent className="mt-[0.15em] h-3.5 w-3.5 shrink-0" />
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

  const showPhoto =
    Boolean(basic.photo) && basic.photoConfig?.visible !== false;

  const PhotoComponent = showPhoto && (
    <motion.div layout="position" className="shrink-0">
      <div
        style={{
          width: `${basic.photoConfig?.width || 88}px`,
          height: `${basic.photoConfig?.height || 88}px`,
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

  const isCenter = layout === "center";
  const isRight = layout === "right";

  return (
    <SectionWrapper sectionId="basic">
      <div
        className={cn(
          "flex w-full gap-6 pb-3",
          isCenter
            ? "flex-col items-center text-center"
            : isRight
              ? "flex-row-reverse items-end justify-between"
              : "items-end justify-between"
        )}
        style={{ borderBottom: `0.6px solid ${KAMI.border}` }}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-5",
            isCenter && "flex-col",
            isRight && "flex-row-reverse"
          )}
        >
          {PhotoComponent}
          <div
            className={cn(
              "flex min-w-0 flex-col",
              isCenter && "items-center",
              isRight && "items-end text-right"
            )}
          >
            {nameField.visible !== false && basic[nameField.key] && (
              <motion.h1
                layout="position"
                className="whitespace-normal break-normal [overflow-wrap:normal] leading-none"
                style={{
                  fontSize: "34px",
                  fontWeight: 500,
                  color: KAMI.nearBlack,
                  letterSpacing: "0.04em",
                }}
              >
                {basic[nameField.key] as string}
              </motion.h1>
            )}
            {titleField.visible !== false && basic[titleField.key] && (
              <motion.p
                layout="position"
                className="mt-2 whitespace-normal break-normal [overflow-wrap:normal]"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: themeColor,
                  lineHeight: 1.3,
                }}
              >
                {basic[titleField.key] as string}
              </motion.p>
            )}
          </div>
        </div>

        <motion.div
          layout="position"
          className={cn(
            "flex min-w-0 flex-col gap-1",
            isCenter
              ? "w-full items-center flex-wrap flex-row justify-center gap-x-4 gap-y-1"
              : isRight
                ? "items-start text-left"
                : "items-end text-right"
          )}
          style={{
            fontSize: `${Math.max((globalSettings?.baseFontSize || 13) - 1, 11)}px`,
            color: KAMI.stone,
            lineHeight: 1.5,
          }}
        >
          {allFields.map((item) => {
            const customFieldHref =
              item.custom && "href" in item && typeof item.href === "string"
                ? item.href
                : null;

            const valueNode = customFieldHref ? (
              <a
                href={customFieldHref}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-transparent hover:decoration-current"
                style={{ color: KAMI.darkWarm }}
              >
                {item.value}
              </a>
            ) : item.key === "email" ? (
              <a
                href={`mailto:${item.value}`}
                className="underline decoration-transparent hover:decoration-current"
                style={{ color: KAMI.darkWarm }}
              >
                {item.value}
              </a>
            ) : (
              <span style={{ color: KAMI.darkWarm }}>{item.value}</span>
            );

            return (
              <motion.div
                key={item.key}
                className="flex min-w-0 items-start gap-1.5"
              >
                {useIconMode ? (
                  <>
                    <span style={{ color: themeColor }}>{getIcon(item.icon)}</span>
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      {valueNode}
                    </span>
                  </>
                ) : (
                  <>
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
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      {valueNode}
                    </span>
                  </>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {basic.githubContributionsVisible && (
        <GithubContribution
          className="mt-3"
          githubKey={basic.githubKey}
          username={basic.githubUseName}
        />
      )}
    </SectionWrapper>
  );
};

export default BaseInfo;
