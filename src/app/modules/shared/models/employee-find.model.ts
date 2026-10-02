import { MetadataFind } from './metadata.model';
import { IdName } from './Generics/IdName.model';

export class EmployeeFind implements IdName {
    id: number;
    name: string;
    metadata?: MetadataFind;

    constructor(id: number, name: string, metadata?: MetadataFind) {
      this.id = id;
      this.name = name;
      this.metadata = metadata;
    }
}
