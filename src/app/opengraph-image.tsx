import { ImageResponse } from "next/og";

import {
  SNAPSHOT,
  getRisingTechnologies,
  releases,
  technologies,
} from "@/lib/data";

export const alt =
  "Frontend Radar — painel de tendências e tecnologias do ecossistema frontend";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0b100e",
          color: "#ecf4ee",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 720,
            height: 720,
            borderRadius: 999,
            border: "1px solid rgba(163,230,53,0.12)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -60,
            width: 520,
            height: 520,
            borderRadius: 999,
            border: "1px solid rgba(163,230,53,0.18)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 130,
            width: 210,
            height: 210,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(163,230,53,0.22) 0%, rgba(163,230,53,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#a3e635",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                border: "2px solid #101a12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#101a12",
                  display: "flex",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                fontFamily: "monospace",
              }}
            >
              frontend.radar
            </span>
            <span style={{ fontSize: 13, color: "#8fa298" }}>
              trend observatory
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 78 }}>
          <span
            style={{
              fontSize: 14,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#a3e635",
              fontFamily: "monospace",
            }}
          >
            snapshot · {SNAPSHOT.label}
          </span>
          <span
            style={{
              marginTop: 10,
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              maxWidth: 820,
            }}
          >
            O pulso do frontend
          </span>
          <span
            style={{
              marginTop: 18,
              fontSize: 24,
              lineHeight: 1.4,
              color: "#9fb2a7",
              maxWidth: 720,
            }}
          >
            Tendências, releases e maturidade das tecnologias que estão
            moldando o desenvolvimento frontend.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: "auto",
          }}
        >
          {[
            { value: technologies.length, label: "tecnologias" },
            { value: releases.length, label: "releases" },
            { value: getRisingTechnologies().length, label: "em ascensão" },
            { value: 5, label: "categorias" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                padding: "12px 18px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#a3e635",
                  fontFamily: "monospace",
                }}
              >
                {stat.value}
              </span>
              <span style={{ fontSize: 14, color: "#8fa298" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
