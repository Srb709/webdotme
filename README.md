# WebDotMe

**WebDotMe** is an independent web design and development studio focused on polished, conversion-minded websites for small businesses.

This repository contains the production source for [webdotme.com](https://www.webdotme.com), including the portfolio, service pages, case studies, local SEO landing pages, editorial content, and lead-generation flow.

## Project goals

The site is designed to do more than act as a portfolio. It serves as the operating website for WebDotMe and is built around four goals:

- present real client work clearly
- explain services without unnecessary sales copy
- create strong mobile-first experiences
- generate qualified project inquiries

## Highlights

- Fully custom static front end
- Responsive layouts designed for desktop, tablet, and mobile
- Portfolio case studies for completed client work
- Dedicated website design, development, local SEO, and support pages
- Philadelphia, Bucks County, and Montgomery County local landing pages
- Process and about pages that explain how projects are handled
- Editorial insights section for useful long-form content
- Lead form connected to a Supabase Edge Function
- XML sitemap and robots configuration
- Vercel production hosting

## Stack

- **HTML5**
- **CSS3**
- **JavaScript**
- **Supabase Edge Functions**
- **Vercel**

The project intentionally uses a lightweight static architecture rather than a framework. There is no client-side application runtime or build step required to render the core site.

## Site structure

```text
/
├── about/
├── bucks-county-web-design/
├── insights/
├── montgomery-county-web-design/
├── philadelphia-web-design/
├── privacy/
├── process/
├── services/
├── start-a-project/
└── work/
```

Key service pages include:

```text
/services/website-design/
/services/website-development/
/services/local-seo/
/services/website-support/
```

Selected work is documented under `/work/`, including Little Lute Studio, Foundry No. 9, and MØNOLITH.

## Lead flow

The project inquiry experience posts to a Supabase Edge Function rather than exposing database credentials in the browser. The website itself remains static while form processing is handled server-side.

## SEO structure

The site includes:

- crawlable static routes
- `sitemap.xml`
- `robots.txt`
- service-specific pages
- location-specific landing pages
- internal links between services, work, process, and editorial content

The architecture keeps core content available without requiring client-side JavaScript to render it.

## Deployment

Production is hosted on Vercel from the `main` branch.

```text
https://www.webdotme.com
```

Because the site is static, deployments are simple and predictable: repository changes are pushed to GitHub and Vercel publishes the production build.

## Repository practices

- Production secrets are not stored in this repository.
- Environment-specific server credentials remain in the services that use them.
- Changes are kept focused so client-facing design and behavior are not altered unintentionally.
- Mobile behavior is treated as a first-class requirement for every page.

## Status

**Active production project.** WebDotMe is the portfolio, client-acquisition site, and home base for ongoing web work by Steven Brooks.
