import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { renderOg } from "../../../lib/og";

export const prerender = true;

export async function getStaticPaths() {
  const entries = await getCollection("work");
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { title: entry.data.title, summary: entry.data.summary },
  }));
}

interface Props {
  title: string;
  summary: string;
}

export async function GET({ props }: APIContext<Props>) {
  const png = await renderOg({
    eyebrow: "Work",
    title: props.title,
    subtitle: props.summary,
  });
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
