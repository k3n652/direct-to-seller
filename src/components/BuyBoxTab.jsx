import { PAL, fmt, SANS } from "../theme";
import { Field, Btn } from "./ui";

const PROPERTY_TYPES = ["Single Family", "Multifamily", "Land", "Townhome/Condo", "Mixed Use"];

export default function BuyBoxTab({ buyerForm, setBuyerForm, togglePropType, submitBuyer, profileSaved, buyers }) {
  const setBF = (k) => (e) => setBuyerForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div style={{ color: PAL.muted, fontSize: 13.5, marginBottom: 20, lineHeight: 1.5 }}>
        Set your criteria once. Deals that match your buy box will be flagged automatically in the feed.
      </div>
      <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
        <Field label="Your Name / Company" value={buyerForm.name} onChange={setBF("name")} placeholder="Jane Smith Investments" />
        <Field label="Markets You Buy In" value={buyerForm.markets} onChange={setBF("markets")} placeholder="Atlanta, GA; Dallas, TX; 30309 — separate markets with semicolons" />
        <Field label="Max Purchase Price" value={buyerForm.maxPrice} onChange={setBF("maxPrice")} placeholder="150000" prefix="$" />
        <div>
          <label style={{ color: PAL.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SANS }}>Property Types</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PROPERTY_TYPES.map((t) => (
              <button key={t} onClick={() => togglePropType(t)} style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${buyerForm.propertyTypes.includes(t) ? PAL.emerald : PAL.paperBorder}`,
                background: buyerForm.propertyTypes.includes(t) ? PAL.emeraldTint : "#fff",
                color: buyerForm.propertyTypes.includes(t) ? PAL.emeraldDark : PAL.muted,
              }}>{t}</button>
            ))}
          </div>
        </div>
        <Field label="Contact Info" value={buyerForm.contact} onChange={setBF("contact")} placeholder="Phone or email wholesalers can reach you at" />
      </div>
      <Btn primary disabled={!buyerForm.name || !buyerForm.markets} onClick={submitBuyer} style={{ width: "100%", padding: "13px 0" }}>
        {profileSaved ? "✓ Buy Box Saved" : "Save Buy Box"}
      </Btn>

      {buyers.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: PAL.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Your Active Buy Box Profile
          </div>
          {buyers.map((b) => (
            <div key={b.id} style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{b.name}</div>
              <div style={{ fontSize: 13, color: PAL.ink }}><strong>Markets:</strong> {b.markets}</div>
              <div style={{ fontSize: 13, color: PAL.ink }}><strong>Max Price:</strong> {fmt(b.maxPrice)}</div>
              <div style={{ fontSize: 13, color: PAL.ink }}><strong>Types:</strong> {b.propertyTypes?.join(", ") || "All"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
