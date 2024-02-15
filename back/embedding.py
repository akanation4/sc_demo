import soundfile as sf
import numpy as np
import logging

DEFAULT_SAMPLE_RATE = 44100
DEFAULT_FRAME_LENGTH = 4096
DEFAULT_CONTROL_STRENGTH = 0.3
DEFAULT_SOUND_FILE = 'wav/sin_440_44100.wav'  
PSEUDO_RAND_FILE = 'dat/prs.dat'


def gen_bit(text: str) -> str:
    """
    テキストをビット列に変換する
    """

    ascii_value = ord(text)
    binary_representation = bin(ascii_value)[2:]
    return binary_representation.zfill(8)


def embed(text: str, frame_length=DEFAULT_FRAME_LENGTH, control_strength=DEFAULT_CONTROL_STRENGTH, sound_file=DEFAULT_SOUND_FILE) -> str:
    """
    透かし信号を埋め込む
    """

    try:
        prs = np.loadtxt(PSEUDO_RAND_FILE)

        cover_signal, sample_rate = sf.read(sound_file)
        bit = gen_bit(text)

        frame_shift = int(frame_length)
        num_embed_bit = int(len(bit))

        total_length = len(cover_signal)
        embed_length = frame_shift * num_embed_bit

        pointer = (total_length - embed_length) // 2

        watermarked_signal = np.zeros(embed_length)

        for i in range(num_embed_bit):
            frame = cover_signal[pointer : (pointer + frame_length)]
            alpha = control_strength * np.max(np.abs(frame))

            if bit[i] == '1':
                watermarked_frame = frame + alpha * prs
            else:
                watermarked_frame = frame - alpha * prs

            watermarked_signal[frame_shift * i : frame_shift * (i + 1)] = watermarked_frame[0 : frame_shift]

        start_part = cover_signal[0 : (total_length - embed_length) // 2]
        end_part = cover_signal[(total_length - embed_length) // 2 + embed_length :]
        watermarked_signal = np.concatenate((start_part, watermarked_signal, end_part))

        wm_filepath = DEFAULT_SOUND_FILE.replace('.wav', '_wm.wav')
        sf.write(wm_filepath, watermarked_signal, sample_rate)

        return wm_filepath
    except Exception as e:
        logging.error(e, exc_info=True)
        raise
