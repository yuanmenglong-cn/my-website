import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Avatar */}
        <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
          <div className="flex h-full w-full items-center justify-center text-4xl">
            👨‍💻
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          你好，我是<span className="text-blue-600">袁梦龙</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          一个热爱技术与创作的开发者。在这里分享我的项目、文章和对技术的思考。
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/projects">
            <Button size="lg">查看作品</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">
              了解更多
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
