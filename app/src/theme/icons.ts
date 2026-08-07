import {
  Shield,
  Phone,
  Mail,
  Key,
  Users,
  Landmark,
  FileText,
  Lock,
  Cloud,
  Bell,
  TriangleAlert,
  Check,
  Clock,
  Home,
  ClipboardList,
  Play,
  LifeBuoy,
  User,
  Star,
  MessageCircle,
  CreditCard,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  Plus,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Chaves de glifo do protótipo (objeto `G` em
 * docs/design-handoff/src/Plano B Digital.dc.html) mapeadas pro equivalente
 * em lucide-react-native — o README pede "biblioteca de ícones do codebase
 * de destino", não os paths SVG originais.
 */
export const GLYPHS = {
  shield: Shield,
  phone: Phone,
  mail: Mail,
  key: Key,
  users: Users,
  bank: Landmark,
  doc: FileText,
  lock: Lock,
  cloud: Cloud,
  bell: Bell,
  alert: TriangleAlert,
  check: Check,
  clock: Clock,
  home: Home,
  plan: ClipboardList,
  play: Play,
  life: LifeBuoy,
  user: User,
  star: Star,
  chat: MessageCircle,
  card: CreditCard,
  globe: Globe,
  eye: Eye,
  eyeOff: EyeOff,
  down: ChevronDown,
  plus: Plus,
  trash: Trash2,
} satisfies Record<string, LucideIcon>;

export type GlyphKey = keyof typeof GLYPHS;
