import {
  Bath,
  Building2,
  Car,
  Coffee,
  Dumbbell,
  Flame,
  Shield,
  Shirt,
  Sparkles,
  Trees,
  Trophy,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import type { FC } from 'react'

const iconMap: Record<string, LucideIcon> = {
  waves: Waves,
  flame: Flame,
  coffee: Coffee,
  bath: Bath,
  shirt: Shirt,
  dumbbell: Dumbbell,
  trophy: Trophy,
  trees: Trees,
  sparkles: Sparkles,
  car: Car,
  shield: Shield,
  building2: Building2,
}

export const SERVICE_ICON_OPTIONS = [
  'Waves',
  'Flame',
  'Coffee',
  'Shirt',
  'Bath',
  'Dumbbell',
  'Trophy',
  'Trees',
  'Shield',
  'Sparkles',
  'Car',
  'Building2',
] as const

export type ServiceIconName = (typeof SERVICE_ICON_OPTIONS)[number]

interface ServiceIconProps {
  name?: string | null
  className?: string
}

const ServiceIcon: FC<ServiceIconProps> = ({ name, className = 'h-6 w-6' }) => {
  const Icon = iconMap[(name ?? '').trim().toLowerCase()] ?? Waves
  return <Icon className={className} aria-hidden="true" />
}

export default ServiceIcon
