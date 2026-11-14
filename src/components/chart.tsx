import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { useTheme } from './ui';

export function LineChart({
  points,
  format,
  height = 190,
}: {
  points: { at: number; value: number }[];
  format: (v: number) => string;
  height?: number;
}) {
  const t = useTheme();
  const [w, setW] = useState(320);
  if (points.length === 0) return null;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const vals = points.map((p) => p.value);
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  if (hi - lo < 1) {
    hi += 1;
    lo -= 1;
  }
  const span = hi - lo;
  lo -= span * 0.1;
  hi += span * 0.1;
  const X = (i: number) => (points.length === 1 ? (padL + w - padR) / 2 : padL + (i / (points.length - 1)) * (w - padL - padR));
  const Y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (height - padT - padB);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(p.value).toFixed(1)}`).join(' ');
  const area = `${d} L${X(points.length - 1)} ${height - padB} L${X(0)} ${height - padB} Z`;
  const ticks = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * (i + 0.5)) / 4);
  const dateLabel = (ts: number) => new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const last = points.length - 1;
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`Chart from ${format(points[0]!.value)} to ${format(points[last]!.value)}`}>
      <Svg width={w} height={height}>
        {ticks.map((v, i) => (
          <Line key={i} x1={padL} x2={w - padR} y1={Y(v)} y2={Y(v)} stroke={t.c.border} strokeWidth={1} />
        ))}
        {ticks.map((v, i) => (
          <SvgText key={'l' + i} x={padL - 6} y={Y(v) + 4} fontSize={10} fontFamily={t.fonts.regular} fill={t.c.muted} textAnchor="end">
            {Math.round(v)}
          </SvgText>
        ))}
        <Path d={area} fill={t.c.accent} opacity={0.1} />
        <Path d={d} stroke={t.c.accent} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={X(i)}
            cy={Y(p.value)}
            r={i === last ? 5.5 : 3.5}
            fill={i === last ? t.c.accent : t.c.surface}
            stroke={t.c.accent}
            strokeWidth={2}
          />
        ))}
        <SvgText
          x={X(0)}
          y={height - 6}
          fontSize={10}
          fontFamily={t.fonts.regular}
          fill={t.c.muted}
          textAnchor={points.length === 1 ? 'middle' : 'start'}>
          {dateLabel(points[0]!.at)}
        </SvgText>
        {points.length > 1 && (
          <SvgText x={X(last)} y={height - 6} fontSize={10} fontFamily={t.fonts.regular} fill={t.c.muted} textAnchor="end">
            {dateLabel(points[last]!.at)}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

/** Horizontal level bar for Rank */
export function LevelBar({
  thresholds,
  value,
  activeIndex,
  format,
}: {
  thresholds: number[];
  value: number;
  activeIndex: number;
  format?: (v: number) => string;
}) {
  const t = useTheme();
  const [w, setW] = useState(320);
  const max = Math.max(thresholds[thresholds.length - 1]! * 1.15, value * 1.05);
  const X = (v: number) => Math.min(w - 2, (v / max) * w);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={56}>
        <Path d={`M0 18h${X(thresholds[0]!) - 2}v10H0z`} fill={t.c.surface2} />
        {thresholds.map((th, i) => {
          const x0 = X(th);
          const x1 = i < thresholds.length - 1 ? X(thresholds[i + 1]!) : w;
          return <Path key={i} d={`M${x0} 18h${Math.max(0, x1 - x0 - 2)}v10H${x0}z`} fill={i === activeIndex ? t.c.accent : t.c.surface2} />;
        })}
        <Path d={`M${X(value) - 7} 2h14l-7 9z`} fill={t.c.text} />
        <Line x1={X(value)} x2={X(value)} y1={12} y2={32} stroke={t.c.text} strokeWidth={2} />
        {thresholds.map((th, i) => (
          <SvgText key={'t' + i} x={X(th)} y={46} fontSize={11} fontFamily={t.fonts.regular} fill={t.c.muted}>
            {format ? format(th) : th}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
