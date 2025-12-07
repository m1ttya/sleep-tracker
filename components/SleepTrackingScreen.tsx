import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type SleepPhaseType = 'FALLING_ASLEEP' | 'LIGHT' | 'DEEP' | 'REM';

interface SensorData {
    heartRate: number;
    hrv: number;
    spo2: number;
    temperature: number;
    movement: number;
}

interface SleepTrackingScreenProps {
    onWakeUp: () => void;
    isConnected: boolean;
}

const SLEEP_PHASES: { type: SleepPhaseType; label: string; color: string; duration: number }[] = [
    { type: 'FALLING_ASLEEP', label: 'Засыпание', color: '#a78bfa', duration: 8000 },
    { type: 'LIGHT', label: 'Лёгкий сон', color: '#60a5fa', duration: 12000 },
    { type: 'DEEP', label: 'Глубокий сон', color: '#3b82f6', duration: 15000 },
    { type: 'REM', label: 'REM', color: '#8b5cf6', duration: 10000 },
    { type: 'LIGHT', label: 'Лёгкий сон', color: '#60a5fa', duration: 10000 },
];

const HeartRateGraph: React.FC<{ data: number[] }> = ({ data }) => {
    const width = 280;
    const height = 60;
    const maxVal = Math.max(...data, 80);
    const minVal = Math.min(...data, 50);
    const range = maxVal - minVal || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - minVal) / range) * height * 0.8 - 5;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <defs>
                <linearGradient id="hrGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.68 0.16 277)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="oklch(0.68 0.16 277)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.polyline
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1. }}
                fill="none"
                stroke="oklch(0.68 0.16 277)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            <polygon
                fill="url(#hrGradient)"
                points={`0,${height} ${points} ${width},${height}`}
            />
        </svg>
    );
};

const SensorCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    unit: string;
    color: string;
    isActive?: boolean;
}> = ({ icon, label, value, unit, color, isActive = true }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card/80 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center relative overflow-hidden"
    >
        {isActive && (
            <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: `inset 0 0 20px ${color}30` }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        )}
        <div className="text-lg mb-1" style={{ color }}>{icon}</div>
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <motion.div
            key={value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold"
            style={{ color }}
        >
            {value}
            <span className="text-xs font-normal ml-1 text-muted-foreground">{unit}</span>
        </motion.div>
    </motion.div>
);

const BluetoothPulse: React.FC<{ isTransmitting: boolean }> = ({ isTransmitting }) => (
    <div className="relative">
        <motion.div
            animate={isTransmitting ? {
                scale: [1, 1.5, 1],
                opacity: [1, 0.3, 1],
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-primary/30 rounded-full blur-md"
        />
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative text-primary"
        >
            <path d="m7 7 10 10-5 5V2l5 5L7 17" />
        </svg>
    </div>
);

const MovementBar: React.FC<{ level: number }> = ({ level }) => {
    const bars = 8;
    return (
        <div className="flex gap-1 items-end h-6">
            {Array.from({ length: bars }).map((_, i) => {
                const isActive = i < Math.ceil((level / 100) * bars);
                const height = 8 + (i * 2);
                return (
                    <motion.div
                        key={i}
                        animate={{
                            backgroundColor: isActive ? 'oklch(0.68 0.16 277)' : 'oklch(0.4 0.02 260)',
                            scaleY: isActive ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="w-2 rounded-full"
                        style={{ height }}
                    />
                );
            })}
        </div>
    );
};

const AnimatedBracelet: React.FC<{ phase: SleepPhaseType; isActive: boolean }> = ({ phase, isActive }) => {
    const phaseColors: Record<SleepPhaseType, string> = {
        FALLING_ASLEEP: '#a78bfa',
        LIGHT: '#60a5fa',
        DEEP: '#3b82f6',
        REM: '#8b5cf6',
    };

    return (
        <div className="relative w-40 h-40">
            {/* Smooth breathing gradient glow */}
            <motion.div
                className="absolute -inset-8 rounded-full"
                style={{
                    background: `radial-gradient(circle, ${phaseColors[phase]}40 0%, ${phaseColors[phase]}20 30%, ${phaseColors[phase]}08 60%, transparent 80%)`,
                }}
                animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.85, 1.15, 0.85]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Inner glow layer for smoother effect */}
            <motion.div
                className="absolute -inset-4 rounded-full blur-xl"
                style={{ backgroundColor: phaseColors[phase] }}
                animate={{ opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Bracelet SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
                {/* Band */}
                <ellipse
                    cx="50"
                    cy="50"
                    rx="35"
                    ry="35"
                    fill="none"
                    stroke="oklch(0.35 0.02 260)"
                    strokeWidth="12"
                />
                {/* Screen */}
                <rect x="35" y="38" width="30" height="24" rx="4" fill="oklch(0.2 0.01 260)" />

                {/* Pulsing sensor indicators */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="4"
                    fill={phaseColors[phase]}
                    animate={isActive ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Heart rate indicator on screen */}
                <motion.path
                    d="M40 50 L43 50 L45 46 L48 54 L51 48 L53 52 L55 50 L60 50"
                    fill="none"
                    stroke={phaseColors[phase]}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    animate={{ pathLength: [0, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            </svg>

            {/* Sensor activity dots */}
            {isActive && (
                <>
                    <motion.div
                        className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: phaseColors[phase] }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: phaseColors[phase] }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: phaseColors[phase] }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                    <motion.div
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: phaseColors[phase] }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    />
                </>
            )}
        </div>
    );
};

const DataTransferIndicator: React.FC<{ isTransmitting: boolean }> = ({ isTransmitting }) => (
    <div className="flex items-center gap-2">
        <BluetoothPulse isTransmitting={isTransmitting} />
        <div className="flex gap-1 mr-2">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={isTransmitting ? {
                        x: [0, 6, 0],
                        opacity: [0.3, 1, 0.3],
                    } : { opacity: 0.3 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
        <span className="text-xs text-muted-foreground">
            {isTransmitting ? 'Передача данных...' : 'Ожидание...'}
        </span>
    </div>
);

const SleepTrackingScreen: React.FC<SleepTrackingScreenProps> = ({ onWakeUp, isConnected }) => {
    const [sensorData, setSensorData] = useState<SensorData>({
        heartRate: 72,
        hrv: 45,
        spo2: 98,
        temperature: 36.4,
        movement: 15,
    });
    const [heartRateHistory, setHeartRateHistory] = useState<number[]>([72]);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTransmitting, setIsTransmitting] = useState(true);

    const currentPhase = SLEEP_PHASES[currentPhaseIndex];

    // Simulate sensor data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSensorData(prev => {
                const phase = SLEEP_PHASES[currentPhaseIndex];
                let baseHR = 65;
                let hrVariation = 5;
                let movementBase = 10;

                switch (phase.type) {
                    case 'FALLING_ASLEEP':
                        baseHR = 70;
                        hrVariation = 8;
                        movementBase = 25;
                        break;
                    case 'LIGHT':
                        baseHR = 62;
                        hrVariation = 5;
                        movementBase = 15;
                        break;
                    case 'DEEP':
                        baseHR = 55;
                        hrVariation = 3;
                        movementBase = 5;
                        break;
                    case 'REM':
                        baseHR = 68;
                        hrVariation = 10;
                        movementBase = 8;
                        break;
                }

                const newHR = Math.round(baseHR + (Math.random() - 0.5) * hrVariation * 2);
                return {
                    heartRate: newHR,
                    hrv: Math.round(35 + Math.random() * 25),
                    spo2: Math.round(96 + Math.random() * 3),
                    temperature: +(36.2 + Math.random() * 0.4).toFixed(1),
                    movement: Math.round(movementBase + Math.random() * 20),
                };
            });
        }, 1500);

        return () => clearInterval(interval);
    }, [currentPhaseIndex]);

    // Update heart rate history
    useEffect(() => {
        setHeartRateHistory(prev => {
            const newHistory = [...prev, sensorData.heartRate];
            if (newHistory.length > 30) newHistory.shift();
            return newHistory;
        });
    }, [sensorData.heartRate]);

    // Progress through sleep phases
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (currentPhaseIndex < SLEEP_PHASES.length - 1) {
                setCurrentPhaseIndex(prev => prev + 1);
            } else {
                setCurrentPhaseIndex(0);
            }
        }, SLEEP_PHASES[currentPhaseIndex].duration);

        return () => clearTimeout(timeout);
    }, [currentPhaseIndex]);

    // Track elapsed time
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Simulate data transmission pulses
    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransmitting(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}ч ${m}м`;
        return `${m}м ${s}с`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center p-4">
                <div>
                    <p className="text-xs text-muted-foreground">Время сна</p>
                    <p className="text-2xl font-bold text-foreground">{formatTime(elapsedTime)}</p>
                </div>
                <DataTransferIndicator isTransmitting={isTransmitting} />
            </div>

            {/* Current phase indicator */}
            <div className="px-4 mb-4">
                <motion.div
                    key={currentPhase.type}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-2xl p-3"
                >
                    <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentPhase.color }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div>
                        <p className="text-xs text-muted-foreground">Текущая фаза</p>
                        <p className="font-bold" style={{ color: currentPhase.color }}>
                            {currentPhase.label}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Animated bracelet */}
            <div className="flex justify-center my-4">
                <AnimatedBracelet phase={currentPhase.type} isActive={isConnected} />
            </div>

            {/* Heart rate graph */}
            <div className="px-6 mb-4">
                <p className="text-xs text-muted-foreground mb-2">💓 Пульс (последние измерения)</p>
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-3">
                    <HeartRateGraph data={heartRateHistory} />
                </div>
            </div>

            {/* Sensor data grid */}
            <div className="px-4 grid grid-cols-3 gap-2 mb-4">
                <SensorCard
                    icon="💓"
                    label="Пульс"
                    value={sensorData.heartRate}
                    unit="bpm"
                    color={currentPhase.color}
                />
                <SensorCard
                    icon="📊"
                    label="HRV"
                    value={sensorData.hrv}
                    unit="мс"
                    color="#60a5fa"
                />
                <SensorCard
                    icon="🫀"
                    label="SpO2"
                    value={sensorData.spo2}
                    unit="%"
                    color="#22c55e"
                />
            </div>

            <div className="px-4 grid grid-cols-2 gap-2 mb-6">
                <SensorCard
                    icon="🌡️"
                    label="Температура"
                    value={sensorData.temperature}
                    unit="°C"
                    color="#f59e0b"
                />
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center">
                    <div className="text-lg mb-1">📈</div>
                    <div className="text-xs text-muted-foreground mb-2">Движение</div>
                    <MovementBar level={sensorData.movement} />
                </div>
            </div>

            {/* Wake up button */}
            <div className="mt-auto p-4 pb-8">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onWakeUp}
                    className="w-full bg-card hover:bg-border text-foreground py-4 rounded-2xl font-bold text-lg transition-colors shadow-app flex items-center justify-center gap-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                    Проснуться
                </motion.button>
            </div>
        </motion.div>
    );
};

export default SleepTrackingScreen;
