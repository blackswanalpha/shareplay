/**
 * Enhanced Audio Processing Module
 * Provides advanced noise reduction and audio clarity improvements
 */

export interface AudioProcessingConfig {
    noiseSuppression: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
    sampleRate?: number;
    channelCount?: number;
    latency?: number;
}

export interface NoiseGateConfig {
    threshold: number; // -60 to 0 dB
    ratio: number; // 1 to 20
    attack: number; // 0 to 1000 ms
    release: number; // 0 to 3000 ms
}

export interface FilterConfig {
    highPassFreq: number; // Hz
    lowPassFreq: number; // Hz
    enableBandpass: boolean;
}

export class AudioProcessor {
    private audioContext: AudioContext | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private gainNode: GainNode | null = null;
    private noiseGateNode: DynamicsCompressorNode | null = null;
    private highPassFilter: BiquadFilterNode | null = null;
    private lowPassFilter: BiquadFilterNode | null = null;
    private outputGainNode: GainNode | null = null;
    private destinationNode: MediaStreamAudioDestinationNode | null = null;
    private analyserNode: AnalyserNode | null = null;
    
    // Noise gate parameters
    private noiseThreshold = -50; // dB
    private gateRatio = 10;
    private attackTime = 0.003; // 3ms
    private releaseTime = 0.1; // 100ms
    
    // Filter frequencies
    private highPassFreq = 85; // Hz - removes low frequency rumble
    private lowPassFreq = 8000; // Hz - removes high frequency noise

    constructor() {
        this.initializeAudioContext();
    }

    private initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 48000,
                latencyHint: 'interactive'
            });
        } catch (error) {
            console.error('Failed to create AudioContext:', error);
        }
    }

    /**
     * Get enhanced media constraints with advanced noise reduction
     */
    public getEnhancedConstraints(): MediaTrackConstraints {
        return {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // Advanced constraints for better quality
            sampleRate: { ideal: 48000 },
            channelCount: { ideal: 1 }, // Mono for voice chat
            latency: { ideal: 0.01 }, // 10ms latency
            // Gain control
            volume: { ideal: 1.0 },
            // Advanced echo cancellation
            googEchoCancellation: true,
            googAutoGainControl: true,
            googNoiseSuppression: true,
            googHighpassFilter: true,
            googTypingNoiseDetection: true,
            // Additional Chrome-specific constraints
            googAudioMirroring: false,
            googDAEchoCancellation: true,
            googNoiseReduction: true,
        } as MediaTrackConstraints;
    }

    /**
     * Process audio stream with advanced filtering and noise reduction
     */
    public async processAudioStream(inputStream: MediaStream): Promise<MediaStream> {
        if (!this.audioContext || !inputStream) {
            return inputStream;
        }

        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Create audio processing chain
            this.sourceNode = this.audioContext.createMediaStreamSource(inputStream);
            
            // Input gain control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 1.2; // Slight boost
            
            // High-pass filter (removes low frequency noise/rumble)
            this.highPassFilter = this.audioContext.createBiquadFilter();
            this.highPassFilter.type = 'highpass';
            this.highPassFilter.frequency.value = this.highPassFreq;
            this.highPassFilter.Q.value = 0.7;
            
            // Low-pass filter (removes high frequency noise)
            this.lowPassFilter = this.audioContext.createBiquadFilter();
            this.lowPassFilter.type = 'lowpass';
            this.lowPassFilter.frequency.value = this.lowPassFreq;
            this.lowPassFilter.Q.value = 0.7;
            
            // Noise gate (dynamic compression to reduce background noise)
            this.noiseGateNode = this.audioContext.createDynamicsCompressor();
            this.noiseGateNode.threshold.value = this.noiseThreshold;
            this.noiseGateNode.ratio.value = this.gateRatio;
            this.noiseGateNode.attack.value = this.attackTime;
            this.noiseGateNode.release.value = this.releaseTime;
            this.noiseGateNode.knee.value = 5;
            
            // Output gain for final level adjustment
            this.outputGainNode = this.audioContext.createGain();
            this.outputGainNode.gain.value = 0.9;
            
            // Analyser for monitoring (optional)
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 2048;
            
            // Create destination stream
            this.destinationNode = this.audioContext.createMediaStreamDestination();
            
            // Connect the audio processing chain
            this.sourceNode
                .connect(this.gainNode)
                .connect(this.highPassFilter)
                .connect(this.lowPassFilter)
                .connect(this.noiseGateNode)
                .connect(this.outputGainNode)
                .connect(this.analyserNode)
                .connect(this.destinationNode);
            
            console.log('Audio processing chain initialized successfully');
            return this.destinationNode.stream;
            
        } catch (error) {
            console.error('Failed to process audio stream:', error);
            return inputStream; // Return original stream on error
        }
    }

    /**
     * Get real-time audio level for monitoring
     */
    public getAudioLevel(): number {
        if (!this.analyserNode) return 0;
        
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        return sum / dataArray.length / 255; // Normalize to 0-1
    }

    /**
     * Adjust noise gate threshold dynamically
     */
    public setNoiseThreshold(thresholdDb: number) {
        this.noiseThreshold = Math.max(-80, Math.min(0, thresholdDb));
        if (this.noiseGateNode) {
            this.noiseGateNode.threshold.value = this.noiseThreshold;
        }
    }

    /**
     * Adjust filter frequencies
     */
    public setFilterFrequencies(highPass: number, lowPass: number) {
        this.highPassFreq = Math.max(20, Math.min(1000, highPass));
        this.lowPassFreq = Math.max(2000, Math.min(20000, lowPass));
        
        if (this.highPassFilter) {
            this.highPassFilter.frequency.value = this.highPassFreq;
        }
        if (this.lowPassFilter) {
            this.lowPassFilter.frequency.value = this.lowPassFreq;
        }
    }

    /**
     * Cleanup audio processing resources
     */
    public cleanup() {
        try {
            // Disconnect nodes safely
            if (this.sourceNode) {
                try {
                    this.sourceNode.disconnect();
                } catch (e) {
                    console.warn('Error disconnecting source node:', e);
                }
            }

            // Close audio context safely with timeout
            if (this.audioContext && this.audioContext.state !== 'closed') {
                try {
                    // Don't await - let it close asynchronously
                    this.audioContext.close().catch(e => 
                        console.warn('Error closing audio context:', e)
                    );
                } catch (e) {
                    console.warn('Error initiating audio context close:', e);
                }
            }
        } catch (error) {
            console.error('Error during audio cleanup:', error);
        }
        
        // Reset all references
        this.audioContext = null;
        this.sourceNode = null;
        this.gainNode = null;
        this.noiseGateNode = null;
        this.highPassFilter = null;
        this.lowPassFilter = null;
        this.outputGainNode = null;
        this.destinationNode = null;
        this.analyserNode = null;
    }

    /**
     * Check if browser supports advanced audio processing
     */
    public static isAdvancedProcessingSupported(): boolean {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return false;
            
            const tempContext = new AudioContext();
            const hasRequiredNodes = !!(
                typeof tempContext.createGain === 'function' &&
                typeof tempContext.createBiquadFilter === 'function' &&
                typeof tempContext.createDynamicsCompressor === 'function' &&
                typeof tempContext.createMediaStreamDestination === 'function'
            );
            
            tempContext.close();
            return hasRequiredNodes;
        } catch {
            return false;
        }
    }

    /**
     * Apply real-time noise reduction using spectral subtraction
     */
    private async setupSpectralSubtraction() {
        if (!this.audioContext || !this.analyserNode) return;
        
        // This would require a more complex implementation with ScriptProcessorNode
        // or AudioWorklet for real-time spectral analysis and noise subtraction
        // For now, we rely on the browser's built-in noise suppression and our filter chain
    }

    /**
     * Get processing latency estimate
     */
    public getProcessingLatency(): number {
        if (!this.audioContext) return 0;
        return this.audioContext.baseLatency + this.audioContext.outputLatency;
    }
}

/**
 * Utility function to create enhanced audio stream
 */
export async function createEnhancedAudioStream(processor: AudioProcessor): Promise<MediaStream | null> {
    try {
        // Get user media with enhanced constraints
        const constraints = processor.getEnhancedConstraints();
        const rawStream = await navigator.mediaDevices.getUserMedia({ 
            audio: constraints,
            video: false 
        });
        
        // Process the stream if advanced processing is supported
        if (AudioProcessor.isAdvancedProcessingSupported()) {
            console.log('Applying advanced audio processing...');
            return await processor.processAudioStream(rawStream);
        } else {
            console.log('Using basic audio processing (browser built-in)');
            return rawStream;
        }
        
    } catch (error) {
        console.error('Failed to create enhanced audio stream:', error);
        return null;
    }
}

/**
 * Audio quality metrics
 */
export interface AudioQualityMetrics {
    snr: number; // Signal-to-noise ratio
    level: number; // Current audio level
    latency: number; // Processing latency
    processingEnabled: boolean;
}

export function getAudioQualityMetrics(processor: AudioProcessor): AudioQualityMetrics {
    return {
        snr: 0, // Would need implementation for SNR calculation
        level: processor.getAudioLevel(),
        latency: processor.getProcessingLatency(),
        processingEnabled: AudioProcessor.isAdvancedProcessingSupported()
    };
}