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

/**
 * The trading entity behind the site, with its services as an offer catalog.
 * Separate @id from #person so search engines can tell the human apart from
 * the business, while `founder` ties the two together.
 */
export function professionalServiceSchema(args: {
  url: string;
  services: {
    slug: string;
    title: string;
    tagline: string;
    from: number;
    fromUnit?: string;
  }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#business`,
    name: site.business.tradingName,
    legalName: site.business.legalName,
    url: args.url,
    image: DEFAULT_OG,
    email: `mailto:${site.author.email}`,
    description:
      "Websites, custom web apps, automation and hosting for small businesses in Ireland.",
    founder: { "@id": `${site.url}/#person` },
    priceRange: "€€",
    currenciesAccepted: site.business.currency,
    address: {
      "@type": "PostalAddress",
      addressCountry: site.author.countryCode,
    },
    areaServed: site.business.serviceArea.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    knowsLanguage: site.language,
    sameAs: [...site.sameAs],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: args.services.map((s) => ({
        "@type": "Offer",
        "@id": `${args.url}#${s.slug}`,
        name: s.title,
        description: s.tagline,
        url: `${args.url}#${s.slug}`,
        priceSpecification: {
          "@type": "PriceSpecification",
          price: s.from,
          priceCurrency: site.business.currency,
          // "from" pricing: the published figure is the floor, not the quote.
          minPrice: s.from,
          valueAddedTaxIncluded: false,
        },
        itemOffered: {
          "@type": "Service",
          name: s.title,
          serviceType: s.title,
          provider: { "@id": `${site.url}/#business` },
        },
      })),
    },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
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
