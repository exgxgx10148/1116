import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "日暮町・老宅喫茶 | 勤美文青甜點咖啡廳" },
      {
        name: "description",
        content:
          "台中勤美商圈半世紀老宅咖啡廳，專為旅人與創作者打造，提供手作馬卡龍、義式冰淇淋、蛋糕與精品飲品，線上預約午後時光。",
      },
      { property: "og:title", content: "日暮町・老宅喫茶 | 勤美文青甜點咖啡廳" },
      {
        property: "og:description",
        content: "台中勤美老宅咖啡廳：手作甜點、精品咖啡與創作者友善座位，歡迎線上預約。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@400;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      },
    ],
  }),
  component: Index,
});

type LightboxItem = { img: string; name: string; price: string; desc: string };
type Booking = {
  name: string;
  phone: string;
  guests: string;
  date: string;
  time: string;
  notes: string;
};

const SLIDE_COUNT = 6;
const SLIDE_INTERVAL_MS = 4000;

function BookingSummary({ booking }: { booking: Booking }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        <div>
          <span className="text-emerald-700">姓名：</span>
          <span className="font-bold">{booking.name}</span>
        </div>
        <div>
          <span className="text-emerald-700">電話：</span>
          <span className="font-bold">{booking.phone}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        <div>
          <span className="text-emerald-700">日期：</span>
          <span className="font-bold">{booking.date}</span>
        </div>
        <div>
          <span className="text-emerald-700">時段：</span>
          <span className="font-bold">{booking.time}</span>
        </div>
      </div>
      <div>
        <span className="text-emerald-700">人數：</span>
        <span className="font-bold">{booking.guests}</span>
      </div>
      <div>
        <span className="text-emerald-700">備註：</span>
        <span className="font-bold">{booking.notes}</span>
      </div>
    </>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [slideIndex, setSlideIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [today, setToday] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // Gallery auto-advance; restarts whenever a dot is picked.
  useEffect(() => {
    const id = window.setInterval(
      () => setSlideIndex((i) => (i + 1) % SLIDE_COUNT),
      SLIDE_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [timerKey]);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lightbox: lock background scroll, close on Escape, return focus on close.
  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  useEffect(() => {
    if (booking) successRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [booking]);

  function openLightbox(img: string, name: string, price: string, desc: string) {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setLightbox({ img, name, price, desc });
  }

  function closeLightbox() {
    setLightbox(null);
    lastFocusRef.current?.focus?.();
  }

  const nextSlide = () => setSlideIndex((i) => (i + 1) % SLIDE_COUNT);
  const prevSlide = () => setSlideIndex((i) => (i - 1 + SLIDE_COUNT) % SLIDE_COUNT);
  const goToSlide = (i: number) => {
    setSlideIndex(i);
    setTimerKey((k) => k + 1);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const field = (id: string) =>
      (
        form.elements.namedItem(id) as
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null
      )?.value ?? "";
    setBooking({
      name: field("name"),
      phone: field("phone"),
      guests: field("guests"),
      date: field("date"),
      time: field("time"),
      notes: field("notes") || "無",
    });
    form.reset();
  }

  return (
    <div className="bg-cream text-brand-900 selection:bg-brand-200">
      {/* 01. Navigation (Logo / 選單 / 訂位 CTA) */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-b border-brand-200/60 transition-all duration-300"
        id="navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <a href="#home" className="flex items-center space-x-2.5 sm:space-x-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-700 text-cream flex items-center justify-center shadow-md group-hover:bg-brand-800 transition shrink-0">
              <i className="fa-solid fa-house-chimney text-base sm:text-lg"></i>
            </div>
            <div>
              <span className="serif-title text-lg sm:text-xl font-bold tracking-wider text-brand-900">
                日暮町
              </span>
              <span className="block text-[10px] sm:text-xs text-brand-600 tracking-widest uppercase">
                Nichimuracho Coffee
              </span>
            </div>
          </a>

          {/* 桌面版導覽連結 */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            <a href="#home" className="text-brand-800 hover:text-warmamber transition">
              首頁 Home
            </a>
            <span className="text-brand-300">|</span>
            <a href="#about" className="text-brand-800 hover:text-warmamber transition">
              關於 About
            </a>
            <span className="text-brand-300">|</span>
            <a href="#menu" className="text-brand-800 hover:text-warmamber transition">
              菜單 Menu
            </a>
            <span className="text-brand-300">|</span>
            <a href="#space" className="text-brand-800 hover:text-warmamber transition">
              環境 Gallery
            </a>
            <span className="text-brand-300">|</span>
            <a href="#booking" className="text-brand-800 hover:text-warmamber transition">
              訂位 Reservation
            </a>
            <span className="text-brand-300">|</span>
            <a href="#info" className="text-brand-800 hover:text-warmamber transition">
              聯絡 Contact
            </a>
            <a
              href="#booking"
              className="ml-2 bg-brand-700 text-cream px-5 py-2.5 rounded-full shadow-sm hover:bg-brand-800 transition transform hover:-translate-y-0.5"
            >
              線上預約 CTA
            </a>
          </div>

          {/* 行動版選單按鈕 */}
          <div className="lg:hidden flex items-center">
            <button
              id="menu-btn"
              className="text-brand-800 focus:outline-none p-3 active:scale-95 transition"
              aria-label="打開導覽選單"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <i className="fa-solid fa-bars text-xl sm:text-2xl"></i>
            </button>
          </div>
        </div>

        {/* 行動版下拉選單 (支援全螢幕流暢開合與大觸控區) */}
        <div
          id="mobile-menu"
          className={`lg:hidden bg-cream/98 backdrop-blur-lg border-b border-brand-200 px-6 py-4 space-y-3 shadow-xl transition-all duration-300 max-h-[calc(100vh-4rem)] overflow-y-auto ${menuOpen ? "" : "hidden"}`}
        >
          <a
            href="#home"
            className="mobile-link block text-brand-800 font-medium py-3 px-2 rounded-xl active:bg-brand-100 border-b border-brand-100 text-base"
            onClick={() => setMenuOpen(false)}
          >
            首頁 Home
          </a>
          <a
            href="#about"
            className="mobile-link block text-brand-800 font-medium py-3 px-2 rounded-xl active:bg-brand-100 border-b border-brand-100 text-base"
            onClick={() => setMenuOpen(false)}
          >
            關於 About
          </a>
          <a
            href="#menu"
            className="mobile-link block text-brand-800 font-medium py-3 px-2 rounded-xl active:bg-brand-100 border-b border-brand-100 text-base"
            onClick={() => setMenuOpen(false)}
          >
            菜單 Menu
          </a>
          <a
            href="#space"
            className="mobile-link block text-brand-800 font-medium py-3 px-2 rounded-xl active:bg-brand-100 border-b border-brand-100 text-base"
            onClick={() => setMenuOpen(false)}
          >
            環境 Gallery
          </a>
          <a
            href="#booking"
            className="mobile-link block text-brand-800 font-medium py-3 px-2 rounded-xl active:bg-brand-100 border-b border-brand-100 text-base"
            onClick={() => setMenuOpen(false)}
          >
            訂位 Reservation
          </a>
          <a
            href="#info"
            className="mobile-link block text-brand-800 font-medium py-3 px-2 rounded-xl active:bg-brand-100 border-b border-brand-100 text-base"
            onClick={() => setMenuOpen(false)}
          >
            聯絡 Contact
          </a>
          <a
            href="#booking"
            className="mobile-link block text-center bg-brand-700 text-cream py-3.5 rounded-full font-medium shadow-md mt-4 text-base"
            onClick={() => setMenuOpen(false)}
          >
            線上預約 CTA
          </a>
        </div>
      </nav>

      {/* 02. Hero (主視覺 / 標語) */}
      <header
        id="home"
        className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-gradient-to-b from-brand-100/60 to-cream"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-brand-200/70 text-brand-800 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider">
                <i className="fa-solid fa-location-dot text-warmamber"></i>
                <span>台中市西區勤美商圈老宅特區</span>
              </div>
              <h1 className="serif-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-900 leading-tight sm:leading-[2.5rem] md:leading-none lg:leading-none">
                在老宅的日落餘暉中，
                <br className="hidden sm:inline" />
                尋找創作者的靈感角落。
              </h1>
              <p className="text-brand-700 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0 sm:leading-[1.5rem] lg:leading-[1.75rem]">
                座落於台中勤美一帶的半世紀老宅。專為旅人與創作者打造的明亮溫馨咖啡廳，伴隨手作甜點與精品飲品，沉澱您的思緒。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-2 sm:pt-4">
                <a
                  href="#booking"
                  className="w-full sm:w-auto bg-brand-700 hover:bg-brand-800 text-cream px-8 py-3.5 sm:py-4 rounded-full font-medium shadow-md transition duration-300 text-center text-sm sm:text-base active:scale-98"
                >
                  預約您的午後時光
                </a>
                <a
                  href="#menu"
                  className="w-full sm:w-auto border border-brand-300 hover:bg-brand-200/50 text-brand-900 px-8 py-3.5 sm:py-4 rounded-full font-medium transition duration-300 text-center text-sm sm:text-base active:scale-98"
                >
                  探索精選菜單
                </a>
              </div>
            </div>

            {/* 視覺展示圖片 */}
            <div className="relative px-2 sm:px-0">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="/site-assets/nichimuracho-cafe-600x700-f5f0ec.png"
                  alt="日暮町咖啡廳外觀與環境"
                  className="w-full h-[320px] sm:h-[420px] lg:h-[480px] object-cover hover:scale-105 transition duration-700"
                />
              </div>
              {/* 浮動小卡 (在極小手機螢幕自動隱藏或調整位置避免溢出) */}
              <div className="absolute -bottom-4 left-4 sm:-bottom-6 sm:left-6 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-xl shadow-xl border border-brand-200 flex items-center space-x-3 max-w-[90%] sm:max-w-xs">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center text-warmamber text-lg sm:text-xl shrink-0">
                  <i className="fa-solid fa-mug-hot"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs text-brand-600 font-medium truncate">
                    嚴選莊園咖啡豆與茶飲
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-brand-900 truncate">
                    手沖、特調飲品與手作甜點
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 03. Intro (品牌特色簡介) */}
      <section id="about" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <span className="text-xs uppercase tracking-widest text-warmamber font-bold">
              03. Intro // Brand Features
            </span>
            <h2 className="serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-950">
              老宅改建、明亮溫馨、專為旅客與創作者打造
            </h2>
            <div className="w-16 h-1 bg-warmamber mx-auto rounded-full"></div>
            <p className="text-brand-700 text-sm sm:text-base lg:text-lg">
              「日暮町」融合了半世紀的建築記憶與當代溫暖美學，是靈感與咖啡香交織的庇護所。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 特色 1 */}
            <div className="bg-brand-50 rounded-2xl p-6 sm:p-8 border border-brand-200/60 hover:shadow-lg transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-200/60 rounded-xl flex items-center justify-center text-brand-800 text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:bg-brand-700 group-hover:text-cream transition duration-300">
                <i className="fa-solid fa-house-laptop"></i>
              </div>
              <h3 className="serif-title text-lg sm:text-xl font-bold text-brand-900 mb-2 sm:mb-3">
                老宅改建與光影美學
              </h3>
              <p className="text-brand-700 text-xs sm:text-sm leading-relaxed sm:leading-[1.25rem]">
                保留了50年代的磨石子與紅磚牆面，搭配大面玻璃窗引入勤美特區的自然光，營造明亮且溫馨的沉靜氛圍。
              </p>
            </div>

            {/* 特色 2 */}
            <div className="bg-brand-50 rounded-2xl p-6 sm:p-8 border border-brand-200/60 hover:shadow-lg transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-200/60 rounded-xl flex items-center justify-center text-brand-800 text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:bg-brand-700 group-hover:text-cream transition duration-300">
                <i className="fa-solid fa-compass"></i>
              </div>
              <h3 className="serif-title text-lg sm:text-xl font-bold text-brand-900 mb-2 sm:mb-3">
                旅客與創作者的聚落
              </h3>
              <p className="text-brand-700 text-xs sm:text-sm leading-relaxed sm:leading-[1.25rem]">
                專為遠端工作者、文字創作者及外地旅客準備的自由角落。提供穩定插座、高速Wi-Fi與自在的交流空間。
              </p>
            </div>

            {/* 特色 3 */}
            <div className="bg-brand-50 rounded-2xl p-6 sm:p-8 border border-brand-200/60 hover:shadow-lg transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-200/60 rounded-xl flex items-center justify-center text-brand-800 text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:bg-brand-700 group-hover:text-cream transition duration-300">
                <i className="fa-solid fa-cookie-bite"></i>
              </div>
              <h3 className="serif-title text-lg sm:text-xl font-bold text-brand-900 mb-2 sm:mb-3">
                手作甜點與精品飲品
              </h3>
              <p className="text-brand-700 text-xs sm:text-sm leading-relaxed sm:leading-[1.25rem]">
                每日新鮮手作法式馬卡龍、義式冰淇淋與特製蛋糕，完美搭配精品咖啡與特調飲品，療癒您的下午茶時光。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Menu Preview (精選菜單與互動分類，每類至少9個品項) */}
      <section id="menu" className="py-16 sm:py-20 lg:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3 sm:space-y-4">
            <span className="text-xs uppercase tracking-widest text-warmamber font-bold">
              04. Menu Preview // Handcrafted Selection
            </span>
            <h2 className="serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-950">
              精選菜單（馬卡龍、冰淇淋、蛋糕、飲品）
            </h2>
            <div className="w-16 h-1 bg-warmamber mx-auto rounded-full"></div>
            <p className="text-brand-700 text-sm sm:text-base">
              點擊下方分類探索品項，或點擊圖片可放大檢視高畫質細節。
            </p>
          </div>

          {/* 分類切換按鈕 (手機上可水平滑動或自動換行) */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
            <button
              className={`menu-tab-btn px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition active:scale-95 ${category === "all" ? "active bg-brand-700 text-cream shadow-sm" : "bg-brand-200/70 text-brand-800"}`}
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
            >
              全部品項
            </button>
            <button
              className={`menu-tab-btn px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-brand-300 transition active:scale-95 ${category === "macaron" ? "active bg-brand-700 text-cream shadow-sm" : "bg-brand-200/70 text-brand-800"}`}
              onClick={() => setCategory("macaron")}
              aria-pressed={category === "macaron"}
            >
              馬卡龍 (9)
            </button>
            <button
              className={`menu-tab-btn px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-brand-300 transition active:scale-95 ${category === "icecream" ? "active bg-brand-700 text-cream shadow-sm" : "bg-brand-200/70 text-brand-800"}`}
              onClick={() => setCategory("icecream")}
              aria-pressed={category === "icecream"}
            >
              冰淇淋 (9)
            </button>
            <button
              className={`menu-tab-btn px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-brand-300 transition active:scale-95 ${category === "cake" ? "active bg-brand-700 text-cream shadow-sm" : "bg-brand-200/70 text-brand-800"}`}
              onClick={() => setCategory("cake")}
              aria-pressed={category === "cake"}
            >
              蛋糕 (9)
            </button>
            <button
              className={`menu-tab-btn px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-brand-300 transition active:scale-95 ${category === "beverage" ? "active bg-brand-700 text-cream shadow-sm" : "bg-brand-200/70 text-brand-800"}`}
              onClick={() => setCategory("beverage")}
              aria-pressed={category === "beverage"}
            >
              飲品 (9)
            </button>
          </div>

          {/* 菜單品項 Grid (共36個品項) */}
          <div
            id="menu-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* ================= MACARON (9 items) ================= */}
            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/rose-macaron.jpg",
                    "玫瑰覆盆子馬卡龍",
                    "NT$ 120",
                    "嚴選有機玫瑰純露與法式覆盆子果醬，外酥內軟，香氣雅緻。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/rose-macaron.jpg"
                  loading="lazy"
                  alt="玫瑰覆盆子馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍推薦
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      玫瑰覆盆子馬卡龍
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 120</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    嚴選有機玫瑰純露與法式覆盆子果醬，外酥內軟，香氣雅緻。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、蛋
                  </span>
                  <span className="text-warmamber font-medium">每日手作限量</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between relative ring-2 ring-warmamber/50"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-warmamber text-white px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold shadow-lg flex items-center space-x-1">
                <i className="fa-solid fa-crown"></i>
                <span>人氣排行第1</span>
              </div>
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/matcha-macaron.jpg",
                    "宇治抹茶柚子馬卡龍",
                    "NT$ 120",
                    "濃郁抹茶甘納許包裹日本高知縣柚子醬夾心，酸甜平衡。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/matcha-macaron.jpg"
                  loading="lazy"
                  alt="抹茶柚子馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍推薦
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      宇治抹茶柚子馬卡龍
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 120</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    濃郁抹茶甘納許包裹日本高知縣柚子醬夾心，酸甜平衡。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、蛋
                  </span>
                  <span className="text-warmamber font-medium">職人手作</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/salted-caramel-macaron.jpg",
                    "布列塔尼海鹽焦糖馬卡龍",
                    "NT$ 110",
                    "手工熬煮焦糖醬搭配法國蓋朗德鹽之花，鹹甜交織不膩口。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/salted-caramel-macaron.jpg"
                  loading="lazy"
                  alt="海鹽焦糖馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍經典
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      布列塔尼海鹽焦糖馬卡龍
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 110</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    手工熬煮焦糖醬搭配法國蓋朗德鹽之花，鹹甜交織不膩口。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、乳製品
                  </span>
                  <span className="text-warmamber font-medium">人氣暢銷</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/earl-grey-macaron.jpg",
                    "皇家伯爵奶茶馬卡龍",
                    "NT$ 110",
                    "浸製斯里蘭卡伯爵茶葉的濃郁鮮奶油內餡，佛手柑香氣迷人。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/earl-grey-macaron.jpg"
                  loading="lazy"
                  alt="伯爵奶茶馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍特選
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      皇家伯爵奶茶馬卡龍
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 110</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    浸製斯里蘭卡伯爵茶葉的濃郁鮮奶油內餡，佛手柑香氣迷人。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、蛋
                  </span>
                  <span className="text-warmamber font-medium">茶香濃郁</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/lavender-blueberry-macaron.jpg",
                    "普羅旺斯薰衣草藍莓",
                    "NT$ 130",
                    "淡雅薰衣草花香融合新鮮手熬藍莓果泥，夢幻紫色調。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/lavender-blueberry-macaron.jpg"
                  loading="lazy"
                  alt="薰衣草藍莓馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍季節
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      普羅旺斯薰衣草藍莓
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 130</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    淡雅薰衣草花香融合新鮮手熬藍莓果泥，夢幻紫色調。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、蛋
                  </span>
                  <span className="text-warmamber font-medium">季節限定</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/pistachio-macaron.jpg",
                    "西西里特級開心果馬卡龍",
                    "NT$ 130",
                    "嚴選義大利西西里島開心果研磨製成濃郁果仁奶油夾心。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/pistachio-macaron.jpg"
                  loading="lazy"
                  alt="開心果馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍精選
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      西西里特級開心果馬卡龍
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 130</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    嚴選義大利西西里島開心果研磨製成濃郁果仁奶油夾心。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、蛋
                  </span>
                  <span className="text-warmamber font-medium">堅果香氣</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/lemon-macaron.jpg",
                    "盛夏屏東黃檸檬馬卡龍",
                    "NT$ 110",
                    "新鮮現榨屏東檸檬汁調製微酸檸檬凝乳，清爽解膩首選。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/lemon-macaron.jpg"
                  loading="lazy"
                  alt="黃檸檬馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍清爽
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      盛夏屏東黃檸檬馬卡龍
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 110</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    新鮮現榨屏東檸檬汁調製微酸檸檬凝乳，清爽解膩首選。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、蛋
                  </span>
                  <span className="text-warmamber font-medium">酸甜清香</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/chocolate-macaron.jpg",
                    "法芙娜70%苦甜巧克馬卡龍",
                    "NT$ 120",
                    "採用法芙娜頂級巧克力製作甘納許，口感深邃且餘韻無窮。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/chocolate-macaron.jpg"
                  loading="lazy"
                  alt="法式苦甜巧克馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍醇厚
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      法芙娜70%苦甜巧克馬卡龍
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 120</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    採用法芙娜頂級巧克力製作甘納許，口感深邃且餘韻無窮。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、蛋
                  </span>
                  <span className="text-warmamber font-medium">濃郁巧克力</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="macaron"
              style={{ display: category === "all" || category === "macaron" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/strawberry-macaron.jpg",
                    "大湖草莓煉乳馬卡龍",
                    "NT$ 130",
                    "新鮮草莓凍乾碎粒融入香甜煉乳白巧夾心，甜蜜滋味。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/strawberry-macaron.jpg"
                  loading="lazy"
                  alt="草莓煉乳馬卡龍"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  馬卡龍人氣
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      大湖草莓煉乳馬卡龍
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 130</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    新鮮草莓凍乾碎粒融入香甜煉乳白巧夾心，甜蜜滋味。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wheat-awn-circle-exclamation mr-1"></i> 含堅果、蛋
                  </span>
                  <span className="text-warmamber font-medium">甜蜜首選</span>
                </div>
              </div>
            </div>

            {/* ================= ICE CREAM (9 items) ================= */}
            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/vanilla-gelato.jpg",
                    "馬達加斯加香草義式冰淇淋",
                    "NT$ 150",
                    "使用天然香草豆莢，低乳脂製作，口感絲滑綿密不膩口。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/vanilla-gelato.jpg"
                  loading="lazy"
                  alt="香草籽義式冰淇淋"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋招牌
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      馬達加斯加香草義式冰淇淋
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    使用天然香草豆莢，低乳脂製作，口感絲滑綿密不膩口。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-cow mr-1"></i> 鮮乳坊鮮奶製作
                  </span>
                  <span className="text-warmamber font-medium">低脂濃郁</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between relative ring-2 ring-warmamber/50"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-warmamber text-white px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold shadow-lg flex items-center space-x-1">
                <i className="fa-solid fa-star"></i>
                <span>人氣王推薦</span>
              </div>
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/matcha-gelato.jpg",
                    "京都宇治濃抹茶冰淇淋",
                    "NT$ 160",
                    "雙倍小山園抹茶粉拌入，茶韻深厚微苦回甘，大人系風味。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/matcha-gelato.jpg"
                  loading="lazy"
                  alt="宇治抹茶冰淇淋"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋特選
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      京都宇治濃抹茶冰淇淋
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    雙倍小山園抹茶粉拌入，茶韻深厚微苦回甘，大人系風味。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-leaf mr-1"></i> 茶香濃厚
                  </span>
                  <span className="text-warmamber font-medium">大人系首選</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/berry-sorbet.jpg",
                    "手作鮮莓果粒雪酪 (Sorbet)",
                    "NT$ 150",
                    "0%乳脂肪，純粹以新鮮草莓果泥與天然果膠製成的冰涼清爽口感。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/berry-sorbet.jpg"
                  loading="lazy"
                  alt="鮮莓雪酪"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋雪酪
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      手作鮮莓果粒雪酪 (Sorbet)
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    0%乳脂肪，純粹以新鮮草莓果泥與天然果膠製成的冰涼清爽口感。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-seedling mr-1"></i> 全素可食 / 無乳脂
                  </span>
                  <span className="text-warmamber font-medium">清爽酸甜</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/mango-gelato.jpg",
                    "台南玉井愛文芒果冰淇淋",
                    "NT$ 160",
                    "嚴選在地玉井愛文芒果，香氣濃郁飽滿，每一口都是夏天滋味。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/mango-gelato.jpg"
                  loading="lazy"
                  alt="愛文芒果冰淇淋"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋季節
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      台南玉井愛文芒果冰淇淋
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    嚴選在地玉井愛文芒果，香氣濃郁飽滿，每一口都是夏天滋味。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-sun mr-1"></i> 在地鮮果
                  </span>
                  <span className="text-warmamber font-medium">夏季限定</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/dark-chocolate-gelato.jpg",
                    "比利時72%黑巧克力冰淇淋",
                    "NT$ 170",
                    "濃厚比利時黑可可豆製作，口感如絲絨般滑順，苦甜交織。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/dark-chocolate-gelato.jpg"
                  loading="lazy"
                  alt="黑巧冰淇淋"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋濃郁
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      比利時72%黑巧克力冰淇淋
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 170</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    濃厚比利時黑可可豆製作，口感如絲絨般滑順，苦甜交織。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-mug-hot mr-1"></i> 濃郁可可
                  </span>
                  <span className="text-warmamber font-medium">經典推薦</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/black-sesame-gelato.jpg",
                    "濃香手作黑芝麻冰淇淋",
                    "NT$ 150",
                    "嚴選烘焙黑芝麻研磨成醬，香氣撲鼻，長輩與文青一致大愛。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/black-sesame-gelato.jpg"
                  loading="lazy"
                  alt="黑芝麻冰淇淋"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋在地
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      濃香手作黑芝麻冰淇淋
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    嚴選烘焙黑芝麻研磨成醬，香氣撲鼻，長輩與文青一致大愛。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-seedling mr-1"></i> 濃郁堅果香
                  </span>
                  <span className="text-warmamber font-medium">古早風味</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/mint-choc-gelato.jpg",
                    "天然薄荷巧酥義式冰淇淋",
                    "NT$ 150",
                    "採用新鮮有機薄荷葉浸泡萃取，拌入手工巧克力脆片。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/mint-choc-gelato.jpg"
                  loading="lazy"
                  alt="薄荷巧酥冰淇淋"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋清涼
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      天然薄荷巧酥義式冰淇淋
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    採用新鮮有機薄荷葉浸泡萃取，拌入手工巧克力脆片。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-leaf mr-1"></i> 天然薄荷葉
                  </span>
                  <span className="text-warmamber font-medium">沁涼爽口</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/rum-raisin-gelato.jpg",
                    "牙買加蘭姆酒漬葡萄冰淇淋",
                    "NT$ 160",
                    "葡萄乾浸泡於陳年蘭姆酒中數週，香氣醇厚，大人系微醺首選。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/rum-raisin-gelato.jpg"
                  loading="lazy"
                  alt="蘭姆葡萄冰淇淋"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋微醺
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      牙買加蘭姆酒漬葡萄冰淇淋
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    葡萄乾浸泡於陳年蘭姆酒中數週，香氣醇厚，大人系微醺首選。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-wine-glass mr-1"></i> 含微量酒精
                  </span>
                  <span className="text-warmamber font-medium">大人系微醺</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="icecream"
              style={{
                display: category === "all" || category === "icecream" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/caramel-walnut-gelato.jpg",
                    "焦糖核桃脆片義式冰淇淋",
                    "NT$ 160",
                    "香濃焦糖冰淇淋基底，加入大量低溫烘烤的酥脆焦糖核桃碎。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/caramel-walnut-gelato.jpg"
                  loading="lazy"
                  alt="焦糖核桃冰淇淋"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  冰淇淋口感
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      焦糖核桃脆片義式冰淇淋
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    香濃焦糖冰淇淋基底，加入大量低溫烘烤的酥脆焦糖核桃碎。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-cookie mr-1"></i> 酥脆口感
                  </span>
                  <span className="text-warmamber font-medium">香甜豐富</span>
                </div>
              </div>
            </div>

            {/* ================= CAKE (9 items) ================= */}
            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between relative ring-2 ring-warmamber/50"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-warmamber text-white px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold shadow-lg flex items-center space-x-1">
                <i className="fa-solid fa-heart"></i>
                <span>店長私房大推</span>
              </div>
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/matcha-crepe-cake.jpg",
                    "宇治小山園若竹千層蛋糕",
                    "NT$ 180",
                    "超過30層手工薄餅，夾入濃郁抹茶卡士達，茶香回甘悠長。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/matcha-crepe-cake.jpg"
                  loading="lazy"
                  alt="小山園抹茶千層"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕特選
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      宇治小山園若竹千層蛋糕
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 180</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    超過30層手工薄餅，夾入濃郁抹茶卡士達，茶香回甘悠長。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-leaf mr-1"></i> 日本進口抹茶粉
                  </span>
                  <span className="text-warmamber font-medium">職人手作</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/basque-cheesecake.jpg",
                    "北海道原味半熟巴斯克乳酪",
                    "NT$ 160",
                    "高溫烘烤出焦糖香氣外皮，內餡滑順如乳酪冰淇淋般濃郁入口即化。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/basque-cheesecake.jpg"
                  loading="lazy"
                  alt="巴斯克乳酪蛋糕"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕人氣
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      北海道原味半熟巴斯克乳酪
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    高溫烘烤出焦糖香氣外皮，內餡滑順如乳酪冰淇淋般濃郁入口即化。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-cheese mr-1"></i> 北海道乳酪
                  </span>
                  <span className="text-warmamber font-medium">店長推薦</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/strawberry-shortcake.jpg",
                    "日式昭和草莓鮮奶油蛋糕",
                    "NT$ 170",
                    "蓬鬆戚風蛋糕體搭配清爽不膩的日本中澤鮮奶油與新鮮草莓。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/strawberry-shortcake.jpg"
                  loading="lazy"
                  alt="草莓鮮奶油蛋糕"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕經典
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      日式昭和草莓鮮奶油蛋糕
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 170</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    蓬鬆戚風蛋糕體搭配清爽不膩的日本中澤鮮奶油與新鮮草莓。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-cake-candles mr-1"></i> 昭和懷舊風格
                  </span>
                  <span className="text-warmamber font-medium">每日限量</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/lemon-tart.jpg",
                    "法式酥脆檸檬凝乳塔",
                    "NT$ 150",
                    "手工塔皮香酥脆口，填滿酸V清香的檸檬凝乳與炙燒蛋白霜。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/lemon-tart.jpg"
                  loading="lazy"
                  alt="法式老奶奶檸檬塔"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕酸甜
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      法式酥脆檸檬凝乳塔
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    手工塔皮香酥脆口，填滿酸V清香的檸檬凝乳與炙燒蛋白霜。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-lemon mr-1"></i> 現榨檸檬汁
                  </span>
                  <span className="text-warmamber font-medium">酸甜清爽</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/walnut-brownie.jpg",
                    "核桃威士忌巧克力布朗尼",
                    "NT$ 150",
                    "加入威士忌提味的紮實布朗尼，搭配烘烤核桃，加熱後帶有熔岩口感。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/walnut-brownie.jpg"
                  loading="lazy"
                  alt="經典布朗尼"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕濃郁
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      核桃威士忌巧克力布朗尼
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    加入威士忌提味的紮實布朗尼，搭配烘烤核桃，加熱後帶有熔岩口感。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-fire mr-1"></i> 可加熱享用
                  </span>
                  <span className="text-warmamber font-medium">濃郁紮實</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/earl-grey-chiffon.jpg",
                    "伯爵茶香戚風佐焦糖脆片",
                    "NT$ 160",
                    "茶香四溢的戚風蛋糕體，淋上伯爵鮮奶油與手工焦糖脆片。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/earl-grey-chiffon.jpg"
                  loading="lazy"
                  alt="伯爵紅茶戚風"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕茶香
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      伯爵茶香戚風佐焦糖脆片
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    茶香四溢的戚風蛋糕體，淋上伯爵鮮奶油與手工焦糖脆片。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-mug-saucer mr-1"></i> 佛手柑茶香
                  </span>
                  <span className="text-warmamber font-medium">下午茶絕配</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/mont-blanc.jpg",
                    "法式栗子蒙布朗",
                    "NT$ 190",
                    "濃郁法國進口栗子泥細緻擠花，內層包裹香草香緹與糖漬栗子。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/mont-blanc.jpg"
                  loading="lazy"
                  alt="蒙布朗栗子塔"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕法式
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      法式栗子蒙布朗
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 190</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    濃郁法國進口栗子泥細緻擠花，內層包裹香草香緹與糖漬栗子。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-seedling mr-1"></i> 法國進口栗子泥
                  </span>
                  <span className="text-warmamber font-medium">精緻奢華</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/tiramisu.jpg",
                    "義式馬斯卡彭手作提拉米蘇",
                    "NT$ 160",
                    "手指餅乾吸飽濃縮咖啡與咖啡香甜酒，層層覆蓋濃郁馬斯卡彭起司。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/tiramisu.jpg"
                  loading="lazy"
                  alt="經典提拉米蘇"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕義式
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      義式馬斯卡彭手作提拉米蘇
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    手指餅乾吸飽濃縮咖啡與咖啡香甜酒，層層覆蓋濃郁馬斯卡彭起司。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-mug-hot mr-1"></i> 咖啡酒香
                  </span>
                  <span className="text-warmamber font-medium">經典義式</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="cake"
              style={{ display: category === "all" || category === "cake" ? undefined : "none" }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/berry-tart.jpg",
                    "森林野莓卡士達酥塔",
                    "NT$ 170",
                    "滿鋪藍莓、覆盆子與黑莓，搭配香草卡士達內餡與酥脆塔皮。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/berry-tart.jpg"
                  loading="lazy"
                  alt="綜合莓果塔"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  蛋糕繽紛
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      森林野莓卡士達酥塔
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 170</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    滿鋪藍莓、覆盆子與黑莓，搭配香草卡士達內餡與酥脆塔皮。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-seedling mr-1"></i> 新鮮野莓
                  </span>
                  <span className="text-warmamber font-medium">視覺饗宴</span>
                </div>
              </div>
            </div>

            {/* ================= BEVERAGES (9 items) ================= */}
            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/hand-drip-coffee.jpg",
                    "衣索比亞 耶加雪菲 水洗",
                    "NT$ 160",
                    "帶有明亮的柑橘、茉莉花香與檸檬紅茶風味，口感清爽層次豐富。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/hand-drip-coffee.jpg"
                  loading="lazy"
                  alt="手沖單品咖啡"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品手沖
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      衣索比亞 耶加雪菲 水洗
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    帶有明亮的柑橘、茉莉花香與檸檬紅茶風味，口感清爽層次豐富。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-mug-saucer mr-1"></i> 手工淺焙
                  </span>
                  <span className="text-warmamber font-medium">精品豆</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/brown-sugar-latte.jpg",
                    "日暮手作黑糖拿鐵",
                    "NT$ 150",
                    "濃縮咖啡與小農鮮乳完美融合，表面炙燒手作黑糖脆片，香甜滑順。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/brown-sugar-latte.jpg"
                  loading="lazy"
                  alt="日暮拿鐵"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品拿鐵
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      日暮手作黑糖拿鐵
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    濃縮咖啡與小農鮮乳完美融合，表面炙燒手作黑糖脆片，香甜滑順。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-mug-hot mr-1"></i> 溫潤香醇
                  </span>
                  <span className="text-warmamber font-medium">冬季人氣</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/cold-brew.jpg",
                    "慢速冰釀 12小時冷萃咖啡",
                    "NT$ 170",
                    "歷經12小時低溫萃取，酒香發酵感與甘甜滑順的口感令人驚豔。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/cold-brew.jpg"
                  loading="lazy"
                  alt="冰滴咖啡"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品冰滴
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      慢速冰釀 12小時冷萃咖啡
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 170</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    歷經12小時低溫萃取，酒香發酵感與甘甜滑順的口感令人驚豔。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-droplet mr-1"></i> 每日限量8杯
                  </span>
                  <span className="text-warmamber font-medium">職人冰釀</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/matcha-latte.jpg",
                    "宇治小山園職人抹茶拿鐵",
                    "NT$ 160",
                    "正宗小山園抹茶刷製，注入香濃蒸氣鮮奶，層次絲滑細緻。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/matcha-latte.jpg"
                  loading="lazy"
                  alt="小山園抹茶拿鐵"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品茶拿鐵
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      宇治小山園職人抹茶拿鐵
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    正宗小山園抹茶刷製，注入香濃蒸氣鮮奶，層次絲滑細緻。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-leaf mr-1"></i> 日本抹茶粉
                  </span>
                  <span className="text-warmamber font-medium">香濃滑順</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/earl-grey-tea.jpg",
                    "英國皇家伯爵葉茶 (可回沖)",
                    "NT$ 140",
                    "精選斯里蘭卡紅茶搭配天然佛手柑精油，茶湯清澈帶怡人果香。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/earl-grey-tea.jpg"
                  loading="lazy"
                  alt="皇家伯爵茶"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品茶品
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      英國皇家伯爵葉茶 (可回沖)
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 140</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    精選斯里蘭卡紅茶搭配天然佛手柑精油，茶湯清澈帶怡人果香。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-mug-saucer mr-1"></i> 可回沖熱飲
                  </span>
                  <span className="text-warmamber font-medium">舒心推薦</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/rose-chamomile-tea.jpg",
                    "法式有機玫瑰洋甘菊茶",
                    "NT$ 150",
                    "無咖啡因花草茶，結合玫瑰花瓣與德國洋甘菊，療癒安神。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/rose-chamomile-tea.jpg"
                  loading="lazy"
                  alt="玫瑰花草茶"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品花草
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      法式有機玫瑰洋甘菊茶
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    無咖啡因花草茶，結合玫瑰花瓣與德國洋甘菊，療癒安神。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-spa mr-1"></i> 無咖啡因
                  </span>
                  <span className="text-warmamber font-medium">放鬆安神</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/lemon-sparkling-coffee.jpg",
                    "西西里特調檸檬氣泡咖啡",
                    "NT$ 160",
                    "濃縮咖啡、屏東新鮮檸檬汁與強氣泡水，夏日消暑絕佳靈感來源。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/lemon-sparkling-coffee.jpg"
                  loading="lazy"
                  alt="西西里檸檬氣泡"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品氣泡
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      西西里特調檸檬氣泡咖啡
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 160</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    濃縮咖啡、屏東新鮮檸檬汁與強氣泡水，夏日消暑絕佳靈感來源。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-bolt mr-1"></i> 清爽氣泡
                  </span>
                  <span className="text-warmamber font-medium">消暑聖品</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/honey-yuzu-tea.jpg",
                    "韓國手作蜂蜜柚子茶 (冰/熱)",
                    "NT$ 130",
                    "酸甜清香的柚子果肉搭配天然純正龍眼蜂蜜，暖心又潤喉。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/honey-yuzu-tea.jpg"
                  loading="lazy"
                  alt="蜂蜜柚子茶"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品果茶
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      韓國手作蜂蜜柚子茶 (冰/熱)
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 130</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    酸甜清香的柚子果肉搭配天然純正龍眼蜂蜜，暖心又潤喉。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-mug-hot mr-1"></i> 天然蜂蜜
                  </span>
                  <span className="text-warmamber font-medium">溫潤爽口</span>
                </div>
              </div>
            </div>

            <div
              className="menu-item bg-white rounded-2xl overflow-hidden shadow-md border border-brand-200/60 flex flex-col justify-between"
              data-category="beverage"
              style={{
                display: category === "all" || category === "beverage" ? undefined : "none",
              }}
            >
              <div
                className="relative h-48 sm:h-56 overflow-hidden cursor-pointer group"
                onClick={() =>
                  openLightbox(
                    "/site-assets/menu/hot-cocoa.jpg",
                    "法芙娜棉花糖法式熱可可",
                    "NT$ 150",
                    "法芙娜可可粉結合溫熱小農鮮乳，鋪上炙燒手作棉花糖，療癒滿分。",
                  )
                }
              >
                <img
                  src="/site-assets/menu/hot-cocoa.jpg"
                  loading="lazy"
                  alt="法式熱可可"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> 點擊放大檢視
                  </span>
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur text-brand-900 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                  飲品暖心
                </span>
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="serif-title text-base sm:text-lg font-bold text-brand-900">
                      法芙娜棉花糖法式熱可可
                    </h3>
                    <span className="text-warmamber font-bold text-sm sm:text-base">NT$ 150</span>
                  </div>
                  <p className="text-brand-700 text-xs sm:text-sm">
                    法芙娜可可粉結合溫熱小農鮮乳，鋪上炙燒手作棉花糖，療癒滿分。
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between text-[11px] sm:text-xs text-brand-600">
                  <span>
                    <i className="fa-solid fa-heart mr-1"></i> 療癒系飲品
                  </span>
                  <span className="text-warmamber font-medium">秋冬必點</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05. Gallery (空間與餐點圖片展示 - 左右自動播放輪播滑塊) */}
      <section id="space" className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <span className="text-xs uppercase tracking-widest text-warmamber font-bold">
              {"05. Gallery // Atmosphere & Space Carousel"}
            </span>
            <h2 className="serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-950">
              建築外觀、室內空間與用餐情境
            </h2>
            <div className="w-16 h-1 bg-warmamber mx-auto rounded-full"></div>
            <p className="text-brand-700 text-sm sm:text-base lg:text-lg">
              透過自動輪播與左右切換，沉浸感受日暮町的老宅外觀、溫馨內裝與創作者聚落氛圍。
            </p>
          </div>

          {/* 輪播容器 (Carousel Container - 針對手機高度優化) */}
          <div className="relative max-w-5xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-brand-100 bg-brand-900">
            {/* 輪播幻燈片群組 */}
            <div
              id="carousel-track"
              className="relative h-[320px] sm:h-[420px] lg:h-[520px] w-full"
            >
              {/* Slide 1: 建築外觀 */}
              <div
                className="carousel-slide absolute inset-0 transition-opacity duration-1000 opacity-100 flex items-center justify-center"
                style={{ opacity: slideIndex === 0 ? 1 : 0 }}
                aria-hidden={slideIndex !== 0}
              >
                <img
                  src="/site-assets/gallery/architecture-exterior.jpg"
                  alt="老宅建築外觀"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/95 via-brand-900/30 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
                  <span className="text-warmamber text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1 sm:mb-2">
                    01 / 06 建築外觀
                  </span>
                  <h3 className="serif-title text-xl sm:text-2xl lg:text-3xl font-bold">
                    半世紀老宅・紅磚與綠意庭院
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-200 mt-1 sm:mt-2 max-w-2xl line-clamp-2 sm:line-clamp-none">
                    保留50年代台中老宅的紅磚外牆與日式屋瓦，在勤美商圈的綠蔭巷弄中散發溫暖靜謐的歷史韻味。
                  </p>
                </div>
              </div>

              {/* Slide 2: 室內空間 */}
              <div
                className="carousel-slide absolute inset-0 transition-opacity duration-1000 opacity-0 flex items-center justify-center"
                style={{ opacity: slideIndex === 1 ? 1 : 0 }}
                aria-hidden={slideIndex !== 1}
              >
                <img
                  src="/site-assets/gallery/interior-lighting-space.jpg"
                  alt="室內明亮空間"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/95 via-brand-900/30 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
                  <span className="text-warmamber text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1 sm:mb-2">
                    02 / 06 室內空間
                  </span>
                  <h3 className="serif-title text-xl sm:text-2xl lg:text-3xl font-bold">
                    明亮採光・磨石子地板與溫潤木質
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-200 mt-1 sm:mt-2 max-w-2xl line-clamp-2 sm:line-clamp-none">
                    大面玻璃窗引入豐沛自然光，映照出原汁原味的復古磨石子地板，營造明亮溫馨的舒適空間。
                  </p>
                </div>
              </div>

              {/* Slide 3: 創作者座位區 */}
              <div
                className="carousel-slide absolute inset-0 transition-opacity duration-1000 opacity-0 flex items-center justify-center"
                style={{ opacity: slideIndex === 2 ? 1 : 0 }}
                aria-hidden={slideIndex !== 2}
              >
                <img
                  src="/site-assets/gallery/creator-workspace-seats.jpg"
                  alt="創作者座位區"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/95 via-brand-900/30 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
                  <span className="text-warmamber text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1 sm:mb-2">
                    03 / 06 座位情境
                  </span>
                  <h3 className="serif-title text-xl sm:text-2xl lg:text-3xl font-bold">
                    創作者共用長桌・靈感交流庇護所
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-200 mt-1 sm:mt-2 max-w-2xl line-clamp-2 sm:line-clamp-none">
                    專為遠端工作者與文字創作者設計的寬敞長桌，備有充足插座與高速網路，讓靈感自由流動。
                  </p>
                </div>
              </div>

              {/* Slide 4: 陽光窗邊席 */}
              <div
                className="carousel-slide absolute inset-0 transition-opacity duration-1000 opacity-0 flex items-center justify-center"
                style={{ opacity: slideIndex === 3 ? 1 : 0 }}
                aria-hidden={slideIndex !== 3}
              >
                <img
                  src="/site-assets/gallery/sunlit-window-corner.jpg"
                  alt="陽光窗邊席"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/95 via-brand-900/30 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
                  <span className="text-warmamber text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1 sm:mb-2">
                    04 / 06 用餐情境
                  </span>
                  <h3 className="serif-title text-xl sm:text-2xl lg:text-3xl font-bold">
                    陽光窗邊雅座・沉澱思緒的角落
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-200 mt-1 sm:mt-2 max-w-2xl line-clamp-2 sm:line-clamp-none">
                    適合旅客與讀書人的靠窗雙人座，品嚐一份手作馬卡龍與手沖飲品，享受悠閒的午後時光。
                  </p>
                </div>
              </div>

              {/* Slide 5: 手作甜點展示櫃 */}
              <div
                className="carousel-slide absolute inset-0 transition-opacity duration-1000 opacity-0 flex items-center justify-center"
                style={{ opacity: slideIndex === 4 ? 1 : 0 }}
                aria-hidden={slideIndex !== 4}
              >
                <img
                  src="/site-assets/gallery/patisserie-display-cabinet.jpg"
                  alt="手作甜點櫃"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/95 via-brand-900/30 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
                  <span className="text-warmamber text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1 sm:mb-2">
                    05 / 06 餐點展示
                  </span>
                  <h3 className="serif-title text-xl sm:text-2xl lg:text-3xl font-bold">
                    每日手作甜點櫃・馬卡龍與千層
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-200 mt-1 sm:mt-2 max-w-2xl line-clamp-2 sm:line-clamp-none">
                    職人每天清晨新鮮製作的法式馬卡龍、義式冰淇淋與精緻蛋糕，在甜點櫃中綻放誘人光彩。
                  </p>
                </div>
              </div>

              {/* Slide 6: 日暮魔幻時刻 */}
              <div
                className="carousel-slide absolute inset-0 transition-opacity duration-1000 opacity-0 flex items-center justify-center"
                style={{ opacity: slideIndex === 5 ? 1 : 0 }}
                aria-hidden={slideIndex !== 5}
              >
                <img
                  src="/site-assets/gallery/evening-magic-hour.jpg"
                  alt="日暮魔幻時刻"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/95 via-brand-900/30 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
                  <span className="text-warmamber text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1 sm:mb-2">
                    06 / 06 黃昏氛圍
                  </span>
                  <h3 className="serif-title text-xl sm:text-2xl lg:text-3xl font-bold">
                    日暮魔幻時刻・溫馨暖黃燈光
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-200 mt-1 sm:mt-2 max-w-2xl line-clamp-2 sm:line-clamp-none">
                    夜幕低垂前的黃昏魔幻時刻，老宅透出溫暖柔和的燈光，為一天的忙碌畫上療癒句點。
                  </p>
                </div>
              </div>
            </div>

            {/* 左右切換按鈕 (手機上加大觸控範圍) */}
            <button
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur transition z-20 active:scale-95"
              aria-label="上一張圖片"
              onClick={prevSlide}
            >
              <i className="fa-solid fa-chevron-left text-sm sm:text-base"></i>
            </button>
            <button
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur transition z-20 active:scale-95"
              aria-label="下一張圖片"
              onClick={nextSlide}
            >
              <i className="fa-solid fa-chevron-right text-sm sm:text-base"></i>
            </button>

            {/* 底部圓點指示器 */}
            <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
              <button
                className={`carousel-dot w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full hover:bg-white transition ${slideIndex === 0 ? "bg-white scale-125" : "bg-white/50"}`}
                onClick={() => goToSlide(0)}
                aria-label={"第 1 張"}
              ></button>
              <button
                className={`carousel-dot w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full hover:bg-white transition ${slideIndex === 1 ? "bg-white scale-125" : "bg-white/50"}`}
                onClick={() => goToSlide(1)}
                aria-label={"第 2 張"}
              ></button>
              <button
                className={`carousel-dot w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full hover:bg-white transition ${slideIndex === 2 ? "bg-white scale-125" : "bg-white/50"}`}
                onClick={() => goToSlide(2)}
                aria-label={"第 3 張"}
              ></button>
              <button
                className={`carousel-dot w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full hover:bg-white transition ${slideIndex === 3 ? "bg-white scale-125" : "bg-white/50"}`}
                onClick={() => goToSlide(3)}
                aria-label={"第 4 張"}
              ></button>
              <button
                className={`carousel-dot w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full hover:bg-white transition ${slideIndex === 4 ? "bg-white scale-125" : "bg-white/50"}`}
                onClick={() => goToSlide(4)}
                aria-label={"第 5 張"}
              ></button>
              <button
                className={`carousel-dot w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full hover:bg-white transition ${slideIndex === 5 ? "bg-white scale-125" : "bg-white/50"}`}
                onClick={() => goToSlide(5)}
                aria-label={"第 6 張"}
              ></button>
            </div>
          </div>
        </div>
      </section>

      {/* 06. Footer (訂位 / 地圖 / 營業資訊) */}
      <section id="info" className="py-16 sm:py-20 lg:py-24 bg-brand-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 sm:mb-16 text-center">
            <span className="text-xs uppercase tracking-widest text-warmamber font-bold">
              {"06. Footer // Reservation & Info"}
            </span>
            <h2 className="serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-950 mt-2">
              訂位、地圖與營業資訊
            </h2>
            <div className="w-16 h-1 bg-warmamber mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
            {/* 左側：營業資訊與地圖說明 */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-brand-200/60 space-y-5 sm:space-y-6">
                <h3 className="serif-title text-xl sm:text-2xl font-bold text-brand-900 border-b border-brand-100 pb-4">
                  營業資訊與交通
                </h3>

                <div className="flex items-start space-x-3.5 sm:space-x-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fa-solid fa-location-dot text-sm sm:text-base"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-900 text-sm sm:text-base">店舖地址</h4>
                    <p className="text-brand-700 text-xs sm:text-sm mt-0.5">
                      台中市西區美村路一段（勤美誠品商圈巷弄內）
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 sm:space-x-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fa-solid fa-clock text-sm sm:text-base"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-900 text-sm sm:text-base">營業時間</h4>
                    <p className="text-brand-700 text-xs sm:text-sm mt-0.5">
                      週一至週日：11:00 - 20:00（每週二公休）
                    </p>
                    <p className="text-[11px] sm:text-xs text-brand-600 mt-0.5">
                      最後點餐時間 19:00
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 sm:space-x-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fa-solid fa-phone text-sm sm:text-base"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-900 text-sm sm:text-base">聯絡電話</h4>
                    <p className="text-brand-700 text-xs sm:text-sm mt-0.5">04-2301-8866</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 sm:space-x-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fa-solid fa-circle-info text-sm sm:text-base"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-900 text-sm sm:text-base">消費須知</h4>
                    <p className="text-brand-700 text-xs sm:text-sm mt-0.5">
                      每人低消一杯飲品｜提供高速Wi-Fi與插座｜歡迎旅客與創作者造訪
                    </p>
                  </div>
                </div>
              </div>

              {/* 模擬地圖區塊 */}
              <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-brand-200/60 overflow-hidden">
                <div className="h-56 sm:h-64 rounded-2xl overflow-hidden bg-brand-200/50 relative">
                  {/* 真實響應式 Google Maps 嵌入，支援手機觸控與導航 */}
                  <iframe
                    title="日暮町・老宅喫茶地圖位置"
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    src="https://www.google.com/maps?q=%E5%8F%B0%E4%B8%AD%E5%B8%82%E8%A5%BF%E5%8D%80%E7%BE%8E%E6%9D%91%E8%B7%AF%E4%B8%80%E6%AE%B5&z=15&hl=zh-TW&output=embed"
                  ></iframe>
                </div>
                <div className="mt-3 px-2 flex items-center justify-between text-xs text-brand-700">
                  <span>
                    <i className="fa-solid fa-location-dot text-warmamber mr-1"></i>{" "}
                    台中市西區美村路一段（勤美誠品商圈）
                  </span>
                  <a
                    href="https://maps.google.com/?q=台中市西區美村路一段"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-800 font-bold hover:underline inline-flex items-center"
                  >
                    開啟Google地圖{" "}
                    <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[10px]"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* 右側：線上預約訂位表單 (CTA) */}
            <div
              id="booking"
              className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-brand-200"
            >
              <div className="mb-6 sm:mb-8">
                <span className="text-xs uppercase tracking-widest text-warmamber font-bold">
                  Reservation CTA
                </span>
                <h3 className="serif-title text-xl sm:text-2xl font-bold text-brand-950 mt-1">
                  線上預約訂位
                </h3>
                <p className="text-brand-700 text-xs sm:text-sm mt-2">
                  填寫下方資料，我們將為您保留溫馨座位與靈感角落。
                </p>
              </div>

              <form
                id="booking-form"
                className="space-y-4 sm:space-y-5"
                onSubmit={handleBooking}
                ref={formRef}
              >
                <div>
                  <label className="block text-xs font-bold text-brand-800 uppercase tracking-wider mb-1.5 sm:mb-2">
                    您的姓名
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50/50 text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 transition"
                    placeholder="請輸入姓名"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-800 uppercase tracking-wider mb-1.5 sm:mb-2">
                      聯絡電話
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50/50 text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 transition"
                      placeholder="0912-345-678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-800 uppercase tracking-wider mb-1.5 sm:mb-2">
                      用餐人數
                    </label>
                    <select
                      id="guests"
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50/50 text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 transition"
                    >
                      <option value="1 位 (創作者單人席)">1 位 (創作者單人席)</option>
                      <option value="2 位 (雙人雅座)">2 位 (雙人雅座)</option>
                      <option value="3 位">3 位</option>
                      <option value="4 位">4 位</option>
                      <option value="5 位以上 (請電洽)">5 位以上 (請電洽)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-800 uppercase tracking-wider mb-1.5 sm:mb-2">
                      預約日期
                    </label>
                    <input
                      type="date"
                      id="date"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50/50 text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 transition"
                      min={today || undefined}
                      defaultValue={today}
                      key={`date-${today}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-800 uppercase tracking-wider mb-1.5 sm:mb-2">
                      預約時段
                    </label>
                    <select
                      id="time"
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50/50 text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 transition"
                    >
                      <option value="11:00 早安場">11:00 早安場</option>
                      <option value="13:30 午茶時光">13:30 午茶時光</option>
                      <option value="15:30 下午茶黃金時段">15:30 下午茶黃金時段</option>
                      <option value="17:30 日暮魔幻時刻">17:30 日暮魔幻時刻</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-800 uppercase tracking-wider mb-1.5 sm:mb-2">
                    備註需求 (選填)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50/50 text-brand-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 transition"
                    placeholder="例如：需要插座創作、行李寄放等..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-700 hover:bg-brand-800 text-cream py-3.5 sm:py-4 rounded-xl font-medium shadow-md transition duration-300 text-sm sm:text-base active:scale-98"
                >
                  確認送出預約
                </button>
              </form>

              {/* 預約成功訊息提示框 (包含摘要呈現) */}
              <div
                id="success-box"
                className={`mt-6 p-4 sm:p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs sm:text-sm space-y-3 shadow-md ${booking ? "" : "hidden"}`}
                ref={successRef}
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-xl sm:text-2xl shrink-0 mt-0.5 sm:mt-0"></i>
                  <div>
                    <span className="font-bold text-sm sm:text-base text-emerald-900">
                      預約請求已成功送出！
                    </span>
                    <p className="text-[11px] sm:text-xs text-emerald-700 mt-0.5">
                      我們已收到您的訂位需求，以下為您的預約摘要：
                    </p>
                  </div>
                </div>
                <div
                  id="booking-summary"
                  className="bg-white/80 p-3.5 rounded-xl border border-emerald-100 text-xs space-y-1.5 text-brand-800 font-medium"
                >
                  {booking && <BookingSummary booking={booking} />}
                </div>
                <p className="text-[11px] text-emerald-600 italic">
                  ※ 我們將會透過簡訊與電話與您確認座位，期待在日暮町與您相見！
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 頁尾 Copyright */}
      <footer className="bg-brand-900 text-cream py-10 sm:py-12 border-t border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-700 text-cream flex items-center justify-center">
              <i className="fa-solid fa-house-chimney text-xs sm:text-sm"></i>
            </div>
            <span className="serif-title text-lg sm:text-xl font-bold tracking-wider">
              日暮町・老宅喫茶
            </span>
          </div>
          <p className="text-xs text-brand-400">
            台中市西區勤美商圈老宅咖啡廳 ｜ 專為旅客與創作者打造的溫馨聚落
          </p>
          <p className="text-[11px] sm:text-xs text-brand-500">
            © 2026 Nichimuracho Cafe. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 一鍵往上到頂的懸浮按鈕 (Back to Top Button) */}
      <button
        id="back-to-top"
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 bg-brand-700 hover:bg-brand-800 text-cream rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none ${showTop ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-label="回到頂部"
        onClick={scrollToTop}
      >
        <i className="fa-solid fa-arrow-up text-base sm:text-lg"></i>
      </button>

      {/* 圖片放大檢視燈箱 (Lightbox Modal) */}
      <div
        id="lightbox-modal"
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-md items-center justify-center p-4 sm:p-6 transition-all duration-300 ${lightbox ? "flex" : "hidden"}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
      >
        <div
          className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 燈箱頂部關閉列 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 bg-cream">
            <span
              className="serif-title font-bold text-brand-900 text-base sm:text-lg"
              id="lightbox-title"
            >
              {lightbox?.name}
            </span>
            <button
              className="w-9 h-9 rounded-full bg-brand-200/70 hover:bg-brand-700 hover:text-cream text-brand-800 flex items-center justify-center transition"
              aria-label="關閉燈箱"
              onClick={closeLightbox}
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          {/* 燈箱內容主體 */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="rounded-2xl overflow-hidden bg-brand-100 max-h-[50vh] flex items-center justify-center">
              <img
                id="lightbox-img"
                alt="放大檢視圖片"
                className="w-full h-full object-contain max-h-[50vh]"
                src={lightbox?.img || undefined}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4
                  className="serif-title font-bold text-brand-900 text-lg sm:text-xl"
                  id="lightbox-name"
                >
                  {lightbox?.name}
                </h4>
                <span className="text-warmamber font-bold text-base sm:text-lg" id="lightbox-price">
                  {lightbox?.price}
                </span>
              </div>
              <p className="text-brand-700 text-xs sm:text-sm leading-relaxed sm:leading-[1.25rem]" id="lightbox-desc">
                {lightbox?.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* JavaScript 互動邏輯 */}
    </div>
  );
}
