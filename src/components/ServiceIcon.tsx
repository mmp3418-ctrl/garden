import {
  Bath,
  Building2,
  Car,
  Coffee,
  Flame,
  Shield,
  Sparkles,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import type { FC } from 'react'

const iconMap: Record<string, LucideIcon> = {
  waves: Waves,
  flame: Flame,
  coffee: Coffee,
  bath: Bath,
  sparkles: Sparkles,
  car: Car,
  shield: Shield,
  building2: Building2,
}

export const SERVICE_ICON_OPTIONS = [
  'Waves',
  'Flame',
  'Coffee',
  'Sparkles',
  'Car',
  'Shield',
  'Building2',
  'Bath',
] as const

interface ServiceIconProps {
  name?: string | null
  className?: string
}

const ServiceIcon: FC<ServiceIconProps> = ({ name, className = 'h-6 w-6' }) => {
  const Icon = iconMap[(name ?? '').trim().toLowerCase()] ?? Waves
  return <Icon className={className} aria-hidden="true" />
}

export default ServiceIcon
