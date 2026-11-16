# Calma

App para Android que te ayuda a tranquilizar la mente:

- **¿Cómo estás ahora?**: elegís cómo te sentís y la app te muestra frases y ejercicios acordes.
- **Frases** que calman: tocá o deslizá para ver otra, guardá las que te hagan bien y compartilas como imagen.
- **Ejercicios**: respiración (calma 4-4-6, caja 4-4-4-4, dormir 4-7-8), técnica 5-4-3-2-1 y relajación guiada con voz.
- **Meditar**: temporizador de 3 a 20 minutos con campana.
- **Sonidos**: música suave, lluvia, mar, bosque, fuego y cuencos, mezclables, con modo dormir.
- **Diario**: gratitud diaria y frases guardadas.
- **Frase del día**: notificación diaria a la hora que elijas.
- Funciona sin internet.

## Descargar el APK

Entrá a **Releases** (columna de la derecha en GitHub) y descargá `Calma.apk` de la última versión.
En el celular, abrilo y aceptá instalar apps de origen desconocido si te lo pide.

## Cómo se arma

- La app está en `www/index.html`.
- Cada vez que se sube un cambio a `main`, GitHub Actions compila el APK automáticamente
  (`.github/workflows/build-apk.yml`) y lo publica en Releases.
- Usa [Capacitor](https://capacitorjs.com) para empaquetar la web como app de Android.
