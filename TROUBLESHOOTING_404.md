# 404: NOT_FOUND (Vercel) — Hızlı Çözüm Rehberi

Aldığınız hata:

```txt
404: NOT_FOUND
Code: NOT_FOUND
ID: fra1::bf8ns-1773168063448-2511ddab7d24
```

Bu hata çoğunlukla **domain bir deployment’a bağlı değilken**, **yanlış path çağrılırken** veya **SPA rewrite eksikken** oluşur.

---

## 1) 5 dakikalık hızlı teşhis

1. **Doğru URL mi?**
   - Eski preview linki yerine production domain’i açın.
2. **Deployment var mı?**
   - Dashboard’da son deploy `Ready` mı kontrol edin.
3. **Domain doğru projeye bağlı mı?**
   - Domain/alias mapping’i kontrol edin.
4. **Route gerçekten mevcut mu?**
   - Çağırdığınız path’in uygulamada karşılığı var mı doğrulayın.
5. **SPA ise rewrite var mı?**
   - `example.com/ayarlar` gibi deep-link’lerde rewrite yoksa 404 alırsınız.

---

## 2) Hemen uygulanabilir düzeltmeler

### A) Production deployment’ı yeniden bağla/promote et

- Vercel panelinde son başarılı deploy’u Production’a promote edin.
- Domain’in bu deploy’a bağlı olduğundan emin olun.

### B) Domain kontrolü

- Project → Settings → Domains altında domain’in **Verified** ve doğru projeye bağlı olduğundan emin olun.
- Yanlış bağlıysa kaldırıp yeniden ekleyin.

### C) SPA rewrite ekle (React/Vite gibi)

`vercel.json` yoksa ekleyin, varsa aşağıdaki kuralı doğrulayın:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

> Not: Next.js App Router kullanıyorsanız genelde bu rewrite’a ihtiyaç yoktur; path’ler framework içinde çözülür.

### D) API route doğrulaması

- Çağırdığınız endpoint ile dosya/route path birebir aynı olmalı.
- Örn. `/api/health` çağrılıyorsa route gerçekten deploy edilen build içinde olmalı.

---

## 3) Log ve doğrulama adımları

1. İlgili isteği tekrar atın.
2. Logs/Functions/Edge loglarında bu ID’yi arayın:
   - `fra1::bf8ns-1773168063448-2511ddab7d24`
3. Aşağıdaki gibi basit kontrol yapın:

```bash
curl -i https://<domaininiz>/
curl -i https://<domaininiz>/<404-alan-path>
```

Beklenen:
- `/` için 200/3xx
- Uygun route için 200/3xx (veya API ise beklenen status)

---

## 4) En olası kök neden (bu hata formatına göre)

Bu tip `404: NOT_FOUND` + bölge/ID formatı çoğunlukla platform seviyesinde route/deployment eşleşme problemidir; yani uygulama kodundan önce **deployment alias/domain eşleşmesini** düzeltmek genelde sorunu çözer.
