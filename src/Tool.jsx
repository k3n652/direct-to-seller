import { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, query, orderBy,
  updateDoc, doc, where, getDoc, setDoc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, onAuthStateChanged,
} from "firebase/auth";

import { db, auth, googleProvider } from "./firebase";
import { PAL, SERIF, SANS, fmt, PROPERTY_TYPES, THIRTY_DAYS_MS, matchCount } from "./theme";
import { Seal, Field, Select, Btn, labelBase } from "./components/ui";
import { AuthInline, RoleSelect } from "./components/Auth";

const EMPTY_DEAL = { wholesalerName: "", address: "", city: "", state: "", zip: "", price: "", arv: "", repairs: "", propertyType: PROPERTY_TYPES[0], description: "", contact: "" };
const EMPTY_BUYER = { name: "", markets: "", maxPrice: "", propertyTypes: [], contact: "" };

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleSaving, setRoleSaving] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState("browse");
  const [deals, setDeals] = useState([]);
  const [buyers, setBuyers] = useState([]); // ALL buyers — used for match counts in Browse
  const [myBuyBoxes, setMyBuyBoxes] = useState([]); // just the logged-in user's own buy boxes
  const [loading, setLoading] = useState(true);
  const [dealForm, setDealForm] = useState(EMPTY_DEAL);
  const [buyerForm, setBuyerForm] = useState(EMPTY_BUYER);
  const [posted, setPosted] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [filters, setFilters] = useState({ state: "", maxPrice: "", propertyType: "All" });
  const [revealedContact, setRevealedContact] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState("");

  // Auth state + fetch role doc
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          setUserRole(snap.exists() ? snap.data().role : null);
        } catch {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // Public data — deals + all buyers, loads regardless of login (browsing is open to everyone)
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

  // Your own buy boxes — only needed once logged in
  useEffect(() => {
    if (!user) { setMyBuyBoxes([]); return; }
    const myQuery = query(collection(db, "buyers"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(myQuery, (snap) => {
      setMyBuyBoxes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const setDF = (k) => (e) => setDealForm((p) => ({ ...p, [k]: e.target.value }));
  const setBF = (k) => (e) => setBuyerForm((p) => ({ ...p, [k]: e.target.value }));
  const togglePropType = (t) => setBuyerForm((p) => ({
    ...p, propertyTypes: p.propertyTypes.includes(t) ? p.propertyTypes.filter((x) => x !== t) : [...p.propertyTypes, t],
  }));

  const submitDeal = async () => {
    if (!user || !dealForm.wholesalerName || !dealForm.address || !dealForm.price) return;
    await addDoc(collection(db, "deals"), {
      ...dealForm, userId: user.uid, postedDate: new Date().toLocaleDateString(), verified: false, createdAt: Date.now(),
    });
    setDealForm(EMPTY_DEAL);
    setPosted(true);
    setTimeout(() => setPosted(false), 2500);
  };

  const submitBuyer = async () => {
    if (!user || !buyerForm.name || !buyerForm.markets) return;
    await addDoc(collection(db, "buyers"), {
      ...buyerForm, userId: user.uid, postedDate: new Date().toLocaleDateString(), createdAt: Date.now(),
    });
    setBuyerForm(EMPTY_BUYER);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const toggleVerifyDeal = async (id, currentStatus) => {
    await updateDoc(doc(db, "deals", id), { verified: !currentStatus });
  };

  const saveRole = async (role) => {
    if (!user) return;
    setRoleSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { role, email: user.email || "", createdAt: Date.now() });
      setUserRole(role);
    } finally {
      setRoleSaving(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (authMode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err.message.replace("Firebase: ", ""));
    }
  };

  // Browse feed: filters + 30-day auto-hide for stale listings
  const filteredDeals = deals.filter((d) => {
    const notExpired = !d.createdAt || (Date.now() - d.createdAt < THIRTY_DAYS_MS);
    const stateOk = !filters.state || (d.state || "").toLowerCase().includes(filters.state.toLowerCase());
    const priceOk = !filters.maxPrice || Number(d.price) <= Number(filters.maxPrice);
    const typeOk = filters.propertyType === "All" || d.propertyType === filters.propertyType;
    return notExpired && stateOk && priceOk && typeOk;
  });

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
      borderBottom: tab === id ? `2px solid ${PAL.emerald}` : "2px solid transparent",
      color: tab === id ? PAL.emeraldDark : PAL.muted,
      fontWeight: 700, fontSize: 14, fontFamily: SANS, transition: "all 0.15s",
    }}>{label}</button>
  );

  // Gated tab content: not logged in -> auth form; logged in w/o role -> role picker; else -> children
  const Gated = ({ contextLabel, children }) => {
    if (authLoading) return <div style={{ color: PAL.muted, textAlign: "center", padding: 40 }}>Checking session…</div>;
    if (!user) {
      return (
        <AuthInline
          contextLabel={contextLabel}
          authMode={authMode} setAuthMode={setAuthMode}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          authError={authError}
          onSubmit={handleEmailAuth}
          onGoogle={handleGoogleAuth}
        />
      );
    }
    if (!userRole) return <RoleSelect onSelect={saveRole} saving={roleSaving} />;
    return children;
  };

  return (
    <div style={{ background: PAL.bg, minHeight: "100vh", fontFamily: SANS, color: PAL.ink }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Seal size={44} status="verified" />
            <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>DirectToSeller</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user && (
              <button onClick={() => signOut(auth)} style={{ background: "none", border: "none", color: PAL.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                Sign Out ({user.email ? user.email.split("@")[0] : "Google User"})
              </button>
            )}
            {!isAdmin && (
              <input
                type="password" placeholder="Admin" value={passInput}
                onChange={(e) => {
                  setPassInput(e.target.value);
                  if (e.target.value === "apprehension") { setIsAdmin(true); setPassInput(""); }
                }}
                style={{ width: 80, fontSize: 10, border: "none", background: "transparent", textAlign: "right", color: PAL.paperBorder, outline: "none" }}
              />
            )}
          </div>
        </div>
        <div style={{ color: PAL.muted, fontSize: 14.5, marginBottom: 28, maxWidth: 480, lineHeight: 1.5 }}>
          Off-market deals and cash buyers, without the Facebook noise. No daisy chains, no bots, no guessing on the numbers.
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${PAL.paperBorder}`, marginBottom: 28 }}>
          <TabBtn id="browse" label={`Browse Deals (${filteredDeals.length})`} />
          <TabBtn id="post" label="Post a Deal" />
          <TabBtn id="buybox" label="My Buy Box" />
          {isAdmin && <TabBtn id="admin" label="🛡️ Admin Panel" />}
        </div>

        {/* BROWSE — open to everyone, no login required */}
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

        {/* POST A DEAL — gated */}
        {tab === "post" && (
          <Gated contextLabel="post a deal">
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
                Deals are reviewed manually before being marked "Verified." Yours will show as Pending until then. Listings auto-hide from the feed after 30 days.
              </div>
              <Btn primary disabled={!dealForm.wholesalerName || !dealForm.address || !dealForm.price} onClick={submitDeal} style={{ width: "100%", padding: "13px 0" }}>
                {posted ? "✓ Deal Posted" : "Post Deal"}
              </Btn>
            </div>
          </Gated>
        )}

        {/* MY BUY BOX — gated */}
        {tab === "buybox" && (
          <Gated contextLabel="set up your buy box">
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

              {myBuyBoxes.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: PAL.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
                    Your Active Buy Box Profile
                  </div>
                  {myBuyBoxes.map((b) => (
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
          </Gated>
        )}

        {/* ADMIN PANEL */}
        {isAdmin && tab === "admin" && (
          <div style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontFamily: SERIF, marginTop: 0, marginBottom: 16 }}>Pending Verifications</h3>
            {deals.filter((d) => !d.verified).length === 0 ? (
              <div style={{ color: PAL.muted, fontSize: 14 }}>All clean! No deals are currently pending review.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {deals.filter((d) => !d.verified).map((d) => (
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
