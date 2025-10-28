
import type { Routine } from './types.ts';

export const WARMUP_ROUTINE: Routine = {
    items: [
        { exerciseId: 'wu-polichinelos', duration: '60 segundos' },
        { exerciseId: 'wu-corrida-estacionaria', duration: '60 segundos' },
        { exerciseId: 'wu-rotacao-bracos', duration: '30 segundos para cada lado' },
        { exerciseId: 'wu-agachamento-corporal', duration: '15 repetições' },
        { exerciseId: 'wu-mobilidade-toracica', duration: '10 repetições' },
    ]
};

export const COOLDOWN_ROUTINE: Routine = {
    items: [
        { exerciseId: 'cd-alongamento-peitoral', duration: '30 segundos cada lado' },
        { exerciseId: 'cd-alongamento-dorsal', duration: '30 segundos' },
        { exerciseId: 'cd-alongamento-quadriceps', duration: '30 segundos cada lado' },
        { exerciseId: 'cd-alongamento-posterior', duration: '30 segundos' },
        { exerciseId: 'cd-alongamento-panturrilha', duration: '30 segundos cada lado' },
    ]
};