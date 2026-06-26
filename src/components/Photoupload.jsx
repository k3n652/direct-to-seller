import { useState } from "react";
import { PAL, SANS } from "../theme";
import { Btn } from "./ui";

// Fill these in from your Cloudinary dashboard:
// 1. Cloud Name -> shown on your dashboard home page
// 2. Upload preset -> Settings (gear icon) -> Upload -> Upload presets -> Add upload preset -> Signing Mode: Unsigned -> Save
const CLOUDINARY_CLOUD_NAME = "doguuhrns";
const CLOUDINARY_UPLOAD_PRESET = "cloudman";

export default function PhotoUpload({ value, onUploaded, label = "Upload a photo" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        onUploaded(data.secure_url);
      } else {
        setError("Upload failed — try again.");
      }
    } catch {
      setError("Upload failed — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={value} alt="Uploaded" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: `1px solid ${PAL.paperBorder}` }} />
        <span style={{ fontSize: 12.5, color: PAL.emerald, fontWeight: 700 }}>Photo attached</span>
        <Btn onClick={() => onUploaded("")} style={{ fontSize: 12, padding: "6px 12px" }}>Remove</Btn>
      </div>
    );
  }

  return (
    <div>
      <label style={{
        display: "inline-block", padding: "9px 16px", borderRadius: 8, border: `1px dashed ${PAL.paperBorder}`,
        background: PAL.paper, color: PAL.muted, fontSize: 13, fontWeight: 600, cursor: uploading ? "default" : "pointer", fontFamily: SANS,
      }}>
        {uploading ? "Uploading…" : label}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} disabled={uploading} />
      </label>
      {error && <div style={{ color: PAL.brick, fontSize: 12, marginTop: 6, fontWeight: 600 }}>{error}</div>}
    </div>
  );
}
