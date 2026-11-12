// The case-study collection. Every .mdx in src/content/work is checked
// against this schema; a missing or invalid field stops the build and names
// the file and field. (Spec: docs/CASE_STUDY_SYSTEM.md §3.)
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stat = z.object({
  value: z.string(),
  label: z.string(),
  source: z.enum(['measured', 'logged', 'reported', 'combined', 'derived', 'count']),
  note: z.string().optional(),
});

const work = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    format: z.enum(['case', 'app']),
    order: z.number(),
    featured: z.boolean(),
    company: z.string(),
    eyebrow: z.array(z.string()),
    intro: z.string(),
    oneLiner: z.string(),
    tags: z.array(z.string()),
    meta: z.object({
      role: z.string(),
      team: z.string().optional(),
      timeline: z.string().optional(),
      research: z.string().optional(),
      platform: z.string().optional(),
      people: z.string().optional(),
    }),
    status: z.enum(['shipped', 'beta', 'trial', 'concept', 'in-use']),
    statusNote: z.string().optional(),
    statusAsOf: z.coerce.date(),
    updated: z.coerce.date(),
    cover: z.object({ video: z.string().optional(), poster: z.string(), alt: z.string() }),
    summary: z.object({ problem: z.string(), role: z.string(), changed: z.string(), result: z.string() }),
    stats: z.array(stat).max(4),
    series: z.object({ name: z.string(), part: z.number(), of: z.number() }).optional(),
    next: z.string(),
    nda: z.boolean().default(false),
    seo: z.object({ description: z.string(), ogImage: z.string() }),
  }),
});

export const collections = { work };
