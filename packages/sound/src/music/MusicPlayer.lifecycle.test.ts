import { afterEach, describe, expect, it, vi } from 'vitest';
import { MusicPlayer } from './MusicPlayer';

vi.mock('howler', () => ({ Howler: { stop: vi.fn(), _audioUnlocked: true }, Howl: vi.fn() }));
vi.mock('@volt/events', () => ({ GetEventDispatcher: () => ({ dispatchEvent: vi.fn() }), SoundManagerEvent: class {} }));

const deferred = () => {
    let resolve: () => void;
    const promise = new Promise<void>(done => { resolve = done; });
    return { promise, resolve: () => resolve() };
};

afterEach(() => vi.useRealTimers());

describe('music playback lifetime', () => {
    it.each(['preload', 'unlockAudio'])('does not restart a stopped song after %s completes', async stage => {
        vi.useFakeTimers();
        const player = new MusicPlayer('');
        const pending = deferred();
        const tick = vi.fn();
        Object.assign(player, { preload: () => stage === 'preload' ? pending.promise : Promise.resolve(), unlockAudio: () => stage === 'unlockAudio' ? pending.promise : Promise.resolve(), tick });
        const playing = player.play('1:1,1:', 1);
        await Promise.resolve();
        player.stop();
        pending.resolve();
        await playing;
        expect(tick).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
