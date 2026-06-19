import { PAL, SERIF, SANS } from "../theme";
import { Field, Btn } from "./ui";

export function AuthInline({ contextLabel, authMode, setAuthMode, email, setEmail, password, setPassword, authError, onSubmit, onGoogle }) {
  return (
    <div style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 12, padding: "28px 24px", maxWidth: 380, margin: "0 auto" }}>
      <h3 style={{ fontFamily: SERIF, fontSize: 18, margin: "0 0 6px" }}>
        {authMode === "login" ? "Sign in to continue" : "Create your free account"}
      </h3>
      <div style={{ color: PAL.muted, fontSize: 13, marginBottom: 18 }}>
        You'll need an account to {contextLabel}. Browsing deals doesn't require one.
      </div>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <Field label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {authError && <div style={{ color: PAL.brick, fontSize: 12.5, fontWeight: 600 }}>{authError}</div>}
        <Btn primary type="submit" style={{ width: "100%", marginTop: 4 }}>
          {authMode === "login" ? "Sign In" : "Sign Up"}
        </Btn>
      </form>
      <div style={{ display: "flex", alignItems: "center", margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: PAL.paperBorder }} />
        <span style={{ padding: "0 10px", fontSize: 12, color: PAL.muted, fontWeight: 600 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: PAL.paperBorder }} />
      </div>
      <button onClick={onGoogle} type="button" style={{
        width: "100%", padding: "11px 0", borderRadius: 8, border: `1px solid ${PAL.paperBorder}`,
        background: "#fff", color: PAL.ink, fontWeight: 700, fontSize: 13.5, fontFamily: SANS, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.25h2.9c1.69-1.55 2.69-3.83 2.69-6.58z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.25c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.58-5.05-3.71H.95v2.32C2.43 15.98 5.46 18 9 18z" fill="#34A853" />
          <path d="M3.95 10.72A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.17.25-1.72V4.96H.95A8.99 8.99 0 0 0 0 9c0 1.51.37 2.96 1.02 4.25l2.93-2.53z" fill="#FBBC05" />
          <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.96 11.42 0 9 0 5.46 0 2.43 2.02.95 4.96l2.93 2.32C4.66 5.16 6.65 3.58 9 3.58z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: PAL.muted }}>
        {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
        <span onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} style={{ color: PAL.emerald, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
          {authMode === "login" ? "Sign up free" : "Log in"}
        </span>
      </div>
    </div>
  );
}

export function RoleSelect({ onSelect, saving }) {
  return (
    <div style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 12, padding: "28px 24px", maxWidth: 380, margin: "0 auto", textAlign: "center" }}>
      <h3 style={{ fontFamily: SERIF, fontSize: 18, margin: "0 0 6px" }}>One last thing</h3>
      <div style={{ color: PAL.muted, fontSize: 13, marginBottom: 20 }}>Are you here to post deals or find them?</div>
      <div style={{ display: "grid", gap: 10 }}>
        <Btn primary disabled={saving} onClick={() => onSelect("wholesaler")} style={{ width: "100%", padding: "12px 0" }}>
          I'm a Wholesaler — I post deals
        </Btn>
        <Btn disabled={saving} onClick={() => onSelect("buyer")} style={{ width: "100%", padding: "12px 0" }}>
          I'm a Buyer — I'm looking for deals
        </Btn>
      </div>
    </div>
  );
}
