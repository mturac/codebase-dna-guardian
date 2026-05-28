# 🧬 Codebase DNA Guardian

> Bir kod tabanının yazılı olmayan kurallarını çıkaran ve uygulayan bir Claude Code becerisisi.

[![npm version](https://img.shields.io/npm/v/codebase-dna-guardian)](https://www.npmjs.com/package/codebase-dna-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-8b5cf6)](https://claude.ai/claude-code)

![DNA Guardian Genel Bakış](docs/screenshots/overview.png)

Her olgun kod tabanında yazılı olmayan kurallar vardır — isimlendirme kuralları, hata yönetimi kalıpları, import stilleri, mimari kararlar — bunları yalnızca deneyimli ekip üyeleri bilir. Yeni geliştiriciler (ve yapay zeka asistanları) bu kurallara yetersizlikten değil, **kimse yazmadığı için** aykırı davranır.

DNA Guardian bu kuralları makine tarafından okunabilir bir profile dönüştürür ve sürekli olarak uygular.

---

## ✨ Ne Yapar

| Komut | Açıklama |
|-------|----------|
| `/dna-scan` | Kod tabanını tarayıp kuralları DNA profili olarak çıkarır |
| `/dna-check [yol]` | Dosyaları DNA profiline göre denetler |
| `/dna-refactor [yol]` | Kural ihlallerini otomatik düzeltir |
| `/dna-report` | Proje genelinde sağlık raporu oluşturur |
| `/dna-preview` | İnteraktif görsel HTML raporu oluşturur |
| `/dna-onboard` | Yeni geliştirici için DNA'dan brifing hazırlar |
| `/dna-diff` | Son taramadan bu yana kuralların nasıl evrildiğini gösterir |
| `/dna-guard [dal]` | Birleştirme öncesi kapı — HARD ihlalleri engeller |

---

## 🚀 Kurulum

### npm ile

```bash
npm install -g codebase-dna-guardian
```

### Manuel kurulum

```bash
git clone https://github.com/mturac/codebase-dna-guardian
# Ardından Claude Code beceriler dizinine ekleyin
```

---

## 📖 Hızlı Başlangıç

```
# 1. Projeyi tara
/dna-scan

# 2. Birleştirmeden önce dosyayı denetle
/dna-check src/services/payment.ts

# 3. Sağlık panosunu gör
/dna-report

# 4. Görsel interaktif rapor
/dna-preview

# 5. PR'ı koru
/dna-guard feature/payment-refactor
```

`/dna-scan` çalıştırdıktan sonra Claude Code, projenizde **her yeni kod yazılmadan önce otomatik olarak DNA'ya başvurur** — ekstra komut gerekmez.

---

## 🏗 Nasıl Çalışır

### 1. Tarama (tüm kod tabanı değil, 15–20 dosya)

Tarayıcı cerrahi hassasiyetle örnekler:
- Yapılandırma dosyaları (tsconfig, eslint, pyproject.toml, vb.)
- Giriş noktaları (main.ts, app.ts, server.py)
- Tipik bir özelliğin **dikey dilimi** (route → service → repository → test)
- Hata yönetimi örnekleri
- Paylaşılan yardımcı programlar
- Test dosyaları

Bu ~20 dosyadan 8 kategoride kalıplar çıkarır: İsimlendirme, Mimari, Hata Yönetimi, Test, Import'lar, Bağımlılıklar, API Kontratları, Asenkron Kalıplar.

### 2. Ciddiyet Seviyeleri

Her kuralın üç seviyeden biri vardır:

| Seviye | Davranış |
|--------|----------|
| 🔴 **HARD** | İhlal eden kod yazmadan önce dur, açıkla, onay iste. |
| 🟡 **SOFT** | Uyumlu kod üret + kısa bir dipnot ekle. |
| 🟢 **PREF** | Sessizce uygula. Hiç bahsetme. |

### 3. Pasif Koruyucu Modu

`.claude/dna.md` oluşturulduktan sonra Claude Code **her kod üretiminden önce otomatik okur** — becerisini açıkça çağırmanıza gerek yok. DNA her zaman aktif.

---

## 📁 DNA Profil Formatı

Tarama sonuçları `.claude/dna.md` (tek proje) veya `.claude/dna/` (monorepo) konumuna yazılır:

```
.claude/
  dna/
    root.md          ← paylaşılan kurallar
    frontend.md      ← servise özel geçersiz kılmalar
    backend.md       ← servise özel geçersiz kılmalar
    cross-service.md ← otomatik oluşturulan sapma haritası
  dna-history.md     ← tüm değişikliklerin denetim izi
```

---

## 📊 Görsel Pano

`scripts/` dizini interaktif bir sağlık raporu oluşturan React pano bileşenini içerir:

```bash
cd scripts && npm install && npm run dev
```

Ya da Claude Code içinde `/dna-preview` kullanın.

| Genel Bakış | Kurallar |
|-------------|----------|
| ![Genel Bakış](docs/screenshots/overview.png) | ![Kurallar](docs/screenshots/rules.png) |

| Servisler | Sağlık |
|-----------|--------|
| ![Servisler](docs/screenshots/services.png) | ![Sağlık](docs/screenshots/health.png) |

---

## 🧩 Monorepo Desteği

DNA Guardian çok servisli projeleri doğal olarak destekler:

```
Dalga 1: Kök tarama (paylaşılan yapılandırma, CI, paylaşılan yardımcılar)
Dalga 2: Servis başına tarama (her servis için bir dikey dilim)
Dalga 3: Çapraz karşılaştırma (servisler arası kalıpları karşılaştır)
Dalga 4: Sınıflandırma (kasıtlı sapma vs. sürüklenme)
```

---

## 🔒 Ciddiyet Örnekleri

### HARD — kod üretimini durdurur
```
🧬 DNA-A2 (HARD): Bu proje Repository deseni kullanıyor — controller'lar
service'leri, service'ler repository'leri, repository'ler veritabanını çağırır.
Controller'da doğrudan veritabanı erişimi mimari katmanlamayı bozar.

Bunun yerine bir repository metodu oluşturup service katmanı üzerinden
bağlayacağım.
```

### SOFT — yalnızca dipnot
```
Not: DNA-N1'e (kebab-case dosya isimlendirme) uyarak `payment-service.ts`
olarak adlandırıldı.
```

### PREF — sessiz
DNA-D2 dediği için `moment` yerine `dayjs` kullanılır. Bahsedilmez.

---

## 🌍 Diğer Diller

[🇬🇧 English](README.md) · [🇫🇷 Français](README.fr.md) · [🇩🇪 Deutsch](README.de.md) · [🇨🇳 中文](README.zh.md) · [🇰🇷 한국어](README.ko.md)

---

## 🤝 Katkıda Bulunma

[CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın. PR'lar memnuniyetle karşılanır.

---

## 📜 Lisans

MIT © Mehmet Turac
