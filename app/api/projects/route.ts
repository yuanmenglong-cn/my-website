import { type NextRequest } from "next/server";
import { createProject, type CreateProjectInput } from "@/lib/notion";

const API_SECRET_KEY = process.env.API_SECRET_KEY;

function verifyAuth(request: NextRequest): boolean {
  // 如果没有配置 API_SECRET_KEY，拒绝所有请求（安全默认）
  if (!API_SECRET_KEY) {
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

export interface ProjectResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    cover: string | null;
    link: string | null;
    tags: string[];
    featured: boolean;
  };
  error?: string;
}

/**
 * POST /api/projects
 * 创建新的项目
 *
 * 认证:
 * - 需要在请求头中添加: Authorization: Bearer <API_SECRET_KEY>
 *
 * 请求体:
 * - title: string (required) - 项目标题
 * - slug: string (required) - URL 友好的标识符
 * - description: string (required) - 项目描述
 * - tags: string[] (required) - 标签数组
 * - link?: string (optional) - 项目链接 URL
 * - cover?: string (optional) - 封面图片 URL
 * - featured?: boolean (optional) - 是否精选展示，默认 false
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 0. 验证 API Key
    if (!verifyAuth(request)) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized: Invalid or missing API key",
        } satisfies ProjectResponse,
        { status: 401 }
      );
    }

    // 1. 解析请求体
    const body = await request.json() as Partial<CreateProjectInput>;

    // 2. 验证必填字段
    const requiredFields: Array<keyof CreateProjectInput> = [
      "title",
      "slug",
      "description",
      "tags",
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
        } satisfies ProjectResponse,
        { status: 400 }
      );
    }

    // 3. 验证 tags 是字符串数组
    if (!Array.isArray(body.tags) || !body.tags.every((tag) => typeof tag === "string")) {
      return Response.json(
        {
          success: false,
          error: "tags must be an array of strings",
        } satisfies ProjectResponse,
        { status: 400 }
      );
    }

    // 4. 验证 featured 是布尔值（如果提供了）
    if (body.featured !== undefined && typeof body.featured !== "boolean") {
      return Response.json(
        {
          success: false,
          error: "featured must be a boolean",
        } satisfies ProjectResponse,
        { status: 400 }
      );
    }

    // 5. 调用 Notion API 创建项目
    const newProject = await createProject({
      title: body.title!,
      slug: body.slug!,
      description: body.description!,
      tags: body.tags!,
      link: body.link,
      cover: body.cover,
      featured: body.featured,
    });

    // 6. 返回成功响应
    return Response.json(
      {
        success: true,
        data: {
          id: newProject.id,
          title: newProject.title,
          slug: newProject.slug,
          description: newProject.description,
          cover: newProject.cover,
          link: newProject.link,
          tags: newProject.tags,
          featured: newProject.featured,
        },
      } satisfies ProjectResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      {
        success: false,
        error: `Failed to create project: ${errorMessage}`,
      } satisfies ProjectResponse,
      { status: 500 }
    );
  }
}
