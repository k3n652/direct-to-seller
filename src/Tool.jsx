import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase"; 
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { collection, doc, updateDoc, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { PAL, SANS, matchCount } from "./theme";
import BrowseTab from "./components/BrowseTab";
import PostTab from "./components/PostTab";
import AdminTab from "./components/AdminTab";
import ProfileTab from "./components/ProfileTab";
import BuyBoxTab from "./components/BuyBoxTab"; 

const EMPTY_DEAL = { 
  wholesalerName: "", address: "", city: "", state: "", zip: "", 
  price: "", arv: "", repairs: "", propertyType: "Single Family", 
  beds: "", baths: "", sqft: "",
  description: "", contact: "", 
  photoLink: "", contractLink: "" 
};

export default function Tool({ user, authLoading, userRole, profileData, deals, buyers, myBuyBoxes, isAdmin }) {
  const [tab, setTab] = useState("browse");
  const [dealForm, setDealForm] = useState(EMPTY_DEAL);
  const [posted, setPosted] = useState(false);
  const [filters, setFilters] = useState({ state: "", maxPrice: "", propertyType: "All" });
  const [revealedContact, setRevealedContact] = useState(null);

  // --- SAFETY FIX START ---
  // If deals haven't loaded yet, return a simple loading message.
  // This prevents the TypeError from "Screenshot 2026-06-19 9.13.14 PM.png"
  if (!deals) {
    return <div style={{ padding: "40px", textAlign: "center", color: PAL.muted }}>Loading dashboard...</div>;
  }
  // --- SAFETY FIX END ---

  useEffect(() => {
    if (tab === "browse") {
      localStorage.setItem("lastViewedDeals", Date.now().toString());
    }
  }, [tab]);

  const submitDeal = async (e) => {
    e.preventDefault();
    if (!dealForm.wholesalerName || !dealForm.address || !dealForm.price || !dealForm.contractLink) return;
    await addDoc(collection(db, "deals"), { 
      ...dealForm, 
      uid: user.uid, 
      verified: false, 
      createdAt: serverTimestamp() 
    });
    setPosted(true);
    setTimeout(() => { setDealForm(EMPTY_DEAL); setPosted(false); setTab("browse"); }, 2000);
  };

  const toggleVerifyDeal = async (id, currentStatus) => {
    await updateDoc(doc(db, "deals", id), { verified: !currentStatus });
  };

  const handleUpdateProfile = async (updates) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  };

  const handleSendPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const handleSignOut = () => signOut(auth);

  // Now safe because we verified deals exists above
  const filteredDeals = deals.filter(d => {
    if (!isAdmin && !d.verified) return false;
    if (filters.state && d.state.toLowerCase() !== filters.state.toLowerCase()) return false;
    if (filters.maxPrice && Number(d.price) > Number(filters.maxPrice)) return false;
    if (filters.propertyType !== "All" && d.propertyType !== filters.propertyType) return false;
    return true;
  });

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
      borderBottom: tab === id ? `2px solid ${PAL.emerald}` : "2px solid transparent",
      color: tab === id ? PAL.emeraldDark : PAL.muted,
      fontWeight: 700, fontSize: 14, fontFamily: SANS, transition: "all 0.15s"
    }}>
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 14px", fontFamily: SANS }}>
      
      {/* Top Navigation */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${PAL.paperBorder}`, marginBottom: 28, overflowX: "auto", whiteSpace: "nowrap" }}>
        <TabBtn id="browse" label={`Browse Deals (${filteredDeals.length})`} />
        <TabBtn id="post" label="Post a Deal" />
        
        <button onClick={() => setTab("buybox")} style={{
          padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
          borderBottom: tab === "buybox" ? `2px solid ${PAL.emerald}` : "2px solid transparent",
          color: tab === "buybox" ? PAL.emeraldDark : PAL.muted,
          fontWeight: 700, fontSize: 14, fontFamily: SANS, transition: "all 0.15s",
          display: "flex", alignItems: "center", gap: 6
        }}>
          My Buy Box
          {userRole === "buyer" && filteredDeals.some(d => {
            const lastViewed = Number(localStorage.getItem("lastViewedDeals") || 0);
            const isNew = d.createdAt?.toMillis() > lastViewed;
            const matchesBox = myBuyBoxes.some(b => matchCount(d, [b]) > 0);
            return isNew && matchesBox;
          }) && (
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: PAL.brick, display: "inline-block" }} />
          )}
        </button>
        
        <TabBtn id="profile" label="Profile" />
        {isAdmin && <TabBtn id="admin" label="🛡️ Admin" />}
      </div>

      {/* Tab Content */}
      {tab === "browse" && <BrowseTab filters={filters} setFilters={setFilters} filteredDeals={filteredDeals} buyers={buyers} myBuyBoxes={myBuyBoxes} userRole={userRole} isAdmin={isAdmin} toggleVerifyDeal={toggleVerifyDeal} revealedContact={revealedContact} setRevealedContact={setRevealedContact} />}
      {tab === "post" && <PostTab dealForm={dealForm} setDealForm={setDealForm} submitDeal={submitDeal} posted={posted} />}
      {tab === "buybox" && <BuyBoxTab />} 
      {tab === "profile" && <ProfileTab user={user} userRole={userRole} profileData={profileData} onUpdateProfile={handleUpdateProfile} onSendPasswordReset={handleSendPasswordReset} onSignOut={handleSignOut} />}
      {tab === "admin" && <AdminTab deals={deals} toggleVerifyDeal={toggleVerifyDeal} />}
    </div>
  );
}
