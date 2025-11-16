
export type Screen = 'HOME' | 'STATS' | 'PROFILE' | 'SETTINGS' | 'LEARN';
export type Page = Screen | 'ONBOARDING' | 'ALARM_SETUP' | 'STATS_DETAIL';

export enum SleepPhaseType {
  AWAKE = 'AWAKE',
  REM = 'REM',
  LIGHT = 'LIGHT',
  DEEP = 'DEEP',
}

export interface SleepPhase {
  type: SleepPhaseType;
  duration: number; // in minutes
}

export interface SleepSession {
  id: string;
  date: string; // ISO string for keying
  totalSleepTime: number; // in minutes
  qualityScore: number; // 0-100
  timeToFallAsleep: number; // in minutes
  phases: SleepPhase[];
  heartRate: { time: number; bpm: number }[];
}

export interface Alarm {
    time: string; // "HH:mm"
    window: number; // in minutes, e.g., 30
    sound: string;
    vibratePhone: boolean;
    vibrateBracelet: boolean;
}
