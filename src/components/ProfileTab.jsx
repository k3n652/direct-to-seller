import { useState } from "react";
import { PAL, SANS } from "../theme";
import { Field, Btn } from "./ui";

export default function ProfileTab({ user, userRole, onLogout, onChangeEmail, onResetPassword }) {
  const [newEmail, setNewEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState(null);
  const [emailSaving, setEmailSaving] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);
  const [resetSending, setResetSending] = useState(false);

  const submitEmailChange = async () => {
    if (!newEmail) return;
    setEmailSaving(true);
    setEmailMsg(null);
    const result = await onChangeEmail(newEmail);
    setEmailMsg(result);
    if (result.ok) setNewEmail("");
    setEmailSaving(false);
  };

  const submitReset = async () => {
    setResetSending(true);
    setResetMsg(null);
    const result = await onResetPassword();
    setResetMsg(result);
    setResetSending(false);
  };

  const sectionStyle = { background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 12, padding: 18, marginBottom: 14 };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: PAL.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 };
  const msgStyle = (ok) => ({ fontSize: 12.5, fontWeight: 600, marginTop: 8, color: ok ? PAL.emerald : PAL.brick });

  return (
    <div>
      {/* Account overview */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Account</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{user.email || "Google Account"}</div>
        <div style={{ display: "inline-block", background: PAL.emeraldTint, color: PAL.emerald, fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize" }}>
          {userRole || "No role set"}
        </div>
      </div>

      {/* Change email */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Change Email</div>
        <div style={{ color: PAL.muted, fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
          Update the email address tied to your account.
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Field label="New Email Address" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="newemail@domain.com" />
          </div>
          <Btn primary disabled={!newEmail || emailSaving} onClick={submitEmailChange} style={{ padding: "10px 18px" }}>
            {emailSaving ? "Saving…" : "Update"}
          </Btn>
        </div>
        {emailMsg && <div style={msgStyle(emailMsg.ok)}>{emailMsg.message}</div>}
      </div>

      {/* Reset password */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Password</div>
        <div style={{ color: PAL.muted, fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
          We'll email you a secure link to set a new password.
        </div>
        <Btn disabled={resetSending} onClick={submitReset} style={{ border: `1px solid ${PAL.paperBorder}` }}>
          {resetSending ? "Sending…" : "Send Password Reset Email"}
        </Btn>
        {resetMsg && <div style={msgStyle(resetMsg.ok)}>{resetMsg.message}</div>}
      </div>

      {/* Log out */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Session</div>
        <div style={{ color: PAL.muted, fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
          Sign out of DirectToSeller on this device.
        </div>
        <Btn onClick={onLogout} style={{ background: PAL.brick, color: "#fff", border: "none" }}>
          Log Out
        </Btn>
      </div>
    </div>
  );
}
