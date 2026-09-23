import { fetchSource } from "@mangaflux/runtime";
import type { MangaDetails, MangaSource, MangaSummary } from "./types.js";

const BASE = process.env.MANGADEX_BASE_URL ?? "https://api.mangadex.org";
const HOSTS = ["api.mangadex.org"];

type MangaDexSearchResponse = {
  data: Array<{
    id: string;
    attributes: {
      title: Record<string, string>;
      description?: Record<string, string>;
      status?: string;
    };
  }>;
};

function pickText(values: Record<string, string> | undefined) {
  if (!values) return undefined;
  return values.en ?? Object.values(values)[0];
}

export const mangaDexSource: MangaSource = {
  id: "mangadex",
  name: "MangaDex",

  async search(query): Promise<MangaSummary[]> {
    const url = new URL("/manga", BASE);
    url.searchParams.set("title", query);
    url.searchParams.set("limit", "20");

    const response = await fetchSource(url.toString(), { allowedHosts: HOSTS });
    if (!response.ok) throw new Error(`MangaDex search failed with ${response.status}`);

    const payload = response.json<MangaDexSearchResponse>();
    return payload.data.map((item) => ({
      id: item.id,
      source: "mangadex",
      title: pickText(item.attributes.title) ?? "Untitled"
    }));
  },

  async details(id): Promise<MangaDetails> {
    const response = await fetchSource(`${BASE}/manga/${encodeURIComponent(id)}`, { allowedHosts: HOSTS });
    if (!response.ok) throw new Error(`MangaDex details failed with ${response.status}`);
    const payload = response.json<{ data: MangaDexSearchResponse["data"][number] }>();
    return {
      id: payload.data.id,
      source: "mangadex",
      title: pickText(payload.data.attributes.title) ?? "Untitled",
      description: pickText(payload.data.attributes.description),
      status: payload.data.attributes.status
    };
  },

  async chapters() {
    throw new Error("MangaDex chapter adapter is the next implementation milestone");
  },

  async pages() {
    throw new Error("MangaDex page adapter is the next implementation milestone");
  }
};
