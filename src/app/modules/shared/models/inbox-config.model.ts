import { DocumentationType } from './documentation-type.model';

export class InboxConfig {
    id: number;
    name: string;
    documentationTypeIds: number[];
    organizationalUnitId: number;
    documentationTypes: DocumentationType[];
    isEntryPoint: boolean;
    isDefaultConfig: boolean;
}
