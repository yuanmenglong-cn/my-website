import { getBlogPosts } from "@/lib/notion";
import { PostCard } from "@/components/blog/PostCard";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export async function LatestPosts() {
  const posts = await getBlogPosts();
  const latestPosts = posts.slice(0, 3);

  if (latestPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
          <Link href="/blog">
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
