import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects, getPageBlocks } from "@/lib/notion";
import { PostContent } from "@/components/blog/PostContent";
import { GiscusComments } from "@/components/comments/GiscusComments";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 3600;

// 生成静态参数
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "项目未找到",
    };
  }

  return {
    title: `${project.title} - 袁梦龙`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const blocks = await getPageBlocks(project.id);

  return (
    <article className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/projects"
          className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          ← 返回作品集
        </Link>

        {/* Header */}
        <header className="mb-10">
          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
            {project.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400">{project.description}</p>

          {/* External Link */}
          {project.link && (
            <div className="mt-6">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="sm">
                  访问项目 →
                </Button>
              </a>
            </div>
          )}
        </header>

        {/* Cover Image */}
        {project.cover && (
          <div className="mb-10 overflow-hidden rounded-2xl">
            <Image
              src={project.cover}
              alt={project.title}
              width={1200}
              height={630}
              className="w-full"
              priority
            />
          </div>
        )}

        {/* Content */}
        <PostContent blocks={blocks} />

        {/* Comments */}
        <GiscusComments category="Projects" />

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <Link
            href="/projects"
            className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
          >
            ← 返回作品集
          </Link>
        </footer>
      </div>
    </article>
  );
}
