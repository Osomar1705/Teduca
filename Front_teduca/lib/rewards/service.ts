import type {
  EarnEventType,
  EarnRule,
  RankingData,
  RankingEntry,
  RewardBalance,
  RewardItem,
  RewardTransaction,
} from './types'

/**
 * Servicio de recompensas. Persiste balance e historial en localStorage.
 * La arquitectura está lista para conectarse al backend (`/api/v1/rewards`).
 */

const BALANCE_KEY = 'teduca_reward_balance'
const TRANSACTIONS_KEY = 'teduca_reward_transactions'
const LAST_ACTIVE_KEY = 'teduca_last_active'
const DAILY_LOGIN_KEY = 'teduca_reward_daily_login'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

interface StoredBalance {
  total: number
  totalEarned: number
  totalRedeemed: number
}

export const EARN_RULES: EarnRule[] = [
  {
    event: 'daily_login',
    label: 'Ingreso diario',
    description: 'Entra a TEDUCA cada día para sumar puntos.',
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
    description: 'Termina un curso completo y obtén tu recompensa.',
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
    description: 'Trae a un amigo a TEDUCA y ambos ganan puntos.',
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
    displayValue: '300 puntos',
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
    displayValue: '450 puntos',
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
    displayValue: '800 puntos',
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
    displayValue: '1200 puntos',
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
    displayValue: '2000 puntos',
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
    displayValue: '1500 puntos',
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
    displayValue: '1000 puntos',
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
    displayValue: '2500 puntos',
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
    displayValue: '600 puntos',
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
    displayValue: '1800 puntos',
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
    displayValue: '900 puntos',
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
    displayValue: '1400 puntos',
    partner: 'Coworking Hub',
    conditions: ['Reserva con 48h de anticipación'],
    status: 'locked',
  },
]

function readStoredBalance(): StoredBalance {
  if (!isBrowser()) return { total: 0, totalEarned: 0, totalRedeemed: 0 }
  const raw = window.localStorage.getItem(BALANCE_KEY)
  if (!raw) return { total: 0, totalEarned: 0, totalRedeemed: 0 }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredBalance>
    return {
      total: Number(parsed.total) || 0,
      totalEarned: Number(parsed.totalEarned) || 0,
      totalRedeemed: Number(parsed.totalRedeemed) || 0,
    }
  } catch {
    return { total: 0, totalEarned: 0, totalRedeemed: 0 }
  }
}

function writeStoredBalance(balance: StoredBalance): void {
  if (!isBrowser()) return
  window.localStorage.setItem(BALANCE_KEY, JSON.stringify(balance))
}

export function getTransactions(): RewardTransaction[] {
  if (!isBrowser()) return []
  const raw = window.localStorage.getItem(TRANSACTIONS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as RewardTransaction[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeTransactions(txs: RewardTransaction[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs))
}

function sumSince(txs: RewardTransaction[], sinceMs: number): number {
  return txs
    .filter((t) => t.type === 'earned' && new Date(t.createdAt).getTime() >= sinceMs)
    .reduce((acc, t) => acc + t.points, 0)
}

export function getRewardBalance(): RewardBalance {
  const stored = readStoredBalance()
  const txs = getTransactions()
  const now = Date.now()
  const weekMs = now - 7 * 86_400_000
  const monthMs = now - 30 * 86_400_000

  return {
    total: stored.total,
    unit: 'puntos',
    label: 'Puntos académicos',
    weeklyEarned: sumSince(txs, weekMs),
    monthlyEarned: sumSince(txs, monthMs),
    totalEarned: stored.totalEarned,
    totalRedeemed: stored.totalRedeemed,
  }
}

export function addEarnTransaction(
  event: EarnEventType,
  description: string,
): RewardTransaction {
  const rule = EARN_RULES.find((r) => r.event === event)
  const points = rule?.pointsAwarded ?? 0
  const stored = readStoredBalance()
  const newTotal = stored.total + points

  const tx: RewardTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'earned',
    event,
    points,
    balance: newTotal,
    description,
    createdAt: new Date().toISOString(),
    status: 'completed',
  }

  const txs = getTransactions()
  txs.unshift(tx)
  writeTransactions(txs)
  writeStoredBalance({
    total: newTotal,
    totalEarned: stored.totalEarned + points,
    totalRedeemed: stored.totalRedeemed,
  })

  return tx
}

/**
 * Otorga 5 puntos por ingreso diario. Idempotente por día usando la misma
 * fecha que la racha (`teduca_last_active`).
 */
export function maybeAwardDailyLogin(): RewardTransaction | null {
  if (!isBrowser()) return null
  const today =
    window.localStorage.getItem(LAST_ACTIVE_KEY) ?? new Date().toISOString().slice(0, 10)
  const lastAwarded = window.localStorage.getItem(DAILY_LOGIN_KEY)
  if (lastAwarded === today) return null

  window.localStorage.setItem(DAILY_LOGIN_KEY, today)
  return addEarnTransaction('daily_login', 'Ingreso diario a TEDUCA')
}

export function getEarnRules(): EarnRule[] {
  return EARN_RULES
}

export function getMarketplaceItems(): RewardItem[] {
  return MARKETPLACE_ITEMS
}

export async function redeemItem(
  itemId: string,
): Promise<{ success: boolean; message: string }> {
  void itemId
  return { success: false, message: 'Función disponible próximamente' }
}

const CURRENT_USER_ID = 'me'

export async function getRanking(): Promise<RankingData> {
  // TODO: conectar a /api/v1/ranking
  const balance = getRewardBalance()
  const streakRaw = isBrowser()
    ? Number(window.localStorage.getItem('teduca_streak_current')) || 0
    : 0

  const global: RankingEntry[] = [
    { position: 1, userId: 'u1', name: 'Valentina Ríos', university: 'UNI Andes', career: 'Ingeniería de Software', score: 4820, pointsBalance: 3200, streak: 64 },
    { position: 2, userId: 'u2', name: 'Mateo Fernández', university: 'UNI Andes', career: 'Data Science', score: 4510, pointsBalance: 2980, streak: 41 },
    { position: 3, userId: 'u3', name: 'Sofía Castro', university: 'Tec Central', career: 'Diseño', score: 4290, pointsBalance: 2750, streak: 38 },
    { position: 4, userId: 'u4', name: 'Diego Morales', university: 'UNI Andes', career: 'Ingeniería de Software', score: 3980, pointsBalance: 2400, streak: 29 },
    { position: 5, userId: CURRENT_USER_ID, name: 'Tú', university: 'UNI Andes', career: 'Ingeniería de Software', score: 3710, pointsBalance: balance.total, streak: streakRaw, isCurrentUser: true },
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
  const weekly = [...global]
    .sort((a, b) => b.streak - a.streak)
    .map((e, i) => ({ ...e, position: i + 1 }))
  const monthly = global

  return {
    global,
    byUniversity,
    byCareer,
    weekly,
    monthly,
    friends: [],
    currentUserPosition: {
      global: global.find((e) => e.isCurrentUser)?.position ?? 0,
      university: byUniversity.find((e) => e.isCurrentUser)?.position ?? 0,
      career: byCareer.find((e) => e.isCurrentUser)?.position ?? 0,
    },
  }
}
