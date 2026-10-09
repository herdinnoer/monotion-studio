import * as htmlToImage from "html-to-image";
import { getCharacter, getMoodDuration } from "@/characters/registry";
import { TIMELINE_EVENT } from "@/characters/_core/useTimeline";
import { DEFAULT_BACKGROUND } from "@/lib/editorState";
import {
  applyKeyColor,
  createColorUsage,
  hexToRgbNumber,
  markColor,
  pickKeyColor,
  prepareFrame,
} from "@/lib/gifKeyColor";
import { muxAlphaWebm } from "@/lib/webmAlphaMuxer";

// =========================================================================
// HELPER FUNCTIONS & MOOD DURATION MAP
// =========================================================================

// Durasi 1 loop penuh dibaca dari daftar mood karakter (lewat registry)
export function getAnimationDurationByMood(mood, characterId) {
  return getMoodDuration(getCharacter(characterId), mood);
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

// Broadcast sinyal progress seek ke karakter
function broadcastSeekProgress(progress0To1, durationMs = 1600) {
  window.dispatchEvent(
    new CustomEvent(TIMELINE_EVENT, {
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
  const bgColor = isBgRemoved ? null : config?.backgroundColor || DEFAULT_BACKGROUND;

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

  const wasPlaying = sessionStorage.getItem("timeline-was-playing") === "true";
  window.dispatchEvent(
    new CustomEvent(TIMELINE_EVENT, {
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
  character,
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

  const durationMs = animationDuration || getAnimationDurationByMood(config.mood, character);
  const isTransparent = Boolean(config.isBgRemoved);

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
    new CustomEvent(TIMELINE_EVENT, {
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

  // Frame ditampung dulu, karena warna kunci transparan baru bisa dipilih
  // setelah semua warna karakter di semua frame diketahui.
  const frames = [];
  const colorUsage = createColorUsage();
  // Warna pilihan user juga dicatat, supaya warna kunci pasti tidak mirip dengannya.
  markColor(colorUsage, hexToRgbNumber(config.color));
  markColor(colorUsage, hexToRgbNumber(config.backgroundColor));

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

      const imageData = scaledCanvas
        .getContext("2d")
        .getImageData(0, 0, targetSize.width, targetSize.height);
      if (isTransparent) prepareFrame(imageData.data, colorUsage);
      frames.push(imageData);
    }
  } finally {
    // ✅ FIX: Always resume as paused (safe default)
    // User can click play button if they want to resume
    window.dispatchEvent(
      new CustomEvent(TIMELINE_EVENT, {
        detail: {
          progress: 0,
          isPlaying: false, // ← Leave paused
          isExporting: false,
          durationMs,
        },
      }),
    );
  }

  // Remove Background: isi bagian tembus dengan warna kunci, lalu tandai warna itu transparan.
  const keyColor = isTransparent ? pickKeyColor(colorUsage) : null;

  const gif = new GIF({
    workers: 2,
    quality: 1,
    workerScript: "/gif.worker.js",
    width: targetSize.width,
    height: targetSize.height,
    transparent: keyColor,
  });

  for (const imageData of frames) {
    if (isTransparent) applyKeyColor(imageData.data, keyColor);
    gif.addFrame(imageData, { delay: playbackDelay });
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
  config = {},
}) => {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error("Elemen workspace tidak ditemukan!");
  }

  const svgElement = container.querySelector("svg");
  if (!svgElement) {
    throw new Error("Elemen SVG karakter tidak ditemukan!");
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

  // Background ikut aturan yang sama dengan GIF/WebM (keputusan K-3):
  // ada kotak warna di paling belakang, kecuali Remove Background aktif.
  if (!config.isBgRemoved) {
    const viewBox = clonedSvg.viewBox?.baseVal;
    const hasViewBox = viewBox && viewBox.width > 0 && viewBox.height > 0;
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bgRect.setAttribute("x", hasViewBox ? String(viewBox.x) : "0");
    bgRect.setAttribute("y", hasViewBox ? String(viewBox.y) : "0");
    bgRect.setAttribute("width", hasViewBox ? String(viewBox.width) : "100%");
    bgRect.setAttribute("height", hasViewBox ? String(viewBox.height) : "100%");
    bgRect.setAttribute("fill", config.backgroundColor || DEFAULT_BACKGROUND);
    clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
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

// WebM transparan (Remove Background).
// Encoder video browser (VideoEncoder) belum bisa menyimpan transparansi secara langsung,
// dan webm-muxer 5 tidak bisa menulis lapisan alpha per frame. Jadi tiap frame di-encode
// DUA kali dengan VP9 (warna + alpha sebagai gambar hitam-putih), lalu dijahit oleh
// muxAlphaWebm (src/lib/webmAlphaMuxer.js). Hasilnya frame per frame, sama seperti WebM biasa.
const WEBM_CODEC = "vp09.00.10.08";
const WEBM_BITRATE = 4_000_000;

let transparentWebmSupport = null;

// Cek sekali (hasilnya diingat): apakah browser punya encoder VP9.
export function supportsTransparentWebm() {
  if (!transparentWebmSupport) {
    transparentWebmSupport =
      typeof window === "undefined" || typeof window.VideoEncoder === "undefined"
        ? Promise.resolve(false)
        : VideoEncoder.isConfigSupported({
            codec: WEBM_CODEC,
            width: 720,
            height: 720,
            bitrate: WEBM_BITRATE,
          })
            .then((result) => Boolean(result.supported))
            .catch(() => false);
  }
  return transparentWebmSupport;
}

async function encodeTransparentWebm({ frames, width, height, fpsNumber, onProgress }) {
  const makeEncoder = (target) => {
    const state = { error: null, colorSpace: null };
    const encoder = new VideoEncoder({
      output: (chunk, meta) => {
        // Info rumus warna dari encoder, ditulis ke file oleh muxAlphaWebm
        if (meta?.decoderConfig?.colorSpace) state.colorSpace = meta.decoderConfig.colorSpace;
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        target.push({ timestampUs: chunk.timestamp, isKey: chunk.type === "key", data });
      },
      error: (e) => {
        state.error = e;
      },
    });
    encoder.configure({ codec: WEBM_CODEC, width, height, bitrate: WEBM_BITRATE });
    return { encoder, state };
  };

  const colorChunks = [];
  const alphaChunks = [];
  const color = makeEncoder(colorChunks);
  const alpha = makeEncoder(alphaChunks);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const pixelCount = width * height;
  // Gambar alpha dalam format I420: Y = tingkat transparansi, U & V netral (128).
  const alphaPlane = new Uint8Array(pixelCount * 1.5);
  alphaPlane.fill(128, pixelCount);

  for (let i = 0; i < frames.length; i++) {
    const img = new Image();
    img.src = frames[i];
    await img.decode();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Pisahkan alpha, lalu buat gambar warna yang padat dengan warna asli piksel
    // (belum dicampur transparansi), supaya tepi setengah tembus tidak jadi gelap.
    for (let p = 0; p < pixelCount; p++) {
      alphaPlane[p] = data[p * 4 + 3];
      data[p * 4 + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    const timestamp = Math.round((i / fpsNumber) * 1_000_000);
    const duration = Math.round((1 / fpsNumber) * 1_000_000);
    const keyFrame = i % 15 === 0;

    // Dikirim sebagai kanvas, sama seperti jalur WebM berlatar warna.
    const colorFrame = new VideoFrame(canvas, { timestamp, duration });
    const alphaFrame = new VideoFrame(alphaPlane, {
      format: "I420",
      codedWidth: width,
      codedHeight: height,
      timestamp,
      duration,
    });
    color.encoder.encode(colorFrame, { keyFrame });
    alpha.encoder.encode(alphaFrame, { keyFrame });
    colorFrame.close();
    alphaFrame.close();

    if (onProgress) onProgress(85 + Math.round(((i + 1) / frames.length) * 14));
  }

  await color.encoder.flush();
  await alpha.encoder.flush();
  color.encoder.close();
  alpha.encoder.close();
  if (color.state.error || alpha.state.error) throw color.state.error || alpha.state.error;
  if (colorChunks.length !== frames.length || alphaChunks.length !== frames.length) {
    throw new Error("Jumlah frame warna dan alpha tidak sama.");
  }

  return muxAlphaWebm({
    width,
    height,
    codecId: "V_VP9",
    frameDurationMs: 1000 / fpsNumber,
    colorSpace: color.state.colorSpace,
    frames: colorChunks.map((chunk, i) => ({
      timestampMs: chunk.timestampUs / 1000,
      isKey: chunk.isKey,
      data: chunk.data,
      alpha: alphaChunks[i].data,
    })),
  });
}


export const exportAsWebm = async ({
  elementId = "character-workspace",
  resolution = "720p",
  frameRate = "30 fps",
  filename = "character-animation.webm",
  character,
  animationDuration,
  onProgress,
  config = {},
}) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Elemen workspace tidak ditemukan!");

  const durationMs = animationDuration || getAnimationDurationByMood(config.mood, character);

  // Remove Background: kalau browser tidak bisa menyimpan WebM transparan, export tetap
  // jalan dengan latar warna (modal export sudah memberi peringatan sebelumnya).
  const keepAlpha = Boolean(config.isBgRemoved) && (await supportsTransparentWebm());
  const frameConfig = config.isBgRemoved && !keepAlpha ? { ...config, isBgRemoved: false } : config;

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

  // Pause player and lock export mode
  window.dispatchEvent(
    new CustomEvent(TIMELINE_EVENT, {
      detail: {
        progress: 0,
        isPlaying: false,
        isExporting: true,
        durationMs,
      },
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 80));

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
        frameConfig,
      );

      ctx.clearRect(0, 0, targetSize.width, targetSize.height);
      ctx.drawImage(frameCanvas, 0, 0);

      // Simpan data URL frame (WebP menyimpan transparansi)
      frames.push(outputCanvas.toDataURL("image/webp", 0.95));
    }

    if (onProgress) onProgress(85);

    // Phase 2a: WebM transparan → warna + alpha di-encode terpisah, lalu dijahit.
    // Kalau gagal, jangan lanjut ke fallback: frame-nya transparan dan fallback
    // tidak bisa menyimpan transparansi (hasilnya akan berlatar hitam).
    if (keepAlpha) {
      const file = await encodeTransparentWebm({
        frames,
        width: targetSize.width,
        height: targetSize.height,
        fpsNumber,
        onProgress,
      });
      triggerDownload(new Blob([file], { type: "video/webm" }), filename);
      if (onProgress) onProgress(100);
      return true;
    }

    // Phase 2b: Latar warna + browser mendukung WebCodecs (Chrome/Edge/Brave modern)
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
  mood = "${config.mood || ""}",
  color = "${config.color || "#ffffff"}",
  backgroundColor = "${config.backgroundColor || DEFAULT_BACKGROUND}",
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
// 6. EKSPOR LOTTIE JSON (100% PIXEL-PERFECT EXACT FRAME-BY-FRAME)
// =========================================================================
export const exportAsLottieJson = async ({
  elementId = "character-workspace",
  character,
  config = {},
  resolution = "480p",
  frameRate = "30 fps",
  filename = "character-lottie.json",
  animationDuration,
  onProgress,
}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemen dengan ID "${elementId}" tidak ditemukan!`);
  }

  const mood = config.mood;
  const durationMs = animationDuration || getAnimationDurationByMood(mood, character);

  const resolutionMap = {
    "240p": { width: 240, height: 240 },
    "360p": { width: 360, height: 360 },
    "480p": { width: 480, height: 480 },
    "720p": { width: 720, height: 720 },
    "1080p": { width: 1080, height: 1080 },
  };

  const targetSize = resolutionMap[resolution] || { width: 480, height: 480 };
  const fpsNumber = parseInt(String(frameRate), 10) || 30;
  const totalFrames = Math.max(12, Math.round((durationMs / 1000) * fpsNumber));

  // 1. Pause player IMMEDIATELY before starting export to avoid race condition
  window.dispatchEvent(
    new CustomEvent(TIMELINE_EVENT, {
      detail: {
        progress: 0,
        isPlaying: false,
        isExporting: true,
        durationMs,
      },
    }),
  );

  // Wait for pause to take effect
  await new Promise((resolve) => setTimeout(resolve, 50));

  const assets = [];
  const layers = [];

  try {
    for (let i = 0; i < totalFrames; i++) {
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalFrames) * 95));
      }

      const progress = i / totalFrames;
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

      const frameDataUrl = scaledCanvas.toDataURL("image/png");
      const assetId = `img_${i}`;

      assets.push({
        id: assetId,
        w: targetSize.width,
        h: targetSize.height,
        u: "",
        p: frameDataUrl,
        e: 1,
      });

      layers.push({
        ddd: 0,
        ind: i + 1,
        ty: 2,
        nm: `Frame_${i}`,
        refId: assetId,
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [targetSize.width / 2, targetSize.height / 2, 0] },
          a: { a: 0, k: [targetSize.width / 2, targetSize.height / 2, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        ip: i,
        op: i + 1,
        st: 0,
      });
    }
  } finally {
    // Resume player state safely
    window.dispatchEvent(
      new CustomEvent(TIMELINE_EVENT, {
        detail: {
          progress: 0,
          isPlaying: false,
          isExporting: false,
          durationMs,
        },
      }),
    );
  }

  // 2. Assemble complete valid Lottie JSON specification
  const lottieData = {
    v: "5.7.4",
    fr: fpsNumber,
    ip: 0,
    op: totalFrames,
    w: targetSize.width,
    h: targetSize.height,
    nm: `${character}-${mood}`,
    ddd: 0,
    assets,
    layers,
    meta: {
      generator: "Monotion Studio 100% Pixel-Perfect Lottie",
      character,
      mood,
      durationMs,
      totalFrames,
    },
  };

  if (onProgress) {
    onProgress(100);
  }

  // 3. Trigger download using Blob & URL.createObjectURL
  const jsonString = JSON.stringify(lottieData, null, 2);
  const jsonBlob = new Blob([jsonString], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(jsonBlob);

  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = downloadUrl;
  downloadAnchor.download = filename;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);

  return true;
};
