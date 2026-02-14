import React from "react";
import { cn } from "@/lib/utils";
import type { RepeatType } from "@/api/userDesigns";

/** Renders a pattern with the correct repeat (full_drop, half_drop, centre, mirror) so design is reflected as made. */
export function PatternThumbnail({
  imageDataUrl,
  repeatType,
  tileSize = 80,
  className,
}: {
  imageDataUrl: string;
  repeatType?: RepeatType;
  tileSize?: number;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ts = tileSize;

  React.useEffect(() => {
    if (!imageDataUrl || (repeatType !== "half_drop" && repeatType !== "mirror")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (repeatType === "half_drop") {
        for (let row = -1; row <= 4; row++) {
          for (let col = -1; col <= 4; col++) {
            const x = col * ts + (row % 2 === 0 ? 0 : ts / 2);
            const y = row * ts;
            ctx.drawImage(img, x, y, ts, ts);
          }
        }
      } else {
        const tw = ts * 2;
        const th = ts * 2;
        for (let row = -1; row <= 4; row++) {
          for (let col = -1; col <= 4; col++) {
            const bx = col * tw;
            const by = row * th;
            ctx.drawImage(img, bx, by, ts, ts);
            ctx.save();
            ctx.translate(bx + 2 * ts, by);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, ts, ts);
            ctx.restore();
            ctx.save();
            ctx.translate(bx, by + 2 * ts);
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, 0, ts, ts);
            ctx.restore();
            ctx.save();
            ctx.translate(bx + 2 * ts, by + 2 * ts);
            ctx.scale(-1, -1);
            ctx.drawImage(img, 0, 0, ts, ts);
            ctx.restore();
          }
        }
      }
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, repeatType, ts]);

  if (repeatType === "half_drop" || repeatType === "mirror") {
    return <canvas ref={canvasRef} className={cn("w-full h-full object-cover", className)} style={{ width: "100%", height: "100%" }} />;
  }
  const bgStyle =
    repeatType === "centre"
      ? { backgroundImage: `url(${imageDataUrl})`, backgroundSize: `${ts}px`, backgroundRepeat: "no-repeat" as const, backgroundPosition: "center" }
      : { backgroundImage: `url(${imageDataUrl})`, backgroundSize: `${ts}px`, backgroundRepeat: "repeat" as const };
  return <div className={cn("w-full h-full bg-slate-100 bg-center", className)} style={bgStyle} />;
}
