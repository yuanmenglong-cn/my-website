import { Hero } from "@/components/home/Hero";
import { LatestPosts } from "@/components/home/LatestPosts";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";

export const revalidate = 86400; // 24 小时重新验证

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestPosts />
      <FeaturedProjects />
    </>
  );
}
