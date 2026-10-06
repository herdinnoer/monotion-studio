import * as htmlToImage from "html-to-image";

// =========================================================================
// HELPER FUNCTIONS & MOOD DURATION MAP
// =========================================================================

// Durasi ideal 1 loop penuh (dalam ms) sesuai mood/state Mochi
export function getAnimationDurationByMood(mood = "idle") {
  const durationMap = {
    dancing: 800, // Animasi joget cepat (0.8s)
    greeting: 750, // Animasi melambai (0.75s)
    sleeping: 2400, // Animasi bernapas pelan & Zzz naik (2.4s)
    dizzy: 1200, // Animasi mata pusing memutar (1.2s)
    yawn: 2000, // Animasi menguap (2.0s)
    idle: 1600, // Animasi standar (1.6s)
    working: 1600,
    thinking: 1600,
    searching: 1600,
    approval: 1600,
    question: 1600,
    error: 1600,
    finished: 1600,
    rate_limit: 1600,
    love: 1600,
    surprised: 1600,
    proud: 1600,
    wink: 1600,
    annoyed: 1600,
    beanie: 1600,
    santa_hat: 1600,
    glasses: 1600,
  };

  return durationMap[mood] || 1600;
}

// Detect WebM / Video MimeType yang didukung browser
function getSupportedMimeType() {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp8",
    "video/webm;codecs=daala",
    "video/webm;codecs=h264",
    "video/webm",
    "video/mp4",
  ];

  for (const type of types) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }

  return "";
}

// Broadcast sinyal progress seek ke MochiMaster
function broadcastSeekProgress(progress0To1, durationMs = 1600) {
  window.dispatchEvent(
    new CustomEvent("mochi-timeline-update", {
      detail: {
        progress: progress0To1,
        isPlaying: false,
        isExporting: true,
        durationMs,
      },
    }),
  );
}

// Capture DOM dan skala ke Canvas tujuan secara terpusat
async function captureAndScaleToTarget(
  element,
  targetWidth,
  targetHeight,
  config = {},
) {
  const rawCanvas = await htmlToImage.toCanvas(element, {
    filter: (node) => node.tagName !== "SCRIPT",
    backgroundColor: null,
  });

  const destCanvas = document.createElement("canvas");
  destCanvas.width = targetWidth;
  destCanvas.height = targetHeight;
  const ctx = destCanvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, targetWidth, targetHeight);

  const isBgRemoved = config?.isBgRemoved;
  const bgColor = isBgRemoved ? null : config?.backgroundColor || "#f5f5f7";

  if (bgColor && bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  const srcWidth = rawCanvas.width;
  const srcHeight = rawCanvas.height;
  const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);

  const drawWidth = srcWidth * scale;
  const drawHeight = srcHeight * scale;
  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;

  ctx.drawImage(
    rawCanvas,
    0,
    0,
    srcWidth,
    srcHeight,
    offsetX,
    offsetY,
    drawWidth,
    drawHeight,
  );

  return destCanvas;
}

// Cleanup style pembeku setelah ekspor selesai
function cleanupWorkspaceAnimations(element, durationMs = 1600) {
  const styleEl = document.getElementById("timeline-step-style");
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }

  const wasPlaying = sessionStorage.getItem("mochi-was-playing") === "true";
  window.dispatchEvent(
    new CustomEvent("mochi-timeline-update", {
      detail: {
        progress: 0,
        isPlaying: wasPlaying,
        isExporting: false,
        durationMs,
      },
    }),
  );
}

// =========================================================================
// 1. EKSPOR KONFIGURASI JSON
// =========================================================================
export const exportAsJson = (
  character,
  config,
  filename = "character-config.json",
) => {
  const exportData = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    character,
    config,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData, null, 2),
  )}`;

  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// =========================================================================
// 2. EKSPOR GIF (DETERMINISTIC FRAME-BY-FRAME)
// =========================================================================
export const exportAsGif = async ({
  elementId = "character-workspace",
  resolution = "720p",
  frameRate = "30 fps",
  filename = "character-animation.gif",
  animationDuration,
  onProgress,
  config = {},
}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemen dengan ID "${elementId}" tidak ditemukan!`);
  }

  const GIFModule = await import("gif.js");
  const GIF = GIFModule.default || GIFModule;

  const mood = config?.mood || "idle";
  const durationMs = animationDuration || getAnimationDurationByMood(mood);

  const resolutionMap = {
    "240p": { width: 240, height: 240 },
    "360p": { width: 360, height: 360 },
    "480p": { width: 480, height: 480 },
    "720p": { width: 720, height: 720 },
  };

  const targetSize = resolutionMap[resolution] || resolutionMap["720p"];
  const fpsNumber = parseInt(frameRate, 10) || 30;

  const totalFrames = Math.round((durationMs / 1000) * fpsNumber);
  const playbackDelay = Math.round(1000 / fpsNumber);

  // ✅ FIX: Pause player IMMEDIATELY before starting export
  // This prevents race condition between export loop and player timeline
  window.dispatchEvent(
    new CustomEvent("mochi-timeline-update", {
      detail: {
        progress: 0,
        isPlaying: false, // ← PAUSE player
        isExporting: true,
        durationMs,
      },
    }),
  );

  // Wait for pause to take effect
  await new Promise((resolve) => setTimeout(resolve, 50));

  const gif = new GIF({
    workers: 2,
    quality: 1,
    workerScript: "/gif.worker.js",
    width: targetSize.width,
    height: targetSize.height,
    transparent: null,
  });

  try {
    for (let i = 0; i < totalFrames; i++) {
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalFrames) * 50));
      }

      const progress = i / totalFrames;

      // ✅ Keep paused during export
      broadcastSeekProgress(progress, durationMs);

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 16);
        });
      });

      const scaledCanvas = await captureAndScaleToTarget(
        element,
        targetSize.width,
        targetSize.height,
        config,
      );

      gif.addFrame(scaledCanvas, { copy: true, delay: playbackDelay });
    }
  } finally {
    // ✅ FIX: Always resume as paused (safe default)
    // User can click play button if they want to resume
    window.dispatchEvent(
      new CustomEvent("mochi-timeline-update", {
        detail: {
          progress: 0,
          isPlaying: false, // ← Leave paused
          isExporting: false,
          durationMs,
        },
      }),
    );
  }

  return new Promise((resolve, reject) => {
    gif.on("progress", (p) => {
      if (onProgress) {
        onProgress(50 + Math.round(p * 50));
      }
    });

    gif.on("finished", (blob) => {
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);

      if (onProgress) onProgress(100);
      resolve(true);
    });

    gif.on("error", (err) => {
      console.error("GIF.js Worker Error:", err);
      reject(new Error("Gagal mengompres file GIF."));
    });

    gif.render();
  });
};

// =========================================================================
// 3. EKSPOR STATIC SVG
// =========================================================================
export const exportAsSvg = async ({
  elementId = "character-workspace",
  filename = "character.svg",
}) => {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error("Elemen workspace tidak ditemukan!");
  }

  const svgElement = container.querySelector("svg");
  if (!svgElement) {
    throw new Error("Elemen SVG Mochi tidak ditemukan!");
  }

  const clonedSvg = svgElement.cloneNode(true);

  clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  if (!clonedSvg.getAttribute("width")) {
    clonedSvg.setAttribute("width", "400");
  }
  if (!clonedSvg.getAttribute("height")) {
    clonedSvg.setAttribute("height", "400");
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);

  svgString = svgString.replace(/style="[^"]*transform-origin[^"]*"/g, "");

  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);

  return true;
};

// =========================================================================
// 4. EKSPOR WEBM / CANVAS VIDEO (GUARANTEED DOWNLOAD & NO STUCK)
// =========================================================================
export const exportAsWebm = async ({
  elementId = "character-workspace",
  resolution = "720p",
  frameRate = "30 fps",
  filename = "character-animation.webm",
  animationDuration,
  onProgress,
  config = {},
}) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Elemen workspace tidak ditemukan!");

  const mood = config?.mood || "idle";
  const durationMs = animationDuration || getAnimationDurationByMood(mood);

  const resolutionMap = {
    "240p": { width: 240, height: 240 },
    "360p": { width: 360, height: 360 },
    "480p": { width: 480, height: 480 },
    "720p": { width: 720, height: 720 },
    "1080p": { width: 1080, height: 1080 },
  };

  const targetSize = resolutionMap[resolution] || resolutionMap["720p"];
  const fpsNumber = parseInt(frameRate, 10) || 30;
  const totalFrames = Math.round((durationMs / 1000) * fpsNumber);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = targetSize.width;
  outputCanvas.height = targetSize.height;
  const ctx = outputCanvas.getContext("2d");

  // Siapkan penampung frame
  const frames = [];

  try {
    // Phase 1: Capture semua frame canvas
    for (let i = 0; i < totalFrames; i++) {
      const progressRatio = i / totalFrames;

      if (onProgress) {
        onProgress(Math.round((i / totalFrames) * 80));
      }

      broadcastSeekProgress(progressRatio, durationMs);

      await new Promise((res) => setTimeout(res, 25));

      const frameCanvas = await captureAndScaleToTarget(
        element,
        targetSize.width,
        targetSize.height,
        config,
      );

      ctx.clearRect(0, 0, targetSize.width, targetSize.height);
      ctx.drawImage(frameCanvas, 0, 0);

      // Simpan data URL frame
      frames.push(outputCanvas.toDataURL("image/webp", 0.95));
    }

    if (onProgress) onProgress(85);

    // Phase 2: Jika browser mendukung WebCodecs (Chrome/Edge/Brave modern)
    if (typeof window.VideoEncoder !== "undefined") {
      try {
        const webmMuxerModule = await import("webm-muxer");
        const { Muxer, ArrayBufferTarget } = webmMuxerModule;

        const muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: {
            codec: "V_VP9",
            width: targetSize.width,
            height: targetSize.height,
            frameRate: fpsNumber,
          },
        });

        const videoEncoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => console.error(e),
        });

        videoEncoder.configure({
          codec: "vp09.00.10.08",
          width: targetSize.width,
          height: targetSize.height,
          bitrate: 4_000_000,
        });

        for (let i = 0; i < frames.length; i++) {
          const img = new Image();
          img.src = frames[i];
          await img.decode();

          const bitmap = await createImageBitmap(img);
          const timestampUs = Math.round((i / fpsNumber) * 1_000_000);
          const durationUs = Math.round((1 / fpsNumber) * 1_000_000);

          const videoFrame = new VideoFrame(bitmap, {
            timestamp: timestampUs,
            duration: durationUs,
          });

          videoEncoder.encode(videoFrame, { keyFrame: i % 15 === 0 });
          videoFrame.close();
          bitmap.close();
        }

        await videoEncoder.flush();
        muxer.finalize();

        const { buffer } = muxer.target;
        const blob = new Blob([buffer], { type: "video/webm" });
        triggerDownload(blob, filename);

        if (onProgress) onProgress(100);
        return true;
      } catch (err) {
        console.warn(
          "VideoEncoder gagal, mengalihkan ke pemicu fallback...",
          err,
        );
      }
    }

    // Phase 3: Fallback Paling Aman (Merangkai Blob Stream Asli)
    const stream = outputCanvas.captureStream(fpsNumber);
    const mimeType = getSupportedMimeType() || "video/webm";
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const recordPromise = new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        triggerDownload(blob, filename);
        if (onProgress) onProgress(100);
        resolve(true);
      };
      mediaRecorder.onerror = (e) => reject(e);
    });

    mediaRecorder.start();

    // Gambar ulang frame-frame yang sudah dicapture dengan kecepatan tinggi
    for (let i = 0; i < frames.length; i++) {
      const img = new Image();
      img.src = frames[i];
      await img.decode();
      ctx.clearRect(0, 0, targetSize.width, targetSize.height);
      ctx.drawImage(img, 0, 0);
      await new Promise((res) => setTimeout(res, Math.floor(1000 / fpsNumber)));
    }

    await new Promise((res) => setTimeout(res, 100));
    mediaRecorder.stop();

    return recordPromise;
  } finally {
    cleanupWorkspaceAnimations(element, durationMs);
  }
};

// Helper pemicu download murni
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// =========================================================================
// 5. COPY REACT COMPONENT CODE
// =========================================================================
export const copyReactComponent = async ({
  character = "mochi",
  config = {},
}) => {
  const codeSnippet = `import React from 'react';

export const MochiCharacter = ({
  mood = "${config.mood || "idle"}",
  color = "${config.color || "#ffffff"}",
  backgroundColor = "${config.backgroundColor || "#f5f5f7"}",
  text = "${config.text || ""}",
}) => {
  return (
    <div 
      className="mochi-container"
      style={{
        backgroundColor,
        borderRadius: '24px',
        padding: '32px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ color }}>
        <span className="mochi-avatar" data-mood={mood}>
          {text && <p className="mochi-text">{text}</p>}
        </span>
      </div>
    </div>
  );
};

export default MochiCharacter;`;

  await navigator.clipboard.writeText(codeSnippet);
  return true;
};

// =========================================================================
// 6. EKSPOR LOTTIE JSON (FULL ANIMATED: BODY + EYES + BADGE + ACCESSORIES)
// =========================================================================
export const exportAsLottieJson = async ({
  elementId = "character-workspace",
  character = "mochi",
  config = {},
  animationDuration = 1600,
  frameRate = 30,
  filename = "character-lottie.json",
}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Elemen workspace tidak ditemukan!");
  }

  try {
    const mood = config?.mood || "idle";
    const durationMs = animationDuration || getAnimationDurationByMood(mood);
    const fpsNumber = parseInt(String(frameRate), 10) || 30;
    const totalFrames = Math.round((durationMs / 1000) * fpsNumber);

    console.log("🎬 Lottie Export Starting:", {
      mood,
      durationMs,
      totalFrames,
      fpsNumber,
    });

    // 1. Generate animation keyframes untuk semua element
    const bodyKeyframes = generateBodyKeyframes(mood, totalFrames, durationMs);
    const eyesKeyframes = generateEyesKeyframes(mood, totalFrames, durationMs);
    const badgeKeyframes = generateBadgeKeyframes(
      mood,
      totalFrames,
      durationMs,
    );
    const accessoriesKeyframes = generateAccessoriesKeyframes(
      mood,
      totalFrames,
      durationMs,
    );

    // 2. Get mood color untuk body
    const svgElement = element.querySelector("svg");
    const bodyPathEl = svgElement?.querySelector("path[fill*='Grad']");
    const bodyFillGradId =
      bodyPathEl?.getAttribute("fill") || "url(#mochi3dGrad)";
    const bodyStrokeColor = bodyPathEl?.getAttribute("stroke") || "#CBD5E1";

    // Extract gradient color (simplified)
    let bodyColor = [1, 1, 1, 1]; // default white
    const gradId = bodyFillGradId.includes("working")
      ? [0.23, 0.51, 0.96, 1]
      : bodyFillGradId.includes("thinking")
        ? [0.55, 0.33, 0.96, 1]
        : bodyFillGradId.includes("searching")
          ? [0.31, 0.27, 0.9, 1]
          : bodyFillGradId.includes("approval")
            ? [0.99, 0.83, 0.33, 1]
            : bodyFillGradId.includes("question")
              ? [0.02, 0.71, 0.82, 1]
              : bodyFillGradId.includes("error")
                ? [0.94, 0.27, 0.27, 1]
                : bodyFillGradId.includes("finished")
                  ? [0.06, 0.73, 0.51, 1]
                  : bodyFillGradId.includes("sleeping")
                    ? [0.55, 0.33, 0.96, 1]
                    : bodyFillGradId.includes("dizzy")
                      ? [0.96, 0.25, 0.37, 1]
                      : [0.98, 0.98, 0.98, 1]; // default light gray
    bodyColor = gradId;

    // 3. Build Lottie JSON dengan multiple layers
    const lottieData = {
      v: "5.7.4",
      fr: fpsNumber,
      ip: 0,
      op: totalFrames,
      w: 400,
      h: 400,
      nm: `${character}-${mood}`,
      ddd: 0,
      assets: [],
      layers: [
        // ✅ LAYER 1: Body (Ellipse with animation keyframes)
        buildBodyLayer(bodyKeyframes, bodyColor, bodyStrokeColor),

        // ✅ LAYER 2: Eyes Group (Position + Opacity Blink + Scale)
        {
          ddd: 0,
          ind: 2,
          ty: 4,
          nm: "Eyes",
          sr: 1,
          ks: {
            o: eyesKeyframes.opacity,
            r: { a: 0, k: 0 },
            p: eyesKeyframes.position,
            a: { a: 0, k: [200, 205, 0] },
            s: eyesKeyframes.scale,
          },
          ao: 0,
          shapes: [
            // Left Eye
            {
              ty: "gr",
              it: [
                {
                  ty: "el",
                  d: 1,
                  s: { a: 0, k: [33, 33] },
                  p: { a: 0, k: [-74, 0] },
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.1, 0.1, 0.11, 1] },
                  o: { a: 0, k: 100 },
                },
              ],
            },
            // Right Eye
            {
              ty: "gr",
              it: [
                {
                  ty: "el",
                  d: 1,
                  s: { a: 0, k: [33, 33] },
                  p: { a: 0, k: [74, 0] },
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [0.1, 0.1, 0.11, 1] },
                  o: { a: 0, k: 100 },
                },
              ],
            },
            // Left Eye Highlight
            {
              ty: "gr",
              it: [
                {
                  ty: "el",
                  d: 1,
                  s: { a: 0, k: [10.4, 10.4] },
                  p: { a: 0, k: [-79.6, -9.6] },
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [1, 1, 1, 1] },
                  o: { a: 0, k: [30] },
                },
              ],
            },
            // Right Eye Highlight
            {
              ty: "gr",
              it: [
                {
                  ty: "el",
                  d: 1,
                  s: { a: 0, k: [10.4, 10.4] },
                  p: { a: 0, k: [79.6, -9.6] },
                },
                {
                  ty: "fl",
                  c: { a: 0, k: [1, 1, 1, 1] },
                  o: { a: 0, k: [30] },
                },
              ],
            },
          ],
        },

        // ✅ LAYER 3: Badge (Pulse + Opacity)
        {
          ddd: 0,
          ind: 3,
          ty: 4,
          nm: "Badge",
          sr: 1,
          ks: {
            o: badgeKeyframes.opacity,
            r: { a: 0, k: 0 },
            p: badgeKeyframes.position,
            a: { a: 0, k: [0, 0, 0] },
            s: badgeKeyframes.scale,
          },
          ao: 0,
          shapes: [
            {
              ty: "gr",
              it: [
                {
                  ty: "el",
                  d: 1,
                  s: { a: 0, k: [28, 28] },
                  p: { a: 0, k: [0, 0] },
                },
                {
                  ty: "fl",
                  c: { a: 0, k: getBadgeColor(mood) },
                  o: { a: 0, k: 100 },
                },
              ],
            },
          ],
        },

        // ✅ LAYER 4: Accessories (Greeting Wave / Santa Hat / etc)
        ...(mood === "greeting"
          ? [buildGreetingWaveLayer(accessoriesKeyframes)]
          : []),
      ],
      meta: {
        generator: "Mochi Character Generator - Animated Lottie",
        character,
        config,
        mood,
        animationDuration: durationMs,
        type: "animated-vector-full",
      },
    };

    // 4. Download
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(lottieData, null, 2),
    )}`;

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    console.log("✅ Lottie JSON exported successfully!");
    return true;
  } catch (err) {
    console.error("❌ Lottie export gagal:", err);
    throw new Error("Gagal mengekspor ke Lottie JSON animated.");
  }
};

// =========================================================================
// BUILD BODY LAYER (with proper anchor & position)
// =========================================================================
function buildBodyLayer(bodyKeyframes, bodyColor, bodyStrokeColor) {
  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Body",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: bodyKeyframes.rotation,
      p: { a: 0, k: [200, 205, 0] }, // Fixed position at center
      a: { a: 0, k: [105, 95, 0] }, // ← Anchor at ellipse center (half of 210x190)
      s: bodyKeyframes.scale,
    },
    ao: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          // ✅ Ellipse body
          {
            ty: "el",
            d: 1,
            s: { a: 0, k: [210, 190] },
            p: { a: 0, k: [0, 0] },
          },
          // Fill
          {
            ty: "fl",
            c: { a: 0, k: bodyColor },
            o: { a: 0, k: 100 },
          },
          // Stroke
          {
            ty: "st",
            c: { a: 0, k: hexToRgb(bodyStrokeColor) },
            w: { a: 0, k: 2 },
            lc: 2,
            lj: 2,
            o: { a: 0, k: 100 },
          },
        ],
      },
    ],
  };
}

// =========================================================================
// KEYFRAME GENERATOR: BODY (Bounce + Rotate + Scale)
// =========================================================================
function generateBodyKeyframes(mood, totalFrames, durationMs) {
  const isDancing = mood === "dancing";
  const rotationFrames = [];
  const positionFrames = [];
  const scaleFrames = [];

  for (let i = 0; i < totalFrames; i++) {
    const p = i / totalFrames;
    const bounce = (1 - Math.cos(p * Math.PI * 2)) / 2;

    let pose;
    if (isDancing) {
      pose = {
        y: -12 * bounce,
        rotate: Math.sin(p * Math.PI * 2) * 6,
        scaleX: 1 - 0.04 * bounce,
        scaleY: 1 + 0.05 * bounce,
      };
    } else {
      pose = {
        y: -6 * bounce,
        rotate: 0,
        scaleX: 1,
        scaleY: 1,
        scale: 1 + 0.012 * bounce,
      };
    }

    rotationFrames.push({
      t: i,
      s: [pose.rotate, pose.rotate, 0],
    });

    positionFrames.push({
      t: i,
      s: [200, 205 + pose.y, 0],
    });

    scaleFrames.push({
      t: i,
      s: [pose.scaleX * 100, pose.scaleY * 100, 100],
    });
  }

  return {
    rotation: { a: 1, k: rotationFrames },
    position: { a: 1, k: positionFrames },
    scale: { a: 1, k: scaleFrames },
  };
}

// =========================================================================
// KEYFRAME GENERATOR: EYES (Blink + Position Track + Surprised Scale)
// =========================================================================
function generateEyesKeyframes(mood, totalFrames, durationMs) {
  const opacityFrames = [];
  const positionFrames = [];
  const scaleFrames = [];

  const isSleeping = mood === "sleeping";
  const isSurprised = mood === "surprised";
  const isDizzy = mood === "dizzy";
  const isWink = mood === "wink";

  for (let i = 0; i < totalFrames; i++) {
    const p = i / totalFrames;

    // ✅ BLINK LOGIC: Deterministic blink every 30 frames (selama 5 frames)
    const blinkCycleFrames = 30;
    const blinkDurationFrames = 5;
    const cyclePosition = i % blinkCycleFrames;
    const isBlinking =
      cyclePosition > blinkCycleFrames - blinkDurationFrames ||
      cyclePosition < 2;
    const blinkOpacity = isBlinking ? 0 : 100;

    // ✅ SLEEP: Eyes closed
    let opacity = isSleeping ? 0 : blinkOpacity;

    // ✅ SURPRISED: Eyes wide (scale up)
    let eyeScale = isSurprised ? 120 : 100;

    // ✅ DIZZY: Eyes spinning
    let eyeRotate = isDizzy ? p * 360 : 0;

    // ✅ WINK: Right eye opacity low
    if (isWink) {
      opacity =
        cyclePosition > blinkCycleFrames - blinkDurationFrames ? 0 : 100;
    }

    // ✅ Position tracking (subtle bounce with body)
    const bounce = (1 - Math.cos(p * Math.PI * 2)) / 2;
    const trackY = -3 * bounce;

    opacityFrames.push({
      t: i,
      s: [opacity],
    });

    positionFrames.push({
      t: i,
      s: [0, trackY, 0],
    });

    scaleFrames.push({
      t: i,
      s: [eyeScale, eyeScale, 100],
    });
  }

  return {
    opacity: { a: 1, k: opacityFrames },
    position: { a: 1, k: positionFrames },
    scale: { a: 1, k: scaleFrames },
  };
}

// =========================================================================
// KEYFRAME GENERATOR: BADGE (Pulse + Opacity)
// =========================================================================
function generateBadgeKeyframes(mood, totalFrames, durationMs) {
  const opacityFrames = [];
  const positionFrames = [];
  const scaleFrames = [];

  const hasBadge =
    mood === "working" ||
    mood === "thinking" ||
    mood === "searching" ||
    mood === "approval" ||
    mood === "question" ||
    mood === "error" ||
    mood === "finished" ||
    mood === "rate_limit" ||
    mood === "love" ||
    mood === "proud";

  if (!hasBadge) {
    // Badge invisible
    for (let i = 0; i < totalFrames; i++) {
      opacityFrames.push({ t: i, s: [0] });
      positionFrames.push({ t: i, s: [-108, 0, 0] });
      scaleFrames.push({ t: i, s: [100, 100, 100] });
    }
  } else {
    for (let i = 0; i < totalFrames; i++) {
      const p = i / totalFrames;

      // ✅ Pulse animation
      const pulseScale = 100 + 15 * Math.sin(p * Math.PI * 2);

      // ✅ Dot blink untuk working/thinking/searching
      const isDotBadge =
        mood === "working" || mood === "thinking" || mood === "searching";
      const dotBlink = isDotBadge ? 50 + 50 * Math.sin(p * Math.PI * 2) : 100;

      opacityFrames.push({
        t: i,
        s: [dotBlink],
      });

      // Badge position (top-left of body)
      positionFrames.push({
        t: i,
        s: [-108, 0, 0],
      });

      scaleFrames.push({
        t: i,
        s: [pulseScale, pulseScale, 100],
      });
    }
  }

  return {
    opacity: { a: 1, k: opacityFrames },
    position: { a: 1, k: positionFrames },
    scale: { a: 1, k: scaleFrames },
  };
}

// =========================================================================
// KEYFRAME GENERATOR: ACCESSORIES (Greeting Wave)
// =========================================================================
function generateAccessoriesKeyframes(mood, totalFrames, durationMs) {
  const rotationFrames = [];

  if (mood === "greeting") {
    for (let i = 0; i < totalFrames; i++) {
      const p = i / totalFrames;
      const bounce = (1 - Math.cos(p * Math.PI * 2)) / 2;

      // Wave rotate: -10 to +24 degrees
      const waveRotate = -10 + 34 * bounce;

      rotationFrames.push({
        t: i,
        s: [waveRotate, waveRotate, 0],
      });
    }
  }

  return {
    rotation: { a: 1, k: rotationFrames },
  };
}

// =========================================================================
// BUILD GREETING WAVE LAYER
// =========================================================================
function buildGreetingWaveLayer(accessoriesKeyframes) {
  return {
    ddd: 0,
    ind: 4,
    ty: 4,
    nm: "Greeting Wave",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: accessoriesKeyframes.rotation,
      p: { a: 0, k: [280, 195, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            ty: "sh",
            ks: {
              a: 0,
              k: {
                c: false,
                v: [
                  [-15, -8],
                  [15, -8],
                  [15, 16],
                  [-15, 16],
                ],
                i: [
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                ],
                o: [
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                ],
              },
            },
          },
          {
            ty: "fl",
            c: { a: 0, k: [0.98, 0.98, 0.98, 1] },
            o: { a: 0, k: 100 },
          },
        ],
      },
    ],
  };
}

// =========================================================================
// HELPERS: Path Parsing, Color Conversion
// =========================================================================
function parsePathToVertices(pathData) {
  const coords = [];
  const numbers = pathData.match(/[\d.-]+/g) || [];
  for (let i = 0; i < numbers.length; i += 2) {
    coords.push([parseFloat(numbers[i]), parseFloat(numbers[i + 1])]);
  }
  return coords;
}

function parsePathToInPoints(pathData) {
  const coords = pathData.match(/[\d.-]+/g) || [];
  return Array(Math.floor(coords.length / 2)).fill([0, 0]);
}

function parsePathToOutPoints(pathData) {
  const coords = pathData.match(/[\d.-]+/g) || [];
  return Array(Math.floor(coords.length / 2)).fill([0, 0]);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1,
  ];
}

function getBadgeColor(mood) {
  const colorMap = {
    working: [0.23, 0.51, 0.96, 1], // #3B82F6
    thinking: [0.55, 0.33, 0.96, 1], // #8B5CF6
    searching: [0.31, 0.27, 0.9, 1], // #4F46E5
    approval: [0.99, 0.83, 0.33, 1], // #FCD34D
    question: [0.02, 0.71, 0.82, 1], // #06B6D4
    error: [0.94, 0.27, 0.27, 1], // #EF4444
    finished: [0.06, 0.73, 0.51, 1], // #10B981
    rate_limit: [0.92, 0.35, 0.05, 1], // #EA580C
    love: [0.96, 0.25, 0.37, 1], // #F43F5E
    proud: [0.06, 0.73, 0.51, 1], // #10B981
  };
  return colorMap[mood] || [0.79, 0.84, 0.89, 1]; // Default gray
}
