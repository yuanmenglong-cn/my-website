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
        <p className="mb-4 leading-relaxed text-gray-700">
          {renderRichText((content as { rich_text: RichTextItem[] }).rich_text)}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="mb-4 mt-8 text-3xl font-bold text-gray-900">
          {getPlainText((content as { rich_text: RichTextItem[] }).rich_text)}
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="mb-3 mt-6 text-2xl font-bold text-gray-900">
          {getPlainText((content as { rich_text: RichTextItem[] }).rich_text)}
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="mb-3 mt-5 text-xl font-bold text-gray-900">
          {getPlainText((content as { rich_text: RichTextItem[] }).rich_text)}
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="mb-1 ml-6 list-disc text-gray-700">
          {renderRichText((content as { rich_text: RichTextItem[] }).rich_text)}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="mb-1 ml-6 list-decimal text-gray-700">
          {renderRichText((content as { rich_text: RichTextItem[] }).rich_text)}
        </li>
      );

    case "code":
      const codeContent = content as {
        rich_text: RichTextItem[];
        language?: string;
      };
      return (
        <pre className="mb-4 overflow-x-auto rounded-xl bg-gray-900 p-4">
          <code className="text-sm font-mono text-gray-100">
            {getPlainText(codeContent.rich_text)}
          </code>
          {codeContent.language && (
            <div className="mt-2 text-xs text-gray-500">
              {codeContent.language}
            </div>
          )}
        </pre>
      );

    case "quote":
      return (
        <blockquote className="mb-4 border-l-4 border-blue-500 pl-4 italic text-gray-600">
          {renderRichText((content as { rich_text: RichTextItem[] }).rich_text)}
        </blockquote>
      );

    case "divider":
      return <hr className="my-8 border-gray-200" />;

    case "callout":
      const calloutContent = content as {
        rich_text: RichTextItem[];
        icon?: { emoji?: string };
      };
      return (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4">
          <span className="text-xl">{calloutContent.icon?.emoji ?? "💡"}</span>
          <div className="text-gray-700">
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
            <figcaption className="mt-2 text-center text-sm text-gray-500">
              {renderRichText(imageContent.caption)}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}
