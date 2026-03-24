import type { BlogPost, Project, NotionBlock } from "@/types";

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const BLOG_DB_ID = process.env.NOTION_BLOG_DATABASE_ID!;
const PROJECTS_DB_ID = process.env.NOTION_PROJECTS_DATABASE_ID!;

// Notion API 基础 URL
const NOTION_API_BASE = "https://api.notion.com/v1";

// 通用请求函数
async function notionRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${response.status} ${error}`);
  }

  return response.json();
}

// ===== 博客文章 API =====

/**
 * 获取所有已发布的博客文章
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await notionRequest(`/databases/${BLOG_DB_ID}/query`, {
      method: "POST",
      body: JSON.stringify({
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
      }),
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
    const response = await notionRequest(`/databases/${BLOG_DB_ID}/query`, {
      method: "POST",
      body: JSON.stringify({
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
      }),
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
      const query = cursor ? `?start_cursor=${cursor}&page_size=100` : "?page_size=100";
      const response = await notionRequest(`/blocks/${pageId}/children${query}`);

      blocks.push(...response.results.map(parseBlock));
      cursor = response.next_cursor ?? undefined;
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
    const response = await notionRequest(`/databases/${PROJECTS_DB_ID}/query`, {
      method: "POST",
      body: JSON.stringify({
        sorts: [
          {
            timestamp: "created_time",
            direction: "descending",
          },
        ],
      }),
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
    const response = await notionRequest(`/databases/${PROJECTS_DB_ID}/query`, {
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: "Featured",
          checkbox: {
            equals: true,
          },
        },
      }),
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
