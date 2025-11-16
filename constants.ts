
import { SleepSession, SleepPhaseType, SleepPhase } from './types';

function generateRandomSleepSession(date: Date): SleepSession {
    const totalSleepTime = 420 + Math.floor(Math.random() * 120); // 7-9 hours
    const phases: SleepPhase[] = [];
    let remainingTime = totalSleepTime;

    const phaseTypes = [SleepPhaseType.DEEP, SleepPhaseType.LIGHT, SleepPhaseType.REM, SleepPhaseType.AWAKE];
    while (remainingTime > 0) {
        const type = phaseTypes[Math.floor(Math.random() * phaseTypes.length)];
        let duration;
        if(type === SleepPhaseType.AWAKE) {
            duration = Math.min(remainingTime, 5 + Math.floor(Math.random() * 10));
        } else if (type === SleepPhaseType.DEEP) {
            duration = Math.min(remainingTime, 20 + Math.floor(Math.random() * 40));
        } else if (type === SleepPhaseType.REM) {
            duration = Math.min(remainingTime, 15 + Math.floor(Math.random() * 30));
        } else {
            duration = Math.min(remainingTime, 30 + Math.floor(Math.random() * 60));
        }
        phases.push({ type, duration });
        remainingTime -= duration;
    }

    const heartRate: { time: number; bpm: number }[] = [];
    for (let i = 0; i < totalSleepTime; i += 10) {
        heartRate.push({ time: i, bpm: 50 + Math.floor(Math.random() * 20) });
    }
    
    const dateStr = date.toISOString().split('T')[0];

    return {
        id: dateStr,
        date: dateStr,
        totalSleepTime,
        qualityScore: 60 + Math.floor(Math.random() * 40),
        timeToFallAsleep: 5 + Math.floor(Math.random() * 25),
        phases,
        heartRate,
    };
}

export const MOCK_SLEEP_DATA: SleepSession[] = Array.from({ length: 15 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i + 1));
    return generateRandomSleepSession(date);
});
