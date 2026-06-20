import { PAL, SANS } from "../theme";

export const inputBase = {
  background: "#fff", border: `1px solid ${PAL.paperBorder}`, borderRadius: 7,
  color: PAL.ink, fontSize: 14.5, padding: "10px 12px", width: "100%",
  outline: "none", boxSizing: "border-box", fontFamily: SANS,
};

export const labelBase = {
  color: PAL.muted, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SANS,
};

export function Seal({ size = 40, status = "pending", color }) {
  const c = color || (status === "verified" ? PAL.emerald : PAL.gold);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="16" fill={c} />
      {status === "verified" ? (
        <path d="M9.5 16.5l4 4 9-9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
          <line x1="16" y1="16" x2="16" y2="9" />
          <line x1="16" y1="16" x2="21" y2="19" />
        </g>
      )}
    </svg>
  );
}

export function Field({ label, value, onChange, placeholder, prefix, type = "text", textarea }) {
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

export function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <select value={value} onChange={onChange} style={{ ...inputBase, cursor: "pointer" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function Btn({ onClick, children, primary, disabled, type, style = {} }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      padding: "11px 18px", borderRadius: 8, border: primary ? "none" : `1px solid ${PAL.paperBorder}`,
      background: disabled ? "#eee" : primary ? PAL.emerald : "#fff",
      color: disabled ? "#999" : primary ? "#fff" : PAL.ink,
      fontWeight: 700, fontSize: 13.5, fontFamily: SANS, cursor: disabled ? "not-allowed" : "pointer",
      transition: "opacity 0.15s", ...style,
    }}>{children}</button>
  );
}
