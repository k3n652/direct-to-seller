export const PAL = {
  bg: "#FFFFFF", paper: "#F7F5EF", paperBorder: "#E6E2D6", ink: "#15201B",
  muted: "#70766A", emerald: "#1F5C4D", emeraldDark: "#163F35", emeraldTint: "#E9F1ED",
  gold: "#A8823F", goldTint: "#F5EEDF", brick: "#9C3B33", brickTint: "#F6EAE8",
};

export const SERIF = "'Iowan Old Style', 'Source Serif Pro', Georgia, 'Times New Roman', serif";
export const SANS = "'Inter', -apple-system, system-ui, sans-serif";

export const fmt = (n) => !n || isNaN(n) ? "—" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

export const PROPERTY_TYPES = ["Single Family", "Multifamily", "Land", "Townhome/Condo", "Mixed Use"];
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function matchCount(deal, buyers) {
  return buyers.filter((b) => {
    const markets = (b.markets || "").toLowerCase().split(",").map((m) => m.trim()).filter(Boolean);
    const hit = markets.some((m) =>
      m === (deal.zip || "").toLowerCase() ||
      (deal.city || "").toLowerCase().includes(m) ||
      m === (deal.state || "").toLowerCase()
    );
    const priceOk = !b.maxPrice || Number(deal.price) <= Number(b.maxPrice);
    const typeOk = !b.propertyTypes || b.propertyTypes.length === 0 || b.propertyTypes.includes(deal.propertyType);
    return hit && priceOk && typeOk;
  }).length;
}
