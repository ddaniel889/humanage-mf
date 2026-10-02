import { MetadataDefinition } from "./metadata.model";

export interface ContainerTypeMetadata extends MetadataDefinition {
  isReadOnly: boolean;
  isReplicated: boolean;
  legSystemName: string;
  metadataMaskOption: [];
  metadataMaskPlaceHolder: string;
}
