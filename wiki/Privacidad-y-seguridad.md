# Privacidad y seguridad

Este documento explica qué hace la aplicación con sus datos y qué no hace.

## Sus datos no salen del navegador

Toda la información del PIAR se queda en su computador. No hay un servidor que reciba los datos. No hay analítica, ni seguimiento, ni cookies de terceros.

## Cifrado local

Los borradores guardados automáticamente se cifran con AES-256-GCM, un estándar reconocido. La llave de cifrado se genera en su navegador la primera vez que abre la aplicación. Esa llave nunca sale de su dispositivo.

Si borra los datos del navegador, la llave también desaparece y los borradores ya no se pueden recuperar.

## ¿Quién puede ver los datos?

- Cualquier persona con acceso físico a su computador y a su sesión de usuario
- Cualquier programa que se ejecute con sus permisos en el computador, incluyendo malware
- Otras pestañas o extensiones del mismo navegador, dentro del mismo dominio de la aplicación

## ¿Quién no puede ver los datos?

- El equipo que desarrolla esta aplicación
- Anthropic ni ninguna otra empresa de IA
- Cualquier servidor de internet
- Su proveedor de internet, más allá del momento en que carga la aplicación
- Otros usuarios del mismo computador que tengan cuentas de usuario distintas

## Recomendaciones para uso institucional

- En equipos compartidos, prefiera una sesión normal del navegador y cierre sesión del computador al terminar.
- No dependa del modo "incógnito" o "navegación privada" para conservar borradores; algunos navegadores bloquean allí el almacenamiento local.
- Use la opción **"Limpiar formulario"** si el equipo va a quedar accesible a otras personas.
- Exporte un respaldo, en PDF o DOCX, antes de limpiar. Los datos cifrados borrados no se pueden recuperar.

## Cómo borrar todo

- Botón "Limpiar formulario" en la pantalla principal
- O borrar los datos de sitio del navegador desde la configuración de privacidad

## Reportar un problema de seguridad

Vea [Reportar un problema](Reportar-un-problema).

## Ver también

- [Inicio](Home)
- [¿Qué es el PIAR?](Que-es-PIAR)
- [Reportar un problema](Reportar-un-problema)
