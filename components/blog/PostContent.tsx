import type { NotionBlock } from "@/types";
import { getPlainText, renderRichText, type RichTextItem } from "@/lib/parser";
import Image from "next/image";

interface PostContentProps {
  blocks: NotionBlock[];
}

export function PostContent({ blocks }: PostContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: NotionBlock }) {
  const { type, content } = block;

  switch (type) {
    case "paragraph":
      return (
        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          {renderRichText((content as { rich_text: RichTextItem[] }).rich_text)}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="mb-4 mt-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {getPlainText((content as { rich_text: RichTextItem[] }).rich_text)}
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="mb-3 mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {getPlainText((content as { rich_text: RichTextItem[] }).rich_text)}
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="mb-3 mt-5 text-xl font-bold text-gray-900 dark:text-gray-100">
          {getPlainText((content as { rich_text: RichTextItem[] }).rich_text)}
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="mb-1 ml-6 list-disc text-gray-700 dark:text-gray-300">
          {renderRichText((content as { rich_text: RichTextItem[] }).rich_text)}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="mb-1 ml-6 list-decimal text-gray-700 dark:text-gray-300">
          {renderRichText((content as { rich_text: RichTextItem[] }).rich_text)}
        </li>
      );

    case "code":
      const codeContent = content as {
        rich_text: RichTextItem[];
        language?: string;
      };
      return (
        <pre className="mb-4 overflow-x-auto rounded-xl bg-gray-900 p-4 dark:bg-gray-800">
          <code className="text-sm font-mono text-gray-100">
            {getPlainText(codeContent.rich_text)}
          </code>
          {codeContent.language && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {codeContent.language}
            </div>
          )}
        </pre>
      );

    case "quote":
      return (
        <blockquote className="mb-4 border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400">
          {renderRichText((content as { rich_text: RichTextItem[] }).rich_text)}
        </blockquote>
      );

    case "divider":
      return <hr className="my-8 border-gray-200 dark:border-gray-700" />;

    case "callout":
      const calloutContent = content as {
        rich_text: RichTextItem[];
        icon?: { emoji?: string };
      };
      return (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <span className="text-xl">{calloutContent.icon?.emoji ?? "💡"}</span>
          <div className="text-gray-700 dark:text-gray-300">
            {renderRichText(calloutContent.rich_text)}
          </div>
        </div>
      );

    case "image":
      const imageContent = content as {
        file?: { url: string };
        external?: { url: string };
        caption?: RichTextItem[];
      };
      const imageUrl =
        imageContent.file?.url ?? imageContent.external?.url ?? "";
      return (
        <figure className="mb-6">
          <Image
            src={imageUrl}
            alt={getPlainText(imageContent.caption ?? [])}
            width={800}
            height={450}
            className="rounded-xl"
          />
          {imageContent.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {renderRichText(imageContent.caption)}
            </figcaption>
          )}
        </figure>
      );

    case "table":
      return <TableRenderer block={block} />;

    case "pdf":
      const pdfContent = content as {
        file?: { url: string };
        external?: { url: string };
      };
      const pdfUrl = pdfContent.file?.url ?? pdfContent.external?.url ?? "";
      if (!pdfUrl) return null;
      return (
        <div className="my-6">
          <iframe
            src={pdfUrl}
            className="w-full h-[600px] rounded-xl border border-gray-200 dark:border-gray-700"
            title="PDF Viewer"
          />
        </div>
      );

    default:
      return null;
  }
}

interface TableRowContent {
  cells: RichTextItem[][];
}

interface TableContent {
  table_width: number;
  has_column_header?: boolean;
  has_row_header?: boolean;
}

function TableRenderer({ block }: { block: NotionBlock }) {
  const { children } = block;
  const content = block.content as TableContent | undefined;

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
        <tbody>
          {children.map((row, rowIndex) => (
            <TableRowRenderer
              key={row.id}
              row={row}
              rowIndex={rowIndex}
              hasColumnHeader={content?.has_column_header ?? false}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableRowRenderer({
  row,
  rowIndex,
  hasColumnHeader,
}: {
  row: NotionBlock;
  rowIndex: number;
  hasColumnHeader: boolean;
}) {
  const content = row.content as TableRowContent | undefined;
  const cells = content?.cells ?? [];
  const isHeaderRow = hasColumnHeader && rowIndex === 0;

  return (
    <tr className={isHeaderRow ? "bg-gray-100 dark:bg-gray-800" : ""}>
      {cells.map((cell, cellIndex) => {
        const CellTag = isHeaderRow ? "th" : "td";
        const isRowHeader = !isHeaderRow && cellIndex === 0;

        return (
          <CellTag
            key={cellIndex}
            className={`border border-gray-300 px-4 py-2 text-left dark:border-gray-700 ${
              isRowHeader ? "bg-gray-50 font-semibold dark:bg-gray-800" : ""
            }`}
          >
            {renderRichText(cell)}
          </CellTag>
        );
      })}
    </tr>
  );
}
