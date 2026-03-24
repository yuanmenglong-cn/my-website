import { Client } from "@notionhq/client";
import type { BlogPost, Project, NotionBlock } from "@/types";

// 初始化 Notion客户端
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
}) as any;

const BLOG_DB_ID = process.env.NOTION_BLOG_DATABASE_ID!;
const PROJECTS_DB_ID = process.env.NOTION_PROJECTS_DATABASE_ID!;

// ===== 博客文章 API =====

/**
 * 获取所有已发布的博客文章
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await notion.databases.query({
      database_id: BLOG_DB_ID,
      filter: {
        property: "Status",
        select: {
          equals: "Published",
        },
      },
      sorts: [
        {
          property: "Published",
          direction: "descending",
        },
      ],
    });

    return response.results.map((page: unknown) => parseBlogPost(page));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

/**
 * 根据 slug 获取单篇博客文章
 */
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    const response = await notion.databases.query({
      database_id: BLOG_DB_ID,
      filter: {
        and: [
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
          {
            property: "Status",
            select: {
              equals: "Published",
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    return parseBlogPost(response.results[0]);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

/**
 * 获取文章的所有内容块
 */
export async function getPageBlocks(
  pageId: string
): Promise<NotionBlock[]> {
  try {
    const blocks: NotionBlock[] = [];
    let cursor: string | undefined;

    do {
      const response: unknown = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
        start_cursor: cursor,
      });

      const typedResponse = response as { results: unknown[]; next_cursor?: string };
      blocks.push(...typedResponse.results.map(parseBlock));
      cursor = typedResponse.next_cursor;
    } while (cursor);

    return blocks;
  } catch (error) {
    console.error("Error fetching page blocks:", error);
    return [];
  }
}

// ===== 项目 API =====

/**
 * 获取所有项目
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const response = await notion.databases.query({
      database_id: PROJECTS_DB_ID,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    });

    return response.results.map((page: unknown) => parseProject(page));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

/**
 * 获取精选项目（首页展示）
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const response = await notion.databases.query({
      database_id: PROJECTS_DB_ID,
      filter: {
        property: "Featured",
        checkbox: {
          equals: true,
        },
      },
    });

    return response.results.map((page: unknown) => parseProject(page));
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    return [];
  }
}

// ===== 数据解析函数 =====

function parseBlogPost(page: unknown): BlogPost {
  const typed = page as {
    id: string;
    cover: { file?: { url: string }; external?: { url: string } } | null;
    properties: {
      Title?: { title: { plain_text: string }[] };
      Slug?: { rich_text: { plain_text: string }[] };
      Excerpt?: { rich_text: { plain_text: string }[] };
      Published?: { date: { start: string } };
      Tags?: { multi_select: { name: string }[] };
      Status?: { select: { name: string } };
    };
  };

  const props = typed.properties;

  return {
    id: typed.id,
    title: props.Title?.title?.[0]?.plain_text ?? "",
    slug: props.Slug?.rich_text?.[0]?.plain_text ?? "",
    excerpt: props.Excerpt?.rich_text?.[0]?.plain_text ?? "",
    cover: typed.cover?.file?.url ?? typed.cover?.external?.url ?? null,
    publishedAt: props.Published?.date?.start ?? "",
    tags: props.Tags?.multi_select?.map((t) => t.name) ?? [],
    status: (props.Status?.select?.name as "Published" | "Draft") ?? "Draft",
  };
}

function parseProject(page: unknown): Project {
  const typed = page as {
    id: string;
    cover: { file?: { url: string }; external?: { url: string } } | null;
    properties: {
      Title?: { title: { plain_text: string }[] };
      Slug?: { rich_text: { plain_text: string }[] };
      Description?: { rich_text: { plain_text: string }[] };
      Link?: { url: string | null };
      Tags?: { multi_select: { name: string }[] };
      Featured?: { checkbox: boolean };
    };
  };

  const props = typed.properties;

  return {
    id: typed.id,
    title: props.Title?.title?.[0]?.plain_text ?? "",
    slug: props.Slug?.rich_text?.[0]?.plain_text ?? "",
    description: props.Description?.rich_text?.[0]?.plain_text ?? "",
    cover: typed.cover?.file?.url ?? typed.cover?.external?.url ?? null,
    link: props.Link?.url ?? null,
    tags: props.Tags?.multi_select?.map((t) => t.name) ?? [],
    featured: props.Featured?.checkbox ?? false,
  };
}

function parseBlock(block: unknown): NotionBlock {
  const typed = block as {
    id: string;
    type: string;
    [key: string]: unknown;
  };

  return {
    id: typed.id,
    type: typed.type as NotionBlock["type"],
    content: typed[typed.type],
  };
}
