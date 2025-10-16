# 🚀 Guía de Deploy con GitHub Actions

## 📋 Configuración Completa en 5 Pasos

### 1️⃣ Configurar GitHub Pages

1. Ve a tu repositorio en GitHub: `https://github.com/jcm-developer/myFilms`
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona: **GitHub Actions**

![GitHub Pages Setup](https://docs.github.com/assets/cb-47267/images/help/pages/publishing-source-drop-down.png)

---

### 2️⃣ Configurar Secrets (Variables de Entorno)

Las variables de entorno deben estar configuradas como **Secrets** en GitHub:

1. Ve a: **Settings** → **Secrets and variables** → **Actions**
2. Click en **New repository secret**
3. Agrega los siguientes secrets **UNO POR UNO**:

#### Secrets Requeridos:

| Name | Value | Descripción |
|------|-------|-------------|
| `VITE_TOKEN` | `tu_token_tmdb` | Token Bearer de TMDb |
| `VITE_API_KEY` | `tu_api_key_tmdb` | API Key de TMDb |
| `VITE_API_URL` | `https://api.themoviedb.org/3` | URL base de TMDb API |
| `VITE_AUTH_USER1` | `jaume:myfilms2024` | Usuario 1 (formato: `username:password`) |
| `VITE_AUTH_USER2` | `admin:admin123` | Usuario 2 (formato: `username:password`) |

#### 📸 Cómo agregar un Secret:

```
1. Click "New repository secret"
2. Name: VITE_TOKEN
3. Secret: [pega tu token aquí]
4. Click "Add secret"
5. Repite para cada variable
```

---

### 3️⃣ Verificar el archivo vite.config.js

El archivo ya está configurado con:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/myFilms/',  // ✅ Nombre de tu repositorio
})
```

⚠️ **Importante**: El `base` debe coincidir exactamente con el nombre de tu repositorio.

---

### 4️⃣ Push al repositorio

```bash
git add .
git commit -m "Add GitHub Actions deploy workflow"
git push origin main
```

---

### 5️⃣ Ver el Deploy en Acción

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Verás el workflow "Deploy to GitHub Pages" ejecutándose
4. Espera a que termine (tarda ~2-3 minutos)
5. Tu app estará disponible en:

```
https://jcm-developer.github.io/myFilms/
```

---

## 🔄 Workflow Automático

Cada vez que hagas `git push` a la rama `main`:

1. ✅ GitHub Actions se ejecuta automáticamente
2. ✅ Instala dependencias (`npm ci`)
3. ✅ Compila el proyecto (`npm run build`) con los secrets
4. ✅ Despliega a GitHub Pages
5. ✅ Tu sitio se actualiza automáticamente

---

## 🔍 Verificar el Estado del Deploy

### En GitHub Actions:

```
1. Repositorio → Actions tab
2. Click en el workflow más reciente
3. Verás cada paso del proceso
4. Si hay errores, aparecerán en rojo ❌
5. Si todo va bien, verás checks verdes ✅
```

### Estados Posibles:

- 🟡 **Amarillo (running)**: Deploy en progreso
- ✅ **Verde (success)**: Deploy exitoso
- ❌ **Rojo (failed)**: Hay un error

---

## 🛠️ Solución de Problemas

### ❌ Error: "Process completed with exit code 1"

**Causa**: Falta algún secret o está mal configurado

**Solución**:
1. Verifica que todos los 5 secrets estén configurados
2. Verifica que los nombres sean exactos (case-sensitive)
3. No debe haber espacios extra en los valores

---

### ❌ Error: "404 - Page not found" al visitar la URL

**Causa**: El `base` en `vite.config.js` no coincide con el nombre del repo

**Solución**:
```javascript
// vite.config.js
base: '/myFilms/', // Debe ser exactamente el nombre de tu repo
```

---

### ❌ Error: "Unable to find env"

**Causa**: Los secrets no están pasándose correctamente

**Solución**:
1. Verifica que los secrets estén en **Repository secrets** (no en Environment secrets)
2. Verifica que el workflow tenga la sección `env:` correcta

---

### ❌ La página carga pero las imágenes no aparecen

**Causa**: Problema con las rutas de assets

**Solución**: Ya está resuelto con `base: '/myFilms/'` en vite.config.js

---

## 📝 Actualizar Credenciales de Usuario

Si quieres cambiar las credenciales de login:

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Click en el secret (ej: `VITE_AUTH_USER1`)
3. Click en **Update**
4. Cambia el valor: `nuevo_usuario:nueva_password`
5. Haz un nuevo commit y push para que se re-despliegue

---

## 🔒 Seguridad

### ✅ Qué está protegido:
- Los secrets de GitHub **nunca** se exponen en los logs
- El archivo `.env` local **no** se sube a GitHub (`.gitignore`)
- Las credenciales solo se pasan durante el build

### ⚠️ Qué NO está protegido:
- Las credenciales compiladas estarán en el bundle JavaScript final
- Cualquiera con DevTools puede verlas en el código compilado
- Esto es una limitación de aplicaciones frontend sin backend

### 🛡️ Para mayor seguridad real:
- Implementa un backend con JWT
- Usa Firebase Authentication
- Usa Auth0 o similar

---

## 🎯 Comandos Útiles

### Ejecutar build localmente:
```bash
npm run build
npm run preview
```

### Ver cómo se verá en producción:
```bash
# El preview usa el mismo base path
npm run preview
# Abre: http://localhost:4173/myFilms/
```

### Forzar re-deploy (sin cambios):
1. Ve a **Actions** en GitHub
2. Selecciona "Deploy to GitHub Pages"
3. Click en **Run workflow**
4. Click en **Run workflow** (botón verde)

---

## 📊 Monitoreo

### Ver logs del deploy:
```
1. GitHub → Actions
2. Click en el workflow
3. Click en "build" → Ver cada paso
4. Click en "deploy" → Ver deploy a Pages
```

### Ver estadísticas de GitHub Pages:
```
Settings → Pages → "View deployment"
```

---

## ✅ Checklist Final

Antes del primer deploy, verifica:

- [ ] Todos los 5 secrets están configurados en GitHub
- [ ] `vite.config.js` tiene `base: '/myFilms/'`
- [ ] El archivo `.github/workflows/deploy.yml` existe
- [ ] GitHub Pages está configurado en "GitHub Actions" mode
- [ ] Has hecho push a la rama `main`

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Revisa los logs de Actions**: GitHub → Actions → Click en el workflow fallido
2. **Verifica los secrets**: Settings → Secrets → Asegúrate que todos existen
3. **Verifica el vite.config.js**: El `base` debe coincidir con el nombre del repo
4. **Prueba localmente**: `npm run build && npm run preview`

---

**🎉 Una vez configurado, cada push desplegará automáticamente tu app actualizada!**
