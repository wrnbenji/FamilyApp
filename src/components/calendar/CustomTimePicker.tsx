// src/components/calendar/CustomTimePicker.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

const CustomTimePicker = ({ label, value, onChange }: Props) => {
  if (Platform.OS !== 'web') {
    // Mobile → native time picker
    return (
      <TouchableOpacity
        style={styles.mobilePicker}
        onPress={async () => {
          const now = new Date();
          const [h, m] = value.split(':').map(Number);
          now.setHours(h || 0);
          now.setMinutes(m || 0);

          const { default: DateTimePicker } = await import('@react-native-community/datetimepicker');

          // Show picker
          const picker = (
            <DateTimePicker
              value={now}
              mode="time"
              onChange={(event, selected) => {
                if (selected) {
                  const hh = selected.getHours().toString().padStart(2, '0');
                  const mm = selected.getMinutes().toString().padStart(2, '0');
                  onChange(`${hh}:${mm}`);
                }
              }}
            />
          );
          // NOTE: expo automatically handles modal on mobile
        }}
      >
        <Text style={styles.mobilePickerText}>{label + ': ' + value}</Text>
      </TouchableOpacity>
    );
  }

  // Web → custom mini picker
  const updateTime = (diff: number) => {
    let [h, m] = value.split(':').map(Number);
    const total = h * 60 + m + diff;
    const newH = Math.floor((total + 1440) % 1440 / 60);
    const newM = ((total + 1440) % 1440) % 60;
    onChange(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
  };

  return (
    <View style={styles.webPicker}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => updateTime(-15)}>
          <Text style={styles.btnTxt}>-</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="hh:mm"
        />

        <TouchableOpacity style={styles.btn} onPress={() => updateTime(+15)}>
          <Text style={styles.btnTxt}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mobilePicker: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ECECEC',
    marginBottom: 8,
  },
  mobilePickerText: {
    fontSize: 16,
  },
  webPicker: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 6,
    borderRadius: 6,
    textAlign: 'center',
  },
});

export default CustomTimePicker;