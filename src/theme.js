export const PAL = {
  bg: "#FFFFFF", paper: "#F8F9FC", paperBorder: "#E3E6EC", ink: "#0F172A",
  muted: "#64748B", emerald: "#2554EB", emeraldDark: "#1741B8", emeraldTint: "#EAF0FF",
  gold: "#D97706", goldTint: "#FEF3E2", brick: "#DC2626", brickTint: "#FEE9E7",
};

// Kept as a separate export name so every file that imports SERIF for headings
// didn't need to be touched individually — this single line removes the
// "editorial/blog" serif look from the whole app at once.
export const SANS = "'Inter', -apple-system, system-ui, sans-serif";
export const SERIF = SANS;

export const fmt = (n) => !n || isNaN(n) ? "—" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

export const PROPERTY_TYPES = ["Single Family", "Multifamily", "Land", "Townhome/Condo", "Mixed Use"];
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const STATE_ABBR = {
  alabama: "al", alaska: "ak", arizona: "az", arkansas: "ar", california: "ca",
  colorado: "co", connecticut: "ct", delaware: "de", florida: "fl", georgia: "ga",
  hawaii: "hi", idaho: "id", illinois: "il", indiana: "in", iowa: "ia",
  kansas: "ks", kentucky: "ky", louisiana: "la", maine: "me", maryland: "md",
  massachusetts: "ma", michigan: "mi", minnesota: "mn", mississippi: "ms", missouri: "mo",
  montana: "mt", nebraska: "ne", nevada: "nv", "new hampshire": "nh", "new jersey": "nj",
  "new mexico": "nm", "new york": "ny", "north carolina": "nc", "north dakota": "nd", ohio: "oh",
  oklahoma: "ok", oregon: "or", pennsylvania: "pa", "rhode island": "ri", "south carolina": "sc",
  "south dakota": "sd", tennessee: "tn", texas: "tx", utah: "ut", vermont: "vt",
  virginia: "va", washington: "wa", "west virginia": "wv", wisconsin: "wi", wyoming: "wy",
  "district of columbia": "dc",
};

// Converts "Georgia" -> "ga". Leaves already-abbreviated input ("ga") untouched.
function normalizeState(s) {
  const v = (s || "").toLowerCase().trim();
  return STATE_ABBR[v] || v;
}

// Buy box markets format: semicolon-separated entries, e.g. "Atlanta, GA; Dallas, TX; 30309"
// A comma WITHIN one entry means "this city AND this state together" (not two separate criteria).
// An entry with no comma is treated as a single flexible token (matches city, state, or zip).
export function matchCount(deal, buyers) {
  const dealCity = (deal.city || "").toLowerCase().trim();
  const dealState = normalizeState(deal.state);
  const dealZip = (deal.zip || "").toLowerCase().trim();

  return buyers.filter((b) => {
    const entries = (b.markets || "").split(";").map((e) => e.trim()).filter(Boolean);

    const hit = entries.some((entry) => {
      if (entry.includes(",")) {
        const [cityPart, statePart] = entry.split(",").map((s) => s.trim().toLowerCase());
        const cityOk = !cityPart || dealCity.includes(cityPart);
        const stateOk = !statePart || normalizeState(statePart) === dealState;
        return cityOk && stateOk;
      }
      const m = entry.toLowerCase();
      return m === dealZip || dealCity.includes(m) || normalizeState(m) === dealState;
    });

    const priceOk = !b.maxPrice || Number(deal.price) <= Number(b.maxPrice);
    const typeOk = !b.propertyTypes || b.propertyTypes.length === 0 || b.propertyTypes.includes(deal.propertyType);
    return hit && priceOk && typeOk;
  }).length;
}
