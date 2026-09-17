# Flujo inicial de alta de padres mediante invitación del colegio

**Fecha de consulta:** 17 de septiembre de 2026  
**Alcance:** evaluación inicial del patrón de alta en España/UE. Se asume que el colegio controla previamente la relación con el alumno y que la invitación se envía a un correo que el colegio tiene registrado. Este documento no sustituye una revisión jurídica del responsable del tratamiento, del DPD ni una DPIA cuando proceda.

## Conclusión

Sí, una invitación individual emitida por el colegio es una buena opción de incorporación si se usa como **mecanismo de activación de una relación ya verificada por el colegio**, no como prueba autónoma de que la persona que abre el enlace tiene patria potestad o derecho a consultar todos los datos del menor.

La opción es aceptable para una primera versión si cumple estas condiciones:

- La invitación se crea únicamente desde una superficie administrativa autorizada y se vincula a un colegio, alumno y destinatario concretos.
- El enlace es aleatorio, de un solo uso, de vida corta y revocable; el servidor guarda solo una representación no reutilizable del token.
- Abrir el enlace verifica el control del correo, pero la autorización posterior se decide por la relación padre/alumno mantenida por el colegio y por controles de acceso del servidor.
- El usuario ve únicamente los datos mínimos necesarios de sus alumnos; nunca puede elegir o alterar libremente el `student_id`, colegio, rol o relación de autorización.
- El colegio dispone de un proceso de corrección, revocación y soporte para correos erróneos, reenvíos, custodia compartida y cambios de patria potestad.
- El tratamiento está documentado con responsable, finalidades, base jurídica, información a las familias, encargados, transferencias, conservación y respuesta a derechos.

Para datos especialmente sensibles, conflictos de custodia o una cuenta con capacidad de exportación, administración o comunicación masiva, el enlace de correo por sí solo no ofrece suficiente garantía. Debe añadirse una verificación independiente proporcional al riesgo, por ejemplo una confirmación desde el canal ya registrado por el colegio o una intervención del personal autorizado. No se recomienda pedir un documento de identidad como respuesta por defecto: aumenta el riesgo y la retención, y debe justificarse por necesidad y proporcionalidad.

## Modelo de flujo recomendado

1. Un administrador o personal del colegio autorizado selecciona un destinatario ya registrado y el alumno o alumnos que puede gestionar.
2. El servidor crea un identificador de invitación y un token criptográficamente aleatorio; almacena el hash del token, su propósito, destinatario, alcance, fecha de expiración y estado. El token no contiene nombre, correo, alumno ni rol.
3. El sistema envía un correo transaccional con HTTPS a una URL de origen fijo y permitido. El correo no incluye información del alumno más allá de lo estrictamente necesario.
4. Al abrir el enlace se muestra una pantalla de confirmación y privacidad. El token se canjea por una sesión de alta restringida, no por acceso general a los datos.
5. El padre establece la cuenta o completa el método passwordless; la aceptación consume y revoca la invitación. El acceso normal requiere una sesión autenticada y una relación de autorización persistida en base de datos.
6. El colegio puede revocar inmediatamente la relación y todas las sesiones asociadas. Una nueva invitación invalida las anteriores.

## Riesgos principales

| Riesgo | Consecuencia | Tratamiento requerido |
| --- | --- | --- |
| Enlace reenviado, correo comprometido o buzón compartido | Alta de una persona no autorizada y acceso a datos del menor | Token de un solo uso y corto, confirmación explícita, relación preautorizada y verificación adicional cuando el riesgo lo requiera |
| El enlace se interpreta como prueba de parentesco | Acceso indebido en casos de custodia, separación o datos restringidos | El colegio mantiene la decisión de autorización; el producto no infiere patria potestad desde el correo |
| Token en historial, logs, `Referer`, analítica o capturas | Secuestro de alta o sesión | HTTPS total, canje inmediato, URL limpia, `Referrer-Policy: no-referrer`, no registrar secretos y no cargar terceros en la pantalla de canje |
| Tokens predecibles, reutilizables o sin límite de intentos | Adivinación, replay o toma de control | CSPRNG, entropía suficiente, hash en reposo, expiración, un solo uso, rate limit y revocación |
| Enumeración de correos o invitaciones | Descubrimiento de familias, spam y abuso del correo | Respuestas uniformes, límites por cuenta/colegio/IP, auditoría y emisión solo por personal autorizado |
| IDOR o RLS incompleta | Un padre ve alumnos de otra familia o colegio | Autorización en cada operación, aislamiento por tenant/colegio, RLS, pruebas positivas y negativas |
| Clave administrativa de Supabase expuesta | Lectura/escritura de todo el proyecto y bypass de RLS | Invitar solo desde servidor confiable; secreto nunca en navegador, código cliente, logs ni repositorio |
| Sesiones largas o tokens en `localStorage` | Persistencia y robo mediante XSS o dispositivo compartido | Cookies `HttpOnly`, `Secure`, `SameSite`, expiración idle/absoluta, rotación y cierre remoto |
| Datos excesivos en registro o perfil | Incumplimiento de minimización y mayor impacto de una brecha | Recoger solo correo, cuenta y relación necesaria; no pedir DNI, domicilio, fecha de nacimiento o salud sin justificación |
| Cuenta no revocada tras baja o cambio familiar | Acceso continuado | Flujo de revocación que invalide membresía y sesiones, con revisión operativa del colegio |
| Proveedor de correo o nube sin garantías | Encargado o transferencia internacional no documentada | DPA, subencargados, ubicación y mecanismo de transferencia revisados antes de producción |

## Controles obligatorios o exigibles por cumplimiento

“Obligatorio” aquí significa exigido por el RGPD/LOPDGDD según los hechos y roles concretos, no que la ley imponga una implementación técnica única.

### Gobernanza y base jurídica

- Identificar quién es el responsable del tratamiento: en un centro público normalmente la Administración educativa competente; en un centro concertado o privado, el centro según sus fines y medios. Determinar por separado si la aplicación actúa como encargado y formalizar el contrato del artículo 28 RGPD.
- Documentar cada finalidad y su base jurídica conforme al artículo 6 RGPD. Para operar un portal escolar necesario para la relación educativa, la base suele analizarse como obligación legal o misión de interés público en el caso público, o contrato/otra base aplicable en el caso privado; no debe marcarse “consentimiento” por comodidad.
- Mantener separadas las finalidades opcionales. Marketing, publicidad, publicación de imágenes o usos no necesarios requieren su propia base y, cuando sea consentimiento, una acción afirmativa, específica, informada, demostrable y tan fácil de retirar como de dar. No condicionar el acceso básico a ese consentimiento.
- Aplicar los principios de licitud, lealtad, transparencia, limitación de finalidad, minimización, exactitud, limitación de conservación, integridad/confidencialidad y responsabilidad proactiva del artículo 5 RGPD.

### Información y derechos

- Proporcionar información clara y accesible sobre responsable, DPD, finalidad, base jurídica, categorías de datos, destinatarios, transferencias, conservación, derechos, reclamación ante la autoridad de control y consecuencias de no facilitar los datos. Si el colegio obtuvo el correo del padre sin recabarlo directamente, debe contemplarse también el artículo 14 RGPD, incluido el origen y el momento de la información.
- Facilitar acceso, rectificación, supresión, limitación, oposición y, cuando aplique, portabilidad; mantener un canal que permita verificar la identidad sin pedir más datos de los necesarios.
- Si se tratan datos del menor sobre la base de consentimiento, aplicar el artículo 8 RGPD y el artículo 7 LOPDGDD: en España el consentimiento propio para servicios de la sociedad de la información se sitúa en 14 años; por debajo deben intervenir los titulares de patria potestad o tutela. Esto no convierte una invitación a un padre en prueba automática de esa titularidad.
- Los centros docentes están entre los supuestos de designación obligatoria de DPD. El contacto del DPD debe ser fácilmente accesible para familias y profesionales.

### Seguridad, privacidad desde el diseño y evaluación de riesgo

- Aplicar protección de datos desde el diseño y por defecto: la cuenta empieza sin más permisos que los necesarios, el perfil no es público y el alumno queda limitado al alcance autorizado.
- Realizar y documentar análisis de riesgos conforme al artículo 32 RGPD. El nivel debe considerar que hay datos de menores y posibles datos de salud, necesidades educativas u otras categorías especiales. Si el tratamiento probablemente entraña alto riesgo, realizar una evaluación de impacto antes de ponerlo en producción y consultar al DPD.
- Usar medidas apropiadas al riesgo: confidencialidad, integridad, disponibilidad, restauración, control de accesos, gestión de secretos, trazabilidad, pruebas y revisión periódica. Para Administraciones Públicas debe considerarse además el Esquema Nacional de Seguridad según la orientación de la AEPD.
- Tener un procedimiento de brechas. El responsable debe documentar toda violación; si es probable que suponga riesgo, notificar a la autoridad de control sin dilación indebida y, en principio, dentro de 72 horas desde que tiene constancia; si el riesgo es alto, comunicarla también a las personas afectadas.
- Revisar las transferencias internacionales y los encargados: contrato de tratamiento, confidencialidad, subencargados, ubicación, medidas y mecanismo válido de transferencia cuando los datos salgan del EEE.

## Controles de seguridad recomendados

### Invitación y token

- Generar el token con un generador criptográficamente seguro, con al menos 128 bits de aleatoriedad efectiva como margen práctico para un secreto de alta sensibilidad; no usar datos secuenciales, correo, alumno, fecha ni JWT con información personal como secreto de invitación.
- Guardar solo un hash o digest con comparación segura. El registro debe estar ligado a un usuario/alcance concreto, tener estado `pending/accepted/revoked/expired` y consumirse de forma atómica.
- Hacerlo de un solo uso, revocable y con caducidad corta. Una hora es el valor predeterminado que documenta Supabase para enlaces de invitación; el responsable puede elegir otro plazo según riesgo, pero debe evitar enlaces indefinidos.
- No permitir que la URL de redirección provenga libremente del cliente. Usar un origen HTTPS fijo o una allowlist estricta. Tras el canje, eliminar el token de la barra de direcciones y del historial de navegación si es posible.
- Aplicar rate limit por invitación, destinatario, colegio e IP; registrar intentos anómalos sin registrar el token. No bloquear la cuenta existente como respuesta a un abuso de invitación.
- Responder de manera equivalente cuando no se quiera revelar si existe un correo o invitación. La interfaz administrativa puede mostrar el detalle solo a personal con permiso.

### Alta, autenticación y sesión

- Separar la sesión limitada de aceptación de la sesión autenticada normal. Tras cambiar el nivel de privilegio, renovar el identificador de sesión y no conceder más acceso por el mero hecho de visitar la página.
- Exigir HTTPS durante todo el flujo. Para cookies de sesión, usar `Secure`, `HttpOnly`, `SameSite=Lax` o `Strict` según el flujo y un alcance de dominio/path mínimo; no guardar tokens de autenticación, JWT o refresh tokens en `localStorage` o `sessionStorage`.
- Definir expiración por inactividad y absoluta, cierre explícito, revocación remota y reautenticación para cambios de correo, relación familiar, permisos o exportaciones.
- Si se usa contraseña, aplicar política segura, comprobación contra credenciales comprometidas y almacenamiento con un algoritmo lento y memory-hard; nunca almacenar ni enviar la contraseña. Considerar passwordless o MFA para funciones de riesgo alto.
- Enviar notificación de alta, cambio de contraseña, cambio de correo y revocación, sin incluir secretos en el correo.

### Supabase Auth y RLS

- Crear usuarios/invitaciones mediante `auth.admin.inviteUserByEmail()` solo en un entorno de servidor confiable con la secret key. Esa clave sustituye a `service_role`, elude RLS y nunca debe exponerse al navegador.
- Configurar solo URLs de redirección permitidas. No confiar en un `redirectTo` enviado por el cliente; comprobar también la configuración del proyecto.
- No usar `user_metadata` para decidir autorización: Supabase documenta que el usuario puede editarlo. Mantener colegio, relación con alumno y rol en tablas de aplicación protegidas; usar `app_metadata` solo cuando el modelo lo justifique y recordando que los claims de un JWT pueden quedar desactualizados hasta su renovación.
- Activar RLS en todas las tablas expuestas y revisar tanto grants como policies. Una policy no revoca por sí sola grants existentes. Conceder a `anon` y `authenticated` únicamente las operaciones necesarias.
- Expresar las policies con `to authenticated`/`to anon` explícitos, comprobar `auth.uid()` y filtrar por la relación autorizada y el colegio. Definir políticas separadas para `select`, `insert`, `update` y `delete`, incluyendo `with check` para impedir reasignar una fila a otro usuario.
- Probar RLS con casos allow/deny: padre del alumno, padre de otro alumno, usuario de otro colegio, usuario revocado, usuario no autenticado, tabla/vista y funciones administrativas. Revisar vistas, funciones `security definer` y cualquier endpoint que pueda saltarse RLS.

## Datos mínimos

### Necesarios para emitir y consumir la invitación

- Correo electrónico del destinatario, si es el canal elegido.
- Identificador interno del colegio/tenant.
- Identificador interno del alumno o relación de alumnos autorizada; preferiblemente no exponerlo en el token ni en el correo.
- Identificador aleatorio de invitación, hash del token, finalidad/alcance, estado, fechas de creación, expiración, aceptación y revocación.
- Identificador del operador que emite o revoca, y metadatos mínimos de auditoría necesarios para seguridad.

### Necesarios para la cuenta activa

- Identidad de autenticación que el usuario elija o el colegio necesite, normalmente correo verificado y `user_id`.
- Nombre visible solo si la experiencia lo requiere.
- Relación autorizada padre/alumno y su estado, mantenida por el colegio.
- Preferencias de comunicación solo si son necesarias y separadas de la autorización.

### Evitar por defecto

- DNI/NIE, copia de documento, fecha de nacimiento, domicilio, teléfono, datos bancarios, información de custodia o datos de salud.
- Datos del alumno en el asunto o cuerpo del correo cuando basten el nombre del colegio y un enlace genérico.
- Un campo libre enviado por el cliente para elegir `student_id`, colegio, rol o condición de progenitor.
- Datos de analítica, publicidad o perfiles no necesarios para prestar el servicio.

Si el servicio llega a tratar salud, necesidades educativas especiales, biometría u otra categoría del artículo 9 RGPD, hace falta un análisis específico de excepción/base, necesidad, acceso restringido y posible DPIA. La invitación no autoriza por sí misma ese tratamiento.

## Retención y borrado

No existe un plazo único del RGPD para todas las cuentas escolares: el responsable debe fijar y justificar plazos por finalidad, aplicar limitación de conservación y documentarlos.

- **Invitación no aceptada:** caducar automáticamente cuando venza; borrar o anonimizar el registro de enlace tras el plazo operativo mínimo para soporte y auditoría. No conservar el token en claro.
- **Invitación aceptada:** marcarla como consumida y eliminar el secreto/hash cuando ya no sea necesario para trazabilidad; conservar solo un evento de auditoría mínimo si existe una finalidad de seguridad o defensa de reclamaciones.
- **Invitación revocada:** invalidar inmediatamente el token y el alcance; conservar solo la evidencia mínima de revocación durante el plazo documentado.
- **Cuenta activa:** conservar los datos mientras sean necesarios para la relación educativa y las obligaciones legales, no por defecto indefinidamente.
- **Baja o fin de relación:** revocar membresías y sesiones, suprimir o anonimizar el perfil y la relación cuando ya no exista finalidad; conservar únicamente lo exigido por obligaciones legales o defensa de reclamaciones, con acceso restringido.
- **Logs y seguridad:** definir una retención independiente, limitada y justificada; enmascarar correo, IP y user-agent cuando no sean necesarios. No guardar URLs completas con tokens.
- **Copias de seguridad:** incluir el borrado en el ciclo de rotación y documentar la ventana residual; impedir que una restauración reanime invitaciones o relaciones revocadas.
- **Derecho de supresión:** atenderlo sin perjuicio de excepciones del artículo 17.3 RGPD. La supresión del padre no debe borrar por accidente el expediente que el colegio debe conservar, ni mantener su acceso operativo.

## Consentimiento y base jurídica

El alta y la autenticación son mecanismos de acceso, no necesariamente un tratamiento basado en consentimiento. La decisión debe separar:

| Tratamiento | Análisis inicial |
| --- | --- |
| Mantener datos de alumno/familia para la función educativa | Normalmente obligación legal o misión de interés público en centros públicos, o la base contractual/legal que corresponda en centros privados/concertados; debe validarlo el responsable |
| Enviar la invitación transaccional al correo registrado | Necesario para habilitar el servicio autorizado, sujeto a información y base principal del servicio; no mezclarlo con publicidad |
| Crear cuenta y gestionar permisos del padre | Necesario para prestar el portal, con minimización y seguridad; no pedir consentimiento si otra base lo hace necesario y adecuado |
| Noticias, promociones, publicidad, perfilado o usos secundarios | Finalidad separada; consentimiento cuando sea la base elegida, específico, demostrable y revocable, o la base alternativa válida que proceda |
| Imágenes, publicaciones o difusión pública | No asumir que la base del servicio educativo cubre la difusión; informar de alcance, audiencia y retirada, y obtener la base específica que proceda |

Si se elige consentimiento, el responsable debe poder demostrarlo, presentarlo de forma clara y separada, no usar casillas premarcadas, y permitir retirarlo con la misma facilidad. El consentimiento de un padre para su propio correo no equivale automáticamente al consentimiento del otro progenitor ni resuelve un desacuerdo sobre representación del menor.

## Checklist de aceptación para la issue

### Decisión y cumplimiento

- [ ] El responsable del tratamiento, encargado, DPD y contacto de privacidad están identificados.
- [ ] Cada finalidad tiene una base jurídica documentada; el acceso básico no depende de consentimiento opcional.
- [ ] La información de los artículos 13/14 RGPD se muestra en el alta y es comprensible para familias.
- [ ] El registro de actividades, contratos con encargados/subencargados y transferencias internacionales están revisados.
- [ ] El análisis de riesgo está aprobado y se ha decidido documentadamente si hace falta DPIA.
- [ ] Existe procedimiento de derechos, revocación, custodia conflictiva y brechas, incluido el plazo de 72 horas cuando aplique.

### Invitación

- [ ] Solo personal autorizado puede emitir, reenviar y revocar invitaciones.
- [ ] La invitación está vinculada a un colegio, destinatario y alcance concretos.
- [ ] El token se genera con CSPRNG, no contiene PII, se almacena como hash, caduca y es de un solo uso.
- [ ] Reenviar una invitación invalida la anterior y revocar una relación invalida el acceso.
- [ ] El enlace usa HTTPS, allowlist de redirecciones, URL limpia tras el canje y `Referrer-Policy` restrictiva.
- [ ] El endpoint aplica rate limiting, control antiabuso y no permite enumeración innecesaria.
- [ ] No se registran tokens, enlaces completos ni secretos en logs, analítica, errores o correo.

### Autenticación, autorización y sesión

- [ ] Abrir el enlace solo inicia una sesión limitada; la sesión normal se crea después de completar la activación.
- [ ] El control del correo no se trata como prueba suficiente de patria potestad en casos de mayor riesgo.
- [ ] Cada lectura y escritura comprueba sesión, usuario, colegio, relación y alcance; no se confía en IDs enviados por el cliente.
- [ ] Las tablas expuestas tienen RLS, grants mínimos y policies explícitas por operación.
- [ ] Hay pruebas de aislamiento entre padres, alumnos, colegios, usuarios revocados y usuarios no autenticados.
- [ ] La secret key/service role de Supabase solo existe en servidor seguro y nunca en el cliente.
- [ ] Las sesiones usan transporte TLS, cookies seguras o un patrón BFF equivalente, expiración, rotación, cierre y revocación.
- [ ] Se notifica al usuario el alta y los cambios de seguridad; existe recuperación que no debilita la autorización.

### Datos y ciclo de vida

- [ ] Se recogen solo correo, identificadores internos, relación/alcance y auditoría mínima necesarios.
- [ ] No se piden DNI, salud, custodia u otros datos sensibles sin necesidad, base y control específicos.
- [ ] Hay plazos aprobados para invitaciones, cuentas, relaciones, logs y copias de seguridad.
- [ ] La baja elimina o anonimiza según el plazo, revoca permisos y no permite reactivar tokens antiguos.
- [ ] Se han probado exportación, supresión, rectificación, oposición/limitación y propagación a encargados cuando corresponda.

## Fuentes primarias consultadas

### Normativa y autoridades españolas

- [Reglamento (UE) 2016/679, texto consolidado en EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02016R0679-20160504), especialmente artículos 5, 6, 7, 8, 9, 12-14, 17, 25, 28, 32-35, 37 y 44-49. La versión HTML consolidada es una herramienta de documentación; el texto auténtico es el publicado en el Diario Oficial, según el propio EUR-Lex.
- [AEPD: Criterios para el tratamiento de datos personales en centros educativos](https://www.aepd.es/infografias/criterios-tratamiento-datos-personales-centros-educativos.pdf), sobre responsable, información a familias, DPD y consentimiento expreso.
- [AEPD: Guía para centros educativos](https://www.aepd.es/guias/guia-centros-educativos.pdf), sobre menores, legitimación, transparencia, seguridad, encargados y transferencias en el entorno educativo.
- [AEPD: Seguridad de los tratamientos](https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/seguridad-de-los-tratamientos), sobre el enfoque basado en riesgo del artículo 32 y la referencia al ENS para Administraciones Públicas.
- [AEPD: Notificación de brechas de datos personales](https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/brechas-de-datos-personales-notificacion), sobre documentación, evaluación de riesgo y notificación en 72 horas.
- [BOE: Ley Orgánica 3/2018, texto consolidado](https://www.boe.es/eli/es/lo/2018/12/05/3/con), especialmente artículo 7 sobre consentimiento de menores y edad de 14 años en España.

### Seguridad de aplicaciones

- [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), usado por analogía para el endpoint de invitación: respuestas uniformes, rate limiting, CSPRNG, tokens largos, almacenados de forma segura, de un solo uso y con expiración, además de no filtrar el token.
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), sobre entropía, significado mínimo del identificador, TLS, cookies `Secure`/`HttpOnly`/`SameSite`, renovación tras cambios de privilegio, expiración y no usar `localStorage` para credenciales.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), sobre autenticación, recuperación, contraseñas y reautenticación tras eventos de riesgo.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), sobre algoritmos lentos y memory-hard y la prohibición práctica de almacenar contraseñas en claro.

### Supabase Auth y autorización

- [Supabase Auth: Users, invitaciones y usuarios](https://supabase.com/docs/guides/auth/users), sobre `inviteUserByEmail`, acción administrativa de servidor, secret key, allowlist de redirecciones, metadatos editables y caducidad predeterminada de una hora.
- [Supabase Auth: Passwordless email logins](https://supabase.com/docs/guides/auth/auth-email-passwordless), sobre magic links/OTP, creación automática de usuarios y expiración configurable compartida con invitaciones.
- [Supabase Auth: Overview](https://supabase.com/docs/guides/auth/overview), sobre JWT de autenticación y su integración con RLS.
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), sobre activar RLS en tablas expuestas, combinar policies con grants, `auth.uid()`, `with check`, pruebas allow/deny y el bypass de RLS de la secret key.
