
export const useAudioAnalysis = (stream: MediaStream | null) => {
  const checkAudioLevel = () => {
    if (!stream) return;

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      return average > 30;
    } catch (error) {
      console.error('Error analyzing audio:', error);
      return false;
    }
  };

  return { checkAudioLevel };
};
