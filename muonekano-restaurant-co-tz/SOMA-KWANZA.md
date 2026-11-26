# Muonekano wa restaurant.co.tz na wa Standard (Kawaida)

Faili hizi zimetoka kwenye **main** (a171482), toleo lililo hewani sasa (Novemba 26, 2026).
Zirekebishe, kisha unirudishie **zip yenye njia zilezile** (folda na majina yasibadilike). Nitazikagua, kuzijaribu na kuziweka.

---

## A. Muonekano wa restaurant.co.tz (brand ya jukwaa: "Tiketi + Ubao")

| Faili | Inaongoza nini |
|---|---|
| `src/styles/brand.css` | **Chanzo kikuu:** rangi, fonti, nafasi (spacing), pembe (radius). `.lt` = mwanga, `.dk` = giza. Ukibadilisha rangi au fonti hapa, kurasa zote za jukwaa zinabadilika |
| `src/lib/brand.ts` | Jina la brand, rangi na umbo la nembo (tiketi) |
| `public/brand/*` | Nembo: icon.svg, logo-lt.svg, logo-dk.svg, icon-512.png, apple-icon.png |
| `src/app/_components/BrandMark.tsx` | Nembo + jina inavyoonyeshwa |
| `src/app/(marketing)/marketing.css` | Ukurasa wa mwanzo (restaurant.co.tz na /sw) |
| `src/app/(marketing)/_components/*.tsx` | Sehemu za ukurasa wa mwanzo: Header, Hero, Story, Views, Showcase, Plans, Faq, Contact, Footer |
| `src/app/(marketing)/copy.ts` | **Maneno yote** ya ukurasa wa mwanzo (Kiingereza na Kiswahili) |
| `src/app/(marketing)/site-config.ts` | Jina, bei, WhatsApp, email, mitandao ya kijamii |
| `src/app/[slug]/admin/login/login.css` | Muonekano wa kurasa za kuingia: /login, /signup, /hq (fomu ya kuingia), /<mgahawa>/admin/login |
| `src/app/signup/signup.css` | Ziada za /signup (kadi za muonekano, anwani) |
| `src/app/hq/hq.css` | Dashboard yako /hq |
| `src/app/_components/admin-brand.css` | **Admin ya kila mgahawa** (sidebar, kadi, vitufe, giza) |
| `src/app/_components/admin-*.css` | Kurasa maalum za admin: ofa/maoni/usalama, mauzo, chagua muonekano |
| `src/app/_components/staff.css` | Ukurasa wa wahudumu |
| `src/app/_components/legal.css` | /privacy na /terms |
| `src/app/globals.css` | Mitindo ya msingi ya mfumo mzima (gate-*, adm-* za msingi) |
| `src/app/**/page.tsx`, `*Form.tsx` | Mpangilio (HTML) wa kurasa hizo. Tazama tu, au badilisha maneno |

## B. Muonekano wa Standard ("Kawaida") ambao migahawa inachagua

| Faili | Inaongoza nini |
|---|---|
| `src/themes/default/default.css` | **Muonekano wote wa menyu ya Kawaida**: rangi, kadi za vyakula, vichwa |
| `src/themes/default/default-extras.css` | Ofa ya leo na rating kwenye Kawaida |
| `src/themes/default/MenuView.tsx` | Mpangilio wa menyu (juu, kategoria, vyakula) |
| `src/themes/default/ItemSheet.tsx` | Dirisha la chakula kimoja (picha, bei, maoni) |
| `src/themes/default/BookingSheet.tsx`, `TablePicker.tsx`, `Gate.tsx` | Hifadhi meza, kuchagua meza, skrini ya kwanza |
| `src/themes/shared/order/*.css` | Kikapu, kutuma oda na hatua za oda (zinatumiwa na Kawaida pia) |
| `src/themes/shared/extras/extras.css` | Nyota na ofa (za pamoja) |
| `src/themes/catalog.ts` | Jina, maelezo na rangi 3 za kijipicha cha kila muonekano (kwenye /signup na Mipangilio) |

> Kawaida inatumia tokens zilezile za `brand.css` (mfano `--accent`, `--bg`, `--fg`). Ukibadilisha tokens, menyu ya Kawaida nayo inabadilika.

---

## Sheria 5 za kurekebisha (ili nisilazimike kurudia kazi)

1. **CSS: badilisha kwa uhuru** rangi, fonti, ukubwa, nafasi, vivuli, pembe na mpangilio. Kwa jukwaa, ni bora kubadilisha tokens kwenye `brand.css`.
2. **Usibadilishe majina ya class** (mfano `.gate-btn`, `.adm-card`, `.dm-primary`) bila kunieleza, kwa sababu faili za `.tsx` zinayategemea.
3. **`.tsx`: maneno na mpangilio sawa; mantiki hapana.** Usiondoe `t("...")`, `onClick`, `useEffect`, `import` wala vitu vya fomu (Turnstile, 2FA).
4. **Ufikivu:** vitufe viwe angalau 44px, maandishi yasomeke (contrast), na `:focus-visible` ibaki.
5. **Zebra na Nino haviko hapa** (ni Premium). Usiviguse.

## Ukimaliza
- Zip folda hiyohiyo, na nirudishie. Kama ulibadilisha faili chache tu, zipe hizo tu (njia zilezile).
- Andika kwa ufupi ulichobadilisha, au nitumie picha ya ulichotaka.
- Nitaendesha majaribio, build, na kukuonyesha kabla ya kuweka hewani.

---

## Ukitaka AI nyingine ikusaidie, bandika maelezo haya

```
Nina mradi wa Next.js 16 (React 19, TypeScript) wa jukwaa la menyu za migahawa (restaurant.co.tz).
Nakupa faili za muonekano tu. Nataka [ELEZA MUONEKANO UNAOTAKA: rangi, hisia, mfano wa tovuti].

SHERIA:
1. Badilisha CSS kwa uhuru (rangi, fonti, nafasi, vivuli, mpangilio). Kwa kurasa za jukwaa, anza na tokens za src/styles/brand.css (.lt mwanga, .dk giza).
2. USIBADILISHE majina ya class yaliyopo, kwa sababu faili za .tsx zinayatumia. Ukihitaji class mpya, iongeze na ueleze.
3. Kwenye .tsx badilisha maandishi na mpangilio wa HTML tu. Usiguse mantiki: t("..."), hooks, onClick, imports, fomu, Turnstile, 2FA.
4. Ufikivu: vitufe angalau 44px, contrast ya WCAG AA, :focus-visible ibaki.
5. Menyu ya Kawaida (src/themes/default) inatumia tokens za brand.css kama --accent; heshimu tokens hizo.
6. Nirudishie faili kamili zilizobadilishwa, kila moja na njia yake kamili, pamoja na orodha fupi ya mabadiliko.
```
