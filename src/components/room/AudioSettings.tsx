"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Settings, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { AudioProcessor, getAudioQualityMetrics, type AudioQualityMetrics } from '@/lib/audioProcessor';
import styles from './AudioSettings.module.css';

interface AudioSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    audioProcessor: AudioProcessor;
    localStream: MediaStream | null;
    isMicOn: boolean;
    onToggleMic: () => void;
    audioQuality: 'basic' | 'enhanced';
    onAudioQualityChange: (quality: 'basic' | 'enhanced') => void;
}

export default function AudioSettings({
    open,
    onOpenChange,
    audioProcessor,
    localStream,
    isMicOn,
    onToggleMic,
    audioQuality,
    onAudioQualityChange
}: AudioSettingsProps) {
    const [noiseThreshold, setNoiseThreshold] = useState(-50);
    const [highPassFreq, setHighPassFreq] = useState(85);
    const [lowPassFreq, setLowPassFreq] = useState(8000);
    const [audioMetrics, setAudioMetrics] = useState<AudioQualityMetrics | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    // Monitor audio levels and metrics
    useEffect(() => {
        if (!open || !isMicOn) return;

        const interval = setInterval(() => {
            const metrics = getAudioQualityMetrics(audioProcessor);
            setAudioMetrics(metrics);
            setAudioLevel(metrics.level);
        }, 100);

        return () => clearInterval(interval);
    }, [open, isMicOn, audioProcessor]);

    // Apply noise threshold changes
    useEffect(() => {
        audioProcessor.setNoiseThreshold(noiseThreshold);
    }, [noiseThreshold, audioProcessor]);

    // Apply filter frequency changes
    useEffect(() => {
        audioProcessor.setFilterFrequencies(highPassFreq, lowPassFreq);
    }, [highPassFreq, lowPassFreq, audioProcessor]);

    const resetToDefaults = () => {
        setNoiseThreshold(-50);
        setHighPassFreq(85);
        setLowPassFreq(8000);
    };

    const getAudioLevelColor = (level: number) => {
        if (level < 0.1) return '#666';
        if (level < 0.3) return '#4ade80';
        if (level < 0.7) return '#fbbf24';
        return '#ef4444';
    };

    const getAudioLevelWidth = (level: number) => {
        return `${Math.min(level * 100, 100)}%`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings style={{ width: '20px', height: '20px' }} />
                            Audio Settings
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className={styles.content}>
                    {/* Audio Quality Selection */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Audio Processing</h3>
                        <div className={styles.qualitySelector}>
                            <Button
                                onClick={() => onAudioQualityChange('basic')}
                                variant={audioQuality === 'basic' ? 'default' : 'ghost'}
                                className={styles.qualityButton}
                            >
                                Basic
                                <span className={styles.qualityDescription}>
                                    Browser built-in processing
                                </span>
                            </Button>
                            <Button
                                onClick={() => onAudioQualityChange('enhanced')}
                                variant={audioQuality === 'enhanced' ? 'default' : 'ghost'}
                                className={styles.qualityButton}
                                disabled={!AudioProcessor.isAdvancedProcessingSupported()}
                            >
                                Enhanced
                                <span className={styles.qualityDescription}>
                                    Advanced noise reduction
                                </span>
                            </Button>
                        </div>
                        {!AudioProcessor.isAdvancedProcessingSupported() && (
                            <p className={styles.warningText}>
                                Enhanced processing not supported in this browser
                            </p>
                        )}
                    </div>

                    {/* Audio Level Monitor */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Audio Level</h3>
                        <div className={styles.audioMeter}>
                            <div 
                                className={styles.audioMeterFill}
                                style={{
                                    width: getAudioLevelWidth(audioLevel),
                                    backgroundColor: getAudioLevelColor(audioLevel)
                                }}
                            />
                        </div>
                        <div className={styles.audioInfo}>
                            <span className={styles.micStatus}>
                                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                {isMicOn ? 'Microphone On' : 'Microphone Off'}
                            </span>
                            {audioMetrics && (
                                <span className={styles.latencyInfo}>
                                    Latency: {Math.round(audioMetrics.latency * 1000)}ms
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Advanced Controls (Enhanced Mode Only) */}
                    {audioQuality === 'enhanced' && AudioProcessor.isAdvancedProcessingSupported() && (
                        <>
                            {/* Noise Gate Control */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Noise Gate</h3>
                                <div className={styles.sliderGroup}>
                                    <label className={styles.sliderLabel}>
                                        Threshold: {noiseThreshold} dB
                                    </label>
                                    <input
                                        type="range"
                                        min="-80"
                                        max="-10"
                                        step="5"
                                        value={noiseThreshold}
                                        onChange={(e) => setNoiseThreshold(Number(e.target.value))}
                                        className={styles.slider}
                                    />
                                    <div className={styles.sliderMarks}>
                                        <span>Sensitive</span>
                                        <span>Balanced</span>
                                        <span>Strict</span>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Controls */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Frequency Filters</h3>
                                <div className={styles.filterControls}>
                                    <div className={styles.sliderGroup}>
                                        <label className={styles.sliderLabel}>
                                            High-pass: {highPassFreq} Hz
                                        </label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="300"
                                            step="5"
                                            value={highPassFreq}
                                            onChange={(e) => setHighPassFreq(Number(e.target.value))}
                                            className={styles.slider}
                                        />
                                        <span className={styles.filterDescription}>
                                            Removes low-frequency rumble and hum
                                        </span>
                                    </div>
                                    
                                    <div className={styles.sliderGroup}>
                                        <label className={styles.sliderLabel}>
                                            Low-pass: {lowPassFreq} Hz
                                        </label>
                                        <input
                                            type="range"
                                            min="4000"
                                            max="12000"
                                            step="100"
                                            value={lowPassFreq}
                                            onChange={(e) => setLowPassFreq(Number(e.target.value))}
                                            className={styles.slider}
                                        />
                                        <span className={styles.filterDescription}>
                                            Removes high-frequency noise and hiss
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Reset Controls */}
                            <div className={styles.section}>
                                <Button
                                    onClick={resetToDefaults}
                                    variant="ghost"
                                    className={styles.resetButton}
                                >
                                    Reset to Defaults
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Audio Quality Info */}
                    {audioMetrics && (
                        <div className={styles.metricsSection}>
                            <h3 className={styles.sectionTitle}>Quality Metrics</h3>
                            <div className={styles.metrics}>
                                <div className={styles.metric}>
                                    <span>Processing:</span>
                                    <span className={audioMetrics.processingEnabled ? styles.statusGood : styles.statusBasic}>
                                        {audioMetrics.processingEnabled ? 'Enhanced' : 'Basic'}
                                    </span>
                                </div>
                                <div className={styles.metric}>
                                    <span>Latency:</span>
                                    <span>{Math.round(audioMetrics.latency * 1000)}ms</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}