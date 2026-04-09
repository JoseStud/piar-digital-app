# Despliegue para instituciones

Esta guía está pensada para equipos de tecnología de Secretarías de Educación e instituciones educativas que quieran hospedar la aplicación o distribuirla internamente.

## Tres opciones de despliegue

- Usar una instancia pública existente, si el proyecto o su institución ya le compartieron una URL concreta.
- Hospedaje propio estático. La aplicación no necesita backend y puede servirse con cualquier servidor web; también hay una imagen Docker lista en el repositorio.
- Distribución como aplicación de escritorio. El build con Tauri produce instaladores nativos para Windows, macOS y Linux.

## Requisitos del servidor

- Disco: aproximadamente 5 MB para la aplicación estática.
- Memoria: mínima, porque no hay procesamiento server-side.
- Red: solo HTTPS hacia los usuarios; no se requiere conexión saliente en tiempo de ejecución.

## Configuración para `.gov.co`

- HTTPS obligatorio. Use Let’s Encrypt o el certificado oficial de la entidad.
- El header CSP se genera durante el build y queda en `out/headers.conf`; configúrelo en el servidor web. La imagen Docker lo aplica automáticamente con nginx.
- El dominio puede ser el que use su entidad.

## Detalles técnicos

Para los pasos concretos de build, como `npm run build` y `docker build`, consulte el archivo [`docs/release.md`](https://github.com/JoseStud/piar-digital-app/blob/main/docs/release.md) en el repositorio.

## Seguridad

- La aplicación es client-side: el servidor solo entrega archivos estáticos.
- Ningún dato del PIAR pasa por el servidor en ningún momento.
- Vea también [Privacidad y seguridad](Privacidad-y-seguridad).

## Soporte

- Para problemas técnicos, use los issues de GitHub del repositorio.
- Para vulnerabilidades de seguridad, vea [Reportar un problema](Reportar-un-problema).

## Ver también

- [Home](Home)
- [Privacidad y seguridad](Privacidad-y-seguridad)
- [Reportar un problema](Reportar-un-problema)
