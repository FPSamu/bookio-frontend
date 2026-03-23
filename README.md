# Bookio - Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![AWS S3](https://img.shields.io/badge/Amazon_S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)

Bienvenido al repositorio Frontend de **Bookio**.

## 🔗 Ecosistema Bookio
Esta plataforma cuenta con una arquitectura desacoplada. Explora nuestros diferentes repositorios:

* 🌐 [**Frontend (React SPA)** ➔ Estás aquí](https://github.com/FPSamu/bookio-frontend)
* 📱 [**Mobile App (Cliente iOS/Android con Flutter)** ➔ Visitar Repositorio](https://github.com/FPSamu/bookio-mobile)
* ⚙️ [**Backend (API REST Node.js)** ➔ Visitar Repositorio](https://github.com/AlanDVarela/bookio-backend)

---

## 📖 Descripción del Proyecto
Actualmente, muchas Pequeñas y Medianas Empresas (PyMEs) del sector servicios (barberías, spas, consultorios) gestionan sus citas de manera manual. Esto ocasiona problemas críticos como el empalme de horarios (*overbooking*), altas tasas de ausentismo (*no-shows*) y pérdida de tiempo productivo en la gestión telefónica.

**Bookio** es una plataforma web SaaS (Software as a Service) multi-negocio diseñada para resolver esta problemática. Este repositorio contiene la **Single Page Application (SPA)** que sirve como interfaz principal para clientes y administradores de negocio, consumiendo la API REST del backend mediante Axios y desplegada como sitio estático en Amazon S3.

### 👥 Equipo y Distribución de Roles
* **Alan Varela:** Backend feature 1 + Front end.
* **Samuel Pia:** Backend feature 2 + Front end.
* **Jair Aguilar:** Backend feature 3 + CI/CD.

---

## 🏗️ Stack Tecnológico

| Tecnología | Rol en el proyecto |
|---|---|
| **React 19** | Librería principal de UI con composición basada en componentes |
| **Vite 8** | Bundler y servidor de desarrollo con HMR |
| **Tailwind CSS 3** | Estilos utilitarios sin archivos CSS adicionales |
| **React Router 7** | Enrutamiento del lado del cliente (SPA) |
| **Axios** | Cliente HTTP para consumir la API REST del backend |
| **Amazon S3** | Alojamiento del sitio estático en producción |

---

## 🚀 Flujos End-to-End (Vista del Cliente)

El frontend participa activamente en los 3 flujos principales del sistema:

1. **Flujo 1 - Onboarding del Tenant:** Formulario de registro de negocio y configuración de servicios. El cliente sube logos e imágenes que se almacenan en S3 a través del backend.
2. **Flujo 2 - Reserva de Citas:** Interfaz de calendario interactivo que consulta disponibilidad en tiempo real y envía solicitudes de reserva al Motor de Reserva del backend.
3. **Flujo 3 - Confirmaciones:** El usuario recibe retroalimentación visual inmediata tras la reserva mientras el backend publica el evento de notificación en SNS de forma asíncrona.

---

## ⚙️ Cómo correr el proyecto (Local)

### Prerrequisitos
* Node.js (v18 o superior)
* El [backend de Bookio](https://github.com/AlanDVarela/bookio-backend) corriendo localmente o una URL de API disponible

### Pasos de instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/FPSamu/bookio-frontend
   cd bookio-frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:

   Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. Levanta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Previsualización del build de producción |
| `npm run lint` | Análisis estático con ESLint |
