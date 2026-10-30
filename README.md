# atlaslog

dotlas iOS uygulamasından önce yaptığım web prototipi. Gezileri ve gezilerdeki yerleri kaydediyor, hepsini etkileşimli bir dünya haritasında gösteriyor. Fikir burada denendi, sonra [dotlas](https://apps.apple.com/app/dotlas/id6816267686) olarak iOS'a taşındı.

Canlı: [atlaslog-black.vercel.app](https://atlaslog-black.vercel.app) (giriş gerekiyor)

## Özellikler

- **Hesaplar:** Supabase Auth ile e-posta ve şifreyle kayıt ve giriş; geziler, yerler ve profil kullanıcıya ait tablolarda
- **Harita:** MapLibre GL ile koyu tema harita; yakın yerler yakınlaştıkça açılan kümeler halinde gösterilir
- **Gezi oluşturma:** yer arama (MapTiler Geocoding), yerlerin sırasını değiştirme, Pexels'ten seçilen kapak fotoğrafı
- **Rota:** gezideki yerler arasındaki karayolu rotası (openrouteservice)
- **Places:** gezilen ülkelerin işaretlendiği dünya haritası ve gezi kartları
- **Explore:** gidilecek yer önerileri, fotoğraflar Pexels'ten; öneriler için Gemini ile sohbet
- **REST API:** Next.js route handler'larıyla gezi, yer, sıralama, rota ve kapak endpoint'leri

## Kullanılan Teknolojiler

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Supabase (Auth, Postgres)
- MapLibre GL, MapTiler
- openrouteservice, Pexels API, Gemini API
- Vercel

## Kurulum

```bash
npm install
```

`.env.local` dosyasına şunlar gerekir:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_MAPTILER_KEY=
OPENROUTESERVICE_API_KEY=
PEXELS_API_KEY=
GEMINI_API_KEY=
```

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde açılır.
