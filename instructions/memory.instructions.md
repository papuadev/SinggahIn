# Project Memory Log

> Active Location: instructions/memory.instructions.md
> This file is managed by the `memory-manager` skill.
> It persists context across AI chat sessions to prevent knowledge loss.
> Do NOT manually edit this file unless necessary.

---

## 📝 Session Checkpoint: 2026-09-16

- **Active Memory Path:** instructions/memory.instructions.md
- **Current SDLC Phase:** Implementation (Sprint 2: Property & Room Management)
- **Active Artifacts:**
  - `docs/prd-feature-singgahin-02092026.md` — Status: ✅ Finalized
  - `spec/spec-architecture-core.md` — Status: ✅ Updated (ADR-007 Hybrid Navigation)
  - `plan/feature-singgahin-property-renting-app-v1.0.md` — Status: 🔄 In Progress (TASK-012 Completed, Next: TASK-013)
- **Achieved Milestones:**
  - Selesai implementasi penuh TASK-012 (Frontend Galeri Foto Uploader Cloudinary 1–6 foto, set cover & Form konfigurasi tipe kamar).
  - Modul Galeri Properti (`PropertyGalleryManager.tsx`, `usePropertyImages.ts`, `property-image.schema.ts`):
    - Validasi batas 1MB per foto, tipe file JPG/PNG/WebP, kuota 1-6 gambar (`CON-004`).
    - Fitur upload multi-file Cloudinary, badge Sampul Utama, Jadikan Sampul, dan Hapus foto.
  - Modul Tipe Kamar (`RoomFormModal.tsx`, `RoomCard.tsx`, `RoomDeleteConfirmModal.tsx`, `RoomListSection.tsx`, `room.api.ts`, `useRooms.ts`, `room.schema.ts`):
    - Form tipe kamar: Nama tipe, harga dasar per malam (Rp $\ge$ 10.000), kapasitas tamu (1–50 orang), total unit, deskripsi.
    - Format mata uang Rupiah (`formatRupiah`), kartu tipe kamar interaktif, dialog konfirmasi hapus kamar.
  - Integrasi Tab Navigasi di `TenantPropertyEditPage.tsx`:
    - Tab 1: "Informasi Dasar & Peta" (`PropertyForm` dengan Leaflet map pin & OpenCage reverse geocoding).
    - Tab 2: "Galeri Foto" (`PropertyGalleryManager` dengan badge hitungan foto).
    - Tab 3: "Tipe & Tarif Kamar" (`RoomListSection` dengan integrasi CRUD tipe kamar).
  - Seluruh pengujian frontend (20 berkas uji, 112 *tests*) dan backend (24 berkas uji, 160 *tests*) lolos 100%.
  - `npm run build` sukses dalam ~4 detik dengan 0 TypeScript errors.
  - Kepatuhan batasan kode mentor: seluruh file baru $\le 166$ baris (`CON-001`), setiap fungsi $\le 15$ baris (`CON-002`), tema warna biru primer konsisten tanpa warna hijau/emerald.
- **Dead-Ends (Do NOT Repeat):**
  - **Attempted:** Menggunakan `.default(1)` di Zod schema saat dipakai pada `useForm<RoomFormData>({ resolver: zodResolver(...) })`.
  - **Reason:** Menghasilkan mismatch type TypeScript antara `z.input` dan `z.output`. Diatasi dengan casting `zodResolver as any` atau menyelaraskan tipe input/output.
- **Updated Files:**
  - `frontend/src/modules/property/services/property.api.ts` — API upload/delete/cover foto properti.
  - `frontend/src/modules/property/schemas/property-image.schema.ts` — Validasi gambar 1MB maks 6 foto.
  - `frontend/src/modules/property/hooks/usePropertyImages.ts` — Query/mutation hooks galeri gambar.
  - `frontend/src/modules/property/components/PropertyGalleryManager.tsx` — Komponen galeri foto properti.
  - `frontend/src/modules/property/__tests__/property-image.test.ts` & `PropertyGalleryManager.test.tsx` — Test suites galeri.
  - `frontend/src/modules/room/room.types.ts` — Tipe data `Room`, payload create/update.
  - `frontend/src/modules/room/schemas/room.schema.ts` — Zod schema formulir kamar.
  - `frontend/src/modules/room/services/room.api.ts` — CRUD API client kamar.
  - `frontend/src/modules/room/hooks/useRooms.ts` — React Query hooks manajemen kamar.
  - `frontend/src/modules/room/components/RoomFormModal.tsx` — Modal form tipe kamar.
  - `frontend/src/modules/room/components/RoomCard.tsx` — Kartu tipe kamar.
  - `frontend/src/modules/room/components/RoomDeleteConfirmModal.tsx` — Konfirmasi hapus kamar.
  - `frontend/src/modules/room/components/RoomListSection.tsx` — Daftar dan pengelola tipe kamar.
  - `frontend/src/modules/room/__tests__/room.schema.test.ts`, `room.api.test.ts`, `RoomComponents.test.tsx` — Test suites kamar.
  - `frontend/src/pages/tenant/TenantPropertyEditPage.tsx` — Halaman ubah properti dengan sistem 3 Tab.
  - `frontend/src/pages/tenant/__tests__/TenantPropertyFormPages.test.tsx` — Test suite untuk Create/Edit Page dan navigasi Tab.
  - `plan/feature-singgahin-property-renting-app-v1.0.md` — Menandai TASK-012 selesai [x].
- **Decisions Made:**
  - Pemisahan modular sub-komponen kamar ke dalam file terpisah (`RoomFormModal`, `RoomCard`, `RoomDeleteConfirmModal`, `RoomListSection`) agar mematuhi batasan ketat 200 baris per file dan 15 baris per fungsi.
- **Next Action / Pending:**
  - TASK-013: Frontend Modal pengaturan Peak Season Rate (nominal/persentase) & date blocking di dasbor tenant.

<!-- checkpoint-tail: TASK-012 selesai, sistem tab pada TenantPropertyEditPage terintegrasi, 112 tes frontend dan 160 tes backend lolos 100%. -->

---
