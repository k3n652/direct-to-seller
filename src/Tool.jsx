import { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, query, orderBy,
  updateDoc, doc, where, getDoc, setDoc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, onAuthStateChanged,
  sendPasswordResetEmail, updateEmail,
} from "firebase/auth";

import { db, auth, googleProvider } from "./firebase";
import { PAL, SERIF, SANS, THIRTY_DAYS_MS } from "./theme";
import { Seal } from "./components/ui";
import { Gated } from "./components/Auth";
import ProfileTab from "./components/ProfileTab";

import BrowseTab from "./components/BrowseTab";
import PostTab from "./components/PostTab";
import BuyBoxTab from "./components/BuyBoxTab";
import AdminTab from "./components/AdminTab";

const EMPTY_DEAL = { wholesalerName: "", address: "", city: "", state: "", zip: "", price: "", arv: "", repairs: "", propertyType: "Single Family", description: "", contact: "", photoUrl: "", contractLink: "", beds: "", baths: "", sqft: "", lotSize: "" };
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

  // Auth session sync + fetch user role profile doc
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

  // Global feeds — load regardless of login, browsing is open to everyone
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

  const submitDeal = async () => {
    if (!user || !dealForm.wholesalerName || !dealForm.address || !dealForm.price || !dealForm.contractLink) return;
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

  const togglePropType = (t) => setBuyerForm((p) => ({
    ...p, propertyTypes: p.propertyTypes.includes(t) ? p.propertyTypes.filter((x) => x !== t) : [...p.propertyTypes, t],
  }));

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

  // Filter logic including the 30-day auto-hide feature
  const handleChangeEmail = async (newEmail) => {
    if (!user) return { ok: false, message: "Not signed in." };
    try {
      await updateEmail(user, newEmail);
      return { ok: true, message: "Email updated." };
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        return { ok: false, message: "For security, log out and back in, then try again." };
      }
      return { ok: false, message: err.message.replace("Firebase: ", "") };
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return { ok: false, message: "No email on this account." };
    try {
      await sendPasswordResetEmail(auth, user.email);
      return { ok: true, message: `Reset link sent to ${user.email}.` };
    } catch (err) {
      return { ok: false, message: err.message.replace("Firebase: ", "") };
    }
  };

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

  return (
    <div style={{ background: PAL.bg, minHeight: "100vh", fontFamily: SANS, color: PAL.ink }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 60px" }}>

        {/* Top Header navbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Seal size={44} status="verified" />
            <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>DirectToSeller</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user && (
              <button onClick={() => signOut(auth)} style={{
                background: PAL.emerald, border: "none", color: "#fff", fontSize: 12.5, fontWeight: 700,
                cursor: "pointer", padding: "7px 14px", borderRadius: 8, fontFamily: SANS,
              }}>
                Log out
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
          Off-market deals and cash buyers, without the Facebook noise.
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${PAL.paperBorder}`, marginBottom: 28 }}>
          <TabBtn id="browse" label={`Browse Deals (${filteredDeals.length})`} />
          <TabBtn id="post" label="Post a Deal" />
          <TabBtn id="buybox" label="My Buy Box" />
          {user && <TabBtn id="profile" label="Profile" />}
          {isAdmin && <TabBtn id="admin" label="🛡️ Admin Panel" />}
        </div>

        {/* Tab content */}
        {tab === "browse" && (
          <BrowseTab
            filteredDeals={filteredDeals} loading={loading} buyers={buyers} myBuyBoxes={myBuyBoxes}
            userRole={userRole} isAdmin={isAdmin} toggleVerifyDeal={toggleVerifyDeal}
            filters={filters} setFilters={setFilters} revealedContact={revealedContact} setRevealedContact={setRevealedContact}
          />
        )}

        {tab === "post" && (
          <Gated
            contextLabel="post a deal"
            authLoading={authLoading} user={user} userRole={userRole}
            authMode={authMode} setAuthMode={setAuthMode}
            email={email} setEmail={setEmail} password={password} setPassword={setPassword}
            authError={authError} onSubmit={handleEmailAuth} onGoogle={handleGoogleAuth}
            onSelectRole={saveRole} roleSaving={roleSaving}
          >
            <PostTab dealForm={dealForm} setDealForm={setDealForm} submitDeal={submitDeal} posted={posted} />
          </Gated>
        )}

        {tab === "buybox" && (
          <Gated
            contextLabel="set up your buy box"
            authLoading={authLoading} user={user} userRole={userRole}
            authMode={authMode} setAuthMode={setAuthMode}
            email={email} setEmail={setEmail} password={password} setPassword={setPassword}
            authError={authError} onSubmit={handleEmailAuth} onGoogle={handleGoogleAuth}
            onSelectRole={saveRole} roleSaving={roleSaving}
          >
            <BuyBoxTab
              buyerForm={buyerForm} setBuyerForm={setBuyerForm} togglePropType={togglePropType}
              submitBuyer={submitBuyer} profileSaved={profileSaved} buyers={myBuyBoxes}
            />
          </Gated>
        )}

        {tab === "profile" && user && (
          <ProfileTab
            user={user} userRole={userRole}
            onLogout={() => signOut(auth)}
            onChangeEmail={handleChangeEmail}
            onResetPassword={handleResetPassword}
          />
        )}

        {tab === "admin" && isAdmin && (
          <AdminTab deals={deals} toggleVerifyDeal={toggleVerifyDeal} />
        )}

      </div>
    </div>
  );
}
