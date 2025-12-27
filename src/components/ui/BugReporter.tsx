"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Bug, Send, X, Camera, Paperclip, AlertTriangle } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./BugReporter.module.css";

interface BugReportData {
    title: string;
    description: string;
    category: string;
    severity: string;
    reproductionSteps: string;
    userAgent: string;
    url: string;
    timestamp: string;
    userId?: string;
    userEmail?: string;
    roomCode?: string;
    browserInfo: BrowserInfo;
    performanceInfo: PerformanceInfo;
    networkInfo: NetworkInfo;
    screenshot?: string;
    logs: LogEntry[];
}

interface BrowserInfo {
    userAgent: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    onLine: boolean;
    viewport: string;
}

interface PerformanceInfo {
    memoryUsage?: number;
    connectionType?: string;
    loadTime?: number;
}

interface NetworkInfo {
    onLine: boolean;
    connectionType?: string;
    effectiveType?: string;
}

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    source?: string;
}

interface BugReporterProps {
    roomCode?: string;
    isOpen?: boolean;
    onClose?: () => void;
    trigger?: "manual" | "error" | "auto";
}

const SEVERITY_OPTIONS = [
    { value: "low", label: "Low - Minor issue", color: "#22c55e" },
    { value: "medium", label: "Medium - Moderate impact", color: "#f59e0b" },
    { value: "high", label: "High - Significant impact", color: "#ef4444" },
    { value: "critical", label: "Critical - Blocks functionality", color: "#dc2626" },
];

const CATEGORY_OPTIONS = [
    "Ghost Rooms",
    "Video Sync Issues", 
    "Audio Problems",
    "Connection Issues",
    "User Interface",
    "Performance",
    "Security",
    "Other"
];

export default function BugReporter({ roomCode, isOpen = false, onClose, trigger = "manual" }: BugReporterProps) {
    const { user } = useUser();
    const [open, setOpen] = useState(isOpen);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Other",
        severity: "medium",
        reproductionSteps: "",
    });
    
    const [systemInfo, setSystemInfo] = useState<{
        browser: BrowserInfo;
        performance: PerformanceInfo;
        network: NetworkInfo;
    }>({
        browser: {} as BrowserInfo,
        performance: {} as PerformanceInfo,
        network: {} as NetworkInfo,
    });
    
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen !== open) {
            setOpen(isOpen);
        }
    }, [isOpen]);

    useEffect(() => {
        if (open) {
            collectSystemInfo();
            collectLogs();
            
            // Auto-populate for ghost room issues
            if (trigger === "error" || roomCode) {
                setFormData(prev => ({
                    ...prev,
                    category: "Ghost Rooms",
                    severity: "high",
                    title: roomCode ? `Ghost room issue in room ${roomCode}` : "Unexpected error occurred",
                }));
            }
        }
    }, [open, trigger, roomCode]);

    const collectSystemInfo = () => {
        const browserInfo: BrowserInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
        };

        const performanceInfo: PerformanceInfo = {
            loadTime: performance.now(),
        };

        // @ts-ignore - Modern browsers support this
        if ('memory' in performance) {
            // @ts-ignore
            performanceInfo.memoryUsage = performance.memory.usedJSHeapSize;
        }

        // @ts-ignore - Modern browsers support this
        if ('connection' in navigator) {
            // @ts-ignore
            performanceInfo.connectionType = navigator.connection?.effectiveType;
        }

        const networkInfo: NetworkInfo = {
            onLine: navigator.onLine,
        };

        // @ts-ignore - Modern browsers support this
        if ('connection' in navigator) {
            // @ts-ignore
            networkInfo.connectionType = navigator.connection?.type;
            // @ts-ignore
            networkInfo.effectiveType = navigator.connection?.effectiveType;
        }

        setSystemInfo({
            browser: browserInfo,
            performance: performanceInfo,
            network: networkInfo,
        });
    };

    const collectLogs = () => {
        // Collect recent console logs and errors from sessionStorage/localStorage
        const storedLogs: LogEntry[] = [];
        
        try {
            // Check for stored error logs
            const errorLogs = localStorage.getItem('shareplay_error_logs');
            if (errorLogs) {
                const parsed = JSON.parse(errorLogs);
                storedLogs.push(...parsed.slice(-10)); // Last 10 errors
            }

            // Add WebSocket debug logs if available
            const wsLogs = localStorage.getItem('shareplay_ws_logs');
            if (wsLogs) {
                const parsed = JSON.parse(wsLogs);
                storedLogs.push(...parsed.slice(-10));
            }
        } catch (e) {
            console.warn('Failed to collect stored logs:', e);
        }

        // Add current session info
        storedLogs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Bug report initiated - Room: ${roomCode || 'none'}, Trigger: ${trigger}`,
            source: 'bug-reporter'
        });

        setLogs(storedLogs);
    };

    const takeScreenshot = async () => {
        try {
            // @ts-ignore - Modern browsers support this
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                // @ts-ignore
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { mediaSource: 'screen' }
                });
                
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                video.onloadedmetadata = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(video, 0, 0);
                    
                    const dataURL = canvas.toDataURL('image/png');
                    setScreenshot(dataURL);
                    
                    // Stop the stream
                    stream.getTracks().forEach(track => track.stop());
                };
            }
        } catch (error) {
            console.warn('Screenshot capture failed:', error);
            alert('Screenshot capture not supported or permission denied');
        }
    };

    const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setScreenshot(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const bugReport: BugReportData = {
                ...formData,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userId: user?.id,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                roomCode: roomCode,
                browserInfo: systemInfo.browser,
                performanceInfo: systemInfo.performance,
                networkInfo: systemInfo.network,
                screenshot: screenshot || undefined,
                logs: logs,
            };

            // In a real implementation, you would send this to your backend
            console.log('Bug report submitted:', bugReport);
            
            // Store locally as backup
            const existingReports = JSON.parse(localStorage.getItem('shareplay_bug_reports') || '[]');
            existingReports.push(bugReport);
            localStorage.setItem('shareplay_bug_reports', JSON.stringify(existingReports.slice(-50))); // Keep last 50
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSubmitted(true);
            
            // Auto-close after success
            setTimeout(() => {
                handleClose();
            }, 2000);
            
        } catch (error) {
            console.error('Failed to submit bug report:', error);
            alert('Failed to submit bug report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        onClose?.();
        // Reset form after animation
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                title: "",
                description: "",
                category: "Other",
                severity: "medium",
                reproductionSteps: "",
            });
            setScreenshot(null);
            setLogs([]);
        }, 200);
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogHeader>
                <DialogTitle className={styles.title}>
                    <Bug size={20} />
                    Report a Bug
                </DialogTitle>
                <p className={styles.description}>
                    Help us improve SharePlay by reporting issues you encounter.
                </p>
            </DialogHeader>

            <DialogContent className={styles.content}>
                {!submitted ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Issue Title *</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Brief description of the issue"
                                required
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className={styles.select}
                                >
                                    {CATEGORY_OPTIONS.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Severity</label>
                                <select
                                    value={formData.severity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                                    className={styles.select}
                                >
                                    {SEVERITY_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what happened in detail..."
                                className={styles.textarea}
                                rows={4}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Steps to Reproduce</label>
                            <textarea
                                value={formData.reproductionSteps}
                                onChange={(e) => setFormData(prev => ({ ...prev, reproductionSteps: e.target.value }))}
                                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                                className={styles.textarea}
                                rows={3}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Attachments</label>
                            <div className={styles.attachmentRow}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={takeScreenshot}
                                    className={styles.attachmentButton}
                                >
                                    <Camera size={16} />
                                    Take Screenshot
                                </Button>
                                
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={styles.attachmentButton}
                                >
                                    <Paperclip size={16} />
                                    Attach File
                                </Button>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileAttachment}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            
                            {screenshot && (
                                <div className={styles.screenshotPreview}>
                                    <img src={screenshot} alt="Screenshot" />
                                    <button
                                        type="button"
                                        onClick={() => setScreenshot(null)}
                                        className={styles.removeScreenshot}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.systemInfo}>
                            <h4>System Information</h4>
                            <div className={styles.infoGrid}>
                                <span>Browser:</span> <span>{systemInfo.browser.userAgent?.split(' ')[0]}</span>
                                <span>Platform:</span> <span>{systemInfo.browser.platform}</span>
                                <span>Online:</span> <span>{systemInfo.network.onLine ? 'Yes' : 'No'}</span>
                                <span>Room Code:</span> <span>{roomCode || 'None'}</span>
                                {logs.length > 0 && (
                                    <>
                                        <span>Logs Collected:</span> <span>{logs.length} entries</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className={styles.successMessage}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>Bug Report Submitted!</h3>
                        <p>Thank you for helping us improve SharePlay. We'll investigate this issue.</p>
                    </div>
                )}
            </DialogContent>

            <DialogFooter>
                {!submitted ? (
                    <>
                        <Button variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!formData.title || !formData.description || isSubmitting}
                            className={styles.submitButton}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className={styles.spinner} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Submit Report
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <Button onClick={handleClose}>Close</Button>
                )}
            </DialogFooter>
        </Dialog>
    );
}

// Hook for easy integration
export function useBugReporter(roomCode?: string) {
    const [isOpen, setIsOpen] = useState(false);
    
    const reportBug = (trigger: "manual" | "error" | "auto" = "manual") => {
        setIsOpen(true);
        
        // Log the bug report trigger for analytics
        if (typeof window !== 'undefined') {
            const logs = JSON.parse(localStorage.getItem('shareplay_bug_reports') || '[]');
            logs.push({
                timestamp: new Date().toISOString(),
                trigger,
                roomCode,
                url: window.location.href,
            });
            localStorage.setItem('shareplay_bug_reports', JSON.stringify(logs.slice(-100)));
        }
    };
    
    const closeBugReporter = () => {
        setIsOpen(false);
    };
    
    return {
        isOpen,
        reportBug,
        closeBugReporter,
        BugReporter: (props: Omit<BugReporterProps, 'isOpen' | 'onClose' | 'roomCode'>) => (
            <BugReporter 
                {...props} 
                roomCode={roomCode}
                isOpen={isOpen} 
                onClose={closeBugReporter} 
            />
        ),
    };
}