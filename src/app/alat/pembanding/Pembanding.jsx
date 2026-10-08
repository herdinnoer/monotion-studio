"use client";

// Alat kerja B18.0: tumpuk / jejerkan Capybara buatan kode dengan gambar referensi.
// Gambar referensi: docs/reference/capybara/<mood>.png (hasil potong capybara-moods.jpg).
// Semua potongan berukuran sama (563 × 498) dan posisi karakternya seragam, jadi
// satu pengaturan posisi & ukuran berlaku untuk semua mood.

import { useEffect, useState } from "react";
import {
  Button,
  Label,
  Slider,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { getCharacter } from "@/characters/registry";
import { dispatchTimeline } from "@/characters/_core/useTimeline";

import idle from "../../../../docs/reference/capybara/idle.png";
import happy from "../../../../docs/reference/capybara/happy.png";
import love from "../../../../docs/reference/capybara/love.png";
import blank from "../../../../docs/reference/capybara/blank.png";
import shocked from "../../../../docs/reference/capybara/shocked.png";
import wow from "../../../../docs/reference/capybara/wow.png";
import proud from "../../../../docs/reference/capybara/proud.png";
import neutral from "../../../../docs/reference/capybara/neutral.png";
import sleeping from "../../../../docs/reference/capybara/sleeping.png";
import playful from "../../../../docs/reference/capybara/playful.png";
import dozing from "../../../../docs/reference/capybara/dozing.png";
import dizzy from "../../../../docs/reference/capybara/dizzy.png";
import yawning from "../../../../docs/reference/capybara/yawning.png";
import annoyed from "../../../../docs/reference/capybara/annoyed.png";
import charmed from "../../../../docs/reference/capybara/charmed.png";

// Urutan sama dengan gambar referensi (kiri ke kanan, atas ke bawah)
const REFERENCES = [
  { id: "idle", label: "Idle", img: idle },
  { id: "happy", label: "Happy", img: happy },
  { id: "love", label: "Love", img: love },
  { id: "blank", label: "Blank", img: blank },
  { id: "shocked", label: "Shocked", img: shocked },
  { id: "wow", label: "Wow", img: wow },
  { id: "proud", label: "Proud", img: proud },
  { id: "neutral", label: "Neutral", img: neutral },
  { id: "sleeping", label: "Sleeping", img: sleeping },
  { id: "playful", label: "Playful", img: playful },
  { id: "dozing", label: "Dozing", img: dozing },
  { id: "dizzy", label: "Dizzy", img: dizzy },
  { id: "yawning", label: "Yawning", img: yawning },
  { id: "annoyed", label: "Annoyed", img: annoyed },
  { id: "charmed", label: "Charmed", img: charmed },
];

const capybara = getCharacter("capybara");
const CapybaraComponent = capybara.Component;
const codeMoodIds = new Set(capybara.moods.map((m) => m.id));

// Ukuran kanvas karakter di editor (CenterWorkspace memakai size 500).
// Posisi & ukuran referensi dihitung dalam persen kanvas ini.
const STAGE_PX = 500;

// Posisi awal referensi: kepala referensi menumpuk kepala kode (diukur di B18.2;
// kepala di gambar referensi agak ke kanan dari tengah gambar, jadi x digeser ke kiri).
// x, y = geser titik tengah (% kanvas); scale = ukuran (% dari ukuran asli gambar)
const DEFAULT_ALIGN = { x: -3, y: -7, scale: 65 };
const STORAGE_KEY = "monotion-pembanding-align";

function loadAlign() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (saved && ["x", "y", "scale"].every((k) => typeof saved[k] === "number")) return saved;
  } catch {}
  return null;
}

function saveAlign(align) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(align));
  } catch {}
}

export function Pembanding() {
  const [moodId, setMoodId] = useState("idle");
  const [mode, setMode] = useState("stack"); // "stack" (tumpuk) | "side" (berdampingan)
  const [opacity, setOpacity] = useState(50);
  const [align, setAlign] = useState(DEFAULT_ALIGN);
  const [frozen, setFrozen] = useState(true);

  const reference = REFERENCES.find((r) => r.id === moodId);
  const hasCode = codeMoodIds.has(moodId);

  // Pengaturan posisi disimpan di browser ini saja, supaya tidak perlu disejajarkan ulang
  useEffect(() => {
    const saved = loadAlign();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- baca localStorage hanya bisa setelah halaman tampil
    if (saved) setAlign(saved);
  }, []);

  const updateAlign = (key, value) => {
    const next = { ...align, [key]: value };
    setAlign(next);
    saveAlign(next);
  };

  const resetAlign = () => {
    setAlign(DEFAULT_ALIGN);
    saveAlign(DEFAULT_ALIGN);
  };

  // Bekukan = pakai pose awal (progress 0) lewat sinyal timeline yang sama dengan player bar
  useEffect(() => {
    dispatchTimeline({ progress: 0, isPlaying: !frozen, isExporting: false });
  }, [frozen, moodId]);

  const refStyle = {
    left: `${50 + align.x}%`,
    top: `${50 + align.y}%`,
    width: `${(reference.img.width / STAGE_PX) * align.scale}%`,
    transform: "translate(-50%, -50%)",
  };

  const character = hasCode ? (
    <CapybaraComponent
      state={moodId}
      enableBlink={!frozen}
      enableTracking={!frozen}
      style={{ width: "100%", height: "100%" }}
    />
  ) : null;

  return (
    <main className="min-h-screen bg-[#141416] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:w-80 lg:shrink-0">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Alat kerja, bukan untuk user
            </p>
            <h1 className="text-xl font-bold">Pembanding Capybara</h1>
            <p className="text-sm text-neutral-300">
              Kode vs gambar referensi. Halaman ini dihapus sebelum rilis (Fase 5).
            </p>
          </header>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Mood</h2>
            <ToggleButtonGroup
              aria-label="Pilih mood"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([moodId])}
              onSelectionChange={(keys) => {
                const [next] = keys;
                if (next) setMoodId(next);
              }}
              isDetached
              size="sm"
              className="flex flex-wrap gap-1.5"
            >
              {REFERENCES.map((r) => (
                <ToggleButton key={r.id} id={r.id} className="min-h-11 gap-1.5">
                  {r.label}
                  {codeMoodIds.has(r.id) && (
                    <span
                      className="size-1.5 rounded-full bg-emerald-400"
                      aria-label="(sudah ada di kode)"
                    />
                  )}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <p className="flex items-center gap-1.5 text-xs text-neutral-300">
              <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
              Titik hijau = mood sudah dibuat di kode
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Tampilan</h2>
            <ToggleButtonGroup
              aria-label="Mode tampilan"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([mode])}
              onSelectionChange={(keys) => {
                const [next] = keys;
                if (next) setMode(next);
              }}
              fullWidth
            >
              <ToggleButton id="stack" className="min-h-11">Tumpuk</ToggleButton>
              <ToggleButton id="side" className="min-h-11">Berdampingan</ToggleButton>
            </ToggleButtonGroup>

            {mode === "stack" && (
              <Slider
                value={opacity}
                onChange={setOpacity}
                minValue={0}
                maxValue={100}
                step={1}
                className="pt-2"
              >
                <Label>Opacity referensi</Label>
                <Slider.Output>{({ state }) => `${state.values[0]}%`}</Slider.Output>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
            )}

            <Switch isSelected={frozen} onChange={setFrozen} className="pt-2">
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Label className="text-sm">Bekukan gerakan (pose awal)</Label>
              </Switch.Content>
            </Switch>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Sejajarkan referensi</h2>
              <Button size="sm" variant="ghost" onPress={resetAlign} className="min-h-11">
                Reset
              </Button>
            </div>
            <AlignSlider
              label="Geser kiri/kanan"
              value={align.x}
              min={-30}
              max={30}
              step={0.5}
              unit="%"
              onChange={(v) => updateAlign("x", v)}
            />
            <AlignSlider
              label="Geser atas/bawah"
              value={align.y}
              min={-30}
              max={30}
              step={0.5}
              unit="%"
              onChange={(v) => updateAlign("y", v)}
            />
            <AlignSlider
              label="Ukuran"
              value={align.scale}
              min={30}
              max={120}
              step={0.5}
              unit="%"
              onChange={(v) => updateAlign("scale", v)}
            />
            <p className="text-xs text-neutral-300">
              Klik slider lalu pakai tombol panah untuk geser halus.
            </p>
          </section>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-3">
          {!hasCode && (
            <p className="rounded-xl bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Mood &quot;{reference.label}&quot; belum dibuat di kode. Yang tampil hanya referensinya.
            </p>
          )}

          {mode === "stack" ? (
            <Stage caption={hasCode ? "Tumpuk: kode + referensi" : "Referensi"}>
              {character}
              {/* eslint-disable-next-line @next/next/no-img-element -- gambar referensi harus tampil apa adanya, tanpa optimasi next/image */}
              <img
                src={reference.img.src}
                alt={`Referensi Capybara mood ${reference.label}`}
                className="pointer-events-none absolute max-w-none select-none"
                style={{ ...refStyle, opacity: hasCode ? opacity / 100 : 1 }}
              />
            </Stage>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Stage caption="Kode">
                {character ?? (
                  <p className="text-sm text-neutral-500">Belum ada di kode</p>
                )}
              </Stage>
              <Stage caption="Referensi">
                {/* eslint-disable-next-line @next/next/no-img-element -- gambar referensi harus tampil apa adanya, tanpa optimasi next/image */}
                <img
                  src={reference.img.src}
                  alt={`Referensi Capybara mood ${reference.label}`}
                  className="pointer-events-none absolute max-w-none select-none"
                  style={refStyle}
                />
              </Stage>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// Kanvas persegi berlatar putih (sama dengan latar gambar referensi)
function Stage({ caption, children }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative mx-auto flex aspect-square w-full max-w-[500px] items-center justify-center overflow-hidden rounded-2xl bg-white">
        {children}
      </div>
      <figcaption className="text-center text-xs text-neutral-300">{caption}</figcaption>
    </figure>
  );
}

function AlignSlider({ label, value, min, max, step, unit, onChange }) {
  return (
    <Slider value={value} onChange={onChange} minValue={min} maxValue={max} step={step}>
      <Label>{label}</Label>
      <Slider.Output>{({ state }) => `${state.values[0]}${unit}`}</Slider.Output>
      <Slider.Track>
        <Slider.Fill />
        <Slider.Thumb />
      </Slider.Track>
    </Slider>
  );
}
