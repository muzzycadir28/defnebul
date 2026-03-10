# 404 NOT_FOUND Hatası (Vercel benzeri dağıtım ortamları)

Kullanıcıdan gelen örnek hata:

```
404: NOT_FOUND
Code: NOT_FOUND
ID: fra1::tmddz-1773167550046-876105eaf856
```

Bu format genellikle isteğin bir route'a eşleşmediğini veya ilgili deployment'ın silindiğini/taşındığını gösterir.

## Olası sebepler

1. **Yanlış URL / domain**
   - Eski preview deployment linki açılıyor olabilir.
2. **Deployment kaldırılmış olabilir**
   - Preview üretimi silinmiş veya retention süresi dolmuş olabilir.
3. **Prod alias yanlış deployment'a işaret ediyor olabilir**
   - Domain doğru ama aktif deployment yanlış.
4. **Uygulamada route yok**
   - Örneğin `/api/foo` çağrılıyor ama böyle bir endpoint yok.
5. **Framework rewrite/redirect kuralı eksik**
   - SPA uygulamalarında direct route erişimlerinde 404 dönebilir.

## Hızlı kontrol listesi

- Deployment platformunda ilgili proje içinde son başarılı build var mı kontrol et.
- Domain/alias eşleşmesini kontrol et (`Production` -> doğru deployment).
- Preview URL yerine production URL kullan.
- API route dosyalarının doğru path'te olduğunu doğrula.
- SPA ise tüm route'ları `index.html`'e rewrite eden kuralı ekle.

## Önerilen aksiyon

1. Son başarılı deployment'ı yeniden promote et.
2. Domain'i doğru deployment'a yeniden bağla.
3. Route/rewrite konfigürasyonunu gözden geçirip tekrar deploy et.
4. Hata devam ediyorsa platform log'larında bu `ID` ile arama yap.
