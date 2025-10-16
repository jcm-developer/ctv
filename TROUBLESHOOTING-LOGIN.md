# 🔧 Troubleshooting - Error de Login en Producción

## ⚠️ Problema
Al intentar iniciar sesión en https://jcm-developer.github.io/myFilms/, se produce un error.

## 🔍 Causas Posibles

### 1. **GitHub Secrets NO Configurados** (Más Probable)
Si no has configurado los secrets en GitHub, las variables de entorno estarán vacías en producción.

**Solución:**
1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click en **"New repository secret"**
4. Añade estos 5 secrets:

| Secret Name | Valor (desde tu .env) |
|------------|----------------------|
| `VITE_TOKEN` | `eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4Y2IwNDRkODhjMzY0MmRkNmQyOTU5YWM4ZmFhMjMwYSIsIm5iZiI6MTc2MDU2NjMxOC4zOTM5OTk4LCJzdWIiOiI2OGYwMWMyZTg4NTUyNzYxYmIzODliYWQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.U_8bYFPnsfat-rN61whkG3V_JnNy5vwsn0TkO4MkqnY` |
| `VITE_API_KEY` | `8cb044d88c3642dd6d2959ac8faa230a` |
| `VITE_API_URL` | `https://api.themoviedb.org/3` |
| `VITE_AUTH_USER1` | `admin:JJJcccLLL` |
| `VITE_AUTH_USER2` | `mariaturmo02:atracciones` |

5. Después de añadir los secrets, haz un nuevo deploy:
```bash
git add .
git commit -m "Add debug page"
git push
```

### 2. **Variables de Entorno con Comillas**
En GitHub Secrets, NO pongas comillas alrededor de los valores.

❌ **INCORRECTO:**
```
"admin:JJJcccLLL"
```

✅ **CORRECTO:**
```
admin:JJJcccLLL
```

### 3. **Formato Incorrecto en AUTH_USER**
Asegúrate de que el formato sea exactamente: `username:password` (sin espacios, sin comillas)

### 4. **Caché del Navegador**
Si acabas de configurar los secrets y hacer redeploy, puede que necesites limpiar la caché:
- **Chrome/Edge:** Ctrl + Shift + R
- **Firefox:** Ctrl + F5
- O abre en modo incógnito

## 🧪 Verificar el Problema

### Opción 1: Página de Debug
Después de hacer el próximo deploy, accede a:
```
https://jcm-developer.github.io/myFilms/debug-env.html
```

Esta página te mostrará:
- ✅ Qué variables están configuradas
- ❌ Qué variables faltan
- 🔍 Si el fallback está siendo usado

### Opción 2: Consola del Navegador
1. Abre https://jcm-developer.github.io/myFilms/
2. Presiona F12 (DevTools)
3. Ve a la pestaña **Console**
4. Escribe:
```javascript
console.log('User1:', import.meta.env.VITE_AUTH_USER1)
console.log('User2:', import.meta.env.VITE_AUTH_USER2)
```

Si aparece `undefined`, es que los secrets NO están configurados.

## 🔄 Flujo de Corrección Completo

```bash
# 1. Configura los secrets en GitHub (ver tabla arriba)

# 2. Haz un commit y push para triggear el deploy
git add .
git commit -m "Add debug page and fix config"
git push

# 3. Ve a la pestaña Actions en GitHub
# https://github.com/jcm-developer/myFilms/actions

# 4. Espera a que el deploy termine (círculo verde ✓)

# 5. Limpia la caché del navegador (Ctrl + Shift + R)

# 6. Prueba de nuevo el login
```

## 🎯 Credenciales de Login

Según tu `.env` actual, las credenciales son:

**Usuario 1:**
- Usuario: `admin`
- Contraseña: `JJJcccLLL`

**Usuario 2:**
- Usuario: `mariaturmo02`
- Contraseña: `atracciones`

**Fallback (si no hay secrets):**
- Usuario: `admin`
- Contraseña: `admin123`

## 📊 Verificar GitHub Actions

1. Ve a: https://github.com/jcm-developer/myFilms/actions
2. Click en el último workflow run
3. Verifica que no haya errores en el step "Build"
4. Si hay errores, probablemente faltan los secrets

## ⚡ Quick Fix

Si quieres que funcione AHORA sin secrets, puedes usar las credenciales de fallback:
- Usuario: `admin`
- Contraseña: `admin123`

Pero **DEBES** configurar los secrets para que funcionen tus credenciales personalizadas.

## 📝 Notas Importantes

1. **Los secrets NO se ven:** Una vez añadidos, GitHub no te los muestra. Esto es normal por seguridad.
2. **Redeploy necesario:** Después de añadir secrets, DEBES hacer un nuevo push para que se apliquen.
3. **Case-sensitive:** Los nombres de los secrets deben ser EXACTAMENTE como aparecen en la tabla (mayúsculas/minúsculas).
4. **No uses .env en producción:** GitHub Pages no tiene acceso a tu `.env` local. Solo funciona con Secrets.

## 🆘 Si Nada Funciona

1. Elimina TODOS los secrets actuales
2. Añádelos de nuevo UNO POR UNO
3. Verifica que no haya espacios al inicio o final
4. Haz un nuevo push
5. Espera al deploy completo
6. Accede a `/debug-env.html` para verificar
