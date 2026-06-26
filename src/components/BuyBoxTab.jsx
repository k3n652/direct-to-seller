import { PAL, fmt, SANS } from "../theme";
import { Field, Btn, Seal } from "./ui";
import PhotoUpload from "./PhotoUpload";

const PROPERTY_TYPES = ["Single Family", "Multifamily", "Land", "Townhome/Condo", "Mixed Use"];

export default function BuyBoxTab({ buyerForm, setBuyerForm, togglePropType, submitBuyer, profileSaved, buyers }) {
  const setBF = (k) => (e) => setBuyerForm((p) => ({ ...p, [k]: e.target.value }));
  const canSave = buyerForm.name && buyerForm.markets && buyerForm.pofLink;

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
        <Field label="Proof of Funds Link" value={buyerForm.pofLink} onChange={setBF("pofLink")} placeholder="Link to a bank statement, POF letter, or lender pre-approval" />
        <div style={{ color: PAL.muted, fontSize: 12, margin: "-6px 0 2px" }}>— or —</div>
        <PhotoUpload value={buyerForm.pofLink} onUploaded={(url) => setBuyerForm((p) => ({ ...p, pofLink: url }))} label="Upload a screenshot instead" />
      </div>

      <div style={{ background: PAL.goldTint, border: `1px solid ${PAL.gold}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color: PAL.gold, fontWeight: 600 }}>
        A proof of funds link or screenshot is required to save your buy box. Wholesalers can see verified buyers are real before reaching out.
      </div>

      <Btn primary disabled={!canSave} onClick={submitBuyer} style={{ width: "100%", padding: "13px 0" }}>
        {profileSaved ? "✓ Buy Box Saved" : "Save Buy Box"}
      </Btn>

      {buyers.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: PAL.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Your Active Buy Box Profile
          </div>
          {buyers.map((b) => (
            <div key={b.id} style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{b.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: b.verified ? PAL.emeraldTint : PAL.goldTint, padding: "3px 9px", borderRadius: 20 }}>
                  <Seal size={14} status={b.verified ? "verified" : "pending"} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: b.verified ? PAL.emerald : PAL.gold }}>
                    {b.verified ? "Verified" : "Pending Review"}
                  </span>
                </div>
              </div>
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
