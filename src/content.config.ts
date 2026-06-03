import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts. Files are written by the Telegram ingestion script
// (scripts/ingest-telegram.mjs) into src/content/posts/*.md, or by hand.
// The file id (filename without extension) becomes the URL slug: /blog/<id>.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // ISO date string in frontmatter; coerced to a Date.
    date: z.coerce.date(),
    // Short summary for the blog index + meta description. Optional —
    // falls back to a trimmed body excerpt when absent.
    excerpt: z.string().optional(),
    // Absolute path under public/, e.g. '/posts/1234/0.jpg'. Optional.
    cover: z.string().optional(),
    // Telegram message id this post was ingested from (used for dedup).
    telegramId: z.number().optional(),
    // Permalink back to the original Telegram post.
    telegramUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
