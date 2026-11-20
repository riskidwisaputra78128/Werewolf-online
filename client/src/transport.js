// Transport: Online (Socket.IO) atau Offline (engine lokal + bot) — API yang sama
import { io } from 'socket.io-client';
import { Game } from '../../shared/engine.js';

class Emitter {
  constructor() { this.h = {}; }
  on(ev, fn) { (this.h[ev] ||= []).push(fn); return this; }
  fire(ev, ...a) { (this.h[ev] || []).forEach((f) => f(...a)); }
}

export class OnlineTransport extends Emitter {
  constructor(sid, url) {
    super();
    this.mode = 'online';
    this.socket = io(url || undefined, { auth: { sid }, transports: ['websocket', 'polling'], reconnectionDelayMax: 4000 });
    for (const ev of ['state', 'rooms', 'kicked', 'left', 'fatal']) this.socket.on(ev, (d) => this.fire(ev, d));
    this.socket.on('connect', () => this.fire('status', 'online'));
    this.socket.on('disconnect', () => this.fire('status', 'offline'));
    this.socket.on('connect_error', () => this.fire('status', 'error'));
  }
  call(ev, payload) {
    return new Promise((res) => {
      if (!this.socket.connected) return res({ ok: false, error: 'Tidak terhubung ke server.' });
      const t = setTimeout(() => res({ ok: false, error: 'Server tidak merespons.' }), 8000);
      this.socket.emit(ev, payload ?? {}, (r) => { clearTimeout(t); res(r || { ok: true }); });
    });
  }
}

export class OfflineTransport extends Emitter {
  constructor() { super(); this.mode = 'offline'; this.game = null; }
  call(ev, p = {}) {
    const me = 'me_local';
    const g = this.game;
    const ok = (r) => Promise.resolve(r || { ok: true });
    switch (ev) {
      case 'create': {
        this.game?.destroy();
        this.game = new Game({ code: 'OFFLINE', name: 'Desa Latihan', hostId: me, hostName: p.name, hostIsMod: false, isPublic: false, onChange: (gm) => queueMicrotask(() => this.fire('state', gm.view(me))) });
        for (let i = 0; i < (p.bots ?? 7); i++) this.game.addBot(me);
        return ok({ ok: true, code: 'OFFLINE' });
      }
      case 'rooms': return ok({ ok: true, rooms: [] });
      case 'leave': this.game?.destroy(); this.game = null; this.fire('left'); return ok();
    }
    if (!g) return ok({ ok: false, error: 'Belum ada game.' });
    const map = {
      start: () => g.start(me), settings: () => g.setSettings(me, p), moderator: () => g.setModerator(me, !!p.on), addBot: () => g.addBot(me),
      kick: () => g.kick(me, p.target), act: () => g.act(me, p), vote: () => g.vote(me, p.target), hunter: () => g.hunterShoot(me, p.target),
      chat: () => g.say(me, p.text), advance: () => g.advance(me), pause: () => g.pause(me), restart: () => g.restart(me),
    };
    return ok(map[ev] ? map[ev]() : { ok: false });
  }
}
