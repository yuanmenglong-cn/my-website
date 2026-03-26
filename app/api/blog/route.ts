import { type NextRequest } from "next/server";
import { createBlogPost, type CreateBlogPostInput } from "@/lib/notion";

function verifyAuth(request: NextRequest): boolean {
  const API_SECRET_KEY = process.env.API_SECRET_KEY;

  // 如果没有配置 API_SECRET_KEY，拒绝所有请求（安全默认）
  if (!API_SECRET_KEY) {
    console.error("API_SECRET_KEY not configured");
    return false;
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return false;
  }

  // 支持 "Bearer <token>" 格式
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return false;
  }

  return parts[1] === API_SECRET_KEY;
}

export interface BlogPostResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    tags: string[];
    status: "Published" | "Draft";
  };
  error?: string;
}

/**
 * POST /api/blog
 * 创建新的博客文章
 *
 * 认证:
 * - 需要在请求头中添加: Authorization: Bearer <API_SECRET_KEY>
 *
 * 请求体:
 * - title: string (required) - 文章标题
 * - slug: string (required) - URL 友好的标识符
 * - excerpt: string (required) - 文章摘要
 * - tags: string[] (required) - 标签数组
 * - content: string (required) - 文章正文（支持简单 Markdown 格式：# 标题、## 二级标题、### 三级标题）
 * - cover?: string (optional) - 封面图片 URL
 *
 * 自动生成字段:
 * - publishedAt: 当前日期 (YYYY-MM-DD)
 * - status: "Published"
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 0. 验证 API Key
    if (!verifyAuth(request)) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized: Invalid or missing API key",
        } satisfies BlogPostResponse,
        { status: 401 }
      );
    }

    // 1. 解析请求体
    const body = await request.json() as Partial<CreateBlogPostInput>;

    // 2. 验证必填字段
    const requiredFields: Array<keyof CreateBlogPostInput> = [
      "title",
      "slug",
      "excerpt",
      "tags",
      "content",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = body[field];
      if (field === "tags") {
        return !Array.isArray(value) || value.length === 0;
      }
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return Response.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        } satisfies BlogPostResponse,
        { status: 400 }
      );
    }

    // 3. 验证 tags 是字符串数组
    if (!Array.isArray(body.tags) || !body.tags.every((tag) => typeof tag === "string")) {
      return Response.json(
        {
          success: false,
          error: "tags must be an array of strings",
        } satisfies BlogPostResponse,
        { status: 400 }
      );
    }

    // 4. 调用 Notion API 创建文章
    const newPost = await createBlogPost({
      title: body.title!,
      slug: body.slug!,
      excerpt: body.excerpt!,
      tags: body.tags!,
      content: body.content!,
      cover: body.cover,
    });

    // 5. 返回成功响应
    return Response.json(
      {
        success: true,
        data: {
          id: newPost.id,
          title: newPost.title,
          slug: newPost.slug,
          excerpt: newPost.excerpt,
          publishedAt: newPost.publishedAt,
          tags: newPost.tags,
          status: newPost.status,
        },
      } satisfies BlogPostResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/blog error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      {
        success: false,
        error: `Failed to create blog post: ${errorMessage}`,
      } satisfies BlogPostResponse,
      { status: 500 }
    );
  }
}
