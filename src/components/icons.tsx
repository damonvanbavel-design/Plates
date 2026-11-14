import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'calendar'
  | 'chart'
  | 'user'
  | 'plus'
  | 'check'
  | 'play'
  | 'chevronDown'
  | 'chevronUp'
  | 'chevronRight'
  | 'chevronLeft'
  | 'close'
  | 'more'
  | 'trash'
  | 'search'
  | 'trophy'
  | 'timer'
  | 'edit'
  | 'rank'
  | 'palette'
  | 'share'
  | 'dumbbell'
  | 'info'
  | 'star'
  | 'starFilled'
  | 'image'
  | 'pause'
  | 'globe';

interface Props {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color, strokeWidth = 2 }: Props) {
  const common = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const body = (() => {
    switch (name) {
      case 'home':
        return <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" {...common} />;
      case 'calendar':
        return (
          <>
            <Rect x={3} y={5} width={18} height={16} rx={2} {...common} />
            <Path d="M3 10h18M8 3v4M16 3v4" {...common} />
          </>
        );
      case 'chart':
        return <Path d="M3 17l6-6 4 4 8-8M15 7h6v6" {...common} />;
      case 'user':
        return (
          <>
            <Circle cx={12} cy={8} r={4} {...common} />
            <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...common} />
          </>
        );
      case 'plus':
        return <Path d="M12 5v14M5 12h14" {...common} />;
      case 'check':
        return <Path d="M5 12l5 5L20 7" {...common} />;
      case 'play':
        return <Path d="M8 5v14l11-7z" fill={color} stroke="none" />;
      case 'chevronDown':
        return <Path d="M6 9l6 6 6-6" {...common} />;
      case 'chevronUp':
        return <Path d="M6 15l6-6 6 6" {...common} />;
      case 'chevronRight':
        return <Path d="M9 6l6 6-6 6" {...common} />;
      case 'chevronLeft':
        return <Path d="M15 6l-6 6 6 6" {...common} />;
      case 'close':
        return <Path d="M6 6l12 12M18 6L6 18" {...common} />;
      case 'more':
        return (
          <>
            <Circle cx={5} cy={12} r={2} fill={color} />
            <Circle cx={12} cy={12} r={2} fill={color} />
            <Circle cx={19} cy={12} r={2} fill={color} />
          </>
        );
      case 'trash':
        return <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" {...common} />;
      case 'search':
        return (
          <>
            <Circle cx={11} cy={11} r={7} {...common} />
            <Path d="M20 20l-4-4" {...common} />
          </>
        );
      case 'trophy':
        return <Path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" {...common} />;
      case 'timer':
        return (
          <>
            <Circle cx={12} cy={13} r={8} {...common} />
            <Path d="M12 9v4l2.5 2.5M9 2h6" {...common} />
          </>
        );
      case 'edit':
        return <Path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" {...common} />;
      case 'rank':
        return <Path d="M12 2l9 5v10l-9 5-9-5V7z M8 14l4-5 4 5" {...common} />;
      case 'palette':
        return (
          <>
            <Path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.3-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" {...common} />
            <Circle cx={7.5} cy={11} r={1.2} fill={color} />
            <Circle cx={10} cy={7} r={1.2} fill={color} />
            <Circle cx={15} cy={7.5} r={1.2} fill={color} />
          </>
        );
      case 'share':
        return <Path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" {...common} />;
      case 'dumbbell':
        return <Path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" {...common} />;
      case 'info':
        return (
          <>
            <Circle cx={12} cy={12} r={9} {...common} />
            <Path d="M12 11v6M12 7.5v.5" {...common} />
          </>
        );
      case 'star':
        return <Path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" {...common} />;
      case 'starFilled':
        return (
          <Path
            d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
            fill={color}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      case 'image':
        return (
          <>
            <Rect x={3} y={4} width={18} height={16} rx={2} {...common} />
            <Circle cx={9} cy={10} r={1.6} {...common} />
            <Path d="M21 16l-5-5-9 9" {...common} />
          </>
        );
      case 'pause':
        return <Path d="M9 6v12M15 6v12" {...common} />;
      case 'globe':
        return (
          <>
            <Circle cx={12} cy={12} r={9} {...common} />
            <Path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" {...common} />
          </>
        );
    }
  })();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {body}
    </Svg>
  );
}
