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
};

const SERIF = "'Iowan Old Style', 'Source Serif Pro', Georgia, 'Times New Roman', serif";
const SANS = "'Inter', -apple-system, system-ui, sans-serif";

function Seal({ size = 40, status = "verified", color }) {
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

const PROBLEMS = [
  {
    title: "Garbage deals, every scroll",
    body: "Facebook groups are flooded with vague \"DM for details\" posts. Most don't list a real address, ARV, or repair estimate — so every lead costs you ten minutes just to find out it's not worth your time.",
  },
  {
    title: "Daisy-chained contracts",
    body: "A \"wholesaler\" posts a deal someone else already has under contract, tacks on an extra fee, and the numbers stop making sense. By the time you find out, you've wasted a week.",
  },
  {
    title: "Bots and ghosts",
    body: "Half the comments asking for your Proof of Funds aren't real buyers — they're spam accounts harvesting contact info, or wholesalers who never had a deal to begin with.",
  },
  {
    title: "Too slow to compete",
    body: "By the time a good deal clears the Facebook algorithm and reaches you, five other buyers already commented. Speed wins in this business, and group feeds aren't built for it.",
  },
];

const FEATURES = [
  {
    title: "Standardized deal sheets",
    body: "Every posted deal includes address, purchase price, ARV, repair estimate, and property type. No more messaging just to find out the basics.",
  },
  {
    title: "Verified by review",
    body: "Deals are checked before they're marked Verified. You'll always know which listings have been looked at and which are still pending.",
  },
  {
    title: "Buy box matching",
    body: "Set your markets, price range, and property type once. The feed flags which deals actually fit your criteria — no more manual filtering.",
  },
  {
    title: "Built for speed",
    body: "A clean feed beats a noisy group feed. See what's new, see what matches, reach out directly.",
  },
];

export default function Landing() {
  return (
    <div style={{ background: PAL.bg, minHeight: "100vh", fontFamily: SANS, color: PAL.ink }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Seal size={40} status="verified" />
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700 }}>DirectToSeller</div>
          </div>
          <a href="/app" style={{
            textDecoration: "none", padding: "9px 16px", borderRadius: 8,
            border: `1px solid ${PAL.paperBorder}`, color: PAL.ink,
            fontWeight: 700, fontSize: 13, fontFamily: SANS,
          }}>
            Launch App →
          </a>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: PAL.goldTint, color: PAL.gold, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 20, marginBottom: 20 }}>
            Now in early access
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 42, lineHeight: 1.15, margin: "0 0 18px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Off-market deals, without the Facebook noise.
          </h1>
          <p style={{ fontSize: 16.5, color: PAL.muted, lineHeight: 1.6, maxWidth: 540, margin: 0 }}>
            DirectToSeller connects wholesalers and cash buyers through standardized, reviewed deal sheets — no daisy chains, no bots, no guessing on the numbers.
          </p>
        </div>

        {/* Problem section */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: PAL.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>
            What's broken right now
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            {PROBLEMS.map((p) => (
              <div key={p.title} style={{ background: PAL.paper, border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                <div style={{ fontSize: 13.5, color: PAL.muted, lineHeight: 1.55 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Solution / Seal divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <Seal size={48} status="verified" />
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700 }}>Verified, direct to you</div>
            <div style={{ fontSize: 13.5, color: PAL.muted }}>One platform. Real deals. Real buyers.</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 56 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ border: `1px solid ${PAL.paperBorder}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 6, color: PAL.emeraldDark }}>{f.title}</div>
              <div style={{ fontSize: 13, color: PAL.muted, lineHeight: 1.55 }}>{f.body}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: PAL.emerald, borderRadius: 14, padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            Get early access
          </div>
          <div style={{ fontSize: 13.5, color: "#D7E6DF", marginBottom: 22, lineHeight: 1.5 }}>
            We're letting in a small group of wholesalers and buyers first. Join the list to get in early.
          </div>

          <iframe
            src="https://tally.so/r/5BODXd?transparentBackground=1"
            width="100%"
            height="220"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            title="Waitlist"
            style={{ borderRadius: 8 }}
          />
        </div>

        <div style={{ textAlign: "center", color: PAL.muted, fontSize: 12, marginTop: 28 }}>
          Built for wholesalers and cash buyers who'd rather close than scroll.
        </div>
      </div>
    </div>
  );
}
