# Project Memory Log

> Active Location: instructions/memory.instructions.md
> This file is managed by the `memory-manager` skill.
> It persists context across AI chat sessions to prevent knowledge loss.
> Do NOT manually edit this file unless necessary.

---

## 📝 Session Checkpoint: 2026-09-15

- **Active Memory Path:** instructions/memory.instructions.md
- **Current SDLC Phase:** Implementation (Sprint 2: Property & Room Management)
- **Active Artifacts:**
  - `docs/prd-feature-singgahin-02092026.md` — Status: ✅ Finalized
  - `spec/spec-architecture-core.md` — Status: ✅ Updated (Added ADR-007 Hybrid Navigation)
  - `plan/feature-singgahin-property-renting-app-v1.0.md` — Status: 🔄 In Progress (TASK-011 Completed, Next: TASK-012)
- **Achieved Milestones:**
  - Selesai implementasi penuh TASK-011 (Frontend Property Management: Form properti 6 kategori, reverse geocoding OpenCage, Leaflet interactive map pin, TenantPropertyListPage, TenantPropertyCreatePage, TenantPropertyEditPage).
  - Implementasi Navbar Ultra-Clean (`Navbar.tsx`): Navbar kini hanya menampilkan Logo di kiri dan Avatar di kanan tanpa teks "Dasbor Pemilik", "Mode Tamu", atau "Pemilik (Tenant)" yang mengotori header.
  - Avatar Dropdown Interaktif: Saat avatar diklik, muncul dropdown card mengambang yang memuat info akun (Nama, Email, Badge Jenis Akun dengan palet warna biru primer konsisten tanpa warna hijau), tautan Dasbor Properti (khusus Tenant), Cari Penginapan, Profil Saya, dan tombol Keluar.
  - Penyesuaian Palet Warna Konsisten: Seluruh warna hijau/zamrud dihapus dan diganti dengan warna biru primer (`primary-600` / `primary-50`) di Navbar, Badge, dan TenantSidebar.
  - Implementasi Desktop Left Sidebar (`TenantSidebar.tsx` & `TenantLayout.tsx`) untuk area operasional pemilik properti di desktop.
  - Implementasi Mobile Bottom Navigation Bar (`MobileBottomNav.tsx`) untuk pengalaman mobile ramah jempol (pola Airbnb/Traveloka).
  - Dokumentasi resmi kesepakatan pola navigasi ganda pada `spec-architecture-core.md` (ADR-007) dan `plan` (UI-001).
- **Dead-Ends (Do NOT Repeat):**
  - **Attempted:** Menaruh seluruh tombol aksi, RoleBadge, dan teks user di satu baris Navbar mobile horizontal.
  - **Reason:** Menyebabkan horizontal overflow dan pemotongan elemen pada layar sempit (<390px). Diatasi dengan memindahkan navigasi tab mobile ke `MobileBottomNav.tsx` dan merampingkan top header.
- **Updated Files:**
  - `spec/spec-architecture-core.md` — Menambahkan ADR-007 (Hybrid Navigation Pattern).
  - `plan/feature-singgahin-property-renting-app-v1.0.md` — Menandai TASK-011 selesai [x] dan menambahkan aturan UI-001.
  - `frontend/src/components/organisms/Navbar.tsx` — Navbar Hybrid dengan deteksi rute dinamis dan switcher mode.
  - `frontend/src/components/organisms/TenantSidebar.tsx` — Sidebar navigasi dasbor desktop tenant.
  - `frontend/src/components/organisms/TenantLayout.tsx` — Wrapper layout dasbor tenant.
  - `frontend/src/components/organisms/MobileBottomNav.tsx` — Komponen bar navigasi bawah layar ponsel.
  - `frontend/src/components/organisms/__tests__/navigation.test.tsx` — Test suite untuk Navbar, TenantSidebar, dan MobileBottomNav.
  - `frontend/src/App.tsx` — Penambahan rute nested dasbor tenant di bawah TenantLayout.
- **Decisions Made:**
  - **ADR-007 & UI-001:** Adopsi Pola Navigasi Hybrid (Top Navbar untuk Publik/User di desktop, Left Sidebar untuk dasbor Tenant di desktop, dan Mobile Bottom Nav untuk seluruh peran di layar ponsel).
- **Next Action / Pending:**
  - TASK-012: Frontend Galeri Foto Uploader Cloudinary (1-6 foto, set cover) & Form konfigurasi tipe kamar.

<!-- checkpoint-tail: TASK-011 dan Navigasi Hybrid (Navbar dinamis, TenantSidebar desktop, MobileBottomNav ponsel) selesai, teruji 84 tes lulus, dan terkunci di ADR-007/UI-001. -->

---
