import React from "react";

/**
 * 富文本项类型
 */
export interface RichTextItem {
  plain_text: string;
  type: string;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    color?: string;
  };
  href?: string | null;
}

/**
 * 从 Notion 富文本对象中提取纯文本
 */
export function getPlainText(richText: RichTextItem[]): string {
  return richText?.map((t) => t.plain_text).join("") ?? "";
}

/**
 * 渲染富文本（支持基础样式）
 */
export function renderRichText(richText: RichTextItem[]): React.ReactNode {
  if (!richText || richText.length === 0) {
    return null;
  }

  return richText.map((text, index) => {
    let content: React.ReactNode = text.plain_text;

    // 应用样式
    if (text.annotations) {
      if (text.annotations.bold) {
        content = <strong key={index}>{content}</strong>;
      }
      if (text.annotations.italic) {
        content = <em key={index}>{content}</em>;
      }
      if (text.annotations.code) {
        content = (
          <code
            key={index}
            className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-red-600"
          >
            {content}
          </code>
        );
      }
      if (text.annotations.strikethrough) {
        content = <del key={index}>{content}</del>;
      }
      if (text.annotations.underline) {
        content = <u key={index}>{content}</u>;
      }
    }

    // 链接
    if (text.href) {
      content = (
        <a
          key={index}
          href={text.href}
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }

    return <span key={index}>{content}</span>;
  });
}
