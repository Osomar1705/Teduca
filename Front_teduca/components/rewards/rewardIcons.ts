import {
  Award,
  BookOpen,
  Bus,
  Calendar,
  CalendarCheck,
  CircleCheck,
  Coffee,
  CreditCard,
  FileBadge,
  FileText,
  Flame,
  Gift,
  GraduationCap,
  Handshake,
  MessageSquare,
  PenTool,
  Percent,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Ticket,
  UserCheck,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { RewardType } from '@/lib/rewards/types'

export const REWARD_TYPE_ICON: Record<RewardType, LucideIcon> = {
  points: Gift,
  discount: Percent,
  food: Coffee,
  transport: Bus,
  merchandise: ShoppingBag,
  book: BookOpen,
  course: GraduationCap,
  certificate: FileBadge,
  event: Ticket,
  gift_card: CreditCard,
  benefit: Sparkles,
}

export const REWARD_TYPE_LABEL: Record<RewardType, string> = {
  points: 'Puntos',
  discount: 'Descuento',
  food: 'Alimentos',
  transport: 'Transporte',
  merchandise: 'Merchandising',
  book: 'Libro',
  course: 'Curso',
  certificate: 'Certificado',
  event: 'Evento',
  gift_card: 'Gift card',
  benefit: 'Beneficio',
}

const EARN_ICON_MAP: Record<string, LucideIcon> = {
  CalendarCheck,
  UserCheck,
  GraduationCap,
  CircleCheck,
  BookOpen,
  Flame,
  Award,
  Target,
  Users,
  Handshake,
  MessageSquare,
  Calendar,
  Zap,
  FileText,
  PenTool,
  Sparkles,
  TrendingUp,
}

export function getEarnIcon(name: string): LucideIcon {
  return EARN_ICON_MAP[name] ?? Sparkles
}
