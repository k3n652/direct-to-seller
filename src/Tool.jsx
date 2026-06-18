import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";

// Replace these with your own Firebase project values (Project Settings > Your apps)
const firebaseConfig = {
  apiKey: "AIzaSyDcoyWu6Sq5_6v8G4j_pdiMyny4GiYIE8Q",
  authDomain: "direct-to-seller.firebaseapp.com",
  projectId: "direct-to-seller",
  storageBucket: "direct-to-seller.firebasestorage.app",
  messagingSenderId: "366400953836",
  appId: "1:366400953836:web:f7277877d7a58c3d95b4c9",
  measurementId: "G-55JR8KG1HF"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

const PAL = {
  bg: "#FFFFFF",
  paper: "#F7F5EF",
  paperBorder: "#E6E2D6",
  ink: "#15201B",
  muted: "#70766A",
  emerald: "#1F5C4D",
  emeraldDark: "#163F35",
  emeraldTint: "#E9F1ED",
  gold: "#A8823F",
  goldTint: "#F5EEDF",
  brick: "#9C3B33",
  brickTint: "#F6EAE8",
};
 
const SERIF = "'Iowan Old Style', 'Source Serif Pro', Georgia, 'Times New Roman', serif";
const SANS = "'Inter', -apple-system, system-ui, sans-serif";
 
const fmt = (n) => !n || isNaN(n) ? "—" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
 
const PROPERTY_TYPES = ["Single Family", "Multifamily", "Land", "Townhome/Condo", "Mixed Use"];
 
/* ---------- Signature element: verification seal ---------- */
function Seal({ size = 40, status = "pending", color }) {
  const c = color || (status === "verified" ? PAL.emerald : PAL.gold);
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
      <circle cx="28" cy="28" r="25" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="28" cy="28" r="19" fill="none" stroke={c} strokeWidth="1" strokeDasharray="2 3.2" />
      {status === "verified" ? (
        <path d="M17 28.5l7 7 15-15" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <g stroke={c} strokeWidth="2.4" strokeLinecap="round">
          <line x1="28" y1="28" x2="28" y2="17" />
          <line x1="28" y1="28" x2="35" y2="32" />
        </g>
      )}
    </svg>
  );
}
 
/* ---------- Shared field components (outside App to avoid remount bugs) ---------- */
const inputBase = {
  background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 7,
  color: PAL.ink, fontSize: 14.5, padding: "10px 12px", width: "100%",
  outline: "none", boxSizing: "border-box", fontFamily: SANS,
};
const labelBase = {
  color: PAL.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SANS,
};
 
function Field({ label, value, onChange, placeholder, prefix, type = "text", textarea }) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: textarea ? 12 : "50%", transform: textarea ? "none" : "translateY(-50%)", color: PAL.muted }}>{prefix}</span>}
        {textarea ? (
          <textarea rows={3} placeholder={placeholder} value={value} onChange={onChange}
            style={{ ...inputBase, paddingLeft: prefix ? 22 : 12, resize: "vertical", lineHeight: 1.5 }} />
        ) : (
          <input type={type} placeholder={placeholder} value={value} onChange={onChange}
            style={{ ...inputBase, paddingLeft: prefix ? 22 : 12 }} />
        )}
      </div>
    </div>
  );
}
 
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <select value={value} onChange={onChange} style={{ ...inputBase, cursor: "pointer" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
 
function Btn({ onClick, children, primary, disabled, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "11px 18px", borderRadius: 8, border: primary ? "none" : `1px solid ${PAL.paperBorder}`,
      background: disabled ? "#eee" : primary ? PAL.emerald : "#fff",
      color: disabled ? "#999" : primary ? "#fff" : PAL.ink,
      fontWeight: 700, fontSize: 13.5, fontFamily: SANS, cursor: disabled ? "not-allowed" : "pointer",
      transition: "opacity 0.15s", ...style,
     }}>{children}</button>
  );
}
 
function matchCount(deal, buyers) {
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
 
const EMPTY_DEAL = { wholesalerName: "", address: "", city: "", state: "", zip: "", price: "", arv: "", repairs: "", propertyType: PROPERTY_TYPES[0], description: "", contact: "" };
const EMPTY_BUYER = { name: "", markets: "", maxPrice: "", propertyTypes: [], contact: "" };
 
export default function App() {
  const [tab, setTab] = useState("browse");
  const [deals, setDeals] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealForm, setDealForm] = useState(EMPTY_DEAL);
  const [buyerForm, setBuyerForm] = useState(EMPTY_BUYER);
  const [posted, setPosted] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [filters, setFilters] = useState({ state: "", maxPrice: "", propertyType: "All" });
  const [revealedContact, setRevealedContact] = useState(null);
  
  // Admin Backdoor Access States
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState("");

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = PAL.bg;
 
    const dealsQuery = query(collection(db, "deals"), orderBy("createdAt", "desc"));
    const unsubDeals = onSnapshot(dealsQuery, (snap) => {
      setDeals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
 
    const buyersQuery = query(collection(db, "buyers"), orderBy("createdAt", "desc"));
    const unsubBuyers = onSnapshot(buyersQuery, (snap) => {
      setBuyers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
 
    return () => { unsubDeals(); unsubBuyers(); };
  }, []);
 
  const setDF = (k) => (e) => setDealForm((p) => ({ ...p, [k]: e.target.value }));
  const setBF = (k) => (e) => setBuyerForm((p) => ({ ...p, [k]: e.target.value }));
  const togglePropType = (t) => setBuyerForm((p) => ({
    ...p, propertyTypes: p.propertyTypes.includes(t) ? p.propertyTypes.filter((x) => x !== t) : [...p.propertyTypes, t],
  }));
 
  const submitDeal = async () => {
    if (!dealForm.wholesalerName || !dealForm.address || !dealForm.price) return;
    await addDoc(collection(db, "deals"), {
      ...dealForm, postedDate: new Date().toLocaleDateString(), verified: false, createdAt: Date.now(),
    });
    setDealForm(EMPTY_DEAL);
    setPosted(true);
    setTimeout(() => setPosted(false), 2500);
  };
 
  const submitBuyer = async () => {
    if (!buyerForm.name || !buyerForm.markets) return;
    await addDoc(collection(db, "buyers"), {
      ...buyerForm, postedDate: new Date().toLocaleDateString(), createdAt: Date.now(),
    });
    setBuyerForm(EMPTY_BUYER);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Admin function to toggle a deal's verification status in Firestore
  const toggleVerifyDeal = async (id, currentStatus) => {
    const dealRef = doc(db, "deals", id);
    await updateDoc(dealRef, {
      verified: !currentStatus
    });
  };
 
  const filteredDeals = deals.filter((d) => {
    const stateOk = !filters.state || (d.state || "").toLowerCase().includes(filters.state.toLowerCase());
    const priceOk = !filters.maxPrice || Number(d.price) <= Number(filters.maxPrice);
    const typeOk = filters.propertyType === "All" || d.propertyType === filters.propertyType;
    return stateOk && priceOk && typeOk;
  });
 
  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
      borderBottom: tab === id ? `2px solid ${PAL.emerald}` : "2px solid transparent",
      color: tab === id ? PAL.emeraldDark : PAL.muted,
      fontWeight: 700, fontSize: 14, fontFamily: SANS, transition: "all 0.15s",
    }}>{label}</button>
  );
 
  return (
    <div style={{ background: PAL.bg, minHeight: "100vh", fontFamily: SANS, color: PAL.ink }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 60px" }}>
 
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Seal size={44} status="verified" />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: PAL.ink, letterSpacing: "-0.01em" }}>
                DirectToSeller
              </div>
            </div>
          </div>
          
          {/* Secret Backdoor Input Form */}
          {!isAdmin && (
            <input 
              type="password" 
              placeholder="Admin pass" 
              value={passInput} 
              onChange={(e) => {
                setPassInput(e.target.value);
                if (e.target.value === "apprehension") { // CHANGE THIS PASSCODE TO WHATEVER YOU WANT
                  setIsAdmin(true);
                  setPassInput("");
                }
              }} 
              style={{ width: 80, fontSize: 10, border: "none", background: "transparent", textAlign: "right", color: PAL.paperBorder, outline: "none" }}
            />
          )}
        </div>
        <div style={{ color: PAL.muted, fontSize: 14.5, marginBottom: 28, maxWidth: 480, lineHeight: 1.5 }}>
          Off-market deals and cash buyers, without the Facebook noise. No daisy chains, no bots, no guessing on the numbers.
        </div>
 
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${PAL.paperBorder}`, marginBottom: 28 }}>
          <TabBtn id="browse" label={`Browse Deals (${deals.length})`} />
          <TabBtn id="post" label="Post a Deal" />
          <TabBtn id="buybox" label="My Buy Box" />
          {isAdmin && <TabBtn id="admin" label="🛡️ Admin Panel" />}
        </div>
 
        {/* BROWSE */}
        {tab === "browse" && (
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
                          {matches > 0 ? `${matches} buyer${matches > 1 ? "s" : ""} in your network match this` : "Posted " + d.postedDate}
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
        )}
 
        {/* POST A DEAL */}
        {tab === "post" && (
          <div>
            <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
              <Field label="Your Name" value={dealForm.wholesalerName} onChange={setDF("wholesalerName")} placeholder="Jane Smith" />
              <Field label="Property Address" value={dealForm.address} onChange={setDF("address")} placeholder="123 Main St" />
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                <Field label="City" value={dealForm.city} onChange={setDF("city")} placeholder="Atlanta" />
                <Field label="State" value={dealForm.state} onChange={setDF("state")} placeholder="GA" />
                <Field label="Zip" value={dealForm.zip} onChange={setDF("zip")} placeholder="30309" />
              </div>
              <Select label="Property Type" value={dealForm.propertyType} onChange={setDF("propertyType")} options={PROPERTY_TYPES} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <Field label="Purchase Price" value={dealForm.price} onChange={setDF("price")} placeholder="100000" prefix="$" />
                <Field label="ARV" value={dealForm.arv} onChange={setDF("arv")} placeholder="200000" prefix="$" />
                <Field label="Est. Repairs" value={dealForm.repairs} onChange={setDF("repairs")} placeholder="30000" prefix="$" />
              </div>
              <Field label="Description" value={dealForm.description} onChange={setDF("description")} placeholder="Title status, condition, motivation, anything a buyer needs to know" textarea />
              <Field label="Your Contact Info" value={dealForm.contact} onChange={setDF("contact")} placeholder="Phone or email buyers can reach you at" />
            </div>
            <div style={{ background: PAL.goldTint, border: `1px solid ${PAL.gold}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color: PAL.gold, fontWeight: 600 }}>
              Deals are reviewed manually before being marked "Verified." Yours will show as Pending until then.
            </div>
            <Btn primary disabled={!dealForm.wholesalerName || !dealForm.address || !dealForm.price} onClick={submitDeal} style={{ width: "100%", padding: "13px 0" }}>
              {posted ? "✓ Deal Posted" : "Post Deal"}
            </Btn>
          </div>
        )}
 
        {/* BUY BOX */}
        {tab === "buybox" && (
          <div>
            <div style={{ color: PAL.muted, fontSize: 13.5, marginBottom: 20, lineHeight: 1.5 }}>
              Set your criteria once. Deals that match your buy box will be flagged automatically in the feed.
            </div>
            <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
              <Field label="Your Name / Company" value={buyerForm.name} onChange={setBF("name")} placeholder="Jane Smith Investments" />
              <Field label="Markets You Buy In" value={buyerForm.markets} onChange={setBF("markets")} placeholder="Atlanta, 30309, GA — comma separated" />
              <Field label="Max Purchase Price" value={buyerForm.maxPrice} onChange={setBF("maxPrice")} placeholder="150000" prefix="$" />
              <div>
                <label style={labelBase}>Property Types</label>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: PAL.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                  {buyers.length} buyer{buyers.length > 1 ? "s" : ""} active on the platform
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN PANEL VIEW */}
        {isAdmin && tab === "admin" && (
          <div style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontFamily: SERIF, marginTop: 0, marginBottom: 16 }}>Pending Verifications</h3>
            {deals.filter(d => !d.verified).length === 0 ? (
              <div style={{ color: PAL.muted, fontSize: 14 }}>All clean! No deals are currently pending review.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {deals.filter(d => !d.verified).map(d => (
                  <div key={d.id} style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 7, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{d.address}</div>
                      <div style={{ fontSize: 12, color: PAL.muted }}>{d.city}, {d.state} · {fmt(d.price)}</div>
                    </div>
                    <Btn primary onClick={() => toggleVerifyDeal(d.id, d.verified)} style={{ padding: "6px 12px", fontSize: 12 }}>
                      Approve
                    </Btn>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
