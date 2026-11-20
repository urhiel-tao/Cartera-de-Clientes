import { NextResponse } from "next/server";
import {
  getAllCountryNames,
  getDistrictsForLocality,
  getLocalitiesForProvince,
  getLocationSeedInfo,
  getProvincesForCountry,
} from "@/lib/locations";

async function fetchOsmSuburbs(lat: number, lon: number): Promise<string[]> {
  if (lat === 0 && lon === 0) return [];
  const q = `
    [out:json][timeout:4];
    (
      node["place"~"suburb|neighbourhood|quarter"]["name"](around:9000,${lat},${lon});
    );
    out tags 60;
  `;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(q)}`,
      signal: AbortSignal.timeout(3200),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "CarteraPro-LocationEnricher/1.0",
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      elements?: Array<{ tags?: Record<string, string> }>;
    };
    const names = (data.elements || [])
      .map((e) => e.tags?.name?.trim())
      .filter((n): n is string => Boolean(n && n.length > 1));
    return Array.from(new Set(names));
  } catch {
    return [];
  }
}

async function fetchOsmTowns(
  country: string,
  province: string
): Promise<string[]> {
  if (!province) return [];
  try {
    const q = `ciudad ${province}, ${country}`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=15`,
      {
        signal: AbortSignal.timeout(3000),
        headers: {
          "User-Agent": "CarteraPro-LocationEnricher/1.0",
          "Accept-Language": "es",
        },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      name?: string;
      display_name?: string;
      type?: string;
    }>;
    return data
      .map((d) => (d.name || d.display_name?.split(",")[0] || "").trim())
      .filter(
        (n) =>
          Boolean(n) &&
          n.toLowerCase() !== province.toLowerCase() &&
          n.toLowerCase() !== country.toLowerCase()
      );
  } catch {
    return [];
  }
}

function mergeUnique(base: string[], extra: string[]): string[] {
  const seen = new Set(base.map((b) => b.toLowerCase()));
  const out = [...base];
  for (const item of extra) {
    const clean = item.trim();
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      out.push(clean);
    }
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "countries";
  const country = (url.searchParams.get("country") || "Argentina").trim();
  const province = (url.searchParams.get("province") || "").trim();
  const locality = (url.searchParams.get("locality") || "").trim();

  if (type === "countries") {
    return NextResponse.json({ items: getAllCountryNames(), dynamicCount: 0 });
  }

  if (type === "provinces") {
    const provs = getProvincesForCountry(country).map((p) => p.name);
    return NextResponse.json({ items: provs, dynamicCount: 0 });
  }

  if (type === "localities") {
    const base = getLocalitiesForProvince(country, province).map((l) => l.name);
    const extra = base.length <= 2 ? await fetchOsmTowns(country, province) : [];
    const items = mergeUnique(base, extra);
    return NextResponse.json({
      items,
      dynamicCount: items.length - base.length,
    });
  }

  if (type === "districts") {
    const base = getDistrictsForLocality(country, province, locality);
    const seed = getLocationSeedInfo(country, province, locality);
    const extra = await fetchOsmSuburbs(seed.lat, seed.lon);
    const items = mergeUnique(base, extra);
    return NextResponse.json({
      items,
      dynamicCount: items.length - base.length,
    });
  }

  return NextResponse.json({ items: [], dynamicCount: 0 });
}
