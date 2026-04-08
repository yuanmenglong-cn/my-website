"use client";

import { useEffect, useRef } from "react";

interface GiscusCommentsProps {
  category: string;
}

export function GiscusComments({ category }: GiscusCommentsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    // Configuration attributes
    script.setAttribute("data-repo", "yuanmenglong-cn/my-website");
    script.setAttribute("data-repo-id", "R_kgDORwJdBw");
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", category === "Blog" ? "DIC_kwDORwJdB84C6YOI" : "DIC_kwDORwJdB84C6YOV");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("data-loading", "lazy");

    container?.appendChild(script);

    return () => {
      container?.removeChild(script);
    };
  }, [category]);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const html = document.documentElement;
          const isDark = html.classList.contains("dark");
          const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
          if (iframe) {
            iframe.contentWindow?.postMessage(
              { giscus: { setConfig: { theme: isDark ? "dark" : "light" } } },
              "https://giscus.app"
            );
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="mt-12" />;
}
