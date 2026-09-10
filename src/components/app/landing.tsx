'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dumbbell, Video, TrendingUp, MessageCircle, BarChart3, CalendarDays,
  CheckCircle2, ArrowLeft, PlayCircle, Star, Flame, Sparkles, Users,
  ClipboardList, Wallet, Bell, Zap, Target, Trophy, XCircle,
} from 'lucide-react'

/* ============ psychology-based palette ============
 * Primary  #F97316 orange → انرژی، هیجان، حرکت، اقدام (CTA clicks)
 * Deep charcoal #0C0A09  → قدرت، تمرکز، جدیت باشگاه
 * Accent  #22C55E green  → موفقیت، پیشرفت، تأیید
 * ================================================== */

const IMG = {
  hero: '/images/hero-bg.jpg',
  coach: '/images/coach.jpg',
  athlete: '/images/athlete.jpg',
  cta: '/images/cta-bg.jpg',
  strength: '/images/strength.jpg',
  av1: '/images/avatar-1.jpg',
  av2: '/images/avatar-2.jpg',
  av3: '/images/avatar-3.jpg',
}

/* ---------- helpers ---------- */

function Reveal({ children, delay = 0, className, y = 32 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Counter({ to, suffix = '', decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  useEffect(() => {
    if (!inView || !ref.current) return
    const fa = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fa(v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '٬')) + suffix
      },
    })
    return () => controls.stop()
  }, [inView, to, suffix, decimals])
  return <span ref={ref}>۰{suffix}</span>
}

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/40 rotate-3">
        <Zap className="w-5 h-5 text-zinc-950" strokeWidth={3} />
      </div>
      <div className="leading-none">
        <div className="text-xl font-black text-white tracking-tight">فیت‌کوچ</div>
        <div className="text-[10px] text-orange-400/90 font-bold mt-1 tracking-wide">FITCOACH</div>
      </div>
    </div>
  )
}

/* ---------- data ---------- */

const TICKER = ['انضباط', 'قدرت', 'رکورد', 'استقامت', 'انفجار', 'تعهد', 'پیروزی', 'تمرین', 'انگیزه', 'قهرمانی']

const CHAOS = [
  'برنامه‌ها پراکنده در چت و یادداشت گوشی',
  'نتایج تمرین‌ها که هیچ‌وقت ثبت نمی‌شود',
  'پیشرفت ورزشکار = حدس و شمارش ذهنی',
  'شهریه‌ها و پرداختی‌های گم‌شده',
]

const SOLUTIONS = [
  'همه‌چیز در یک پنل: برنامه، تقویم، نتایج، مالی',
  'ورزشکار با ویدئوی هر حرکت دقیق تمرین می‌کند',
  'نمودار پیشرفت، خودش خودش را می‌سازد',
  'درآمد ماهانه، یک نگاه، صفر خطا',
]

const SPLIT_FEATURES = [
  {
    tag: 'برنامه‌سازی حرفه‌ای',
    title: 'برنامه‌ای که ورزشکار «اجرا» می‌کند، نه اینکه گم شود',
    desc: 'برنامه چند هفته‌ای بساز، هر جلسه را با ست، تکرار، وزنه و استراحت دقیق تعریف کن و با یک کلیک برای یک یا صد ورزشکار بفرست. هر حرکت با ویدئوی آموزشی کنار ورزشکار است — حتی وقتی تو آنجا نیستی.',
    points: ['قالب آماده و کپی سریع برنامه هفته قبل', 'ارسال هم‌زمان به چند ورزشکار', 'ویدئو از آپارات، یوتیوب یا فایل مستقیم'],
    img: IMG.strength,
    alt: 'تمرین با هالتر',
  },
  {
    tag: 'پایش و تحلیل',
    title: 'پیشرفتی که روی کاغذ نمی‌ماند، روی نمودار می‌درخشد',
    desc: 'ورزشکار نتیجه‌ی هر جلسه را در دو دقیقه ثبت می‌کند؛ تو نرخ تبعیت، روند وزن، کیفیت تمرین و فعالیت ۸ هفته‌ای‌اش را زنده می‌بینی. تصمیم‌های برنامه‌ی بعدی دیگر حدسی نیست — داده‌محور است.',
    points: ['نرخ تبعیت هر ورزشکار، لحظه‌ای', 'نمودار وزن، چربی و عملکرد', 'گزارش ۸ هفته‌ای برای هر فرد'],
    img: IMG.athlete,
    alt: 'تمرین استقامتی گروهی',
  },
  {
    tag: 'کسب‌وکار مربی‌گری',
    title: 'مربی‌گری هنر است؛ مالی‌اش را به ما بسپار',
    desc: 'شهریه‌ی هر ورزشکار، بدهی‌ها، پرداخت‌های معوق و روند درآمد ۶ ماهه — همه در یک داشبورد مالی ساده. اولین بار که ماهانه‌ات را دقیق می‌بینی، می‌فهمی چرا این بخش مهم است.',
    points: ['ثبت شهریه در چند ثانیه', 'هشدار پرداخت‌های معوق', 'نمودار روند درآمد ماهانه'],
    img: IMG.coach,
    alt: 'مربی در حال تمرین',
  },
]

const TESTIMONIALS = [
  {
    name: 'رضا کریمی',
    role: 'مربی بدنسازی — ۱۲ سال سابقه',
    avatar: IMG.av1,
    text: 'قبلاً برنامه‌ها را تو دفتر می‌نوشتم و نیمی از وقتم پاسخ‌دادن به پیام‌ها بود. الان ۴۰ ورزشکار دارم و مغزم آرام است. هر شب گزارش پیشرفت همه را یک‌جا می‌بینم.',
  },
  {
    name: 'سارا احمدی',
    role: 'ورزشکار — ۶ ماه با فیت‌کوچ',
    avatar: IMG.av2,
    text: 'برنامه‌ام با ویدئوی هر حرکت دستم است، دیگر گیج نمی‌زنم. نمودار وزنم که هر هفته پایین می‌رود، انگیزه‌ام چند برابر شده. حس می‌کنم یک مربی واقعی کنارم است.',
  },
  {
    name: 'محمد حسینی',
    role: 'مربی کراس‌فیت',
    avatar: IMG.av3,
    text: 'بخش مالی‌اش خیلی گردن کلفتی است؛ شهریه‌های معوقم را در ماه اول همه پس گرفتند. تقویم جلسات هم باعث شد هیچ جلسه‌ای جا نماند. برای مربی‌های جدی، ضروری است.',
  },
]

const STEPS = [
  { icon: Users, title: 'ورزشکارانت را اضافه کن', desc: 'پروفایل کامل: قد، وزن، هدف، سطح و نکات پزشکی — کمتر از یک دقیقه برای هر نفر.' },
  { icon: ClipboardList, title: 'برنامه بساز و بفرست', desc: 'از بانک حرکات با ویدئو، جلسات هفته را بچین و به یک یا چند نفر ارسال کن.' },
  { icon: Flame, title: 'ورزشکار اجرا و ثبت می‌کند', desc: 'با راهنمای ویدئویی تمرین می‌کند و ست‌ها، وزنه‌ها و کیفیتش را ثبت می‌کند.' },
  { icon: TrendingUp, title: 'پیشرفت را ببین و دقیق‌تر برنامه بریز', desc: 'نمودارها خودشان حرف می‌زنند؛ برنامه‌ی بعدی بر اساس داده، نه حدس.' },
]

/* ---------- page ---------- */

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-[#0C0A09] text-zinc-100 overflow-x-clip">
      {/* ================= NAVBAR ================= */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0C0A09]/90 backdrop-blur-xl border-b border-orange-500/10 py-0 shadow-lg shadow-black/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#solution" className="hover:text-orange-400 transition-colors">چرا فیت‌کوچ؟</a>
            <a href="#features" className="hover:text-orange-400 transition-colors">امکانات</a>
            <a href="#testimonials" className="hover:text-orange-400 transition-colors">نظر کاربران</a>
            <a href="#how" className="hover:text-orange-400 transition-colors">شروع سریع</a>
          </nav>
          <Button
            onClick={onEnter}
            className="bg-gradient-to-l from-orange-600 to-amber-500 text-white font-bold hover:shadow-xl hover:shadow-orange-600/40 hover:scale-[1.03] active:scale-95 transition-all rounded-xl px-5"
          >
            ورود رایگان
          </Button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center">
        {/* bg image with cinematic overlays */}
        <div className="absolute inset-0">
          <motion.img
            src={IMG.hero}
            alt="ورزشکار در حال تمرین در باشگاه"
            initial={{ scale: 1.15, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0C0A09]/95 via-[#0C0A09]/75 to-[#0C0A09]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-transparent to-[#0C0A09]/60" />
          <div className="absolute bottom-0 left-1/4 w-[42rem] h-[42rem] rounded-full bg-orange-600/15 blur-[140px] pointer-events-none" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 w-full pt-32 pb-24">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 backdrop-blur px-4 py-2 text-sm text-orange-300 mb-7"
            >
              <Sparkles className="w-4 h-4" />
              پلتفرم هوشمند مربیان و ورزشکاران
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.45 }}
              className="text-[2.6rem] leading-[1.2] sm:text-6xl lg:text-[4.2rem] font-black text-white leading-[1.25]"
            >
              مسیر
              <span className="relative mx-3 inline-block">
                <span className="bg-gradient-to-l from-orange-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">قهرمانی</span>
                <svg className="absolute -bottom-2 right-0 w-full h-3 text-orange-500/70" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M2 9 C 60 2, 140 2, 198 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              اینجا شروع می‌شه
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.62 }}
              className="mt-7 text-lg sm:text-xl text-zinc-300/90 leading-relaxed max-w-xl"
            >
              برنامه تمرینی، ویدئوی آموزشی حرکات، ثبت نتایج، پیام‌رسانی و مدیریت مالی —
              <span className="text-white font-semibold"> تمام دنیای مربی‌گری‌ات در یک پنل</span>؛ تا انرژی‌ات صرف ساختن قهرمان شود، نه جمع‌کردن اکسل و چت.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.78 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                onClick={onEnter}
                className="h-14 px-9 rounded-2xl bg-gradient-to-l from-orange-600 to-amber-500 text-white font-black text-lg shadow-2xl shadow-orange-600/40 hover:shadow-orange-500/50 hover:scale-[1.04] active:scale-95 transition-all"
              >
                همین حالا شروع کن — رایگان
                <ArrowLeft className="w-5 h-5 mr-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onEnter}
                className="h-14 px-8 rounded-2xl border-white/20 text-white bg-white/5 backdrop-blur hover:bg-white/15 hover:border-orange-400/50"
              >
                <PlayCircle className="w-5 h-5 text-orange-400" />
                تماشای دموی زنده
              </Button>
            </motion.div>

            {/* trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3 space-x-reverse">
                  {[IMG.av1, IMG.av2, IMG.av3].map((a, i) => (
                    <img key={i} src={a} alt="کاربر فیت‌کوچ" className="w-10 h-10 rounded-full border-2 border-[#0C0A09] object-cover" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1.5">
                    <Stars />
                    <span className="font-bold text-white">۴.۹</span>
                  </div>
                  <div className="text-zinc-400 text-xs mt-0.5">از +۵۰۰ مربی و ورزشکار فعال</div>
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/10" />
              <div className="text-sm text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                بدون نیاز به کارت بانکی
              </div>
            </motion.div>
          </div>
        </div>

        {/* scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute bottom-6 right-1/2 translate-x-1/2 text-zinc-500 text-xs flex flex-col items-center gap-1.5"
        >
          اسکرول کن
          <div className="w-6 h-10 rounded-full border-2 border-zinc-600 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-orange-400" />
          </div>
        </motion.div>
      </section>

      {/* ================= TICKER ================= */}
      <div className="relative border-y border-orange-500/15 bg-gradient-to-l from-orange-950/40 via-[#0C0A09] to-orange-950/40 py-4 overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex whitespace-nowrap gap-8 w-max"
        >
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((w, i) => (
            <span key={i} className="flex items-center gap-8 text-lg font-black text-zinc-600">
              {w}
              <Dumbbell className="w-4 h-4 text-orange-600/60" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ================= PROBLEM → SOLUTION ================= */}
      <section id="solution" className="relative py-24 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/25 px-4 py-1.5 text-sm text-red-400 mb-5">
              <XCircle className="w-4 h-4" /> آشنایه؟
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.35]">
              مدیریت ورزشکار‌ها با
              <span className="text-red-400"> چت و اکسل</span>،
              <br />
              یعنی آشفتگی دائمی
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
            {/* chaos card */}
            <Reveal delay={0.1}>
              <div className="h-full rounded-3xl border border-red-500/15 bg-gradient-to-b from-red-950/20 to-transparent p-7 sm:p-9">
                <div className="text-sm font-bold text-red-400 mb-6 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> وضعیت فعلی بیشتر مربی‌ها
                </div>
                <ul className="space-y-5">
                  {CHAOS.map((t, i) => (
                    <motion.li
                      key={t}
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + i * 0.1 }}
                      className="flex items-start gap-3 text-zinc-300"
                    >
                      <span className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      </span>
                      {t}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* solution card */}
            <Reveal delay={0.25}>
              <div className="relative h-full rounded-3xl border border-green-500/25 bg-gradient-to-b from-green-950/25 to-transparent p-7 sm:p-9 overflow-hidden">
                <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-green-500/10 blur-3xl" />
                <div className="relative">
                  <div className="text-sm font-bold text-green-400 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> با فیت‌کوچ
                  </div>
                  <ul className="space-y-5">
                    {SOLUTIONS.map((t, i) => (
                      <motion.li
                        key={t}
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-start gap-3 text-zinc-200 font-medium"
                      >
                        <span className="w-6 h-6 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        </span>
                        {t}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= SPLIT FEATURES (with photos) ================= */}
      <section id="features" className="relative py-24 lg:py-28 px-4">
        <div className="max-w-7xl mx-auto space-y-24 lg:space-y-32">
          {SPLIT_FEATURES.map((f, idx) => (
            <div key={f.tag} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* image side */}
              <Reveal className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="relative group">
                  <div className={`absolute -inset-4 bg-gradient-to-tr ${idx % 2 === 1 ? 'from-green-500/20' : 'from-orange-500/25'} to-transparent blur-2xl rounded-[2.5rem] opacity-70 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                    <img
                      src={f.img}
                      alt={f.alt}
                      loading="lazy"
                      className="w-full aspect-[4/3] object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09]/80 via-transparent to-transparent" />
                    {/* floating stat chip */}
                    <div className="absolute bottom-4 right-4 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        {idx === 0 && <ClipboardList className="w-5 h-5 text-orange-400" />}
                        {idx === 1 && <BarChart3 className="w-5 h-5 text-green-400" />}
                        {idx === 2 && <Wallet className="w-5 h-5 text-amber-400" />}
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-white">
                          {idx === 0 ? 'ارسال برنامه' : idx === 1 ? 'تحلیل زنده' : 'کنترل مالی'}
                        </div>
                        <div className="text-zinc-400 mt-0.5">{idx === 0 ? 'به چند ورزشکار، هم‌زمان' : idx === 1 ? 'بدون حدس و شمارش' : 'صفر ریال گم‌شده'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* text side */}
              <Reveal delay={0.15} className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/25 px-4 py-1.5 text-sm text-orange-300 mb-5">
                  <Zap className="w-4 h-4" />
                  {f.tag}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4] mb-5">
                  {f.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-lg mb-7">{f.desc}</p>
                <ul className="space-y-3.5 mb-8">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-zinc-200">
                      <span className="w-6 h-6 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="ghost"
                  onClick={onEnter}
                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 px-0 hover:px-4 transition-all font-bold"
                >
                  همین کار رو در دمو ببین
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STATS BAND ================= */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="relative rounded-[2.5rem] overflow-hidden border border-orange-500/20">
              <img src={IMG.cta} alt="دویدن در غروب" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#0C0A09]/85" />
              <div className="absolute inset-0 bg-gradient-to-l from-orange-600/25 via-transparent to-transparent" />
              <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 p-10 sm:p-14">
                {[
                  { v: 500, suffix: '+', label: 'مربی فعال', dec: 0 },
                  { v: 1200, suffix: '+', label: 'برنامه‌ی اجراشده', dec: 0 },
                  { v: 92, suffix: '٪', label: 'میانگین تبعیت تمرین', dec: 0 },
                  { v: 4.9, suffix: '', label: 'امتیاز رضایت از ۵', dec: 1 },
                ].map((s, i) => (
                  <Reveal key={s.label} delay={i * 0.1} className="text-center">
                    <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-amber-500">
                      <Counter to={s.v} suffix={s.suffix} decimals={s.dec} />
                    </div>
                    <div className="text-sm text-zinc-400 mt-2">{s.label}</div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= ATHLETE APP ================= */}
      <section className="relative py-24 lg:py-28 px-4 overflow-hidden">
        <div className="absolute top-1/3 -left-40 w-[36rem] h-[36rem] rounded-full bg-orange-600/10 blur-[130px] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/25 px-4 py-1.5 text-sm text-orange-300 mb-5">
              <Target className="w-4 h-4" /> اپ ورزشکار
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-black text-white leading-[1.35] mb-6">
              ورزشکار فقط یک کار دارد:
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-500 to-amber-400">تمرین کردن</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-9 max-w-lg">
              برنامه همان لحظه که مربی می‌فرستد، دستش است. ویدئوی هر حرکت جلوی چشمش است. نتیجه را در دو دقیقه ثبت می‌کند و
              پیشرفتش را هفته‌به‌هفته در نمودار می‌بیند — همین چرخه‌ی ساده، انضباط می‌سازد.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-9">
              {[
                { icon: Video, t: 'ویدئوی هر حرکت', d: 'فرم درست، بدون سؤال' },
                { icon: Bell, t: 'اطلاع برنامه جدید', d: 'همان لحظه، نوتیف' },
                { icon: TrendingUp, t: 'نمودار پیشرفت', d: 'وزن، چربی، عملکرد' },
                { icon: MessageCircle, t: 'چت با مربی', d: 'سؤال، جواب، پیگیری' },
              ].map((x) => (
                <div key={x.t} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 hover:border-orange-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                    <x.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{x.t}</div>
                    <div className="text-xs text-zinc-500 mt-1">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={onEnter}
              variant="outline"
              className="h-12 px-7 rounded-xl border-orange-500/40 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400 font-bold"
            >
              ورود به‌عنوان ورزشکار
              <ArrowLeft className="w-4 h-4 mr-1" />
            </Button>
          </Reveal>

          {/* phone mockup */}
          <Reveal delay={0.2} className="relative mx-auto w-full max-w-[340px]">
            <motion.div
              initial={{ rotate: 3 }}
              whileInView={{ rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-8 bg-gradient-to-b from-orange-500/25 to-transparent blur-3xl rounded-full" />
              <div className="relative rounded-[2.8rem] border border-white/15 bg-zinc-900 shadow-2xl shadow-orange-950/40 p-3">
                <div className="rounded-[2.3rem] bg-[#0C0A09] overflow-hidden">
                  {/* status bar */}
                  <div className="flex justify-between items-center px-6 pt-4 pb-2 text-[10px] text-zinc-500">
                    <span>۹:۴۱</span>
                    <div className="w-20 h-5 bg-black rounded-full" />
                    <span>۱۰۰٪</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-zinc-950 font-black">ع</div>
                        <div>
                          <div className="text-sm font-bold text-white">سلام علی 👋</div>
                          <div className="text-[11px] text-zinc-500">امروز: پا و باسن — هفته ۳</div>
                        </div>
                      </div>
                      <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="rounded-2xl bg-gradient-to-l from-orange-500/15 to-transparent border border-orange-500/20 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-[11px] text-zinc-400">تبعیت این هفته</div>
                          <div className="text-3xl font-black text-orange-400 mt-1">۸۲٪</div>
                        </div>
                        <div className="flex items-end gap-1 h-12">
                          {[60, 85, 45, 90, 70, 95].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              whileInView={{ height: `${h}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.6, delay: 0.4 + i * 0.07 }}
                              className="w-2.5 rounded-t bg-gradient-to-t from-orange-600 to-amber-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { n: 'اسکوات', s: '۴×۸', w: '۸۰kg', d: true },
                        { n: 'ددلیفت رومانیایی', s: '۳×۱۰', w: '۶۰kg', d: true },
                        { n: 'لانج راه‌رونده', s: '۳×۱۲', w: '۱۶kg', d: false },
                      ].map((ex, i) => (
                        <motion.div
                          key={ex.n}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.12 }}
                          className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/5 px-3.5 py-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${ex.d ? 'bg-green-500' : 'border-2 border-zinc-600'}`}>
                              {ex.d && <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />}
                            </div>
                            <span className={`text-sm font-medium ${ex.d ? 'text-zinc-500 line-through' : 'text-white'}`}>{ex.n}</span>
                          </div>
                          <span className="text-[11px] text-zinc-500">{ex.s} · {ex.w}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="h-12 rounded-2xl bg-gradient-to-l from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-600/30">
                      ثبت تمرین امروز
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section id="testimonials" className="relative py-24 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 text-sm text-amber-300 mb-5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> حرف‌های کاربران
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-snug">
              مربی‌هایی که
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-500 to-amber-400"> دنیایشان </span>
              مرتب شد
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.12}>
                <div className="relative h-full rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent p-7 pt-9 hover:border-orange-500/35 hover:-translate-y-1.5 transition-all duration-300">
                  <div className="absolute -top-3 right-7 rounded-full bg-gradient-to-l from-orange-600 to-amber-500 text-white text-xs font-bold px-3 py-1 shadow-lg shadow-orange-600/30">
                    {i === 2 ? 'صرفه‌جویی مالی' : i === 1 ? '۱۲kg کاهش وزن' : '۴۰ ورزشکار فعال'}
                  </div>
                  <Stars />
                  <p className="mt-5 text-zinc-300 leading-relaxed text-[15px]">{t.text}</p>
                  <div className="mt-6 pt-5 border-t border-white/8 flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} loading="lazy" className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/40" />
                    <div>
                      <div className="font-bold text-white text-sm">{t.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">در ۴ قدم راه بیفت</h2>
            <p className="text-zinc-500 mt-4 text-lg">از صفر تا اولین برنامه‌ی ارسال‌شده، کمتر از یک روز</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12}>
                <div className="relative h-full rounded-3xl border border-white/8 bg-white/[0.03] p-6 hover:border-orange-500/40 hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/25 to-amber-500/10 border border-orange-500/25 group-hover:scale-110 transition-transform">
                      <s.icon className="w-7 h-7 text-orange-400" />
                    </div>
                    <span className="text-5xl font-black text-white/5 group-hover:text-orange-500/15 transition-colors">{['۰۱', '۰۲', '۰۳', '۰۴'][i]}</span>
                  </div>
                  <h3 className="font-black text-white text-lg mb-2.5">{s.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="relative rounded-[2.5rem] overflow-hidden border border-orange-500/30 shadow-2xl shadow-orange-950/30">
              <img src={IMG.cta} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0C0A09]/70 via-[#0C0A09]/85 to-[#0C0A09]/95" />
              <div className="absolute -top-24 left-1/3 w-96 h-96 rounded-full bg-orange-600/25 blur-[110px]" />
              <div className="relative text-center px-6 py-16 sm:py-20">
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-orange-600/50 mb-7"
                >
                  <Flame className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.35] max-w-2xl mx-auto">
                  آتیش زیر پات هنوز
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-500 to-amber-400"> روشنه؟</span>
                </h2>
                <p className="text-zinc-400 mt-5 max-w-xl mx-auto text-lg leading-relaxed">
                  همین حالا با حساب دمو وارد شو — یک مربی با ۳ ورزشکار واقعی، برنامه‌های زنده، چت و مالی.
                  <span className="text-zinc-200 font-semibold"> اثباتش، تجربه‌کردنش است.</span>
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={onEnter}
                    className="h-14 px-10 rounded-2xl bg-gradient-to-l from-orange-600 to-amber-500 text-white font-black text-lg shadow-2xl shadow-orange-600/40 hover:scale-[1.05] active:scale-95 transition-all"
                  >
                    ورود به دموی زنده
                    <ArrowLeft className="w-5 h-5 mr-1" />
                  </Button>
                </div>
                <p className="mt-5 text-xs text-zinc-500">مربی: coach@fitcoach.ir — ورزشکار: ali@fitcoach.ir — رمز: 123456</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Logo />
          <p className="text-sm text-zinc-600">© ۱۴۰۵ فیت‌کوچ — پلتفرم مدیریت مربیان و ورزشکاران</p>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#features" className="hover:text-orange-400 transition-colors">امکانات</a>
            <a href="#testimonials" className="hover:text-orange-400 transition-colors">نظرها</a>
            <a href="#how" className="hover:text-orange-400 transition-colors">راهنما</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
