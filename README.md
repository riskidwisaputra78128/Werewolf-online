# 🐺 Werewolf Online — Desa 3D Multiplayer

Game social deduction Werewolf (mirip Mafia) yang dimainkan bareng teman langsung di browser: buat room, bagikan kode/link, lalu main realtime di desa 3D dengan siklus siang–malam.

**Stack:** Node.js + Express + Socket.IO (server, realtime) · Three.js + Vite (client) · engine game bersama di `shared/engine.js` (dipakai server & mode offline).

## Fitur
- **Room & lobby:** buat room (publik/privat), daftar room aktif, gabung lewat kode atau link undangan `https://domain-kamu/#KODE`, maks 16 pemain.
- **Host = Moderator (opsional):** moderator tidak ikut bermain, melihat semua peran & aksi malam, bisa *lanjut fase*, jeda timer, ulang game, dan mengeluarkan pemain. Tanpa moderator, game berjalan otomatis pakai timer.
- **9 peran:** Werewolf, Seer, Doctor, Hunter, Hakim (suara ×2), Guardian, Witcher (ramuan penyembuh & racun), Villager, Moderator. Host memilih peran mana yang aktif dan jumlah werewolf.
- **Alur fase:** Pembagian peran → Malam → Fajar → Diskusi → Voting → Putusan → (Panah Hunter) → … → Menang.
- **Chat 3 kanal:** umum (siang), rahasia serigala (malam), arwah (pemain mati). Pesan muncul sebagai gelembung di atas avatar.
- **Desa 3D:** terrain, hutan pinus, rumah kayu, api unggun, langit atmosfer, bulan & bintang, kunang-kunang. Klik avatar untuk memilih target, putar/zoom kamera, nisan untuk pemain mati, dan werewolf berubah wujud di akhir game.
- **Bot pengisi:** host bisa menambah bot agar minimal 4 pemain. Ada juga **latihan offline vs 7 bot** tanpa server.
- **Tangguh:** reconnect otomatis (refresh tab tidak keluar dari game), host berpindah otomatis jika host keluar, pemain yang dikeluarkan tidak bisa masuk lagi, semua aksi divalidasi di server (anti-curang: klien hanya menerima peran yang boleh ia lihat).

## Menjalankan lokal
Butuh Node.js 18+.
```bash
npm install
npm run build     # build client ke client/dist
npm start         # buka http://localhost:3000
```
Mode pengembangan (hot reload): `npm run dev` → buka http://localhost:5173.

Main bareng di jaringan yang sama (WiFi kantor/rumah): buka `http://IP-komputer-kamu:3000` dari HP/laptop teman.

## Deploy gratis agar bisa dimainkan dari mana saja
**Render.com (paling mudah)**
1. Upload folder ini ke repo GitHub.
2. Di Render: *New → Blueprint*, pilih repo itu. File `render.yaml` sudah menyiapkan semuanya.
3. Setelah selesai, kamu mendapat URL `https://werewolf-online-xxxx.onrender.com`. Bagikan ke teman.
> Paket gratis Render "tidur" setelah 15 menit tanpa pengunjung, jadi pembukaan pertama butuh ±30–50 detik.

**Railway / Fly.io / VPS:** pakai `Dockerfile` yang tersedia, atau jalankan `npm install --include=dev && npm run build && npm start`. Server membaca `PORT` dari environment.

> Catatan: Google Apps Script tidak mendukung WebSocket, jadi versi ini butuh hosting Node.js seperti di atas.

## Aturan peran
| Peran | Aksi |
|---|---|
| 🐺 Werewolf | Malam: memilih mangsa bersama (suara terbanyak). Bisa chat rahasia. |
| 🔮 Seer | Malam: menerawang 1 pemain, tahu apakah dia werewolf. |
| 🩺 Doctor | Malam: melindungi 1 pemain (boleh diri sendiri, tidak boleh orang yang sama 2 malam berturut-turut). |
| 🛡️ Guardian | Malam: mengawal 1 pemain. Jika diserang, Guardian yang gugur menggantikannya. |
| 🧪 Witcher | 1× ramuan penyembuh (selamatkan korban malam itu) dan 1× racun. |
| 🏹 Hunter | Saat mati, menembak 1 pemain lain. |
| ⚖️ Hakim | Suara voting bernilai 2. |
| 🧑‍🌾 Villager | Diskusi & voting. |

**Menang:** Warga menang jika semua werewolf mati. Werewolf menang jika jumlahnya ≥ jumlah warga hidup.

## Struktur
```
shared/engine.js        Aturan game, fase, peran, voting, chat, bot, view per pemain
server/index.js         Express + Socket.IO: room, join/leave, kick, reconnect
client/index.html       UI (lobby, HUD, panel, modal)
client/src/main.js      Logika UI & render state
client/src/village.js   Desa 3D & avatar
client/src/transport.js Online (Socket.IO) / Offline (engine lokal)
client/src/characters.js, textures.js, noise.js, audio.js   Aset prosedural
```

## Event Socket.IO
`create {name, roomName, hostIsMod, isPublic}` · `join {code, name}` · `leave` · `rooms` · `start` · `settings {...}` · `moderator {on}` · `addBot` · `kick {target}` · `act {target, type}` · `vote {target|'skip'}` · `hunter {target}` · `chat {text}` · `advance` · `pause` · `restart` → server mengirim `state` (dipersonalisasi per pemain) dan `rooms`.
