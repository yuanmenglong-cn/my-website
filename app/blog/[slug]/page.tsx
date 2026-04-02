import { notFound } from "next/navigation";
import { getBlogPostBySlug, getPageBlocks, getBlogPosts } from "@/lib/notion";
import { PostContent } from "@/components/blog/PostContent";
import { GiscusComments } from "@/components/comments/GiscusComments";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 3600; // 1 小时重新验证

// 生成静态参数（可选，用于 SSG）
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: `${post.title} - 袁梦龙`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const blocks = await getPageBlocks(post.id);

  return (
    <article className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
        >
          ← 返回博客列表
        </Link>

        {/* Header */}
        <header className="mb-10">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="primary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
            {post.title}
          </h1>

          {/* Date */}
          <time className="text-gray-500 dark:text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>

        {/* Cover Image */}
        {post.cover && (
          <div className="mb-10 overflow-hidden rounded-2xl">
            <Image
              src={post.cover}
              alt={post.title}
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
        <GiscusComments category="Blog" />

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
          >
            ← 返回博客列表
          </Link>
        </footer>
      </div>
    </article>
  );
}
