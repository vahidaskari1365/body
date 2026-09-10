/**
 * Seed script — creates demo coach, athletes, exercises, programs, logs, messages, payments.
 * Run: bun scripts/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'crypto'

const db = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const V = (name: string) => `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${name}.mp4`

async function main() {
  console.log('🌱 Seeding...')
  await db.sessionExercise.deleteMany()
  await db.workoutLog.deleteMany()
  await db.progressEntry.deleteMany()
  await db.message.deleteMany()
  await db.payment.deleteMany()
  await db.programAssignment.deleteMany()
  await db.workoutSession.deleteMany()
  await db.program.deleteMany()
  await db.exercise.deleteMany()
  await db.athleteProfile.deleteMany()
  await db.session.deleteMany()
  await db.user.deleteMany()

  // ---- users ----
  const coach = await db.user.create({
    data: { name: 'رضا کریمی', email: 'coach@fitcoach.ir', password: hashPassword('123456'), role: 'COACH', phone: '09121234567' },
  })
  const ali = await db.user.create({
    data: {
      name: 'علی محمدی', email: 'ali@fitcoach.ir', password: hashPassword('123456'), role: 'ATHLETE', phone: '09351234567',
      athleteProfile: { create: { coachId: coach.id, height: 178, weight: 82, sport: 'فیتنس', goal: 'MUSCLE_GAIN', level: 'INTERMEDIATE', medicalNotes: 'آسیب خفیف شانه راست — از پرس سرشانه سنگین پرهیز شود' } },
    },
  })
  const sara = await db.user.create({
    data: {
      name: 'سارا احمدی', email: 'sara@fitcoach.ir', password: hashPassword('123456'), role: 'ATHLETE', phone: '09191234567',
      athleteProfile: { create: { coachId: coach.id, height: 165, weight: 63, sport: 'فیتنس بانوان', goal: 'FAT_LOSS', level: 'BEGINNER' } },
    },
  })
  const reza = await db.user.create({
    data: {
      name: 'محمد حسینی', email: 'reza@fitcoach.ir', password: hashPassword('123456'), role: 'ATHLETE', phone: '09361234567',
      athleteProfile: { create: { coachId: coach.id, height: 172, weight: 70, sport: 'کراس‌فیت', goal: 'FITNESS', level: 'ADVANCED' } },
    },
  })
  console.log('✓ users')

  // ---- exercises ----
  const exData = [
    { name: 'اسکوات با هالتر', category: 'STRENGTH', muscleGroups: 'چهارسر، همسترینگ، باسن', equipment: 'هالتر', description: 'پادشاه حرکات پا برای قدرت و حجم', instructions: '۱. هالتر را روی تراپسیوس قرار دهید\n۲. پاها به عرض شانه\n۳. تا موازی زمین پایین بروید\n۴. پاشنه‌ها را به زمین فشار دهید و بالا بیایید', videoUrl: V('ForBiggerBlazes') },
    { name: 'پرس سینه هالتر', category: 'STRENGTH', muscleGroups: 'سینه، سرشانه، پشت بازو', equipment: 'هالتر و نیمکت', description: 'حرکت اصلی سینه برای قدرت بالا تنه', instructions: '۱. کتف‌ها را جمع و قفل کنید\n۲. هالتر را کنترل‌شده پایین بیاورید\n۳. از سینه به بالا فشار دهید', videoUrl: V('ForBiggerEscapes') },
    { name: 'ددلیفت', category: 'STRENGTH', muscleGroups: 'کمر، همسترینگ، باسن', equipment: 'هالتر', description: 'قدرتمندترین حرکت زنجیره خلفی', instructions: '۱. کمر صاف، سینه باز\n۲. هالتر نزدیک ساق پا\n۳. با باسن بلند شوید نه با کمر', videoUrl: V('ForBiggerFun') },
    { name: 'پرس سرشانه دمبل', category: 'STRENGTH', muscleGroups: 'سرشانه، پشت بازو', equipment: 'دمبل', description: 'توسعه حجم و قدرت سرشانه', instructions: '۱. دمبل‌ها کنار گوش‌ها\n۲. به بالا فشار دهید تا دمبل‌ها نزدیک هم شوند', videoUrl: V('ForBiggerJoyrides') },
    { name: 'بارفیکس', category: 'STRENGTH', muscleGroups: 'زیربغل، جلوبازو', equipment: 'بارفیکس', description: 'بهترین حرکت عرضی زیربغل با وزن بدن', instructions: '۱. دست‌ها کمی بازتر از شانه\n۲. با آرنج بدن را بالا بکشید\n۳. چانه از بار رد شود', videoUrl: V('ForBiggerMeltdowns') },
    { name: 'شنا سوئدی', category: 'STRENGTH', muscleGroups: 'سینه، مرکزی بدن', equipment: 'وزن بدن', description: 'حرکت پایه سینه و ثبات مرکزی', instructions: '۱. بدن در یک خط صاف\n۲. آرنج‌ها ۴۵ درجه\n۳. سینه نزدیک زمین', videoUrl: V('ElephantsDream') },
    { name: 'پلانک', category: 'CORE', muscleGroups: 'مرکزی بدن', equipment: 'وزن بدن', description: 'تقویت ثبات و استقامت مرکز بدن', instructions: '۱. ساعد روی زمین\n۲. باسن هم‌سطح بدن\n۳. ۳۰ تا ۶۰ ثانیه نگه دارید', videoUrl: V('Sintel') },
    { name: 'تردمیل — دویدن اینتروال', category: 'CARDIO', muscleGroups: 'قلب و عروق، پا', equipment: 'تردمیل', description: 'چربی‌سوزی بالا با اینتروال HIIT', instructions: '۱. ۲ دقیقه گرم کردن با راه رفتن\n۲. ۳۰ ثانیه دویدن سریع\n۳. ۶۰ ثانیه راه رفتن — ۸ تکرار', videoUrl: V('TearsOfSteel') },
    { name: 'روئینگ (قایق‌سواری)', category: 'CARDIO', muscleGroups: 'تمام بدن', equipment: 'دستگاه روئینگ', description: 'کاردیو تمام‌بدن کم‌فشار روی مفاصل', instructions: '۱. حرکت از پا شروع می‌شود\n۲. سپس بدن و در آخر دست‌ها', videoUrl: V('ForBiggerBlazes') },
    { name: 'حرکت کششی کتف و سینه', category: 'MOBILITY', muscleGroups: 'سینه، شانه', equipment: 'بدون تجهیزات', description: 'بهبود انعطاف و ریکاوری بعد تمرین', instructions: '۱. ۳۰ ثانیه هر سمت\n۲. تنفس عمیق', videoUrl: V('ForBiggerEscapes') },
  ]
  const exercises: Record<string, { id: string; name: string }> = {}
  for (const e of exData) {
    const created = await db.exercise.create({ data: { ...e, coachId: coach.id } })
    exercises[e.name] = created
  }
  console.log('✓ exercises')

  // ---- programs ----
  const program1 = await db.program.create({
    data: {
      coachId: coach.id, title: 'افزایش عضله بالاتنه — ۴ هفته‌ای', description: 'برنامه قدرتی برای افزایش حجم عضلانی بالاتنه با تمرکز روی حرکات مرکب',
      goal: 'MUSCLE_GAIN', level: 'INTERMEDIATE', durationWeeks: 4, daysPerWeek: 3, status: 'PUBLISHED',
    },
  })
  const program2 = await db.program.create({
    data: {
      coachId: coach.id, title: 'کاهش وزن و چربی‌سوزی — ۶ هفته‌ای', description: 'ترکیب کاردیو اینتروال و تمرین با وزن بدن برای کاهش وزن پایدار',
      goal: 'FAT_LOSS', level: 'BEGINNER', durationWeeks: 6, daysPerWeek: 4, status: 'PUBLISHED',
    },
  })
  const program3 = await db.program.create({
    data: {
      coachId: coach.id, title: 'آمادگی کراس‌فیت مسابقه‌ای', description: 'برنامه پیشرفته WOD برای آمادگی مسابقات منطقه‌ای',
      goal: 'ATHLETIC', level: 'ADVANCED', durationWeeks: 8, daysPerWeek: 5, status: 'PUBLISHED',
    },
  })
  console.log('✓ programs')

  const dayLabels = ['شنبه', 'دوشنبه', 'چهارشنبه']
  type SeDef = { name: string; sets: number; reps: string; weight?: string; rest?: number }
  const p1Sessions: { title: string; focus: string; ex: SeDef[] }[] = [
    { title: 'سینه و پشت بازو', focus: 'بالاتنه — هل', ex: [
      { name: 'پرس سینه هالتر', sets: 4, reps: '8-10', weight: '60' },
      { name: 'شنا سوئدی', sets: 3, reps: '15' },
      { name: 'پرس سرشانه دمبل', sets: 3, reps: '10', weight: '14' },
    ] },
    { title: 'زیربغل و جلوبازو', focus: 'بالاتنه — کشش', ex: [
      { name: 'بارفیکس', sets: 4, reps: '6-8' },
      { name: 'ددلیفت', sets: 4, reps: '6', weight: '90' },
      { name: 'پلانک', sets: 3, reps: '45 ثانیه' },
    ] },
    { title: 'پا و مرکزی بدن', focus: 'پایین‌تنه', ex: [
      { name: 'اسکوات با هالتر', sets: 4, reps: '8', weight: '80' },
      { name: 'پلانک', sets: 3, reps: '60 ثانیه' },
    ] },
  ]
  for (let w = 1; w <= 4; w++) {
    for (let d = 0; d < 3; d++) {
      const s = p1Sessions[d]
      const session = await db.workoutSession.create({
        data: { programId: program1.id, title: s.title, weekNumber: w, dayNumber: d + 1, dayLabel: dayLabels[d], focus: s.focus },
      })
      let order = 0
      for (const e of s.ex) {
        await db.sessionExercise.create({
          data: { sessionId: session.id, exerciseId: exercises[e.name].id, order: order++, sets: e.sets, reps: e.reps, weight: e.weight || null, restSeconds: e.rest || 90 },
        })
      }
    }
  }

  const p2Sessions: { title: string; focus: string; ex: SeDef[] }[] = [
    { title: 'کاردیو اینتروال', focus: 'چربی‌سوزی', ex: [
      { name: 'تردمیل — دویدن اینتروال', sets: 1, reps: '۲۰ دقیقه' },
      { name: 'حرکت کششی کتف و سینه', sets: 2, reps: '۳۰ ثانیه' },
    ] },
    { title: 'تمرین با وزن بدن', focus: 'تمام بدن', ex: [
      { name: 'شنا سوئدی', sets: 3, reps: '12' },
      { name: 'پلانک', sets: 3, reps: '40 ثانیه' },
      { name: 'اسکوات با هالتر', sets: 3, reps: '12', weight: '20' },
    ] },
    { title: 'کاردیو دستگاه', focus: 'هوازی', ex: [
      { name: 'روئینگ (قایق‌سواری)', sets: 1, reps: '۱۵ دقیقه' },
      { name: 'تردمیل — دویدن اینتروال', sets: 1, reps: '۱۰ دقیقه' },
    ] },
    { title: 'قدرتی سبک', focus: 'حفظ عضله', ex: [
      { name: 'ددلیفت', sets: 3, reps: '10', weight: '40' },
      { name: 'پرس سینه هالتر', sets: 3, reps: '12', weight: '25' },
    ] },
  ]
  for (let w = 1; w <= 2; w++) {
    for (let d = 0; d < 4; d++) {
      const s = p2Sessions[d]
      const session = await db.workoutSession.create({
        data: { programId: program2.id, title: s.title, weekNumber: w, dayNumber: d + 1, dayLabel: dayLabels[Math.min(d, 2)], focus: s.focus },
      })
      let order = 0
      for (const e of s.ex) {
        await db.sessionExercise.create({
          data: { sessionId: session.id, exerciseId: exercises[e.name].id, order: order++, sets: e.sets, reps: e.reps, weight: e.weight || null, restSeconds: e.rest || 60 },
        })
      }
    }
  }

  const p3Session = await db.workoutSession.create({
    data: { programId: program3.id, title: 'WOD — AMRAP 20', weekNumber: 1, dayNumber: 1, dayLabel: 'شنبه', focus: 'تمام بدن' },
  })
  for (const [i, e] of ['بارفیکس', 'شنا سوئدی', 'روئینگ (قایق‌سواری)'].entries()) {
    await db.sessionExercise.create({
      data: { sessionId: p3Session.id, exerciseId: exercises[e].id, order: i, sets: 5, reps: '10', restSeconds: 45 },
    })
  }
  console.log('✓ sessions')

  // ---- assignments ----
  await db.programAssignment.create({ data: { programId: program1.id, athleteId: ali.id, startDate: new Date(Date.now() - 21 * 864e5).toISOString().slice(0, 10) } })
  await db.programAssignment.create({ data: { programId: program2.id, athleteId: sara.id, startDate: new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10) } })
  await db.programAssignment.create({ data: { programId: program3.id, athleteId: reza.id, startDate: new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10) } })
  await db.programAssignment.create({ data: { programId: program2.id, athleteId: ali.id, startDate: new Date(Date.now() - 5 * 864e5).toISOString().slice(0, 10) } })
  console.log('✓ assignments')

  // ---- workout logs (past ~3 weeks for ali, 2 weeks sara, 1 week reza) ----
  const p1DbSessions = await db.workoutSession.findMany({ where: { programId: program1.id }, include: { exercises: { include: { exercise: true } } } })
  const p2DbSessions = await db.workoutSession.findMany({ where: { programId: program2.id }, include: { exercises: { include: { exercise: true } } } })

  async function createLogs(athleteId: string, sessions: typeof p1DbSessions, weeks: number, completionRate: number) {
    let i = 0
    for (let w = 0; w < weeks; w++) {
      for (const s of sessions.filter((x) => x.weekNumber === w + 1)) {
        i++
        const daysAgo = weeks * 7 - w * 7 - (i % 3) - 1
        if (daysAgo < 0) continue
        const date = new Date(Date.now() - daysAgo * 864e5 - Math.random() * 4 * 36e5)
        const roll = Math.random() * 100
        const status = roll < completionRate ? 'COMPLETED' : roll < completionRate + 12 ? 'PARTIAL' : 'SKIPPED'
        await db.workoutLog.create({
          data: {
            athleteId, sessionId: s.id, title: s.title, date, status,
            duration: status === 'SKIPPED' ? null : 45 + Math.round(Math.random() * 30),
            rating: status === 'SKIPPED' ? null : 3 + Math.round(Math.random() * 2),
            notes: status === 'PARTIAL' ? 'وقت کم بود، دو حرکت آخر انجام نشد' : null,
            exerciseLogs: status === 'SKIPPED' ? undefined : {
              create: s.exercises.map((se) => ({
                exerciseId: se.exerciseId,
                exerciseName: se.exercise.name,
                actualSets: status === 'PARTIAL' ? Math.max(1, se.sets - 1) : se.sets,
                actualReps: se.reps,
                actualWeight: se.weight,
              })),
            },
          },
        })
      }
    }
  }
  await createLogs(ali.id, p1DbSessions, 3, 78)
  await createLogs(sara.id, p2DbSessions, 2, 65)
  console.log('✓ workout logs')

  // ---- progress entries ----
  const progressSeed = [
    { userId: ali.id, base: 84.5, trend: -0.4, count: 8 },
    { userId: sara.id, base: 66.0, trend: -0.5, count: 6 },
    { userId: reza.id, base: 71.0, trend: -0.2, count: 4 },
  ]
  for (const p of progressSeed) {
    for (let i = p.count - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 7 * 864e5)
      const weight = p.base + (p.count - 1 - i) * p.trend + (Math.random() - 0.5)
      await db.progressEntry.create({
        data: {
          athleteId: p.userId, date,
          weight: Math.round(weight * 10) / 10,
          bodyFat: Math.round((18 + Math.random() * 4) * 10) / 10,
          muscleMass: Math.round((32 + Math.random() * 3) * 10) / 10,
        },
      })
    }
  }
  console.log('✓ progress')

  // ---- messages ----
  const msgs = [
    { from: ali.id, to: coach.id, content: 'سلام مربی، برنامه این هفته رو دیدم. برای پرس سینه هنوز ۶۰ کیلو سخته، کمترش کنم؟', daysAgo: 2 },
    { from: coach.id, to: ali.id, content: 'سلام علی جان 👋 همین ۶۰ کیلو رو با فرم تمیز بزن، دو هفته دیگه راحت میشه. تمرکزت روی اجرا باشه نه وزنه.', daysAgo: 2 },
    { from: ali.id, to: coach.id, content: 'چشم. جلسه امروز ۴ تا از ۴ ست رو کامل زدم 💪', daysAgo: 1 },
    { from: sara.id, to: coach.id, content: 'سلام، بعد از تمرین کاردیو سرگیجه دارم. صبحانه رو قبل تمرین بخورم؟', daysAgo: 1 },
    { from: coach.id, to: sara.id, content: 'سلام سارا، بله یه وعده سبک کربوهیدرات‌دار ۴۵ دقیقه قبل تمرین بخور. اگر تکرار شد حتماً بگو تا بررسی کنیم.', daysAgo: 1 },
  ]
  for (const m of msgs) {
    await db.message.create({
      data: { senderId: m.from, receiverId: m.to, content: m.content, createdAt: new Date(Date.now() - m.daysAgo * 864e5 - 36e5), readAt: m.from === coach.id ? new Date() : null },
    })
  }
  console.log('✓ messages')

  // ---- payments ----
  const now = new Date()
  const pay = [
    { athleteId: ali.id, amount: 2500000, title: 'شهریه برنامه آنلاین — ماه جاری', method: 'CARD', status: 'PAID', monthOffset: 0 },
    { athleteId: sara.id, amount: 2000000, title: 'شهریه برنامه آنلاین — ماه جاری', method: 'ONLINE', status: 'PAID', monthOffset: 0 },
    { athleteId: reza.id, amount: 3200000, title: 'شهریه کراس‌فیت اختصاصی', method: 'CASH', status: 'PENDING', monthOffset: 0 },
    { athleteId: ali.id, amount: 2500000, title: 'شهریه برنامه آنلاین — ماه قبل', method: 'CARD', status: 'PAID', monthOffset: 1 },
    { athleteId: sara.id, amount: 2000000, title: 'شهریه برنامه آنلاین — ماه قبل', method: 'ONLINE', status: 'PAID', monthOffset: 1 },
    { athleteId: ali.id, amount: 2500000, title: 'شهریه برنامه آنلاین — دو ماه قبل', method: 'CARD', status: 'PAID', monthOffset: 2 },
  ]
  for (const p of pay) {
    await db.payment.create({
      data: { coachId: coach.id, athleteId: p.athleteId, amount: p.amount, title: p.title, method: p.method, status: p.status, date: new Date(now.getFullYear(), now.getMonth() - p.monthOffset, 5) },
    })
  }
  console.log('✓ payments')

  console.log('\n🎉 Seed complete!')
  console.log('   مربی:   coach@fitcoach.ir / 123456')
  console.log('   ورزشکار: ali@fitcoach.ir / 123456 (also sara@, reza@)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
