# CactusClub — OnlyFans & Fanvue Agency CRM & Admin Dashboard

A high-performance, pixel-perfect Agency Management & Live Chatter Workstation built for OnlyFans, Fanvue, and Fansly creator management agencies.

![CactusClub](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Features

### 1. Admin Analytics Dashboard (`/admin`)
* **Creator Earnings Overview**: Multi-period selector (*Yesterday*, *Today*, *This week*, *This month*) with breakdown across 6 revenue channels:
  * Subscriptions
  * Posts
  * Messages
  * Tips
  * Referrals
  * Streams
* **Employee Sales Bézier Chart**: Interactive SVG Bézier curve with peak hover tooltips matching agency revenue timelines.
* **Team Performance Leaderboard**: Chatter sales ranking, conversion percentage, and customer satisfaction scores.
* **Shift Manager & Scheduled Hours**: Weekly operator roster with live shift statuses (Simon, Nella, Florent, Heron, Ilan).
* **Multi-Platform Support**: Fast switching between OnlyFans, Fanvue, and Fansly.
* **Live Agency Alert Drawer**: Real-time notifications for unlocked PPVs, high tips, and target completions.

### 2. Messages Pro Live Chatter Workstation (`/` or `/messages`)
* **3-Column Studio Desk**:
  * **Left Column**: Fans queue with custom filter pills (*All*, *Pinned*, *Priority*, *Unread*, *With Tips*), unread badges, spending indicators ($0 - $860+), and voice memo recorder.
  * **Center Column**: Live chat conversation stream with chatter identity tags (*SIMON*, *Nella*), quoted mass broadcast cards, inline translation, PPV media locking/unlocking, audio waveform voice players, and instant script execution via `/` shortcut.
  * **Right Column**: Fan CRM insights (*Top 5% Spending Power*, *Low Chargeback Risk*, *Subscription History*, *Tagging Engine*, *Interactive Notes*, and simulated tip celebration with confetti).

### 3. Global Productivity & Studio Tools
* **Safe For Work (SFW) Mode**: One-click instant blur filter on all sensitive creator media.
* **Internationalization (i18n)**: Instant switching between **Français (FR)**, **English (EN)**, **Español (ES)**, and **Deutsch (DE)**.
* **Dark / Light Mode**: Seamless theme switching with persistent user preference.
* **Web Audio Sound Effects**: Custom synthesizer for message sent, message received, and PPV unlock / cash chime.
* **Studio Modals**:
  * Vault Pro Media Asset Gallery
  * Canned Script Library & Shortcut Manager
  * Mass DM / Campaign Dispatcher
  * Locked PPV Generator with Price Tags
  * Multi-Creator Account Linker
  * GIF Search & Picker
  * Automated Message Scheduler

---

## 🛠️ Tech Stack

* **Framework**: [React 19](https://react.dev/)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Audio FX**: Native Web Audio API
* **Micro-interactions**: Canvas Confetti

---

## 💻 Getting Started

### Prerequisites
* Node.js 18+ or 20+
* npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/businessofsmc-dev/Cactusclub.git

# Navigate into project directory
cd Cactusclub

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will be running locally at:
* **Admin Dashboard**: `http://localhost:5173/admin`
* **Live Chat Workstation**: `http://localhost:5173/`

### Production Build

```bash
npm run build
```

---

## 📜 License

Private agency software for CactusClub. All rights reserved.
