"use client";

import React from "react";
import { Beanie } from "./Beanie";
import { SantaHat } from "./SantaHat";
import { Glasses } from "./Glasses";

// Aksesori bersama untuk semua karakter. Mood menyebut `accessory: "<nama>"`,
// dan nama itu harus ada di `allowedAccessories` milik karakter.
//
// Tiap aksesori menempel ke titik tempel (anchors) karakter:
//   beanie, santa_hat — titik "hat"
//   glasses           — titik "face"
const ACCESSORIES = {
  beanie: { anchor: "hat", Component: Beanie },
  santa_hat: { anchor: "hat", Component: SantaHat },
  glasses: { anchor: "face", Component: Glasses },
};

export const ACCESSORY_NAMES = Object.keys(ACCESSORIES);

export function Accessory({ type, allowed = [], points, headWidth, eyeOffset }) {
  if (!type) return null;

  const accessory = ACCESSORIES[type];
  if (!accessory || !allowed.includes(type)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Aksesori "${type}" tidak dikenal atau tidak diizinkan untuk karakter ini.`);
    }
    return null;
  }

  const { x, y } = points[accessory.anchor];
  const { Component } = accessory;
  return <Component x={x} y={y} headWidth={headWidth} eyeOffset={eyeOffset} />;
}

export default Accessory;
