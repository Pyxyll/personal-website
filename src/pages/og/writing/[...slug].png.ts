import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { renderOg } from "../../../lib/og";

export const prerender = true;

export async function getStaticPaths() {
  const entries = await getCollection("writing", ({ data }) => !data.draft);
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { title: entry.data.title, description: entry.data.description },
  }));
}

interface Props {
  title: string;
  description: string;
}

export async function GET({ props }: APIContext<Props>) {
  const png = await renderOg({
    eyebrow: "Writing",
    title: props.title,
    subtitle: props.description,
  });
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
