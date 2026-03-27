import { getBlogPosts } from "@/lib/notion";
import { PostCard } from "@/components/blog/PostCard";

export const revalidate = 3600; // 1 小时重新验证

export const metadata = {
  title: "博客 - 袁梦龙",
  description: "袁梦龙的技术博客，分享技术文章、项目经验和生活感悟",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
            博客文章
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            分享技术文章、项目经验和生活感悟
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">暂无文章，敬请期待...</p>
          </div>
        )}
      </div>
    </div>
  );
}
