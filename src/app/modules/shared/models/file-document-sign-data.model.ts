export class FileDocumentCollaborationData {
  requiredSignature: boolean;
  viewDate: Date;
  signatureDate: Date;
  signatureState: string;
  motiveDisagreement: string;
  showMotiveDisagreement: boolean;
  uploaded: boolean;
  uploadDate: Date;
  error: string;
  enabled: boolean;

  isActionPending(): boolean {
    if (!this.enabled) {
      return false;
    }

    return ((this.requiredSignature && this.signatureDate == null) || this.viewDate == null || !this.uploaded);
  }

  getViewedDate(): Date {
    if (this.viewDate && new Date(this.viewDate).getFullYear() > 1900) {
      return this.viewDate;
    }
    return null;
  }

  getSignatureDate(): Date {
    if (this.signatureDate && new Date(this.signatureDate).getFullYear() > 1900) {
      return this.signatureDate;
    }
    return null;
  }

  hasErrors(): boolean {
    return (this.error != null && this.error.length > 0);
  }
}
