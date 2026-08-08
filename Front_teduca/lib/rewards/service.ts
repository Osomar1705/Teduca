import { apiClient } from '../api-client'
import { API_ENDPOINTS } from '../constants'
import type {
  EarnEventType,
  EarnRule,
  RankingData,
  RankingEntry,
  RewardBalance,
  RewardItem,
  RewardTransaction,
} from './types'

export const EARN_RULES: EarnRule[] = [
  {
    event: 'daily_login',
    label: 'Ingreso diario',
    description: 'Entra a TEDUCA cada día para sumar Orbits.',
    pointsAwarded: 5,
    isActive: true,
    maxPerDay: 1,
    icon: 'CalendarCheck',
  },
  {
    event: 'onboarding_complete',
    label: 'Completar tu perfil',
    description: 'Termina el onboarding y personaliza tu experiencia.',
    pointsAwarded: 30,
    isActive: true,
    icon: 'UserCheck',
  },
  {
    event: 'mentorship_attended',
    label: 'Asistir a una mentoría',
    description: 'Participa en una sesión con un profesor o mentor.',
    pointsAwarded: 50,
    isActive: true,
    icon: 'GraduationCap',
  },
  {
    event: 'module_completed',
    label: 'Completar un módulo',
    description: 'Finaliza un módulo dentro de un curso.',
    pointsAwarded: 25,
    isActive: true,
    icon: 'CircleCheck',
  },
  {
    event: 'course_completed',
    label: 'Completar un curso',
    description: 'Termina un curso completo y acumulá Orbits.',
    pointsAwarded: 100,
    isActive: true,
    icon: 'BookOpen',
  },
  {
    event: 'streak_milestone',
    label: 'Hito de racha',
    description: 'Alcanza rachas de 7, 30 o 100 días de actividad.',
    pointsAwarded: 40,
    isActive: true,
    icon: 'Flame',
  },
  {
    event: 'good_grade',
    label: 'Buena calificación',
    description: 'Obtén una nota destacada en una tarea o examen.',
    pointsAwarded: 35,
    isActive: true,
    icon: 'Award',
  },
  {
    event: 'weekly_challenge',
    label: 'Reto semanal',
    description: 'Completa el reto de la semana propuesto por la comunidad.',
    pointsAwarded: 60,
    isActive: true,
    icon: 'Target',
  },
  {
    event: 'referral',
    label: 'Invitar a un compañero',
    description: 'Trae a un amigo a TEDUCA y ambos ganan Orbits.',
    pointsAwarded: 75,
    isActive: true,
    maxPerWeek: 5,
    icon: 'Users',
  },
  {
    event: 'helped_student',
    label: 'Ayudar a un estudiante',
    description: 'Responde dudas y apoya a otros en la comunidad.',
    pointsAwarded: 20,
    isActive: false,
    icon: 'Handshake',
  },
  {
    event: 'answer_accepted',
    label: 'Respuesta aceptada',
    description: 'Tu respuesta fue marcada como la mejor solución.',
    pointsAwarded: 30,
    isActive: false,
    icon: 'MessageSquare',
  },
  {
    event: 'event_participated',
    label: 'Participar en un evento',
    description: 'Asiste a charlas, talleres o eventos académicos.',
    pointsAwarded: 45,
    isActive: false,
    icon: 'Calendar',
  },
  {
    event: 'hackathon_joined',
    label: 'Unirse a un hackathon',
    description: 'Participa en un hackathon o competencia.',
    pointsAwarded: 120,
    isActive: false,
    icon: 'Zap',
  },
  {
    event: 'research_published',
    label: 'Publicar investigación',
    description: 'Comparte un trabajo de investigación con la comunidad.',
    pointsAwarded: 150,
    isActive: false,
    icon: 'FileText',
  },
  {
    event: 'content_published',
    label: 'Publicar contenido',
    description: 'Crea recursos educativos para otros estudiantes.',
    pointsAwarded: 40,
    isActive: false,
    icon: 'PenTool',
  },
  {
    event: 'became_mentor',
    label: 'Convertirte en mentor',
    description: 'Da el paso y empieza a mentorizar a otros.',
    pointsAwarded: 200,
    isActive: false,
    icon: 'Sparkles',
  },
  {
    event: 'high_participation',
    label: 'Alta participación',
    description: 'Mantén una participación destacada durante el mes.',
    pointsAwarded: 80,
    isActive: false,
    icon: 'TrendingUp',
  },
]

export const MARKETPLACE_ITEMS: RewardItem[] = [
  {
    id: 'cafeteria-cafe',
    name: 'Vale de café',
    description: 'Un café gratis en la cafetería del campus.',
    type: 'food',
    category: 'food',
    value: 300,
    displayValue: '300 Orbits',
    partner: 'Cafetería Central',
    stock: 50,
    conditions: ['Solo para estudiantes activos', 'Válido de lunes a viernes'],
    status: 'available',
    featured: true,
  },
  {
    id: 'almuerzo-descuento',
    name: '20% en almuerzo',
    description: 'Descuento del 20% en el menú del comedor universitario.',
    type: 'discount',
    category: 'food',
    value: 450,
    displayValue: '450 Orbits',
    partner: 'Comedor Universitario',
    conditions: ['Máximo 1 por semana'],
    status: 'locked',
  },
  {
    id: 'pase-transporte',
    name: 'Pase de transporte',
    description: 'Un pase semanal de transporte universitario.',
    type: 'transport',
    category: 'transport',
    value: 800,
    displayValue: '800 Orbits',
    partner: 'Movilidad Campus',
    conditions: ['Solo para estudiantes activos', 'Máximo 1 por mes'],
    status: 'locked',
  },
  {
    id: 'libro-tecnico',
    name: 'Libro técnico',
    description: 'Un libro de tu carrera de nuestro catálogo aliado.',
    type: 'book',
    category: 'education',
    value: 1200,
    displayValue: '1200 Orbits',
    partner: 'Editorial Académica',
    conditions: ['Sujeto a disponibilidad del catálogo'],
    status: 'locked',
  },
  {
    id: 'curso-premium',
    name: 'Curso premium',
    description: 'Acceso a un curso premium de la plataforma.',
    type: 'course',
    category: 'education',
    value: 2000,
    displayValue: '2000 Orbits',
    conditions: ['Válido por 6 meses'],
    status: 'locked',
    featured: true,
  },
  {
    id: 'certificado',
    name: 'Certificado destacado',
    description: 'Certificado verificado con sello TEDUCA.',
    type: 'certificate',
    category: 'education',
    value: 1500,
    displayValue: '1500 Orbits',
    conditions: ['Requiere completar un curso'],
    status: 'locked',
  },
  {
    id: 'evento-vip',
    name: 'Entrada a evento',
    description: 'Acceso prioritario a un evento o charla exclusiva.',
    type: 'event',
    category: 'university',
    value: 1000,
    displayValue: '1000 Orbits',
    conditions: ['Sujeto a fechas disponibles'],
    status: 'locked',
  },
  {
    id: 'giftcard-libreria',
    name: 'Gift card librería',
    description: 'Tarjeta de regalo para gastar en la librería aliada.',
    type: 'gift_card',
    category: 'partner',
    value: 2500,
    displayValue: '2500 Orbits',
    partner: 'Librería Universitaria',
    conditions: ['No acumulable con otras promociones'],
    status: 'locked',
  },
  {
    id: 'merch-kit',
    name: 'Kit TEDUCA',
    description: 'Stickers, una taza y una libreta de la comunidad.',
    type: 'merchandise',
    category: 'lifestyle',
    value: 600,
    displayValue: '600 Orbits',
    stock: 100,
    conditions: ['Retiro en campus'],
    status: 'available',
  },
  {
    id: 'mentoria-premium',
    name: 'Mentoría 1:1',
    description: 'Una sesión de mentoría con un profesor destacado.',
    type: 'benefit',
    category: 'education',
    value: 1800,
    displayValue: '1800 Orbits',
    conditions: ['Sujeto a agenda del mentor'],
    status: 'locked',
    featured: true,
  },
  {
    id: 'streaming-descuento',
    name: 'Descuento streaming',
    description: 'Descuento en tu suscripción de música o video.',
    type: 'discount',
    category: 'lifestyle',
    value: 900,
    displayValue: '900 Orbits',
    partner: 'Aliado Digital',
    conditions: ['Máximo 1 por mes'],
    status: 'locked',
  },
  {
    id: 'coworking-dia',
    name: 'Día de coworking',
    description: 'Un día completo en un espacio de coworking aliado.',
    type: 'benefit',
    category: 'partner',
    value: 1400,
    displayValue: '1400 Orbits',
    partner: 'Coworking Hub',
    conditions: ['Reserva con 48h de anticipación'],
    status: 'locked',
  },
]

interface ApiSummary {
  total_points: number
  current_streak: number
  longest_streak: number
  last_active_date: string | null
}

interface ApiLedgerEntry {
  id: string
  points: number
  reason: string
  event_name: string | null
  created_at: string
}

interface ApiReward {
  id: string
  code: string
  name: string
  description: string | null
  cost_points: number
}

export async function getRewardBalance(): Promise<RewardBalance> {
  const summary = await apiClient.get<ApiSummary>('/api/v1/gamification/me')
  const ledger = await apiClient.get<{ data: ApiLedgerEntry[] }>('/api/v1/gamification/ledger?limit=100')

  const now = Date.now()
  const weekMs = now - 7 * 86_400_000
  const monthMs = now - 30 * 86_400_000

  const entries = ledger.data
  const weeklyEarned = entries
    .filter((e) => e.points > 0 && new Date(e.created_at).getTime() >= weekMs)
    .reduce((acc, e) => acc + e.points, 0)
  const monthlyEarned = entries
    .filter((e) => e.points > 0 && new Date(e.created_at).getTime() >= monthMs)
    .reduce((acc, e) => acc + e.points, 0)
  const totalEarned = entries.filter((e) => e.points > 0).reduce((acc, e) => acc + e.points, 0)
  const totalRedeemed = entries.filter((e) => e.points < 0).reduce((acc, e) => acc + Math.abs(e.points), 0)

  return {
    total: summary.total_points,
    unit: 'Orbits',
    label: 'Orbits',
    weeklyEarned,
    monthlyEarned,
    totalEarned,
    totalRedeemed,
  }
}

export function getTransactions(): RewardTransaction[] {
  return []
}

export async function getTransactionsAsync(): Promise<RewardTransaction[]> {
  const ledger = await apiClient.get<{ data: ApiLedgerEntry[] }>('/api/v1/gamification/ledger?limit=50')
  return ledger.data.map((e, i, arr) => {
    const runningBalance = arr.slice(i).reduce((acc, x) => acc + x.points, 0)
    return {
      id: e.id,
      type: e.points > 0 ? 'earned' : 'redeemed',
      event: e.event_name as EarnEventType | undefined,
      points: Math.abs(e.points),
      balance: runningBalance,
      description: e.reason,
      createdAt: e.created_at,
      status: 'completed',
    } as RewardTransaction
  })
}

export async function addEarnTransaction(
  event: EarnEventType,
  description: string,
): Promise<RewardTransaction> {
  const rule = EARN_RULES.find((r) => r.event === event)
  const points = rule?.pointsAwarded ?? 0
  await apiClient.post('/api/v1/gamification/award', { event, points, reason: description })
  return {
    id: `tx_${Date.now()}`,
    type: 'earned',
    event,
    points,
    balance: 0,
    description,
    createdAt: new Date().toISOString(),
    status: 'completed',
  }
}

export async function maybeAwardDailyLogin(): Promise<RewardTransaction | null> {
  if (typeof window === 'undefined') return null
  const today = new Date().toISOString().slice(0, 10)
  const key = 'teduca_reward_daily_login'
  if (localStorage.getItem(key) === today) return null
  localStorage.setItem(key, today)
  return addEarnTransaction('daily_login', 'Ingreso diario — Orbits ganados')
}

export function getEarnRules(): EarnRule[] {
  return EARN_RULES
}

export function getMarketplaceItems(): RewardItem[] {
  return MARKETPLACE_ITEMS
}

export async function getBackendRewards(): Promise<ApiReward[]> {
  return apiClient.get<ApiReward[]>(API_ENDPOINTS.GAMIFICATION.REWARDS)
}

export async function redeemItem(
  itemId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await apiClient.post(API_ENDPOINTS.GAMIFICATION.REDEEM(itemId))
    return { success: true, message: 'Recompensa canjeada exitosamente' }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'No se pudo canjear la recompensa'
    return { success: false, message }
  }
}

export async function getRanking(): Promise<RankingData> {
  let balance = 0
  try {
    const summary = await apiClient.get<ApiSummary>('/api/v1/gamification/me')
    balance = summary.total_points
  } catch {
    // sin sesión
  }

  const global: RankingEntry[] = [
    { position: 1, userId: 'u1', name: 'Valentina Ríos', university: 'UNI Andes', career: 'Ingeniería de Software', score: 4820, pointsBalance: 3200, streak: 64 },
    { position: 2, userId: 'u2', name: 'Mateo Fernández', university: 'UNI Andes', career: 'Data Science', score: 4510, pointsBalance: 2980, streak: 41 },
    { position: 3, userId: 'u3', name: 'Sofía Castro', university: 'Tec Central', career: 'Diseño', score: 4290, pointsBalance: 2750, streak: 38 },
    { position: 4, userId: 'u4', name: 'Diego Morales', university: 'UNI Andes', career: 'Ingeniería de Software', score: 3980, pointsBalance: 2400, streak: 29 },
    { position: 5, userId: 'me', name: 'Tú', university: 'UNI Andes', career: 'Ingeniería de Software', score: 3710, pointsBalance: balance, streak: 0, isCurrentUser: true },
    { position: 6, userId: 'u6', name: 'Camila Vega', university: 'Tec Central', career: 'Matemáticas', score: 3540, pointsBalance: 2100, streak: 22 },
    { position: 7, userId: 'u7', name: 'Lucas Ibáñez', university: 'UNI Sur', career: 'Física', score: 3320, pointsBalance: 1950, streak: 18 },
    { position: 8, userId: 'u8', name: 'Antonia Paz', university: 'UNI Andes', career: 'Data Science', score: 3110, pointsBalance: 1800, streak: 15 },
    { position: 9, userId: 'u9', name: 'Benjamín Rojas', university: 'Tec Central', career: 'Diseño', score: 2940, pointsBalance: 1650, streak: 12 },
    { position: 10, userId: 'u10', name: 'Isabella Núñez', university: 'UNI Sur', career: 'Biología', score: 2780, pointsBalance: 1500, streak: 9 },
  ]

  const byUniversity = global
    .filter((e) => e.university === 'UNI Andes')
    .map((e, i) => ({ ...e, position: i + 1 }))
  const byCareer = global
    .filter((e) => e.career === 'Ingeniería de Software')
    .map((e, i) => ({ ...e, position: i + 1 }))
  const weekly = [...global].sort((a, b) => b.streak - a.streak).map((e, i) => ({ ...e, position: i + 1 }))

  return {
    global,
    byUniversity,
    byCareer,
    weekly,
    monthly: global,
    friends: [],
    currentUserPosition: {
      global: global.find((e) => e.isCurrentUser)?.position ?? 0,
      university: byUniversity.find((e) => e.isCurrentUser)?.position ?? 0,
      career: byCareer.find((e) => e.isCurrentUser)?.position ?? 0,
    },
  }
}
