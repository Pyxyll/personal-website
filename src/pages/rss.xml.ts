import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { site } from "../lib/site";

export const prerender = true;

export async function GET(context: APIContext) {
  let posts: Awaited<ReturnType<typeof getCollection<"writing">>> = [];
  try {
    posts = (await getCollection("writing", ({ data }) => !data.draft)).sort(
      (a, b) => +b.data.publishedAt - +a.data.publishedAt
    );
  } catch {
    // Collection is empty during the initial content-less commit. Emit an
    // empty feed rather than crashing the build.
    posts = [];
  }

  return rss({
    title: `${site.name} · Writing`,
    description: "Notes from the keyboard. Web, infra, the occasional rant.",
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/writing/${post.id}/`,
      categories: post.data.tags,
      author: `${site.author.email} (${site.author.name})`,
    })),
    customData: [
      `<language>${site.language.toLowerCase()}</language>`,
      `<atom:link href="${new URL("/rss.xml", site.url).toString()}" rel="self" type="application/rss+xml" />`,
      `<image><url>${new URL("/og.png", site.url).toString()}</url><title>${site.name} · Writing</title><link>${site.url}</link></image>`,
    ].join(""),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
  });
}
