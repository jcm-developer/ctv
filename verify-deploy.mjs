#!/usr/bin/env node

/**
 * Script de verificación de configuración de deploy
 * Verifica que todo esté listo para el deploy en GitHub Pages
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verificando configuración de deploy...\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Verificar que existe vite.config.js
console.log('📝 Verificando vite.config.js...');
const viteConfigPath = join(__dirname, 'vite.config.js');
if (existsSync(viteConfigPath)) {
    const viteConfig = readFileSync(viteConfigPath, 'utf-8');
    if (viteConfig.includes("base: '/myFilms/'")) {
        success.push('✅ vite.config.js tiene el base path correcto');
    } else {
        errors.push('❌ vite.config.js debe tener: base: \'/myFilms/\'');
    }
} else {
    errors.push('❌ No se encuentra vite.config.js');
}

// 2. Verificar que existe .github/workflows/deploy.yml
console.log('📝 Verificando workflow de GitHub Actions...');
const workflowPath = join(__dirname, '.github', 'workflows', 'deploy.yml');
if (existsSync(workflowPath)) {
    success.push('✅ Workflow de deploy configurado');
    const workflow = readFileSync(workflowPath, 'utf-8');

    // Verificar que usa secrets
    const requiredSecrets = [
        'VITE_TOKEN',
        'VITE_API_KEY',
        'VITE_API_URL',
        'VITE_AUTH_USER1',
        'VITE_AUTH_USER2'
    ];

    requiredSecrets.forEach(secret => {
        if (workflow.includes(`secrets.${secret}`)) {
            success.push(`✅ Secret ${secret} configurado en workflow`);
        } else {
            errors.push(`❌ Secret ${secret} falta en workflow`);
        }
    });
} else {
    errors.push('❌ No se encuentra .github/workflows/deploy.yml');
}

// 3. Verificar .env local
console.log('📝 Verificando .env local...');
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
    success.push('✅ Archivo .env existe localmente');
    const envContent = readFileSync(envPath, 'utf-8');

    const requiredEnvVars = [
        'VITE_TOKEN',
        'VITE_API_KEY',
        'VITE_API_URL',
        'VITE_AUTH_USER1',
        'VITE_AUTH_USER2'
    ];

    requiredEnvVars.forEach(envVar => {
        if (envContent.includes(envVar + '=')) {
            success.push(`✅ ${envVar} definido en .env`);
        } else {
            warnings.push(`⚠️  ${envVar} no está en .env local`);
        }
    });
} else {
    warnings.push('⚠️  Archivo .env no existe (esto es normal si usas solo GitHub Secrets)');
}

// 4. Verificar .gitignore
console.log('📝 Verificando .gitignore...');
const gitignorePath = join(__dirname, '.gitignore');
if (existsSync(gitignorePath)) {
    const gitignore = readFileSync(gitignorePath, 'utf-8');
    if (gitignore.includes('.env')) {
        success.push('✅ .env está en .gitignore');
    } else {
        errors.push('❌ .env debe estar en .gitignore para proteger tus credenciales');
    }
} else {
    errors.push('❌ No se encuentra .gitignore');
}

// 5. Verificar package.json
console.log('📝 Verificando package.json...');
const packageJsonPath = join(__dirname, 'package.json');
if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    if (packageJson.scripts && packageJson.scripts.build) {
        success.push('✅ Script de build configurado');
    } else {
        errors.push('❌ Script de build falta en package.json');
    }
} else {
    errors.push('❌ No se encuentra package.json');
}

// Mostrar resultados
console.log('\n' + '='.repeat(60));
console.log('📊 RESULTADOS DE LA VERIFICACIÓN');
console.log('='.repeat(60) + '\n');

if (success.length > 0) {
    console.log('✅ ÉXITOS:\n');
    success.forEach(msg => console.log('  ' + msg));
    console.log('');
}

if (warnings.length > 0) {
    console.log('⚠️  ADVERTENCIAS:\n');
    warnings.forEach(msg => console.log('  ' + msg));
    console.log('');
}

if (errors.length > 0) {
    console.log('❌ ERRORES:\n');
    errors.forEach(msg => console.log('  ' + msg));
    console.log('');
}

// Resumen final
console.log('='.repeat(60));
if (errors.length === 0) {
    console.log('✅ TODO LISTO PARA DEPLOY!');
    console.log('\nPróximos pasos:');
    console.log('1. Configura los Secrets en GitHub:');
    console.log('   Settings → Secrets and variables → Actions');
    console.log('2. Haz push a la rama main:');
    console.log('   git add . && git commit -m "Deploy setup" && git push');
    console.log('3. Ve a Actions en GitHub para ver el deploy');
    console.log('\n📚 Más información: Lee DEPLOY.md');
} else {
    console.log('❌ HAY ERRORES QUE CORREGIR');
    console.log('\n⚠️  Revisa los errores arriba antes de hacer deploy');
    process.exit(1);
}
console.log('='.repeat(60) + '\n');
