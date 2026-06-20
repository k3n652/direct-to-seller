import React from "react";
import { PAL, fmt, matchCount } from "../theme";
import { Field, Select, Btn } from "./ui";

// Define it here so Vercel doesn't crash looking for it in theme.js
const PROPERTY_TYPES = ["Single Family", "Multifamily", "Land", "Townhome/Condo", "Mixed Use"];

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
        <div style={{ display: "grid", gap: 16 }}>
          {filteredDeals.map((d) => {
            const priceNum = Number(d.price) || 0;
            const arvNum = Number(d.arv) || 0;
            const repairsNum = Number(d.repairs) || 0;
            const margin = arvNum - priceNum - repairsNum;
            const totalInvested = priceNum + repairsNum;
            const arvRatio = arvNum > 0 ? Math.round((totalInvested / arvNum) * 100) : 0;
            
            // Fixed unused variables by rendering them in the footer below
            const matches = matchCount(d, buyers);
            const isBuyerMatch = userRole === "buyer" && myBuyBoxes.some((b) => matchCount(d, [b]) > 0);

            return (
              <div key={d.id} style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, overflow: "hidden" }}>
                
                {/* Hero Image Section */}
                <div style={{ height: 180, background: PAL.paper, position: "relative", borderBottom: `1px solid ${PAL.paperBorder}` }}>
                  {d.photoLink && (d.photoLink.includes(".jpg") || d.photoLink.includes(".png") || d.photoLink.includes(".jpeg")) ? (
                     <img src={d.photoLink} alt="Property" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: PAL.muted, fontSize: 13, flexDirection: "column", gap: 6 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      {d.photoLink ? <a href={d.photoLink} target="_blank" rel="noreferrer" style={{ color: PAL.emerald, textDecoration: "underline" }}>View External Photos</a> : "No Photos Available"}
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                    <span style={{ background: d.verified ? PAL.emerald : PAL.gold, color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {d.verified ? "Verified" : "Pending"}
                    </span>
                    {arvRatio > 0 && arvRatio < 100 && (
                      <span style={{ background: PAL.ink, color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {arvRatio}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Data Section */}
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: PAL.ink, letterSpacing: "-0.02em" }}>{fmt(priceNum)}</div>
                    <div style={{ fontSize: 14, color: PAL.muted, fontWeight: 600 }}>(ARV - {fmt(arvNum)})</div>
                  </div>

                  <div style={{ fontSize: 14, color: PAL.ink, marginBottom: 12 }}>
                    {[d.address, d.city, d.state, d.zip].filter(Boolean).join(", ")}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: PAL.ink, fontWeight: 500, marginBottom: 14 }}>
                    {d.beds && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>🛏 {d.beds} Beds</span>}
                    {d.baths && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>🚿 {d.baths} Baths</span>}
                    {d.sqft && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>📏 {d.sqft} sq.ft</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>🏠 {d.propertyType}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14, background: PAL.paper, padding: 10, borderRadius: 6, border: `1px solid ${PAL.paperBorder}` }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: PAL.muted, textTransform: "uppercase" }}>Est. Repairs</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: PAL.ink }}>{fmt(repairsNum)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: PAL.muted, textTransform: "uppercase" }}>Est. Margin</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: PAL.emeraldDark }}>{fmt(margin)}</div>
                    </div>
                  </div>

                  {d.description && <div style={{ fontSize: 13, color: PAL.muted, marginBottom: 14, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.description}</div>}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: `1px solid ${PAL.paperBorder}` }}>
                    
                    {/* The unused variables are now correctly utilized here */}
                    <div style={{ fontSize: 12, fontWeight: 700, color: isBuyerMatch ? PAL.emerald : PAL.muted }}>
                      {isBuyerMatch 
                        ? "✓ Matches Buy Box" 
                        : userRole === "wholesaler" 
                          ? `${matches} Buyers Match This`
                          : `Posted by ${d.wholesalerName || "Unknown"}`
                      }
                    </div>
                    
                    <div style={{ display: "flex", gap: 8 }}>
                      {isAdmin && (
                        <Btn onClick={() => toggleVerifyDeal(d.id, d.verified)} style={{ padding: "6px 12px", fontSize: 12, borderColor: d.verified ? PAL.brick : PAL.emerald, color: d.verified ? PAL.brick : PAL.emerald }}>
                          {d.verified ? "Unverify" : "Verify"}
                        </Btn>
                      )}
                      {revealedContact === d.id ? (
                        <div style={{ fontSize: 13, fontWeight: 700, color: PAL.ink, background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, padding: "6px 12px", borderRadius: 7 }}>
                          {d.contact}
                        </div>
                      ) : (
                        <Btn primary onClick={() => setRevealedContact(d.id)} style={{ padding: "8px 16px", fontSize: 12.5 }}>
                          Contact
                        </Btn>
                      )}
                    </div>
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
