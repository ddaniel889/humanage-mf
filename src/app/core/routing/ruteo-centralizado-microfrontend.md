# Ruteo Centralizado - Guía de Implementación (Microfrontend)

## Descripción General

El sistema de ruteo centralizado permite que este microfrontend coordine su navegación con la aplicación host. El microfrontend **nunca** toma decisiones de navegación directamente, sino que solicita al host y reacciona a sus decisiones.

## Principio Fundamental

**El host decide, el microfrontend reacciona.**

## Arquitectura

### Flujo de Comunicación

```text
Microfrontend Request → Host Decision → Host Broadcast → Microfrontend Update
```

## Componentes Principales

### 1. MicrofrontendLocationStrategy

**Ubicación:** `src/app/core/routing/microfrontend-location-strategy.ts`

**Responsabilidades:**

- Interceptar todas las operaciones de navegación del router de Angular
- Enviar solicitudes de navegación al host
- Escuchar broadcasts del host
- Actualizar el estado interno solo cuando el host lo indica

**Métodos Clave:**

```typescript
// Notifica al host sobre navegación solicitada
override pushState(state: unknown, title: string, url: string, queryParams: string): void

override replaceState(state: unknown, title: string, url: string, queryParams: string): void

// Solicita manipulación del historial al host
override back(): void
override forward(): void
override historyGo(relativePosition: number): void

// Procesa decisiones del host
private processHostNavigationDecision(hostRoute: string): void

// Configura comunicación con el host
private setupHostCommunication(): void
```

## Configuración

### 1. Registrar el LocationStrategy

En el módulo principal del microfrontend:

```typescript
import { MicrofrontendLocationStrategy } from './core/routing/microfrontend-location-strategy';
import { LocationStrategy } from '@angular/common';

@NgModule({
  providers: [
    {
      provide: LocationStrategy,
      useClass: MicrofrontendLocationStrategy
    }
  ]
})
export class AppModule { }
```

### 2. Configurar UrlHandlingStrategy

El microfrontend debe definir qué rutas le pertenecen (ver VALID_URL_PREFIXES injection token)

## Flujos de Navegación

### Navegación Interna del Microfrontend

1. Usuario hace click en un link o se llama a `router.navigate()`
2. `MicrofrontendLocationStrategy.pushState()` intercepta
3. Se emite `MicrofrontendNavigationRequestEvent` al host
4. **NO se actualiza el estado interno aún**
5. Host procesa y hace broadcast
6. `setupHostCommunication()` recibe el broadcast
7. `shouldProcessUrl()` determina si esta ruta es para este microfrontend
8. Si es para este microfrontend: `processHostNavigationDecision()` actualiza el estado
9. Se navega internamente y se emite el cambio

### Navegación desde el Host

1. Host cambia de ruta
2. Host hace broadcast con `HostNavigationChangeEvent`
3. Todos los microfrontends reciben el evento
4. `shouldProcessUrl()` filtra si la ruta pertenece a este microfrontend
5. Si pertenece: `processHostNavigationDecision()` actualiza el estado
6. Si no pertenece: se ignora el evento

### Operaciones de Historial

1. Usuario hace click en botón "Atrás"
2. `MicrofrontendLocationStrategy.back()` intercepta
3. Se emite `MicrofrontendHistoryRequestEvent` al host
4. Host ejecuta `history.back()`
5. Browser cambia la URL
6. Host detecta el cambio y hace broadcast
7. Microfrontend reacciona según corresponda
