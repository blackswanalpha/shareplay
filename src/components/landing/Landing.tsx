"use client";

import dynamic from "next/dynamic";

const LandingBackground = dynamic(
  () =>
    import("@/components/landing/LandingBackground").then(
      (m) => m.LandingBackground
    ),
  { ssr: false }
);

const LandingCard = dynamic(
  () =>
    import("@/components/landing/LandingCard").then((m) => m.LandingCard),
  { ssr: false }
);

const LandingAudio = dynamic(
  () =>
    import("@/components/landing/LandingAudio").then((m) => m.LandingAudio),
  { ssr: false }
);

export function Landing() {
  return (
    <>
      <LandingBackground />
      <LandingCard />
      <LandingAudio />
    </>
  );
}
