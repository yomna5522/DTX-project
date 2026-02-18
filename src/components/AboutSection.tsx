import { useRef, useState, useEffect } from "react";
import { Sparkles, Eye, Layers, Heart, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import aboutImage from "@/assets/about-printing.jpg";

// Video URL: prefer src/assets/about2.mp4 (dynamic import so build works if file is missing)
const getAbout2VideoUrl = (): Promise<string> =>
  import("@/assets/about2.mp4")
    .then((m) => m.default)
    .catch(() => "/about2.mp4");

const features = [
  { icon: Sparkles, titleKey: "lastingBrilliance", descKey: "lastingBrillianceDesc", color: "bg-[#F5BB00]" },
  { icon: Eye, titleKey: "sharpDetails", descKey: "sharpDetailsDesc", color: "bg-[#EC1C24]" },
  { icon: Layers, titleKey: "diverseSelection", descKey: "diverseSelectionDesc", color: "bg-[#002B5B]" },
  { icon: Heart, titleKey: "yourVision", descKey: "yourVisionDesc", color: "bg-[#D63384]" },
];

const AboutSection = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [videoSrcLoaded, setVideoSrcLoaded] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    getAbout2VideoUrl().then(setVideoUrl);
  }, []);

  const handleVideoEnded = () => {
    setPlaying(false);
    setVideoEnded(true);
  };

  const togglePlay = async () => {
    if (videoUnavailable || !videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
      return;
    }
    setVideoEnded(false);
    const video = videoRef.current;
    const url = videoUrl ?? await getAbout2VideoUrl();
    if (url) setVideoUrl(url);
    if (!videoSrcLoaded && url) {
      video.src = url;
      setVideoSrcLoaded(true);
      const onCanPlay = () => {
        video.removeEventListener("canplay", onCanPlay);
        video.play().then(() => setPlaying(true)).catch(() => setVideoUnavailable(true));
      };
      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("error", () => {
        video.removeEventListener("canplay", onCanPlay);
        setVideoUnavailable(true);
      }, { once: true });
      video.load();
      return;
    }
    if (videoSrcLoaded) {
      if (videoEnded) video.currentTime = 0;
      video.play().then(() => setPlaying(true)).catch(() => setVideoUnavailable(true));
    }
  };

  const handleVideoPlay = () => setPlaying(true);
  const handleVideoPause = () => setPlaying(false);
  const handleVideoError = () => setVideoUnavailable(true);

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle curved lines in background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 800 600" fill="none">
          <path d="M0 80 Q200 40 400 80 T800 80" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <path d="M0 160 Q250 120 500 160 T800 160" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <path d="M0 240 Q150 200 400 240 T800 240" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <path d="M100 0 Q100 150 100 300 Q100 450 100 600" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
          <path d="M250 0 Q250 180 250 400 T250 600" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 md:mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
            <span className="text-[120px] md:text-[200px] font-heading font-black text-slate-100 uppercase tracking-tighter opacity-90 scale-x-110">
              About
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.4em] mb-3">
              {t("about.aboutCompany")}
            </p>
            <h2 className="font-heading text-3xl md:text-5xl font-black text-primary tracking-tight">
              {t("about.heading")}
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Video/poster block: larger size, red L-corner, custom play overlay. Graceful fallback when no video source. */}
          <div className="relative rounded-xl overflow-hidden bg-slate-100 shadow-xl w-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[580px]">
            {/* Red L-shaped corner frame */}
            <div className="absolute top-0 left-0 z-20 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500 rounded-r shadow-sm" />
              <div className="absolute top-0 left-0 w-2 h-full bg-red-500 rounded-b shadow-sm" />
            </div>

            {videoUnavailable ? (
              /* Fallback: show poster image only when video has no supported source */
              <img
                src={aboutImage}
                alt="About DTX Printing"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  poster={aboutImage}
                  playsInline
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  className="absolute inset-0 w-full h-full object-cover"
                  title="About DTX Printing"
                />
                {/* Poster image overlay when video has ended so the image appears again */}
                {videoEnded && (
                  <img
                    src={aboutImage}
                    alt="About DTX Printing"
                    className="absolute inset-0 z-[5] w-full h-full object-cover"
                    aria-hidden
                  />
                )}
              </>
            )}

            {/* Custom white circle + red play icon (hidden when playing or when video unavailable) */}
            {!playing && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 transition-opacity hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 rounded-xl disabled:pointer-events-none"
                aria-label="Play video"
              >
                <span className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white shadow-2xl flex items-center justify-center ring-8 ring-white/30 transition-transform hover:scale-105 active:scale-95">
                  <Play className="h-8 w-8 md:h-10 md:w-10 text-red-500 fill-red-500 ml-1 rtl:ml-0 rtl:mr-1 rtl:rotate-180" strokeWidth={2} />
                </span>
              </button>
            )}

            {playing && !videoUnavailable && (
              <div className="absolute bottom-0 left-0 right-0 z-10 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            )}
          </div>

          <div>
            <p className="text-slate-600 leading-relaxed mb-8 text-sm md:text-base">
              {t("about.intro")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {features.map((f, i) => (
                <div key={i} className="flex flex-col items-start gap-3">
                  <div className={`w-12 h-12 rounded-full ${f.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-heading text-base md:text-lg font-black text-slate-900 mb-1.5 tracking-tight">
                      {t(`about.${f.titleKey}`)}
                    </h4>
                    <p className="text-slate-500 text-[13px] leading-relaxed">
                      {t(`about.${f.descKey}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
