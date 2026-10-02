export const HostEventTypes = {
  OpenFileDocument: 'open-file-document',
} as const;

export type HostEventType = (typeof HostEventTypes)[keyof typeof HostEventTypes];
