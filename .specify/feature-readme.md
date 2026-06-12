# Lectura rápida: .specify / herramientas

Este archivo resume cómo usar los scripts de especificación y comprobar prerequisitos antes de ejecutar pasos de planificación o aclaración.

Comprobación de prerequisitos (PowerShell)
------------------------------------------
Ejecutar el siguiente comando desde la raíz del repositorio (Windows PowerShell / PowerShell Core):

powershell -NoProfile -ExecutionPolicy Bypass -File .\.specify\scripts\powershell\check-prerequisites.ps1 -Json -PathsOnly

Explicación:
- -NoProfile y -ExecutionPolicy Bypass permiten ejecutar el script sin cargar perfiles que puedan bloquearlo.
- -Json -PathsOnly hace que el script devuelva rutas relevantes en formato JSON sin realizar validaciones destructivas.

Ejemplo (si desea salida legible en PowerShell):

pwsh -NoProfile -ExecutionPolicy Bypass -File ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly | ConvertFrom-Json | Format-List

Ejecutar la aclaración (/speckit.clarify)
-----------------------------------------
Después de que la comprobación de prerequisitos pase, ejecute el comando de aclaración desde la herramienta o extensión que use (por ejemplo, la integración de Speckit/Spec Kit en el editor o la interfaz de agente). En este repositorio la creación/clarificación de la especificación se realiza mediante el comando de Speckit:

/speckit.clarify

Si dispone de una interfaz de línea de comandos para Speckit, puede que el comando equivalente sea:

speckit clarify

Pasos recomendados antes de ejecutar /speckit.clarify
- Ejecutar el script de comprobación: check-prerequisites.ps1 (ver comando arriba).
- Confirmar que .specify/feature.json existe y apunta a la carpeta correcta (por defecto en este repositorio: ".specify").

Notas
-----
- No se sobrescribieron plantillas existentes en .specify/templates.
- Si necesita ejecutar el script en WSL o Linux, use pwsh (PowerShell Core) y adapte las rutas a formato POSIX.
