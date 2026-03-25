import { getProjects } from "@/lib/notion";
import type { Project } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const revalidate = 300; // 5分钟重新验证

export const metadata = {
  title: "作品集 - 袁梦龙",
  description: "袁梦龙的项目和作品展示",
};

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
        {/* Cover */}
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          {project.cover ? (
            <Image
              src={project.cover}
              alt={project.title}
              width={600}
              height={340}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
              <span className="text-4xl">🚀</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 line-clamp-2">{project.description}</p>
        </div>
      </div>
    </Link>
  );
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            作品集
          </h1>
          <p className="mt-3 text-gray-600">展示我的项目和作品</p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">暂无项目，敬请期待...</p>
          </div>
        )}
      </div>
    </div>
  );
}
