# Host Communication Module

Self-contained module for communication between microfrontends and host application via CustomEvents.

## Structure

```
host-events/
├── models/
│   ├── host-dialog-config.model.ts    - Configuration compatible with Angular Material 14+
│   ├── open-file-document-event.model.ts - CustomEvent payload
│   ├── host-event-types.ts - Event types enum
│   └── index.ts
├── services/
│   ├── host-event.service.ts          - Service that dispatches events
│   └── index.ts
├── index.ts                            - Main exports
└── README.md                           - This file
```

## Usage

### In the Microfrontend

```typescript
import { HostEventsService, HostDialogConfig } from '../path/to/host-events'; // Adjust path based on your project structure

export class MyComponent {
  constructor(private hostEventsService: HostEventsService) {}

  openDialog() {
    const config: HostDialogConfig = {
      data: myData,
      width: '90%',
      panelClass: 'my-custom-class'
    };
    this.hostEventsService.openFileDocument(config);
  }
}
```

To use this module in another microfrontend:

1. Copy the `host-events` folder entirely to `src/app/core/`
2. Import from the location where you copied the folder (e.g. `../../core/host-events`)
3. Ensure the host has a listener configured

## Extensibility

To add new event types:

1. Create new interface in `models/` (e.g., `open-custom-event.model.ts`)
2. Create method in `HostEventsService` (e.g., `openCustomDialog()`)
3. Update exports in `models/index.ts`
4. Create corresponding listener in the host
