// Schema.org JSON-LD builders. Keep these pure (no Astro/browser deps) so
// they can be imported by any page/layout/endpoint.
import { site } from "./site";

const abs = (path: string) =>
  new URL(path.replace(/^\//, ""), site.url + "/").toString();

const DEFAULT_OG = abs("/og.png");

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.author.name,
    url: site.url,
    image: DEFAULT_OG,
    jobTitle: site.author.role,
    description: site.description,
    email: `mailto:${site.author.email}`,
    address: {
      "@type": "PostalAddress",
      addressCountry: site.author.countryCode,
    },
    sameAs: [...site.sameAs],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: site.language,
    publisher: { "@id": `${site.url}/#person` },
  };
}

export function webPageSchema(args: {
  url: string;
  name: string;
  description: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${args.url}#webpage`,
    url: args.url,
    name: args.name,
    description: args.description,
    image: args.image ?? DEFAULT_OG,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@id": `${site.url}/#person` },
  };
}

export function articleSchema(args: {
  url: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags?: string[];
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    image: args.image ?? DEFAULT_OG,
    datePublished: args.publishedAt.toISOString(),
    dateModified: (args.updatedAt ?? args.publishedAt).toISOString(),
    author: { "@id": `${site.url}/#person` },
    publisher: { "@id": `${site.url}/#person` },
    keywords: args.tags?.join(", "),
    inLanguage: site.language,
    mainEntityOfPage: { "@type": "WebPage", "@id": args.url },
    url: args.url,
  };
}

export function creativeWorkSchema(args: {
  url: string;
  title: string;
  description: string;
  year?: number;
  role?: string;
  stack?: string[];
  externalUrl?: string;
  repoUrl?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: args.title,
    description: args.description,
    url: args.url,
    image: args.image ?? DEFAULT_OG,
    creator: { "@id": `${site.url}/#person` },
    author: { "@id": `${site.url}/#person` },
    dateCreated: args.year ? String(args.year) : undefined,
    keywords: args.stack?.join(", "),
    inLanguage: site.language,
    sameAs: [args.externalUrl, args.repoUrl].filter(Boolean),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function blogSchema(args: { url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${args.url}#blog`,
    url: args.url,
    name: `${site.name} · Writing`,
    description: "Notes from the keyboard. Web, infra, the occasional rant.",
    inLanguage: site.language,
    publisher: { "@id": `${site.url}/#person` },
  };
}

export function collectionPageSchema(args: {
  url: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${args.url}#collection`,
    url: args.url,
    name: args.name,
    description: args.description,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
  };
}

export function contactPageSchema(args: { url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${args.url}#contact`,
    url: args.url,
    name: `Contact · ${site.name}`,
    inLanguage: site.language,
    about: { "@id": `${site.url}/#person` },
  };
}
