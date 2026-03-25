import { getFeaturedProjects } from "@/lib/notion";
import type { Project } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
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

        <div className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects();

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">精选项目</h2>
          <Link href="/projects">
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
