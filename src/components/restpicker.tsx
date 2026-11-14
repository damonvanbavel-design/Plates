import { useState } from 'react';
import { View } from 'react-native';

import { fmtSeconds } from '@/lib/calc';

import { Sheet, SheetOption } from './sheet';
import { Button, Field, Row } from './ui';

export const REST_CHOICES = [0, 30, 45, 60, 90, 120, 150, 180, 240, 300];

export const restLabel = (sec: number | undefined, fallback: number) => {
  const v = sec === undefined ? fallback : sec;
  return v === 0 ? 'Rest off' : `Rest ${fmtSeconds(v)}`;
};

/** Pick a rest time: default, off, presets or a custom number of seconds. */
export function RestPicker({
  visible,
  onClose,
  value,
  fallback,
  onChange,
  title = 'Rest after each set',
}: {
  visible: boolean;
  onClose: () => void;
  value: number | undefined;
  fallback: number;
  onChange: (v: number | undefined) => void;
  title?: string;
}) {
  const [custom, setCustom] = useState('');
  const pick = (v: number | undefined) => {
    onChange(v);
    onClose();
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <SheetOption
        label={`Default (${fmtSeconds(fallback)})`}
        detail="Set in Profile"
        selected={value === undefined}
        onPress={() => pick(undefined)}
      />
      {REST_CHOICES.map((c) => (
        <SheetOption key={c} label={c === 0 ? 'Off – no timer' : fmtSeconds(c)} selected={value === c} onPress={() => pick(c)} />
      ))}
      <View style={{ marginTop: 10 }}>
        <Row gap={10}>
          <View style={{ flex: 1 }}>
            <Field label="Custom (seconds)" value={custom} onChangeText={setCustom} keyboardType="number-pad" placeholder="e.g. 200" />
          </View>
          <Button
            label="Set"
            small
            style={{ marginTop: 26, paddingHorizontal: 22 }}
            disabled={!(parseInt(custom, 10) >= 0 && parseInt(custom, 10) <= 1800)}
            onPress={() => pick(parseInt(custom, 10))}
          />
        </Row>
      </View>
    </Sheet>
  );
}
