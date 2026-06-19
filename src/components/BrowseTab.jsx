import { PAL, SERIF, fmt, PROPERTY_TYPES, matchCount } from "../theme";
import { Seal, Field, Select, Btn } from "./ui";

export default function BrowseTab({
  filters, setFilters, loading, filteredDeals, buyers, myBuyBoxes, userRole,
  isAdmin, toggleVerifyDeal, revealedContact, setRevealedContact,
}) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        <Field label="State" value={filters.state} onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))} placeholder="e.g. GA" />
        <Field label="Max Price" value={filters.maxPrice} onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))} placeholder="e.g. 150000" prefix="$" />
        <Select label="Property Type" value={filters.propertyType} onChange={(e) => setFilters((p) => ({ ...p, propertyType: e.target.value }))} options={["All", ...PROPERTY_TYPES]} />
      </div>

      {loading ? (
        <div style={{ color: PAL.muted, textAlign: "center", padding: 50 }}>Loading deals…</div>
      ) : filteredDeals.length === 0 ? (
        <div style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 36, textAlign: "center", color: PAL.muted, fontSize: 14 }}>
          No deals match yet. Be the first — post one from the "Post a Deal" tab.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filteredDeals.map((d) => {
            const margin = (Number(d.arv) || 0) - (Number(d.price) || 0) - (Number(d.repairs) || 0);
            const matches = matchCount(d, buyers);
            const isBuyerMatch = userRole === "buyer" && myBuyBoxes.some((b) => matchCount(d, [b]) > 0);

            return (
              <div key={d.id} style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{d.address}</div>
                    <div style={{ color: PAL.muted, fontSize: 12.5 }}>{[d.city, d.state, d.zip].filter(Boolean).join(", ")} · {d.propertyType}</div>
                    <div style={{ color: PAL.emeraldDark, fontSize: 12, fontWeight: 600, marginTop: 3 }}>Posted by {d.wholesalerName || "Unknown"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: d.verified ? PAL.emeraldTint : PAL.goldTint, padding: "4px 10px", borderRadius: 20 }}>
                    <Seal size={16} status={d.verified ? "verified" : "pending"} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: d.verified ? PAL.emerald : PAL.gold }}>
                      {d.verified ? "Verified" : "Pending Review"}
                    </span>
                  </div>
                </div>

                {isBuyerMatch && (
                  <div style={{ display: "inline-block", background: PAL.emeraldTint, color: PAL.emerald, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 10 }}>
                    Matches your Buy Box
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[["Price", fmt(d.price)], ["ARV", fmt(d.arv)], ["Repairs", fmt(d.repairs)], ["Est. Margin", fmt(margin)]].map(([l, v]) => (
                    <div key={l} style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 7, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: PAL.muted, textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {d.description && <div style={{ fontSize: 13.5, color: PAL.ink, marginBottom: 12, lineHeight: 1.5 }}>{d.description}</div>}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: PAL.emeraldDark, fontWeight: 700 }}>
                    {userRole === "buyer"
                      ? (isBuyerMatch ? "Matches your Buy Box" : "Posted " + d.postedDate)
                      : (matches > 0 ? `${matches} buyer${matches > 1 ? "s" : ""} in your network match this` : "Posted " + d.postedDate)}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {isAdmin && (
                      <Btn onClick={() => toggleVerifyDeal(d.id, d.verified)} style={{ borderColor: d.verified ? PAL.brick : PAL.emerald, color: d.verified ? PAL.brick : PAL.emerald }}>
                        {d.verified ? "Unverify" : "Approve Verification"}
                      </Btn>
                    )}
                    {revealedContact === d.id ? (
                      <div style={{ fontSize: 13, fontWeight: 700, color: PAL.ink, background: "#fff", border: `1px solid ${PAL.paperBorder}`, padding: "6px 12px", borderRadius: 7 }}>
                        {d.contact}
                      </div>
                    ) : (
                      <Btn primary onClick={() => setRevealedContact(d.id)} style={{ padding: "8px 14px", fontSize: 12.5 }}>
                        Contact Wholesaler
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
