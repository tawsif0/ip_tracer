import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "https://api.cleanpc.xyz";

export default function Redirect() {
  const { shortCode } = useParams();

  useEffect(() => {
    // Immediate redirect without timer
    window.location.replace(
      `${API_BASE}/api/links/${encodeURIComponent(shortCode)}`
    );
  }, [shortCode]);

  // Return null for completely blank page
  return null;
}
