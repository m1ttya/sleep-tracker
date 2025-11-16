

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion';
import { Screen, Page, SleepSession, Alarm, SleepPhaseType } from './types';
import { MOCK_SLEEP_DATA } from './constants';
import { HomeIcon, MoonIcon, SunIcon, BatteryIcon, BluetoothIcon, ChevronLeftIcon, ChevronRightIcon, AlarmClockIcon, StatsIcon, SettingsIcon, ProfileIcon, LearnIcon } from './components/Icons';
import SleepChart from './components/SleepChart';

const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
};

const formatHHMM = (d: Date): string => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full flex flex-col items-center p-8 text-center bg-card"
    >
        <div className="flex-grow flex flex-col items-center justify-center">
            <MoonIcon className="w-24 h-24 text-primary mb-8" />
            <h1 className="text-3xl font-bold text-card-foreground mb-4">Просыпайтесь отдохнувшим</h1>
             <button onClick={onComplete} className="bg-primary text-primary-foreground py-4 px-12 rounded-app font-bold text-xl hover:opacity-90 transition-opacity mt-8 shadow-app-md">
                Начать
            </button>
        </div>
        
        <div className="w-full">
            <div className="bg-background p-4 rounded-app mb-6">
                <p className="text-muted-foreground">Наш умный будильник разбудит вас в самой легкой фазе сна, чтобы вы чувствовали себя бодрым</p>
            </div>
        </div>
    </motion.div>
);

const HomeScreen: React.FC<{ 
    setPage: (page: Page) => void, 
    alarm: Alarm | null, 
    setSelectedSessionId: (id: string) => void, 
    setIsSleeping: (isSleeping: boolean) => void,
    showNotification: (message: string) => void,
    isConnected: boolean,
    batteryLevel: number,
    username: string,
}> = ({ setPage, alarm, setSelectedSessionId, setIsSleeping, showNotification, isConnected, batteryLevel, username }) => {
    const lastNight = MOCK_SLEEP_DATA[0];

    const getAlarmWindow = (alarm: Alarm) => {
        const [h, m] = alarm.time.split(':').map(Number);
        const centerDate = new Date();
        centerDate.setHours(h, m, 0, 0);
        
        const startDate = new Date(centerDate.getTime() - (alarm.window / 2) * 60000);
        const endDate = new Date(centerDate.getTime() + (alarm.window / 2) * 60000);
        
        return `${formatHHMM(startDate)} - ${formatHHMM(endDate)}`;
    };

    const handleLastNightClick = () => {
        setSelectedSessionId(lastNight.id);
        setPage('STATS_DETAIL');
    };

    const handleStartSleep = () => {
        if (alarm) {
            setIsSleeping(true);
        } else {
            showNotification('Пожалуйста, сначала установите будильник');
        }
    };

    return (
        <div className="p-6 pb-28 flex-grow flex flex-col">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-muted-foreground">С возвращением,</p>
                    <h1 className="text-2xl font-bold text-foreground">{username}</h1>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                    {isConnected && <BluetoothIcon className="w-6 h-6 text-primary" />}
                    <div className="flex items-center gap-1">
                        <BatteryIcon className="w-6 h-6" />
                        <span>{batteryLevel}%</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPage('ALARM_SETUP')}
                    className="w-64 h-64 bg-primary text-primary-foreground rounded-full shadow-app-md flex flex-col items-center justify-center text-center transition-all duration-300"
                >
                    {alarm ? (
                        <>
                            <p className="opacity-90 text-lg font-medium">Установлен на</p>
                            <p className="text-5xl font-bold my-1">{alarm.time}</p>
                            <p className="bg-black/20 px-4 py-1.5 rounded-full text-sm mt-1 font-bold">
                                {`с ${getAlarmWindow(alarm).split(' - ')[0]} до ${getAlarmWindow(alarm).split(' - ')[1]}`}
                            </p>
                        </>
                    ) : (
                         <>
                            <AlarmClockIcon className="w-32 h-32" />
                        </>
                    )}
                </motion.button>
            </main>

            <div className="mt-8">
                <p className="text-muted-foreground font-bold mb-2 text-center">Статистика последнего сна</p>
                <button 
                    onClick={handleLastNightClick}
                    className="w-full text-left bg-card p-4 rounded-app shadow-app hover:bg-border transition-colors flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-full"><MoonIcon className="w-6 h-6 text-primary" /></div>
                        <div>
                            <p className="font-bold text-foreground text-lg">{formatTime(lastNight.totalSleepTime)}</p>
                            <p className="text-xs text-muted-foreground">{lastNight.qualityScore}% Качество</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-6 h-6 text-muted-foreground" />
                </button>
            </div>

            <button 
                onClick={handleStartSleep}
                className="w-full bg-primary text-primary-foreground py-4 mt-6 rounded-app font-bold text-lg hover:opacity-90 transition-opacity shadow-app">
                Начать сон
            </button>
        </div>
    );
};

const WheelItem: React.FC<{
    num: number;
    i: number;
    itemHeight: number;
    dragY: any;
    containerHeight: number;
}> = ({ num, i, itemHeight, dragY, containerHeight }) => {
    const itemTopInList = i * itemHeight;
    
    const opacity = useTransform(dragY, latestY => {
        const itemTopInContainer = latestY + itemTopInList;
        const itemCenterInContainer = itemTopInContainer + itemHeight / 2;
        const distanceFromCenter = Math.abs(containerHeight / 2 - itemCenterInContainer);
        const opacity = Math.max(0, 1 - (distanceFromCenter / (containerHeight / 1.5)));
        return opacity * opacity;
    });

    const scale = useTransform(opacity, [0, 1], [0.7, 1]);

    return (
        <motion.div className="flex items-center justify-center" style={{ height: itemHeight, y: itemTopInList, position: 'absolute', width: '100%' }}>
            <motion.span style={{ opacity, scale }} className="text-6xl font-bold">
                {num.toString().padStart(2, '0')}
            </motion.span>
        </motion.div>
    );
};

const TimeWheelPicker: React.FC<{
    value: number;
    setValue: (value: number) => void;
    range: number[];
    itemHeight: number;
}> = ({ value, setValue, range, itemHeight }) => {
    const containerHeight = 192;
    const centeringOffset = (containerHeight - itemHeight) / 2;

    const extendedRange = useMemo(() => [...range, ...range, ...range], [range]);
    
    const initialIndex = value + range.length;
    const dragY = useMotionValue(-initialIndex * itemHeight + centeringOffset);

    const calculateVisibleRange = (y: number) => {
        const top = -y + centeringOffset;
        const firstVisible = Math.floor(top / itemHeight) - 5;
        const lastVisible = firstVisible + 15;
        return {
            start: Math.max(0, firstVisible),
            end: Math.min(extendedRange.length - 1, lastVisible)
        };
    };

    const [visibleRange, setVisibleRange] = useState(() => calculateVisibleRange(dragY.get()));

    useMotionValueEvent(dragY, "change", (latest) => {
        setVisibleRange(calculateVisibleRange(latest));
    });

    const handleDragEnd = (event, info) => {
        const projectedY = dragY.get() + info.velocity.y * 0.3;
        let newIndex = Math.round(-(projectedY - centeringOffset) / itemHeight);
        
        newIndex = Math.max(0, Math.min(extendedRange.length - 1, newIndex));
        
        setValue(extendedRange[newIndex]);

        animate(dragY, -newIndex * itemHeight + centeringOffset, {
            type: "spring",
            stiffness: 400,
            damping: 40,
            onComplete: () => {
                const finalIndex = newIndex % range.length;
                const newY = -(finalIndex + range.length) * itemHeight + centeringOffset;
                dragY.set(newY);
            }
        });
    };

    return (
        <div style={{ height: containerHeight }} className="relative w-24 overflow-hidden">
            <motion.div
                drag="y"
                style={{ y: dragY, height: extendedRange.length * itemHeight }}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing relative"
            >
                {extendedRange.slice(visibleRange.start, visibleRange.end).map((num, index) => {
                    const i = visibleRange.start + index;
                    return (
                        <WheelItem 
                            key={i} 
                            num={num} 
                            i={i} 
                            itemHeight={itemHeight} 
                            dragY={dragY} 
                            containerHeight={containerHeight} 
                        />
                    )
                })}
            </motion.div>
        </div>
    );
};

const AlarmSetupScreen: React.FC<{ onSave: (alarm: Alarm) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [h, m] = '07:00'.split(':').map(Number);
    const [hour, setHour] = useState(h);
    const [minute, setMinute] = useState(m);

    const handleSave = () => {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        onSave({
            time,
            window: 30,
            sound: 'default',
            vibratePhone: true,
            vibrateBracelet: true,
        });
    };
    
    const endDate = new Date();
    endDate.setHours(hour, minute, 0, 0);
    const startDate = new Date(endDate.getTime() - 30 * 60000);

    const hoursRange = Array.from({ length: 24 }, (_, i) => i);
    const minutesRange = Array.from({ length: 60 }, (_, i) => i);

    return (
        <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 bg-background p-6 flex flex-col"
        >
            <h1 className="text-2xl font-bold text-center mb-8 text-foreground">Когда вас разбудить?</h1>
            <div className="flex-grow flex items-center justify-center text-7xl font-bold text-center w-full focus:ring-0 text-foreground">
                <div className="flex items-center justify-center text-center gap-2">
                    <TimeWheelPicker value={hour} setValue={setHour} range={hoursRange} itemHeight={64} />
                    <div className="h-48 flex items-center justify-center">
                        <span className="text-6xl font-bold">:</span>
                    </div>
                    <TimeWheelPicker value={minute} setValue={setMinute} range={minutesRange} itemHeight={64} />
                </div>
            </div>
            <div className="bg-card p-4 rounded-app mb-6">
                <p className="text-center text-card-foreground">
                    Разбудим вас в легкой фазе сна между <span className="font-bold text-primary">{formatHHMM(startDate)}</span> и <span className="font-bold text-primary">{formatHHMM(endDate)}</span>
                </p>
            </div>
             <button onClick={handleSave} className="w-full bg-primary text-primary-foreground py-4 rounded-app font-bold text-lg mb-4 shadow-app">
                Установить
            </button>
            <button onClick={onCancel} className="w-full text-center text-muted-foreground py-2">
                Отмена
            </button>
        </motion.div>
    );
};

const StatsDetailScreen: React.FC<{ session: SleepSession, onBack: () => void }> = ({ session, onBack }) => {
    const phaseDurations = session.phases.reduce((acc, phase) => {
        acc[phase.type] = (acc[phase.type] || 0) + phase.duration;
        return acc;
    }, {} as Record<SleepPhaseType, number>);

    const dateString = new Date(session.date).toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' });
    const capitalizedDateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            className="absolute inset-0 bg-background p-6 flex flex-col"
        >
            <header className="flex items-center justify-center mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold text-center text-foreground">
                    {capitalizedDateString}
                </h1>
            </header>

            <div className="flex-grow overflow-y-auto space-y-6">
                <div className="bg-card p-4 rounded-app shadow-app">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-muted-foreground text-sm">Общее время сна</p>
                            <p className="text-2xl font-bold text-foreground">{formatTime(session.totalSleepTime)}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground text-sm">Качество</p>
                            <p className="text-2xl font-bold text-foreground">{session.qualityScore}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-app shadow-app">
                    <h2 className="font-bold mb-2 text-foreground">Фазы сна</h2>
                    <SleepChart phases={session.phases} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-foreground">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-chart-1"></div><div>Глубокий: {formatTime(phaseDurations.DEEP || 0)}</div></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-chart-2"></div><div>Легкий: {formatTime(phaseDurations.LIGHT || 0)}</div></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-chart-4"></div><div>REM: {formatTime(phaseDurations.REM || 0)}</div></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-chart-5"></div><div>Бодр-е: {formatTime(phaseDurations.AWAKE || 0)}</div></div>
                    </div>
                </div>
            </div>
            
            <div className="pt-4 flex-shrink-0">
                <button onClick={onBack} className="w-full bg-card hover:bg-border transition-colors text-foreground py-3 rounded-app font-bold text-lg flex items-center justify-center gap-2 shadow-app">
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>Назад</span>
                </button>
            </div>
        </motion.div>
    );
};

const HistoryScreen: React.FC<{ setPage: (page: Page) => void, setSelectedSessionId: (id: string) => void }> = ({ setPage, setSelectedSessionId }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // Sun=0, Mon=1
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon=0..Sun=6
    
    const calendarDays = Array.from({ length: adjustedFirstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    
    const sleepDataByDate = useMemo(() => MOCK_SLEEP_DATA.reduce((acc, session) => {
        acc[session.date] = session;
        return acc;
    }, {} as Record<string, SleepSession>), []);

    const handleDayClick = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        if(sleepDataByDate[dateStr]) {
            setSelectedSessionId(dateStr);
            setPage('STATS_DETAIL');
        }
    };
    
    const monthYearString = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    const capitalizedMonthYear = monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1);

    return (
        <div className="p-6 flex-grow flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="text-muted-foreground"><ChevronLeftIcon className="w-6 h-6"/></button>
                <h1 className="text-2xl font-bold text-center text-foreground">
                    {capitalizedMonthYear}
                </h1>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="text-muted-foreground"><ChevronRightIcon className="w-6 h-6"/></button>
            </header>
            <div className="grid grid-cols-7 gap-2 text-center text-sm text-muted-foreground mb-4">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                    const dateStr = day ? `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : '';
                    const hasData = day && sleepDataByDate[dateStr];
                    return (
                        <div key={index} className="flex justify-center items-start">
                            {day && (
                                <button 
                                    onClick={() => handleDayClick(day)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${hasData ? 'bg-primary/20 text-primary' : 'text-foreground'} ${new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() ? 'ring-2 ring-primary' : ''}`}
                                >
                                    {day}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => {
    return (
        <div
            onClick={() => setEnabled(!enabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${enabled ? 'bg-primary justify-end' : 'bg-border justify-start'}`}
        >
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                className="w-6 h-6 bg-white rounded-full shadow-md"
            />
        </div>
    );
};

const SegmentedControl: React.FC<{ options: string[]; selected: string; setSelected: (selected: string) => void; layoutId: string; }> = ({ options, selected, setSelected, layoutId }) => {
    return (
        <div className="flex w-full bg-border p-1 rounded-lg">
            {options.map(option => (
                <div key={option} className="relative flex-1">
                    {selected === option && (
                        <motion.div
                            layoutId={layoutId}
                            className="absolute inset-0 bg-card rounded-md shadow-sm"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                    <button
                        onClick={() => setSelected(option)}
                        className="relative w-full h-full py-1.5 text-sm font-bold text-center transition-colors"
                    >
                        <span className={selected === option ? 'text-foreground' : 'text-muted-foreground'}>{option}</span>
                    </button>
                </div>
            ))}
        </div>
    );
};

const AnimatedBraceletIcon: React.FC<{className?: string}> = ({ className }) => {
    return (
        <div className={`w-32 h-32 ${className}`} style={{ perspective: '400px' }}>
            <svg viewBox="0 0 64 64" className="w-full h-full">
                <g className="spin-bracelet" style={{ transformOrigin: '50% 50%' }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M34 32.5L33.9997 33.55L33.9989 33.9849L33.9976 34.3185L33.9958 34.5997L33.9934 34.8474L33.9905 35.0712L33.9871 35.2769L33.9832 35.4683L33.9787 35.6479L33.9737 35.8176L33.9682 35.9789L33.9622 36.1329L33.9556 36.2805L33.9485 36.4223L33.9409 36.559L33.9327 36.691L33.924 36.8188L33.9148 36.9427L33.9051 37.0631L33.8948 37.1801L33.884 37.294L33.8727 37.4051L33.8608 37.5134L33.8484 37.6192L33.8355 37.7227L33.822 37.8238L33.808 37.9228L33.7935 38.0198L33.7784 38.1148L33.7628 38.208L33.7467 38.2994L33.73 38.3891L33.7128 38.4771L33.695 38.5636L33.6767 38.6485L33.6579 38.732L33.6385 38.8141L33.6186 38.8948L33.5981 38.9742L33.5771 39.0524L33.5555 39.1292L33.5333 39.2049L33.5107 39.2794L33.4874 39.3527L33.4636 39.4249L33.4393 39.4961L33.4144 39.5662L33.3889 39.6352L33.3629 39.7032L33.3363 39.7703L33.3092 39.8363L33.2815 39.9014L33.2532 39.9656L33.2243 40.0288L33.1949 40.0912L33.1649 40.1527L33.1343 40.2133L33.1031 40.273L33.0714 40.3319L33.039 40.39L33.0061 40.4472L32.9726 40.5037L32.9385 40.5594L32.9038 40.6142L32.8685 40.6683L32.8326 40.7217L32.796 40.7743L32.7589 40.8261L32.7212 40.8772L32.6828 40.9276L32.6438 40.9773L32.6042 41.0263L32.564 41.0745L32.5231 41.1221L32.4816 41.1689L32.4394 41.2151L32.3966 41.2606L32.3531 41.3055L32.309 41.3497L32.2642 41.3932L32.2188 41.436L32.1727 41.4782L32.1258 41.5198L32.0783 41.5607L32.0301 41.601L31.9812 41.6407L31.9316 41.6797L31.8813 41.7181L31.8302 41.7559L31.7784 41.7931L31.7259 41.8297L31.6726 41.8656L31.6186 41.901L31.5638 41.9357L31.5082 41.9699L31.4518 42.0035L31.3946 42.0364L31.3366 42.0688L31.2777 42.1006L31.2181 42.1318L31.1575 42.1625L31.0961 42.1925L31.0338 42.222L30.9707 42.2509L30.9066 42.2792L30.8415 42.307L30.7756 42.3342L30.7086 42.3608L30.6407 42.3869L30.5717 42.4124L30.5017 42.4373L30.4307 42.4617L30.3585 42.4856L30.2853 42.5088L30.2109 42.5316L30.1353 42.5537L30.0585 42.5754L29.9805 42.5964L29.9012 42.617L29.8206 42.6369L29.7386 42.6564L29.6552 42.6753L29.5704 42.6936L29.484 42.7114L29.3961 42.7287L29.3066 42.7454L29.2153 42.7616L29.1223 42.7772L29.0274 42.7923L28.9306 42.8069L28.8318 42.8209L28.7308 42.8345L28.6276 42.8474L28.522 42.8599L28.4138 42.8718L28.303 42.8831L28.1893 42.894L28.0725 42.9043L27.9525 42.9141L27.8288 42.9233L27.7014 42.9321L27.5697 42.9403L27.4334 42.9479L27.292 42.9551L27.1449 42.9617L26.9915 42.9678L26.8308 42.9733L26.6617 42.9784L26.483 42.9829L26.2926 42.9868L26.0882 42.9903L25.866 42.9932L25.6205 42.9956L25.3425 42.9975L25.0141 42.9989L24.591 42.9997L23.7963 43L22.4927 42.9998L22.045 42.999L21.7058 42.9978L21.4213 42.996L21.1714 42.9936L20.9459 42.9908L20.7389 42.9874L20.5465 42.9835L20.366 42.9791L20.1956 42.9742L20.0336 42.9687L19.8791 42.9627L19.731 42.9561L19.5888 42.9491L19.4517 42.9415L19.3193 42.9334L19.1912 42.9248L19.067 42.9156L18.9464 42.9059L18.8291 42.8957L18.7149 42.8849L18.6037 42.8736L18.4951 42.8618L18.3891 42.8494L18.2855 42.8366L18.1841 42.8231L18.085 42.8092L17.9878 42.7947L17.8927 42.7797L17.7994 42.7641L17.7078 42.748L17.618 42.7314L17.5298 42.7142L17.4432 42.6965L17.3582 42.6782L17.2746 42.6594L17.1924 42.6401L17.1115 42.6202L17.032 42.5997L16.9538 42.5787L16.8768 42.5572L16.8011 42.5351L16.7265 42.5125L16.6531 42.4893L16.5808 42.4656L16.5095 42.4413L16.4394 42.4164L16.3702 42.391L16.3021 42.365L16.235 42.3385L16.1689 42.3114L16.1037 42.2837L16.0395 42.2555L15.9762 42.2266L15.9137 42.1973L15.8522 42.1673L15.7915 42.1367L15.7317 42.1056L15.6727 42.0739L15.6146 42.0416L15.5573 42.0088L15.5008 41.9753L15.445 41.9412L15.3901 41.9066L15.3359 41.8713L15.2825 41.8354L15.2299 41.799L15.178 41.7619L15.1268 41.7242L15.0763 41.6859L15.0266 41.6469L14.9776 41.6074L14.9293 41.5672L14.8817 41.5264L14.8348 41.4849L14.7885 41.4428L14.7429 41.4L14.6981 41.3566L14.6538 41.3126L14.6103 41.2678L14.5674 41.2224L14.5251 41.1763L14.4835 41.1296L14.4425 41.0821L14.4022 41.034L14.3624 40.9851L14.3234 40.9356L14.2849 40.8853L14.2471 40.8343L14.2098 40.7826L14.1732 40.7301L14.1372 40.6769L14.1018 40.6229L14.067 40.5681L14.0328 40.5126L13.9992 40.4563L13.9662 40.3992L13.9337 40.3412L13.9019 40.2824L13.8706 40.2228L13.8399 40.1624L13.8098 40.101L13.7803 40.0388L13.7514 39.9757L13.723 39.9117L13.6952 39.8467L13.6679 39.7808L13.6413 39.714L13.6152 39.6461L13.5896 39.5772L13.5646 39.5073L13.5402 39.4364L13.5163 39.3643L13.493 39.2911L13.4702 39.2168L13.448 39.1414L13.4263 39.0647L13.4052 38.9868L13.3847 38.9076L13.3646 38.8271L13.3452 38.7452L13.3262 38.6619L13.3078 38.5772L13.29 38.491L13.2727 38.4032L13.2559 38.3138L13.2397 38.2227L13.224 38.1298L13.2088 38.0351L13.1942 37.9384L13.1801 37.8397L13.1666 37.7389L13.1536 37.6359L13.1411 37.5304L13.1292 37.4225L13.1177 37.3119L13.1069 37.1984L13.0965 37.0819L13.0867 36.9621L13.0774 36.8388L13.0686 36.7117L13.0604 36.5803L13.0527 36.4444L13.0455 36.3034L13.0388 36.1568L13.0327 36.0039L13.0271 35.8438L13.022 35.6755L13.0175 35.4976L13.0135 35.3083L13.01 35.105L13.007 34.8844L13.0045 34.6411L13.0026 34.3661L13.0012 34.0429L13.0003 33.6305L13 32.919L13.0002 31.5372L13.0009 31.0755L13.0021 30.7304L13.0039 30.4425L13.0061 30.1903L13.0089 29.9631L13.0123 29.7548L13.0161 29.5614L13.0205 29.38L13.0254 29.2088L13.0309 29.0462L13.0368 28.8911L13.0433 28.7426L13.0503 28.5999L13.0579 28.4624L13.0659 28.3297L13.0745 28.2012L13.0837 28.0767L13.0933 27.9558L13.1035 27.8383L13.1142 27.7239L13.1255 27.6124L13.1372 27.5036L13.1496 27.3974L13.1624 27.2936L13.1758 27.1921L13.1897 27.0928L13.2041 26.9955L13.2191 26.9002L13.2346 26.8067L13.2507 26.7151L13.2673 26.6251L13.2844 26.5368L13.3021 26.4501L13.3203 26.3649L13.3391 26.2812L13.3584 26.1988L13.3782 26.1179L13.3986 26.0383L13.4196 25.96L13.441 25.8829L13.4631 25.8071L13.4857 25.7324L13.5088 25.6589L13.5325 25.5865L13.5568 25.5152L13.5816 25.4449L13.607 25.3757L13.6329 25.3075L13.6594 25.2403L13.6864 25.1741L13.7141 25.1089L13.7423 25.0446L13.771 24.9812L13.8004 24.9187L13.8303 24.8571L13.8608 24.7963L13.8919 24.7364L13.9235 24.6774L13.9558 24.6192L13.9886 24.5618L14.022 24.5052L14.056 24.4494L14.0906 24.3944L14.1259 24.3402L14.1617 24.2867L14.1981 24.234L14.2351 24.1821L14.2728 24.1308L14.311 24.0803L14.3499 24.0305L14.3894 23.9815L14.4296 23.9331L14.4704 23.8854L14.5118 23.8385L14.5538 23.7922L14.5965 23.7465L14.6399 23.7016L14.6839 23.6573L14.7286 23.6137L14.7739 23.5707L14.8199 23.5284L14.8667 23.4868L14.914 23.4457L14.9621 23.4053L15.0109 23.3656L15.0604 23.3264L15.1106 23.2879L15.1616 23.25L15.2133 23.2128L15.2657 23.1761L15.3188 23.14L15.3728 23.1046L15.4275 23.0697L15.4829 23.0355L15.5392 23.0018L15.5963 22.9688L15.6541 22.9363L15.7128 22.9044L15.7724 22.8731L15.8328 22.8424L15.894 22.8122L15.9562 22.7826L16.0192 22.7536L16.0832 22.7252L16.148 22.6974L16.2139 22.6701L16.2807 22.6434L16.3484 22.6172L16.4172 22.5916L16.4871 22.5666L16.558 22.5421L16.6299 22.5182L16.703 22.4948L16.7772 22.472L16.8526 22.4497L16.9292 22.428L17.007 22.4069L17.0861 22.3863L17.1665 22.3662L17.2482 22.3467L17.3314 22.3277L17.416 22.3093L17.5021 22.2914L17.5898 22.274L17.679 22.2572L17.77 22.241L17.8627 22.2252L17.9573 22.21L18.0538 22.1954L18.1523 22.1812L18.253 22.1677L18.3558 22.1546L18.4611 22.1421L18.5688 22.1301L18.6792 22.1186L18.7924 22.1077L18.9087 22.0973L19.0282 22.0874L19.1512 22.0781L19.2781 22.0693L19.409 22.061L19.5446 22.0533L19.6851 22.046L19.8312 22.0393L19.9836 22.0332L20.1431 22.0275L20.3107 22.0224L20.4878 22.0178L20.6762 22.0137L20.8782 22.0102L21.0972 22.0072L21.3385 22.0047L21.6105 22.0027L21.929 22.0013L22.3313 22.0004L22.9868 22L24.416 22.0001L24.8934 22.0008L25.2446 22.002L25.5361 22.0037L25.7907 22.0059L26.0195 22.0087L26.2292 22.012L26.4237 22.0158L26.6059 22.0201L26.7779 22.025L26.9411 22.0304L27.0968 22.0363L27.2458 22.0428L27.3889 22.0497L27.5268 22.0572L27.6599 22.0653L27.7887 22.0738L27.9135 22.0829L28.0346 22.0925L28.1524 22.1027L28.2671 22.1133L28.3788 22.1245L28.4878 22.1363L28.5942 22.1485L28.6982 22.1613L28.7999 22.1747L28.8994 22.1886L28.9968 22.203L29.0923 22.2179L29.1859 22.2334L29.2777 22.2494L29.3678 22.2659L29.4562 22.283L29.5431 22.3007L29.6284 22.3188L29.7122 22.3375L29.7946 22.3568L29.8757 22.3766L29.9554 22.397L30.0338 22.4179L30.111 22.4393L30.1869 22.4613L30.2617 22.4838L30.3353 22.5069L30.4078 22.5306L30.4792 22.5548L30.5495 22.5796L30.6188 22.6049L30.6871 22.6308L30.7543 22.6572L30.8206 22.6843L30.886 22.7118L30.9503 22.74L31.0138 22.7687L31.0764 22.798L31.1381 22.8279L31.1989 22.8583L31.2588 22.8894L31.3179 22.921L31.3762 22.9532L31.4336 22.986L31.4903 23.0193L31.5461 23.0533L31.6012 23.0879L31.6555 23.123L31.709 23.1588L31.7618 23.1952L31.8138 23.2322L31.8651 23.2697L31.9157 23.308L31.9655 23.3468L32.0146 23.3863L32.0631 23.4263L32.1108 23.4671L32.1578 23.5084L32.2042 23.5504L32.2498 23.5931L32.2948 23.6364L32.3392 23.6804L32.3828 23.725L32.4259 23.7703L32.4682 23.8163L32.5099 23.8629L32.551 23.9102L32.5915 23.9583L32.6313 24.007L32.6705 24.0565L32.709 24.1066L32.747 24.1575L32.7843 24.2091L32.821 24.2615L32.8571 24.3146L32.8926 24.3684L32.9275 24.4231L32.9618 24.4785L32.9955 24.5347L33.0286 24.5917L33.0611 24.6495L33.0931 24.7081L33.1244 24.7676L33.1552 24.8279L33.1854 24.8891L33.215 24.9512L33.244 25.0141L33.2725 25.078L33.3004 25.1428L33.3277 25.2086L33.3545 25.2753L33.3807 25.343L33.4064 25.4117L33.4314 25.4815L33.456 25.5523L33.4799 25.6241L33.5033 25.6971L33.5262 25.7712L33.5485 25.8465L33.5702 25.923L33.5914 26.0007L33.6121 26.0797L33.6322 26.16L33.6518 26.2417L33.6708 26.3247L33.6893 26.4092L33.7072 26.4952L33.7246 26.5827L33.7414 26.6719L33.7578 26.7627L33.7735 26.8553L33.7888 26.9497L33.8035 27.046L33.8176 27.1444L33.8313 27.2449L33.8444 27.3475L33.8569 27.4526L33.869 27.5601L33.8805 27.6703L33.8914 27.7833L33.9019 27.8993L33.9118 28.0185L33.9212 28.1413L33.93 28.2678L33.9383 28.3984L33.9461 28.5336L33.9534 28.6737L33.9601 28.8194L33.9664 28.9712L33.972 29.1301L33.9772 29.2971L33.9818 29.4733L33.9859 29.6607L33.9895 29.8615L33.9926 30.0791L33.9951 30.3183L33.9971 30.5874L33.9986 30.9013L33.9995 31.2943L34 31.9074L34 32.5Z" stroke="oklch(var(--primary))" stroke-width="2"/>
                    <path d="M38.2105 52C44.7217 52 50 43.2696 50 32.5C50 21.7304 44.7217 13 38.2105 13M38.2105 52C33.922 52 30.1682 48.2126 28.1053 42.5497M38.2105 52H28.1053C23.8167 52 20.063 48.2126 18 42.5497M38.2105 13C34.111 13 30.5001 16.461 28.3877 21.7128M38.2105 13H28.1053C24.0057 13 20.3948 16.461 18.2825 21.7128" stroke="oklch(var(--muted))" stroke-width="2"/>
                    <path d="M17 32.5L23 26L20 36L22.0833 33.5M30 32.5L23 40L27.5 27L22.9167 32.5" stroke="oklch(var(--muted))" stroke-linecap="round"/>
                    <path d="M31.8524 28.1645L31.8409 28.0849L31.829 28.0069L31.8167 27.9305L31.8039 27.8555L31.7907 27.782L31.777 27.7098L31.763 27.639L31.7484 27.5693L31.7335 27.5009L31.7181 27.4337L31.7023 27.3676L31.686 27.3026L31.6693 27.2387L31.6521 27.1758L31.6345 27.1139L31.6164 27.0529L31.5979 26.9929L31.579 26.9338L31.5596 26.8756L31.5397 26.8183L31.5194 26.7619L31.4987 26.7062L31.4775 26.6514L31.4558 26.5974L31.4337 26.5442L31.4111 26.4917L31.388 26.44L31.3645 26.3891L31.3406 26.3388L31.3161 26.2893L31.2912 26.2404L31.2658 26.1923L31.24 26.1448L31.2136 26.098L31.1868 26.0519L31.1595 26.0064L31.1318 25.9615L31.1035 25.9173L31.0748 25.8737L31.0456 25.8307L31.0158 25.7883L30.9856 25.7465L30.9549 25.7054L30.9237 25.6647L30.892 25.6247L30.8598 25.5853L30.827 25.5464L30.7938 25.5081L30.76 25.4703L30.7257 25.4331L30.6909 25.3964L30.6555 25.3603L30.6196 25.3247L30.5832 25.2896L30.5462 25.2551L30.5087 25.2211L30.4706 25.1876L30.432 25.1547L30.3928 25.1222L30.353 25.0903L30.3127 25.0588L30.2717 25.0279L30.2302 24.9975L30.1881 24.9675L30.1454 24.9381L30.1021 24.9091L30.0581 24.8806L30.0135 24.8527L29.9683 24.8252L29.9225 24.7982L29.876 24.7716L29.8288 24.7455L29.7809 24.72L29.7324 24.6948L29.6832 24.6702L29.6333 24.646L29.5826 24.6223L29.5312 24.599L29.4791 24.5763L29.4262 24.5539L29.3726 24.5321L29.3181 24.5106L29.2628 24.4897L29.2068 24.4692L29.1498 24.4491L29.092 24.4295L29.0333 24.4104L28.9737 24.3917L28.9132 24.3734L28.8517 24.3556L28.7893 24.3383L28.7258 24.3214L28.6613 24.3049L28.5957 24.2888L28.5289 24.2733L28.4611 24.2581L28.392 24.2434L28.3217 24.2291L28.2501 24.2153L28.1772 24.2019L28.1029 24.1889L28.0271 24.1764L27.9498 24.1643L27.8709 24.1526L27.7904 24.1414L27.708 24.1306L27.6239 24.1203L27.5377 24.1103L27.4495 24.1008L27.3591 24.0917L27.2663 24.0831L27.1709 24.0749L27.0728 24.0671L26.9718 24.0598L26.8675 24.0528L26.7598 24.0463L26.6482 24.0403L26.5323 24.0346L26.4117 24.0294L26.2857 24.0246L26.1535 24.0202L26.0143 24.0163L25.8668 24.0128L25.7093 24.0097L25.5396 24.007L25.3543 24.0048L25.1483 24.003L24.9123 24.0016L24.628 24.0006L24.2415 24.0001L23.0845 24L22.5539 24.0003L22.2282 24.0011L21.9704 24.0022L21.7502 24.0038L21.5549 24.0058L21.3776 24.0083L21.2141 24.0111L21.0616 24.0144L20.9182 24.0181L20.7825 24.0223L20.6534 24.0268L20.5301 24.0318L20.4118 24.0373L20.298 24.0431L20.1883 24.0494L20.0822 24.0561L19.9796 24.0632L19.88 24.0708L19.7832 24.0788L19.6891 24.0872L19.5974 24.096L19.5081 24.1053L19.4209 24.115L19.3357 24.1251L19.2524 24.1357L19.1709 24.1467L19.0912 24.1582L19.0131 24.17L18.9365 24.1823L18.8614 24.1951L18.7878 24.2082L18.7155 24.2218L18.6446 24.2359L18.5748 24.2504L18.5064 24.2653L18.439 24.2806L18.3729 24.2964L18.3078 24.3127L18.2437 24.3294L18.1807 24.3465L18.1188 24.3641L18.0577 24.3821L17.9977 24.4006L17.9385 24.4195L17.8802 24.4388L17.8229 24.4587L17.7663 24.4789L17.7106 24.4996L17.6558 24.5208L17.6017 24.5425L17.5484 24.5645L17.4959 24.5871L17.4441 24.6101L17.3931 24.6336L17.3428 24.6575L17.2932 24.6819L17.2443 24.7068L17.1961 24.7321L17.1486 24.7579L17.1017 24.7842L17.0555 24.811L17.01 24.8382L16.9651 24.866L16.9208 24.8942L16.8772 24.9229L16.8341 24.9521L16.7917 24.9818L16.7499 25.0119L16.7086 25.0426L16.668 25.0738L16.6279 25.1055L16.5884 25.1377L16.5495 25.1704L16.5111 25.2036L16.4733 25.2373L16.436 25.2715L16.3993 25.3063L16.3632 25.3416L16.3275 25.3775L16.2924 25.4139L16.2579 25.4508L16.2238 25.4883L16.1903 25.5263L16.1573 25.5649L16.1248 25.6041L16.0928 25.6438L16.0613 25.6841L16.0303 25.725L15.9999 25.7664L15.9699 25.8085L15.9404 25.8512L15.9114 25.8945L15.8829 25.9384L15.8549 25.9829L15.8273 26.028L15.8003 26.0738L15.7737 26.1203L15.7476 26.1674L15.722 26.2152L15.6968 26.2637L15.6721 26.3129L15.6479 26.3627L15.6242 26.4133L15.6009 26.4646L15.5781 26.5167L15.5557 26.5695L15.5338 26.6231L15.5123 26.6775L15.4913 26.7327L15.4708 26.7887L15.4507 26.8456L15.4311 26.9033L15.4119 26.9619L15.3932 27.0215L15.3749 27.0819L15.357 27.1433L15.3396 27.2057L15.3227 27.2691L15.3062 27.3335L15.2901 27.3991L15.2745 27.4657L15.2593 27.5335L15.2446 27.6024L15.2302 27.6727L15.2164 27.7441L15.2029 27.8169L15.1899 27.8912L15.1774 27.9668L15.1653 28.044L15.1536 28.1227L15.1423 28.2031L15.1315 28.2853L15.1211 28.3693L15.1111 28.4553L15.1016 28.5434L15.0925 28.6336L15.0838 28.7263L15.0755 28.8214L15.0677 28.9193L15.0603 29.02L15.0534 29.124L15.0468 29.2315L15.0407 29.3428L15.0351 29.4583L15.0298 29.5785L15.025 29.7041L15.0206 29.8357L15.0166 29.9743L15.0131 30.1211L15.0099 30.2777L15.0072 30.4463L15.005 30.6302L15.0031 30.8344L15.0017 31.0675L15.0007 31.3468L15.0001 31.7206L15 32.8392L15.0003 33.4152L15.001 33.749L15.0021 34.0107L15.0037 34.2333L15.0057 34.4303L15.0081 34.6088L15.0109 34.7734L15.0141 34.9266L15.0178 35.0707L15.0219 35.2069L15.0265 35.3365L15.0314 35.4603L15.0368 35.579L15.0426 35.6931L15.0489 35.8031L15.0555 35.9094L15.0626 36.0124L15.0702 36.1122L15.0781 36.2092L15.0865 36.3035L15.0953 36.3953L15.1046 36.4849L15.1142 36.5723L15.1243 36.6576L15.1349 36.741L15.1458 36.8226L15.1572 36.9025L15.1691 36.9808L15.1813 37.0574L15.194 37.1326L15.2072 37.2064L15.2207 37.2788L15.2348 37.3498L15.2492 37.4196L15.2641 37.4882L15.2794 37.5556L15.2952 37.6219L15.3114 37.6871L15.328 37.7512L15.3451 37.8143L15.3627 37.8763L15.3807 37.9374L15.3991 37.9976L15.418 38.0568L15.4373 38.1151L15.4571 38.1726L15.4773 38.2292L15.498 38.2849L15.5191 38.3399L15.5407 38.394L15.5628 38.4474L15.5853 38.4999L15.6083 38.5518L15.6317 38.6029L15.6556 38.6532L15.68 38.7029L15.7048 38.7518L15.7301 38.8001L15.7559 38.8476L15.7821 38.8946L15.8089 38.9408L15.8361 38.9864L15.8638 39.0314L15.8919 39.0757L15.9206 39.1194L15.9497 39.1625L15.9794 39.205L16.0095 39.2468L16.0402 39.2881L16.0713 39.3288L16.1029 39.3689L16.1351 39.4085L16.1677 39.4474L16.2009 39.4859L16.2346 39.5237L16.2688 39.561L16.3035 39.5978L16.3388 39.634L16.3746 39.6697L16.411 39.7048L16.4478 39.7394L16.4853 39.7735L16.5233 39.8071L16.5618 39.8401L16.6009 39.8726L16.6406 39.9047L16.6809 39.9362L16.7217 39.9672L16.7631 39.9977L16.8051 40.0277L16.8478 40.0573L16.891 40.0863L16.9348 40.1148L16.9793 40.1429L17.0244 40.1705L17.0702 40.1976L17.1166 40.2242L17.1637 40.2503L17.2114 40.276L17.2598 40.3012L17.3089 40.3259L17.3587 40.3502L17.4093 40.3739L17.4605 40.3973L17.5125 40.4201L17.5653 40.4425L17.6188 40.4645L17.6732 40.486L17.7283 40.507L17.7843 40.5276L17.841 40.5477L17.8987 40.5674L17.9572 40.5866L18.0167 40.6054L18.0771 40.6237L18.1384 40.6416L18.2007 40.659L18.264 40.676L18.3284 40.6925L18.3938 40.7086L18.4604 40.7243L18.528 40.7395L18.5969 40.7543L18.667 40.7686L18.7384 40.7825L18.8111 40.796L18.8852 40.809L18.9607 40.8216L19.0378 40.8338L19.1164 40.8455L19.1967 40.8568L19.2787 40.8677L19.3626 40.8781L19.4484 40.8881L19.5363 40.8977L19.6264 40.9068L19.7188 40.9155L19.8137 40.9238L19.9114 40.9317L20.0119 40.9391L20.1156 40.9461L20.2228 40.9527L20.3338 40.9588L20.4489 40.9645L20.5688 40.9698L20.6939 40.9746L20.825 40.9791L20.963 40.9831L21.1091 40.9867L21.2648 40.9898L21.4324 40.9926L21.6149 40.9949L21.8172 40.9967L22.0475 40.9982L22.3221 40.9992L22.6845 40.9998L23.7399 41L24.3832 40.9998L24.7257 40.9991L24.9915 40.998L25.2166 40.9965L25.4153 40.9945L25.5952 40.9921L25.7607 40.9893L25.9148 40.9861L26.0595 40.9825L26.1963 40.9784L26.3264 40.9739L26.4506 40.969L26.5697 40.9636L26.6842 40.9578L26.7945 40.9516L26.9011 40.945L27.0043 40.9379L27.1044 40.9304L27.2016 40.9225L27.2961 40.9142L27.3881 40.9054L27.4778 40.8962L27.5654 40.8866L27.6509 40.8765L27.7345 40.866L27.8162 40.8551L27.8962 40.8437L27.9746 40.8319L28.0514 40.8197L28.1267 40.807L28.2006 40.7939L28.2731 40.7803L28.3442 40.7664L28.4141 40.752L28.4828 40.7371L28.5503 40.7218L28.6167 40.7061L28.6819 40.6899L28.7461 40.6733L28.8093 40.6562L28.8714 40.6387L28.9326 40.6208L28.9928 40.6024L29.0521 40.5836L29.1105 40.5643L29.168 40.5445L29.2247 40.5243L29.2805 40.5037L29.3355 40.4826L29.3897 40.461L29.4431 40.439L29.4958 40.4165L29.5477 40.3936L29.5988 40.3702L29.6492 40.3463L29.6989 40.322L29.7479 40.2972L29.7963 40.2719L29.8439 40.2462L29.8908 40.22L29.9371 40.1933L29.9828 40.1661L30.0278 40.1385L30.0722 40.1103L30.1159 40.0817L30.1591 40.0526L30.2016 40.023L30.2435 39.9929L30.2848 39.9623L30.3256 39.9312L30.3658 39.8996L30.4053 39.8675L30.4444 39.8349L30.4828 39.8017L30.5207 39.7681L30.5581 39.7339L30.5949 39.6992L30.6311 39.664L30.6668 39.6283L30.702 39.592L30.7367 39.5551L30.7708 39.5177L30.8044 39.4798L30.8375 39.4413L30.8701 39.4022L30.9021 39.3626L30.9337 39.3224L30.9648 39.2816L30.9953 39.2402L31.0254 39.1982L31.0549 39.1557L31.084 39.1125L31.1126 39.0687L31.1407 39.0242L31.1683 38.9792L31.1954 38.9335L31.2221 38.8871L31.2483 38.8401L31.274 38.7924L31.2992 38.7441L31.3239 38.695L31.3482 38.6453L31.3721 38.5948L31.3954 38.5436L31.4183 38.4916L31.4408 38.4389L31.4627 38.3854L31.4843 38.3312L31.5053 38.2761L31.5259 38.2202L31.5461 38.1635L31.5658 38.1059L31.5851 38.0474L31.6039 37.9881L31.6222 37.9278L31.6401 37.8665L31.6576 37.8043L31.6746 37.741L31.6912 37.6768L31.7074 37.6114L31.723 37.545L31.7383 37.4774L31.7531 37.4086L31.7675 37.3386L31.7814 37.2673L31.7949 37.1947L31.808 37.1207L31.8206 37.0453L31.8328 36.9684L31.8446 36.8899L31.8559 36.8098L31.8668 36.7279L31.8773 36.6442L31.8873 36.5585L31.8969 36.4708L31.9061 36.3809L31.9149 36.2886L31.9232 36.1939L31.9311 36.0965L31.9385 35.9962L31.9455 35.8927L31.9521 35.7859L31.9583 35.6752L31.9641 35.5604L31.9694 35.441L31.9743 35.3163L31.9787 35.1857L31.9828 35.0483L31.9864 34.9029L31.9896 34.748L31.9923 34.5814L31.9947 34.4003L31.9966 34.1998L31.9981 33.9721L31.9991 33.702L31.9998 33.35L32 32.5L32 32.0203L31.9996 31.524L31.9989 31.2058L31.9977 30.9517L31.996 30.7339L31.994 30.5402L31.9915 30.3641L31.9886 30.2015L31.9853 30.0498M31.874 28.329L31.8842 28.414L31.8939 28.501L31.9032 28.5902L31.9121 28.6817L31.9206 28.7756L31.9286 28.8721L31.9362 28.9715L31.9433 29.0739L31.9501 29.1797L31.9564 29.2891L31.9623 29.4025" stroke="oklch(var(--muted))"/>
                </g>
            </svg>
        </div>
    );
};


// --- Settings Persistence ---
interface AppSettings {
    wakeUpWindow: string;
    alarmSound: string;
    phoneVibration: boolean;
    braceletVibration: boolean;
    soundTimer: string;
    smartWeekends: boolean;
    smartReminder: boolean;
    sleepReminder: boolean;
    reminderTime: string;
    selectedSound: string;
    vibrationIntensity: string;
}

const defaultSettings: AppSettings = {
    wakeUpWindow: '30 мин',
    alarmSound: 'radar',
    phoneVibration: true,
    braceletVibration: true,
    soundTimer: '30 мин',
    smartWeekends: false,
    smartReminder: true,
    sleepReminder: true,
    reminderTime: '30 мин',
    selectedSound: 'none',
    vibrationIntensity: 'Средняя',
};

function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem('app-settings');
            if (stored) {
                return { ...defaultSettings, ...JSON.parse(stored) };
            }
        } catch (e) { console.error("Failed to read settings from localStorage", e); }
        return defaultSettings;
    });

    useEffect(() => {
        try {
            localStorage.setItem('app-settings', JSON.stringify(settings));
        } catch (e) { console.error("Failed to save settings to localStorage", e); }
    }, [settings]);

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return { settings, updateSetting };
}


const SettingsScreen: React.FC = () => {
    const { settings, updateSetting } = useSettings();
    
    // Audio playback state (remains local to the component)
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    const stopCurrentSound = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }
    };

    const playSound = (soundId: string) => {
        updateSetting('selectedSound', soundId);

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        
        stopCurrentSound();

        if (soundId === 'none') {
            return;
        }

        const bufferSize = 2 * audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            let noise = 0;
            switch(soundId) {
                case 'white-noise': noise = Math.random() * 2 - 1; break;
                case 'rain':
                    const b0 = 0.99886 * lastOut + (Math.random() * 2 - 1) * 0.0555179;
                    const b1 = 0.99332 * lastOut + (Math.random() * 2 - 1) * 0.0750759;
                    const b2 = 0.96900 * lastOut + (Math.random() * 2 - 1) * 0.1538520;
                    noise = b0 + b1 + b2 + (Math.random() * 2 - 1) * 0.1848;
                    lastOut = noise;
                    noise *= 0.05;
                    break;
                case 'ocean':
                    const white = Math.random() * 2 - 1;
                    noise = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = noise;
                    noise *= 3.5;
                    break;
            }
            output[i] = noise;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.01;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start();
        
        sourceRef.current = source;
        gainNodeRef.current = gainNode;
    };

    useEffect(() => {
        return () => {
            stopCurrentSound();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const sounds = [
        { id: 'none', name: 'Отключено' },
        { id: 'rain', name: 'Шум дождя' },
        { id: 'white-noise', name: 'Белый шум' },
        { id: 'ocean', name: 'Волны океана' },
    ];
    
    const alarmSounds = [
        { id: 'radar', name: 'Радар' },
        { id: 'crystals', name: 'Кристаллы' },
        { id: 'waves', name: 'Волны' },
    ];

    return (
        <div className="p-6 pb-28">
            <h1 className="text-2xl font-bold text-center mb-8 text-foreground">Настройки</h1>
            <div className="space-y-6">
                
                {/* Notifications Section */}
                <div className="bg-card p-4 rounded-app shadow-app">
                    <h2 className="font-bold text-lg mb-4 text-foreground">Уведомления</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-foreground">Напоминание о сне</label>
                            <ToggleSwitch enabled={settings.sleepReminder} setEnabled={v => updateSetting('sleepReminder', v)} />
                        </div>
                        <AnimatePresence>
                        {settings.sleepReminder && (
                            <motion.div
                                className="origin-top"
                                initial={{ scaleY: 0, opacity: 0 }}
                                animate={{ scaleY: 1, opacity: 1 }}
                                exit={{ scaleY: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                <div className="pt-4">
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Время напоминания</label>
                                    <SegmentedControl layoutId="reminder-time" options={['15 мин', '30 мин', '45 мин']} selected={settings.reminderTime} setSelected={v => updateSetting('reminderTime', v)} />
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Waking Up Section */}
                <div className="bg-card p-4 rounded-app shadow-app">
                    <h2 className="font-bold text-lg mb-4 text-foreground">Пробуждение</h2>
                    <div className="space-y-4">
                        <div>
                            <SegmentedControl layoutId="wake-up-window" options={['15 мин', '30 мин', '45 мин']} selected={settings.wakeUpWindow} setSelected={v => updateSetting('wakeUpWindow', v)} />
                        </div>
                        <button className="w-full flex justify-between items-center text-left">
                            <label className="text-sm font-medium text-foreground">Звук будильника</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{alarmSounds.find(s => s.id === settings.alarmSound)?.name}</span>
                                <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </button>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-foreground">Вибрация на телефоне</label>
                            <ToggleSwitch enabled={settings.phoneVibration} setEnabled={v => updateSetting('phoneVibration', v)} />
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-foreground">Вибрация на браслете</label>
                            <ToggleSwitch enabled={settings.braceletVibration} setEnabled={v => updateSetting('braceletVibration', v)} />
                        </div>
                    </div>
                </div>

                {/* Falling Asleep Section */}
                <div className="bg-card p-4 rounded-app shadow-app">
                    <h2 className="font-bold text-lg mb-4 text-foreground">Звук для сна</h2>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            {sounds.map(sound => (
                                <button 
                                    key={sound.id}
                                    onClick={() => playSound(sound.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors flex justify-between items-center ${settings.selectedSound === sound.id ? 'bg-primary/20 text-primary' : 'hover:bg-border'}`}
                                >
                                    <span>{sound.name}</span>
                                    {settings.selectedSound === sound.id && <motion.div initial={{scale: 0}} animate={{scale: 1}}><SunIcon className="w-5 h-5" /></motion.div>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Adaptive Behavior Section */}
                <div className="bg-card p-4 rounded-app shadow-app">
                    <h2 className="font-bold text-lg mb-4 text-foreground">Адаптивное поведение</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="text-sm font-medium text-foreground">Умное напоминание о сне</label>
                                <p className="text-xs text-muted-foreground">Напомнить раньше, если вы плохо спали</p>
                            </div>
                            <ToggleSwitch enabled={settings.smartReminder} setEnabled={v => updateSetting('smartReminder', v)} />
                        </div>
                    </div>
                </div>

                {/* Integrations Section */}
                <div className="bg-card p-4 rounded-app shadow-app">
                    <h2 className="font-bold text-lg mb-4 text-foreground">Интеграции</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <label className="text-sm font-medium text-foreground">Умные выходные</label>
                                <p className="text-xs text-muted-foreground">Автонастройка по календарю</p>
                            </div>
                            <ToggleSwitch enabled={settings.smartWeekends} setEnabled={v => updateSetting('smartWeekends', v)} />
                        </div>
                    </div>
                </div>

                {/* General Section */}
                <div className="bg-card p-4 rounded-app shadow-app">
                    <h2 className="font-bold text-lg mb-2 text-foreground">Общие</h2>
                    <div className="flex flex-col">
                        <button className="w-full flex justify-between items-center text-left p-3 hover:bg-border rounded-lg transition-colors">
                            <label className="text-sm font-medium text-foreground">Управление данными</label>
                            <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button className="w-full flex justify-between items-center text-left p-3 hover:bg-border rounded-lg transition-colors">
                            <label className="text-sm font-medium text-foreground">О приложении</label>
                            <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LearnScreen = () => (
    <div className="p-6 flex-grow flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground">Как это работает</h1>
        <p className="text-muted-foreground mt-4 text-center">Этот раздел в разработке. Здесь будет объяснение фаз сна и работы приложения.</p>
    </div>
);

const ProfileScreen: React.FC<{
    isConnected: boolean;
    batteryLevel: number;
    setIsConnected: (isConnected: boolean) => void;
    username: string;
    setUsername: (name: string) => void;
}> = ({ isConnected, batteryLevel, setIsConnected, username, setUsername }) => {
    const { settings, updateSetting } = useSettings();
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectingStatusText, setConnectingStatusText] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(username);

    const handleConnectToggle = () => {
        setIsConnecting(true);
        setConnectingStatusText(isConnected ? "Отключение..." : "Подключение...");
        setTimeout(() => {
            setIsConnected(!isConnected);
            setIsConnecting(false);
        }, 1500);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value);
    };

    const handleNameSave = () => {
        if (nameInput.trim()) {
            setUsername(nameInput.trim());
        }
        setIsEditingName(false);
    };

    return (
        <div className="p-6 pb-28 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 border-2 border-border">
                <span className="text-4xl font-bold text-primary">{username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
                {isEditingName ? (
                    <input 
                        type="text"
                        value={nameInput}
                        onChange={handleNameChange}
                        onBlur={handleNameSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                        className="w-auto text-2xl font-bold text-foreground bg-transparent border-b-2 border-primary text-center focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <h1 className="text-2xl font-bold text-foreground">{username}</h1>
                )}
                <button onClick={() => setIsEditingName(!isEditingName)} className="text-muted-foreground hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
            </div>
            <p className="text-muted-foreground mb-8">example@mail.com</p>

            <div className="w-full bg-card rounded-app p-6 shadow-app flex flex-col items-center">
                <AnimatedBraceletIcon className="mb-4" />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isConnecting ? 'connecting' : (isConnected ? 'connected' : 'disconnected')}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center"
                    >
                        {isConnecting ? (
                            <p className="font-bold text-primary">{connectingStatusText}</p>
                        ) : isConnected ? (
                            <>
                                <p className="font-bold text-foreground">Браслет Zzzone</p>
                                <p className="text-sm text-green-500">Подключен • {batteryLevel}%</p>
                            </>
                        ) : (
                            <>
                                <p className="font-bold text-foreground">Браслет Zzzone</p>
                                <p className="text-sm text-muted-foreground">Не подключен</p>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
                <button
                    onClick={handleConnectToggle}
                    disabled={isConnecting}
                    className="w-full bg-primary text-primary-foreground py-3 mt-6 rounded-app font-bold text-lg hover:opacity-90 transition-opacity shadow-app disabled:opacity-50"
                >
                    {isConnecting ? '...' : (isConnected ? 'Отключить' : 'Подключить')}
                </button>
            </div>

            <div className="w-full bg-card rounded-app p-4 shadow-app mt-6">
                 <h2 className="font-bold text-lg mb-4 text-foreground px-2">Настройки браслета</h2>
                 <div className="space-y-2">
                    <div className="p-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Интенсивность вибрации</label>
                        <SegmentedControl layoutId="vibration-intensity" options={['Низкая', 'Средняя', 'Высокая']} selected={settings.vibrationIntensity} setSelected={v => updateSetting('vibrationIntensity', v)} />
                    </div>
                    <button className="w-full flex justify-between items-center text-left p-2 hover:bg-border rounded-lg transition-colors">
                        <label className="text-sm font-medium text-foreground">Найти браслет</label>
                        <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                    </button>
                 </div>
            </div>
            
            <button className="w-full text-center text-destructive py-4 mt-6 font-bold">
                Выйти из аккаунта
            </button>
        </div>
    );
};


const BottomNav: React.FC<{ activeScreen: Screen; setScreen: (screen: Screen) => void }> = ({ activeScreen, setScreen }) => {
    const navItems = [
        { screen: 'LEARN', icon: LearnIcon, label: 'Обучение' },
        { screen: 'STATS', icon: StatsIcon, label: 'Статистика' },
        { screen: 'HOME', icon: HomeIcon, label: 'Главная' },
        { screen: 'PROFILE', icon: ProfileIcon, label: 'Профиль' },
        { screen: 'SETTINGS', icon: SettingsIcon, label: 'Настройки' },
    ];

    return (
        <nav className="bg-card border-t border-border">
            <div className="flex justify-around items-center h-20 px-2">
                {navItems.map(item => {
                    if (item.screen === 'HOME') {
                        return (
                            <button
                                key={item.screen}
                                onClick={() => setScreen('HOME')}
                                aria-label={item.label}
                                className={`w-16 h-16 -mt-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeScreen === 'HOME' ? 'bg-primary text-primary-foreground shadow-app-md' : 'bg-card text-muted-foreground shadow-app'}`}
                            >
                                <item.icon className="w-9 h-9" />
                            </button>
                        );
                    }
                    return (
                        <button
                            key={item.screen}
                            onClick={() => setScreen(item.screen as Screen)}
                            aria-label={item.label}
                            className={`p-2 rounded-full transition-colors duration-300 ${activeScreen === item.screen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <item.icon className="w-8 h-8" />
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

const BreathingAnimationScreen: React.FC<{ onWakeUp: () => void }> = ({ onWakeUp }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="breathing-bg absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center"
    >
        <div className="z-10">
            <p className="text-muted-foreground text-lg tracking-wider">Дышите глубоко</p>
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                onClick={onWakeUp}
                className="bg-white/10 backdrop-blur-sm text-card-foreground py-3 px-10 rounded-app font-bold text-lg hover:bg-white/20 transition-colors duration-300 shadow-app"
            >
                Проснуться
            </motion.button>
        </div>
    </motion.div>
);

const Notification: React.FC<{ message: string; onDismiss: () => void }> = ({ message }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            className="absolute bottom-28 left-0 right-0 mx-auto z-[100] w-max max-w-[90%] p-4 bg-card text-card-foreground rounded-app shadow-app-md flex items-center gap-4"
        >
            <AlarmClockIcon className="w-6 h-6 text-primary" />
            <p>{message}</p>
        </motion.div>
    );
};


export default function App() {
    const [isOnboarding, setIsOnboarding] = useState(true);
    const [screen, setScreen] = useState<Screen>('HOME');
    const [page, setPage] = useState<Page>('ONBOARDING');
    const [previousPage, setPreviousPage] = useState<Page>('HOME');
    const [alarm, setAlarm] = useState<Alarm | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isSleeping, setIsSleeping] = useState(false);
    const [notification, setNotification] = useState<{ message: string; id: number } | null>(null);
    const [isConnected, setIsConnected] = useState(true);
    const [batteryLevel, setBatteryLevel] = useState(92);
    const [username, setUsername] = useState("Пользователь");

    const showNotification = (message: string) => {
        setNotification({ message, id: Date.now() });
        setTimeout(() => {
            setNotification(null);
        }, 2000);
    };

    const handleSetPage = (newPage: Page) => {
        setPreviousPage(page);
        if (['HOME', 'STATS', 'PROFILE', 'SETTINGS', 'LEARN'].includes(newPage)) {
            setScreen(newPage as Screen);
        }
        setPage(newPage);
    };

    const handleSaveAlarm = (newAlarm: Alarm) => {
        setAlarm(newAlarm);
        handleSetPage('HOME');
    };
    
    const selectedSession = useMemo(() => {
        if (!selectedSessionId) return null;
        return MOCK_SLEEP_DATA.find(s => s.id === selectedSessionId) || null;
    }, [selectedSessionId]);

        const renderPage = () => {

            switch(page) {

                case 'ONBOARDING':

                    return <OnboardingScreen onComplete={() => { setIsOnboarding(false); handleSetPage('HOME'); }} />;

                                case 'HOME':

                                    return <HomeScreen setPage={handleSetPage} alarm={alarm} setSelectedSessionId={setSelectedSessionId} setIsSleeping={setIsSleeping} showNotification={showNotification} isConnected={isConnected} batteryLevel={batteryLevel} username={username}/>;

                case 'STATS':

                    return <HistoryScreen setPage={handleSetPage} setSelectedSessionId={setSelectedSessionId} />;

                case 'PROFILE':

                    return <ProfileScreen isConnected={isConnected} batteryLevel={batteryLevel} setIsConnected={setIsConnected} username={username} setUsername={setUsername} />;

                case 'SETTINGS':

                    return <SettingsScreen />;

                case 'LEARN':

                    return <LearnScreen />;

                default:

                    return <HomeScreen setPage={handleSetPage} alarm={alarm} setSelectedSessionId={setSelectedSessionId} setIsSleeping={setIsSleeping} showNotification={showNotification} isConnected={isConnected} batteryLevel={batteryLevel} username={username}/>;

            }

        };

    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-sm h-[800px] max-h-[90vh] bg-background rounded-[2.5rem] shadow-app-xl flex flex-col overflow-hidden relative">
                <div className="flex-grow relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={screen}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 overflow-y-auto hide-scrollbar"
                        >
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </div>
                
                <AnimatePresence>
                    {!isOnboarding && page !== 'ALARM_SETUP' && page !== 'STATS_DETAIL' && (
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: '0%' }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute bottom-0 left-0 right-0"
                        >
                            <BottomNav activeScreen={screen} setScreen={(s) => handleSetPage(s)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {page === 'ALARM_SETUP' && <AlarmSetupScreen onSave={handleSaveAlarm} onCancel={() => handleSetPage('HOME')} />}
                    {page === 'STATS_DETAIL' && selectedSession && <StatsDetailScreen session={selectedSession} onBack={() => handleSetPage(previousPage)} />}
                </AnimatePresence>
                
                <AnimatePresence>
                    {notification && <Notification key={notification.id} message={notification.message} onDismiss={() => setNotification(null)} />}
                </AnimatePresence>

                <AnimatePresence>
                    {isSleeping && <BreathingAnimationScreen onWakeUp={() => setIsSleeping(false)} />}
                </AnimatePresence>
            </div>
        </div>
    );
}