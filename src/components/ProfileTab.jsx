import React, { useState } from "react";
import { PAL, SERIF } from "../theme";
import { Field, Btn } from "./ui";

export default function ProfileTab({ user, userRole, profileData, onUpdateProfile, onSendPasswordReset, onSignOut }) {
  const [name, setName] = useState(profileData?.name || "");
  const [contact, setContact] = useState(profileData?.contact || "");
  const [saving, setSaving] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdateProfile({ name, contact });
    setSaving(false);
  };

  const handleReset = async () => {
    await onSendPasswordReset(user.email);
    setResetSent(true);
  };

  return (
    <div style={{ maxWidth: 540, margin: "0 auto" }}>
      
      {/* Public Profile Settings */}
      <div style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: SERIF, marginTop: 0, marginBottom: 16 }}>Public Profile</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <Field label="Display Name / Company" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith Investments" />
          <Field label="Default Contact Info" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or Email" />
          <Btn primary onClick={handleSave} disabled={saving || (!name && !contact)} style={{ width: "fit-content", padding: "8px 16px" }}>
            {saving ? "Saving..." : "Save Changes"}
          </Btn>
        </div>
      </div>

      {/* Account & Security */}
      <div style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: SERIF, marginTop: 0, marginBottom: 16 }}>Account & Security</h3>
        <div style={{ fontSize: 13, color: PAL.ink, marginBottom: 16, lineHeight: 1.5 }}>
          <div style={{ marginBottom: 4 }}><strong>Email:</strong> {user?.email}</div>
          <div><strong>Role:</strong> <span style={{ textTransform: "capitalize", color: PAL.emerald, fontWeight: 700 }}>{userRole}</span></div>
        </div>
        <Btn onClick={handleReset} disabled={resetSent} style={{ fontSize: 12.5 }}>
          {resetSent ? "✓ Reset Link Sent to Email" : "Send Password Reset Email"}
        </Btn>
      </div>

      {/* Danger Zone */}
      <div style={{ background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: 24 }}>
        <Btn onClick={onSignOut} style={{ width: "100%", color: PAL.brick, borderColor: `${PAL.brick}55` }}>
          Sign Out
        </Btn>
      </div>

    </div>
  );
}
