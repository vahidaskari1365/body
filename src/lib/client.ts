'use client'

import { useEffect, useState, useCallback } from 'react'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'COACH' | 'ATHLETE'
  phone?: string | null
  athleteProfile?: AthleteProfile | null
}

export interface AthleteProfile {
  id: string
  userId: string
  coachId?: string | null
  height?: number | null
  weight?: number | null
  sport?: string | null
  goal?: string | null
  level?: string | null
  birthDate?: string | null
  medicalNotes?: string | null
  status?: string
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'خطایی رخ داد')
  }
  return data as T
}

export function useFetch<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!path)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!path) return
    setLoading(true)
    setError(null)
    try {
      const result = await api<T>(path)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا')
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    refresh()
  }, [path, ...deps])

  return { data, loading, error, refresh, setData }
}

const FA_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const FA_DAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']

export function toFa(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '-'
  return String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
}

export function faDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
  } catch {
    return d.toLocaleDateString('fa-IR')
  }
}

export function faDateShort(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long', day: 'numeric' }).format(d)
  } catch {
    return d.toLocaleDateString('fa-IR')
  }
}

export function faDayName(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return FA_DAYS[new Date(date).getDay()]
}

export function faMonthName(monthNum: number): string {
  return FA_MONTHS[monthNum - 1] || String(monthNum)
}

export function faMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  return `${toFa(new Intl.NumberFormat('en-US').format(Math.round(amount)))} تومان`
}

export function faTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return toFa(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`)
}

export const ROLE_LABEL: Record<string, string> = {
  COACH: 'مربی',
  ATHLETE: 'ورزشکار',
}

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'مبتدی',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'پیشرفته',
}

export const GOAL_LABEL: Record<string, string> = {
  MUSCLE_GAIN: 'افزایش عضله',
  FAT_LOSS: 'کاهش وزن',
  FITNESS: 'تناسب اندام',
  ATHLETIC: 'آمادگی مسابقه',
}

export const CATEGORY_LABEL: Record<string, string> = {
  STRENGTH: 'قدرتی',
  CARDIO: 'هوازی',
  MOBILITY: 'انعطاف‌پذیری',
  CORE: 'مرکزی',
  WARMUP: 'گرم کردن',
  COOLDOWN: 'سرد کردن',
}

export const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'کامل',
  PARTIAL: 'ناقص',
  SKIPPED: 'لغو شده',
  ACTIVE: 'فعال',
  PAUSED: 'مکث‌شده',
  ARCHIVED: 'بایگانی',
  DRAFT: 'پیش‌نویس',
  PUBLISHED: 'منتشر شده',
  PAID: 'پرداخت شده',
  PENDING: 'در انتظار',
  CANCELLED: 'لغو شده',
}

export const METHOD_LABEL: Record<string, string> = {
  CASH: 'نقدی',
  CARD: 'کارت به کارت',
  ONLINE: 'درگاه آنلاین',
  TRANSFER: 'حواله',
}

export function videoEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const aparat = url.match(/aparat\.com\/v\/([\w]+)/)
  if (aparat) return `https://www.aparat.com/video/video/embed/videohash/${aparat[1]}/vt/frame`
  return url
}

export function isEmbeddableVideo(url: string | null | undefined): boolean {
  if (!url) return false
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}
