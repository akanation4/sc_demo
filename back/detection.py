import numpy as np
import soundfile as sf
import scipy.signal as signal

DEFAULT_FRAME_LENGTH = 4096
NUM_EMBED_BIT = 8
DEFAULT_SAMPLE_RATE = 44100
PSEUDO_RAND_FILE = "dat/prs.dat"


def amplify(signal, target_peak=1.0):

    current_peak = np.max(np.abs(signal))
    if current_peak == 0:
        return signal
    amplification_factor = target_peak / current_peak
    amplified_signal = signal * amplification_factor

    return amplified_signal


def correlate_with_scipy(audio_data, cover_signal):

    correlation = signal.correlate(audio_data, cover_signal, mode="full")
    max_index = np.argmax(correlation)

    start_index = max(max_index - len(cover_signal) + 1, 0)
    end_index = min(start_index + len(cover_signal) , len(audio_data))
    overlapped_data = audio_data[start_index:end_index]

    return overlapped_data


def detect(file_path):

    cover_signal, _ = sf.read("wav/sin_440_44100.wav")
    recording, _ = sf.read(file_path)

    recording = amplify(recording)

    stego_signal = correlate_with_scipy(recording, cover_signal)

    if len(stego_signal) != len(cover_signal):
        raise ValueError("Stego signal and cover signal should have the same length") 

    frame_shift = int(DEFAULT_FRAME_LENGTH)

    total_length = len(stego_signal)
    num_embed_bit = NUM_EMBED_BIT
    embed_length = frame_shift * num_embed_bit
    
    prs = np.loadtxt(PSEUDO_RAND_FILE)

    pointer = (total_length - embed_length) // 2

    detected_bit = np.zeros(num_embed_bit)

    for i in range(num_embed_bit):
        frame = (
            stego_signal[pointer : (pointer + frame_shift)]
            - cover_signal[pointer : (pointer + frame_shift)]
        )

        comp = np.correlate(frame, prs, "full")
        maxp = np.argmax(comp)
        if comp[maxp] > 0:
            detected_bit[i] = 1
        else:
            detected_bit[i] = 0

        pointer += frame_shift

    watermark = "".join([str(int(bit)) for bit in detected_bit])

    return watermark