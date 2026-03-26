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

      const parsedBlocks = await Promise.all(
        response.results.map(async (block: unknown) => {
          const parsed = parseBlock(block);
          const typedBlock = block as { type: string; id: string; has_children?: boolean };

          // 递归获取子块（表格行等）
          if (typedBlock.has_children) {
            parsed.children = await getPageBlocks(typedBlock.id);
          }

          return parsed;
        })
      );

      blocks.push(...parsedBlocks);
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

/**
 * 根据 slug 获取单个项目
 */
export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  try {
    const response = await notionRequest(`/databases/${PROJECTS_DB_ID}/query`, {
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: "Slug",
          rich_text: {
            equals: slug,
          },
        },
      }),
    });

    if (response.results.length === 0) {
      return null;
    }

    return parseProject(response.results[0]);
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
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

// ===== 创建项目 API =====

export interface CreateProjectInput {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  link?: string | null;
  cover?: string | null;
  featured?: boolean;
}

/**
 * 创建新的项目
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { title, slug, description, tags, link, cover, featured = false } = input;

  try {
    // 创建页面（数据库条目）
    const pageData: Record<string, unknown> = {
      parent: {
        database_id: PROJECTS_DB_ID,
      },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Slug: {
          rich_text: [
            {
              text: {
                content: slug,
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              text: {
                content: description,
              },
            },
          ],
        },
        Tags: {
          multi_select: tags.map((tag) => ({ name: tag })),
        },
        Featured: {
          checkbox: featured,
        },
      },
    };

    // 如果有链接，添加 Link
    if (link) {
      (pageData.properties as Record<string, unknown>).Link = {
        url: link,
      };
    }

    // 如果有封面图，添加 cover
    if (cover) {
      pageData.cover = {
        external: {
          url: cover,
        },
      };
    }

    const page = await notionRequest("/pages", {
      method: "POST",
      body: JSON.stringify(pageData),
    });

    // 返回新创建的项目
    return parseProject(page);
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  content: string;
  cover?: string | null;
}

/**
 * 创建新的博客文章
 */
export async function createBlogPost(input: CreateBlogPostInput): Promise<BlogPost> {
  const { title, slug, excerpt, tags, content, cover } = input;

  // 获取当前时间作为发布时间
  const publishedAt = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 格式

  try {
    // 1. 创建页面（数据库条目）
    const pageData: Record<string, unknown> = {
      parent: {
        database_id: BLOG_DB_ID,
      },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Slug: {
          rich_text: [
            {
              text: {
                content: slug,
              },
            },
          ],
        },
        Excerpt: {
          rich_text: [
            {
              text: {
                content: excerpt,
              },
            },
          ],
        },
        Published: {
          date: {
            start: publishedAt,
          },
        },
        Tags: {
          multi_select: tags.map((tag) => ({ name: tag })),
        },
        Status: {
          select: {
            name: "Published",
          },
        },
      },
    };

    // 如果有封面图，添加 cover
    if (cover) {
      pageData.cover = {
        external: {
          url: cover,
        },
      };
    }

    const page = await notionRequest("/pages", {
      method: "POST",
      body: JSON.stringify(pageData),
    });

    // 2. 添加正文内容块
    await addPageContent(page.id, content);

    // 3. 返回新创建的文章
    return parseBlogPost(page);
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }
}

/**
 * 将 Markdown 内容转换为 Notion 块并添加到页面
 */
async function addPageContent(pageId: string, content: string): Promise<void> {
  // 简单解析：按段落分割
  const paragraphs = content.split('\n\n').filter((p) => p.trim());

  const blocks = paragraphs.map((paragraph) => {
    // 检查是否是标题（以 # 开头）
    const headingMatch = paragraph.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const blockType = level === 1 ? "heading_1" : level === 2 ? "heading_2" : "heading_3";
      return {
        type: blockType,
        [blockType]: {
          rich_text: [{ text: { content: text } }],
        },
      };
    }

    // 普通段落
    return {
      type: "paragraph",
      paragraph: {
        rich_text: [{ text: { content: paragraph } }],
      },
    };
  });

  // Notion API 每次最多添加 100 个块
  const chunkSize = 100;
  for (let i = 0; i < blocks.length; i += chunkSize) {
    const chunk = blocks.slice(i, i + chunkSize);
    await notionRequest(`/blocks/${pageId}/children`, {
      method: "PATCH",
      body: JSON.stringify({ children: chunk }),
    });
  }
}
