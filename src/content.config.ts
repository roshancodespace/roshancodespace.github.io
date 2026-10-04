import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
    loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
    })
});

const projects = defineCollection({
    loader: glob({ base: "./src/content/projects", pattern: "**/*.mdx" }),
    schema: z.object({
        title: z.string(),
        tagline: z.string(),
        description: z.string(),
        category: z.string(),
        year: z.string(),
        role: z.string(),
        status: z.string(),
        languages: z.array(z.string()).min(1),
        order: z.number().default(100),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
        image: z.string().optional(),
        cardLayout: z.enum(["stacked", "split"]).default("stacked"),
        cardSpan: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
        accentColor: z.string().optional(),
        githubUrl: z.url().optional(),
        liveUrl: z.url().optional(),
        stars: z.number().int().nonnegative().optional(),
        forks: z.number().int().nonnegative().optional(),
        specs: z
            .array(z.object({ label: z.string(), value: z.string() }))
            .default([]),
        previewSnippet: z
            .object({ lang: z.string(), code: z.string() })
            .optional(),
    }),
});

export const collections = {
    blog,
    projects,
};