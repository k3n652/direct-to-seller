import { PAL } from "../theme";
import { Field, Select, Btn } from "./ui";

const PROPERTY_TYPES = ["Single Family", "Multifamily", "Land", "Townhome/Condo", "Mixed Use"];

export default function PostTab({ dealForm, setDealForm, submitDeal, posted }) {
  const setDF = (k) => (e) => setDealForm((p) => ({ ...p, [k]: e.target.value }));
  const canPost = dealForm.wholesalerName && dealForm.address && dealForm.price && dealForm.contractLink;

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
          <Field label="Purchase Price" value={dealForm.price} onChange={setDF("price")} placeholder="100000" prefix="$" />
          <Field label="ARV" value={dealForm.arv} onChange={setDF("arv")} placeholder="200000" prefix="$" />
          <Field label="Est. Repairs" value={dealForm.repairs} onChange={setDF("repairs")} placeholder="30000" prefix="$" />
        </div>
        <Field label="Photo Link" value={dealForm.photoUrl} onChange={setDF("photoUrl")} placeholder="Link to a photo of the property (Imgur, Drive, etc.)" />
        <Field label="Description" value={dealForm.description} onChange={setDF("description")} placeholder="Title status, condition, motivation, anything a buyer needs to know" textarea />
        <Field label="Your Contact Info" value={dealForm.contact} onChange={setDF("contact")} placeholder="Phone or email buyers can reach you at" />
        <Field label="Contract Link (required)" value={dealForm.contractLink} onChange={setDF("contractLink")} placeholder="Link to your signed purchase agreement, redacted is fine" />
      </div>

      <div style={{ background: PAL.goldTint, border: `1px solid ${PAL.gold}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color: PAL.gold, fontWeight: 600 }}>
        A contract link is required to post. Deals are reviewed manually before being marked "Verified" — yours will show as Pending until then.
      </div>

      <Btn primary disabled={!canPost} onClick={submitDeal} style={{ width: "100%", padding: "13px 0" }}>
        {posted ? "✓ Deal Posted" : "Post Deal"}
      </Btn>
    </div>
  );
}
