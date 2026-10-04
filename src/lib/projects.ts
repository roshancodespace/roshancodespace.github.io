import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;
export type ProjectData = Project["data"];
export type ProjectCardLayout = ProjectData["cardLayout"];
export type ProjectCardSpan = NonNullable<ProjectData["cardSpan"]>;

export async function getAllProjects(): Promise<Project[]> {
	const entries = await getCollection("projects", ({ data }) => !data.draft);
	return entries.sort(
		(a, b) =>
			a.data.order - b.data.order ||
			a.data.title.localeCompare(b.data.title),
	);
}

export async function getFeaturedProjects(): Promise<Project[]> {
	return (await getAllProjects()).filter((p) => p.data.featured);
}
