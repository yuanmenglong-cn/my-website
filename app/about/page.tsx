export const revalidate = 86400; // 24 小时重新验证

export const metadata = {
  title: "关于我 - 我的名字",
  description: "了解更多关于我的信息",
};

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Notion",
];

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
            <div className="flex h-full w-full items-center justify-center text-6xl">
              👨‍💻
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            关于我
          </h1>
        </div>

        {/* Bio */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-gray-900">简介</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              你好！我是一名热爱技术的开发者。我喜欢探索新技术，构建有用的产品，
              并与社区分享我的学习经验。
            </p>
            <p>
              这个网站是我使用 Next.js 和 Notion API 构建的，
              用于展示我的项目和分享技术文章。
            </p>
          </div>
        </section>

        {/* Skills */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-gray-900">技术栈</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-gray-900">联系方式</h2>
          <div className="space-y-3">
            <p className="text-gray-600">
              欢迎通过以下方式与我联系：
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>
                📧 邮箱:{" "}
                <a
                  href="mailto:hello@example.com"
                  className="text-blue-600 hover:underline"
                >
                  hello@example.com
                </a>
              </li>
              <li>
                🐙 GitHub:{" "}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  @myusername
                </a>
              </li>
              <li>
                🐦 Twitter:{" "}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  @myusername
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
