import React from "react";
import { PAL } from "../theme";
import { Field, Select, Btn } from "./ui";

const PROPERTY_TYPES = ["Single Family", "Multifamily", "Land", "Townhome/Condo", "Mixed Use"];

export default function PostTab({ dealForm, setDealForm, submitDeal, posted }) {
  const setDF = (k) => (e) => setDealForm((p) => ({ ...p, [k]: e.target.value }));

  return (
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
          <Field label="Beds" value={dealForm.beds || ""} onChange={setDF("beds")} placeholder="3" type="number" />
          <Field label="Baths" value={dealForm.baths || ""} onChange={setDF("baths")} placeholder="2" type="number" />
          <Field label="Sq. Ft." value={dealForm.sqft || ""} onChange={setDF("sqft")} placeholder="1800" type="number" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Field label="Purchase Price" value={dealForm.price} onChange={setDF("price")} placeholder="100000" prefix="$" type="number" />
          <Field label="ARV" value={dealForm.arv} onChange={setDF("arv")} placeholder="200000" prefix="$" type="number" />
          <Field label="Est. Repairs" value={dealForm.repairs} onChange={setDF("repairs")} placeholder="30000" prefix="$" type="number" />
        </div>

        <Field label="Property Photos Link (Google Drive, Zillow, etc.)" value={dealForm.photoLink || ""} onChange={setDF("photoLink")} placeholder="https://..." />
        <Field label="Signed Contract Link (Required for Verification)" value={dealForm.contractLink || ""} onChange={setDF("contractLink")} placeholder="https://..." />
        
        <Field label="Description" value={dealForm.description} onChange={setDF("description")} placeholder="Condition, motivation, occupancy status..." textarea />
        <Field label="Your Contact Info" value={dealForm.contact} onChange={setDF("contact")} placeholder="Phone or email" />
      </div>

      <div style={{ background: PAL.goldTint, border: `1px solid ${PAL.gold}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color: PAL.gold, fontWeight: 600 }}>
        Deals are reviewed manually. Ensure your contract link is accessible to admins.
      </div>

      <Btn 
        primary 
        disabled={!dealForm.wholesalerName || !dealForm.address || !dealForm.price || !dealForm.contractLink} 
        onClick={submitDeal} 
        style={{ width: "100%", padding: "13px 0" }}
      >
        {posted ? "✓ Deal Posted" : "Post Deal"}
      </Btn>
    </div>
  );
}
