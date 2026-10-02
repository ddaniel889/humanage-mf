export class FileDocumentMetadata {
  metadataValue: any;
  systemName: any;
  metadataId: number;
  asName: boolean;
  metadataIsRequired: boolean;
  metadataIsUnique: boolean;
  metadataLabel: string;
  metadataType: String;
  metadataValueDescription: string;
  position: number;

  constructor() {
    this.metadataValue = "";
  }

  formatMetadata(): any {
    switch (this.metadataType) {
      case "combo":
      case "comboKV":
        if (this.metadataValue) {
          return this.metadataValueDescription != null ? this.metadataValueDescription : this.metadataValue;
        } else {
          return "";
        }
        break;
      case "userControl":
        return "User Id: " + this.metadataValue;
        break;
      case "period":
        if (this.metadataValue) {
          return new Date(this.metadataValue.substring(0, 4), this.metadataValue.substring(4, 6), 0, 0, 0, 0, 0);
        } else {
          return "";
        }
        break;
      default:
        return this.metadataValue;
    }

  }
}
