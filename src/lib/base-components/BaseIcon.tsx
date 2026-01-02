import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  ArrowDown,
  Check,
  CheckCircle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CircleX,
  Cog,
  CornerUpLeft,
  Edit3,
  FileText,
  FolderPlus,
  FolderTree,
  Hourglass,
  Info,
  Plus,
  Search,
  Save,
  Table,
  Trash2,
  User,
  X,
} from 'lucide-react-native';
import { ThemeColors } from '../../lib/GlobalStyles';

export type IconName =
  | 'info'
  | 'arrow-down-long'
  | 'plus'
  | 'table-list'
  | 'cog'
  | 'folder-tree'
  | 'user'
  | 'folder-plus'
  | 'search'
  | 'chevron-down'
  | 'chevron-up'
  | 'x'
  | 'check'
  | 'check-circle'
  | 'circle-check'
  | 'xmark-circle'
  | 'hourglass-start'
  | 'hourglass-half'
  | 'hourglass-end'
  | 'trash'
  | 'keyboard-arrow-up'
  | 'keyboard-arrow-down'
  | 'close'
  | 'cancel'
  | 'save'
  | 'floppy-disk'
  | 'arrow-rotate-left'
  | 'calendar-day'
  | 'pencil'
  | 'file-pdf';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  strokeWidth?: number;
};

const iconMap: Record<IconName, React.ComponentType<any>> = {
  info: Info,
  'arrow-down-long': ArrowDown,
  plus: Plus,
  'table-list': Table,
  cog: Cog,
  'folder-tree': FolderTree,
  user: User,
  'folder-plus': FolderPlus,
  search: Search,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  x: X,
  check: Check,
  'check-circle': CheckCircle,
  'circle-check': CircleCheck,
  'xmark-circle': CircleX,
  'hourglass-start': Hourglass,
  'hourglass-half': Hourglass,
  'hourglass-end': Hourglass,
  trash: Trash2,
  'keyboard-arrow-up': ChevronUp,
  'keyboard-arrow-down': ChevronDown,
  close: X,
  cancel: X,
  save: Save,
  'floppy-disk': Save,
  'arrow-rotate-left': CornerUpLeft,
  'calendar-day': CalendarDays,
  pencil: Edit3,
  'file-pdf': FileText,
};

const BaseIcon = ({
  name,
  size = 20,
  color = ThemeColors.primary,
  strokeWidth = 2,
  style,
}: Props) => {
  const IconComponent = iconMap[name] || Info;
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} style={style} />;
};

export default BaseIcon;
