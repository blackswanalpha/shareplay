export interface SendPipeline {
  processedStream: MediaStream;
  cleanup: () => void;
}

export interface ReceivePipeline {
  gainNode: GainNode;
  cleanup: () => void;
}

export function createSendPipeline(
  ctx: AudioContext,
  sourceStream: MediaStream
): SendPipeline {
  const source = ctx.createMediaStreamSource(sourceStream);

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 80;
  highpass.Q.value = 0.7;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 30;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  const destination = ctx.createMediaStreamDestination();

  source.connect(highpass);
  highpass.connect(compressor);
  compressor.connect(destination);

  return {
    processedStream: destination.stream,
    cleanup: () => {
      source.disconnect();
      highpass.disconnect();
      compressor.disconnect();
    },
  };
}

export function createReceivePipeline(
  ctx: AudioContext,
  remoteStream: MediaStream,
  initialGain: number
): ReceivePipeline {
  const source = ctx.createMediaStreamSource(remoteStream);

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -30;
  compressor.knee.value = 20;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  const gainNode = ctx.createGain();
  gainNode.gain.value = initialGain;

  source.connect(compressor);
  compressor.connect(gainNode);
  gainNode.connect(ctx.destination);

  return {
    gainNode,
    cleanup: () => {
      source.disconnect();
      compressor.disconnect();
      gainNode.disconnect();
    },
  };
}
