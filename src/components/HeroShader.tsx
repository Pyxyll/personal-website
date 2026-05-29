import { Dithering } from "@paper-design/shaders-react";

// Ambient dithered shader for the home hero. Bayer-matrix dither in pink-on-black.
// Tuned to read as a quiet backdrop, not an active field:
//   - high scale → big, slow features
//   - low speed  → barely-moving drift
//   - 0.7 opacity → recedes behind type
//   - tight mask → only the central area shows, fades hard to page edge
//
// maxPixelCount: the lib defaults to 1920*1080*4 (~8.3M). Above that it renders
// the shader below display resolution and the browser upscales it, which makes
// the ordered dither pattern beat against the pixel grid and produces visible
// horizontal banding on large/maximised windows. We raise the cap so the shader
// always renders 1:1 (covers up to ~4K @ 2x DPR). The dither shader is cheap, so
// the extra fragments are essentially free.
const MAX_PIXEL_COUNT = 1920 * 1080 * 16; // ~33M

export default function HeroShader() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{
        opacity: 0.7,
        maskImage:
          "radial-gradient(ellipse 55% 55% at 50% 45%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 85%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 55% 55% at 50% 45%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 85%)",
      }}
    >
      <Dithering
        width="100%"
        height="100%"
        maxPixelCount={MAX_PIXEL_COUNT}
        colorBack="#0a0a0a"
        colorFront="#da2862"
        shape="warp"
        type="4x4"
        size={2}
        scale={3}
        speed={0.07}
      />
    </div>
  );
}
