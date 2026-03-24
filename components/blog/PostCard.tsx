import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface PostCardProps {
  post: BlogPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="h-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        {/* Cover Image */}
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          {post.cover ? (
            <Image
              src={post.cover}
              alt={post.title}
              width={600}
              height={340}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
              <span className="text-4xl">📝</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="primary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="mb-4 text-sm text-gray-600 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Date */}
          <time className="text-xs text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </article>
    </Link>
  );
}
