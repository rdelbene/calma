# Calma

App para Android que te ayuda a tranquilizar la mente:

- **Frases** que calman: tocá o deslizá para ver otra, y guardá las que te hagan bien.
- **Respirar**: ejercicio guiado 4-4-6 (inhalá, sostené, exhalá).
- **Sonido**: música suave y lluvia, generadas en el momento.

## Descargar el APK

Entrá a **Releases** (columna de la derecha en GitHub) y descargá `Calma.apk` de la última versión.
En el celular, abrilo y aceptá instalar apps de origen desconocido si te lo pide.

## Cómo se arma

- La app está en `www/index.html`.
- Cada vez que se sube un cambio a `main`, GitHub Actions compila el APK automáticamente
  (`.github/workflows/build-apk.yml`) y lo publica en Releases.
- Usa [Capacitor](https://capacitorjs.com) para empaquetar la web como app de Android.
