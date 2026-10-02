import { MetadataFind } from './metadata.model';
import { IdName } from './Generics/IdName.model';

export class DocumentationFind implements IdName {
    documentTypeId?: number;
    documentationTypeId?: number;
    documentationTypeName?: string;
    metadatas?: MetadataFind[];
    sequence: any[];
    restrictionFilter: number;
    filterNonViewed: boolean;

    constructor(documentTypeId: number, id: number, name: string, sequence: any[], metadatas?: MetadataFind[]) {
      this.documentTypeId = documentTypeId;
      this.documentationTypeId = id;
      this.documentationTypeName = name;
      this.metadatas = metadatas || [];
      this.sequence = sequence;
    }

    get id(): number {
      return this.documentationTypeId ? this.documentationTypeId : 0;
    }

    get name(): string {
      return this.documentationTypeName;
    }
}
