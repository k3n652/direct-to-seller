import { PAL, fmt } from "../theme";
import { Btn } from "./ui";

export default function AdminTab({ deals, toggleVerifyDeal, buyers, toggleVerifyBuyer }) {
  const pendingDeals = deals.filter((d) => !d.verified);
  const pendingBuyers = buyers.filter((b) => !b.verified);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, marginTop: 0, marginBottom: 16 }}>Pending Deal Verifications</h3>

        {pendingDeals.length === 0 ? (
          <div style={{ color: PAL.muted, fontSize: 14 }}>All clean! No deals are currently pending review.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {pendingDeals.map((d) => (
              <div key={d.id} style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{d.address}</div>
                    <div style={{ fontSize: 12, color: PAL.muted }}>{d.city}, {d.state} {d.zip} · {fmt(d.price)} · Posted by {d.wholesalerName}</div>
                  </div>
                  <Btn primary onClick={() => toggleVerifyDeal(d.id, d.verified)} style={{ padding: "6px 12px", fontSize: 12 }}>
                    Approve
                  </Btn>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {d.contractLink ? (
                    <a href={d.contractLink} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 12.5, fontWeight: 700, color: PAL.emerald, background: PAL.emeraldTint,
                      padding: "6px 12px", borderRadius: 8, textDecoration: "none",
                    }}>
                      📄 View Contract
                    </a>
                  ) : (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: PAL.brick, background: PAL.brickTint, padding: "6px 12px", borderRadius: 8 }}>
                      ⚠ No contract link on file
                    </span>
                  )}
                  {d.photoUrl && (
                    <a href={d.photoUrl} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 12.5, fontWeight: 700, color: PAL.ink, background: PAL.paper,
                      border: `1px solid ${PAL.paperBorder}`, padding: "6px 12px", borderRadius: 8, textDecoration: "none",
                    }}>
                      🖼 View Photo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, marginTop: 0, marginBottom: 16 }}>Pending Buyer Verifications</h3>

        {pendingBuyers.length === 0 ? (
          <div style={{ color: PAL.muted, fontSize: 14 }}>All clean! No buyers are currently pending review.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {pendingBuyers.map((b) => (
              <div key={b.id} style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: PAL.muted }}>{b.markets} · Max {fmt(b.maxPrice)}</div>
                  </div>
                  <Btn primary onClick={() => toggleVerifyBuyer(b.id, b.verified)} style={{ padding: "6px 12px", fontSize: 12 }}>
                    Approve
                  </Btn>
                </div>

                {b.pofLink ? (
                  <a href={b.pofLink} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 12.5, fontWeight: 700, color: PAL.emerald, background: PAL.emeraldTint,
                    padding: "6px 12px", borderRadius: 8, textDecoration: "none",
                  }}>
                    💵 View Proof of Funds
                  </a>
                ) : (
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: PAL.brick, background: PAL.brickTint, padding: "6px 12px", borderRadius: 8 }}>
                    ⚠ No proof of funds link on file
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
