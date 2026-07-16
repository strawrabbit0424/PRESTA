let audioCtx: AudioContext | null = null

export function activarAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext()
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
}

export function reproducirBeep() {
    if (!audioCtx) return
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.4)
}