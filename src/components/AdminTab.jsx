import React from "react";
import { PAL, SERIF, fmt } from "../theme";
import { Btn } from "./ui";

export default function AdminTab({ deals, toggleVerifyDeal }) {
  const pendingDeals = deals.filter((d) => !d.verified);

  return (
    <div style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 20 }}>
      <h3 style={{ fontFamily: SERIF, marginTop: 0, marginBottom: 16 }}>Pending Verifications</h3>
      {pendingDeals.length === 0 ? (
        <div style={{ color: PAL.muted, fontSize: 14 }}>All clean! No deals are currently pending review.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {pendingDeals.map((d) => (
            <div key={d.id} style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 7, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{d.address}</div>
                <div style={{ fontSize: 12, color: PAL.muted, marginBottom: 4 }}>
                  {d.city}, {d.state} · {fmt(d.price)}
                </div>
                {d.contractLink ? (
                  <a href={d.contractLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: PAL.emerald, fontWeight: 700, textDecoration: "underline" }}>
                    View Contract Proof ↗
                  </a>
                ) : (
                  <span style={{ fontSize: 12, color: PAL.brick, fontWeight: 700 }}>No Contract Provided</span>
                )}
              </div>
              <Btn primary onClick={() => toggleVerifyDeal(d.id, d.verified)} style={{ padding: "6px 12px", fontSize: 12 }}>
                Approve
              </Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
