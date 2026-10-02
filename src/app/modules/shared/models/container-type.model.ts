import { EmployeeMetadata } from "./employee-metadata.model";

export class ContainerType {

  public static readonly cuilSystemName = '_cuil';
  public static readonly cuilLabel = 'Cuil';
  public static readonly cuilMask = '99-99999999-9';

  id: number;
  organizationalUnitId: number;
  organizationalUnitName: string;
  metadata: EmployeeMetadata[];

  constructor(
    id: number,
    organizationalUnitId: number,
    organizationalUnitName: string,
    metadata: EmployeeMetadata[]
  ) {
    this.id = id;
    this.organizationalUnitId = organizationalUnitId;
    this.organizationalUnitName = organizationalUnitName;
    this.metadata = metadata;
  }

  get mask(): string {
    return this.getMetadataMask(ContainerType.cuilSystemName);
  }

  get maskLength(): number {
    return this.getMetadataMaskLength();
  }

  get maskPlaceHolder(): string {
    return this.getMetadataMaskPlaceHolder(ContainerType.cuilSystemName);
  }

  get label(): string {
    return this.getMetadataLabel(ContainerType.cuilSystemName);
  }

  protected getMetadataMask(key: string): any {
    const mv = this.getMetadata(key);

    return mv != null ? this.replaceMask(mv.metadataMask) : '00-00000000-0';
  }

  protected getMetadataMaskLength(): any {
    const rgx = new RegExp("[^a-zA-Z0-9 *]");

    return this.mask.replace(new RegExp(rgx, 'g'), '').length;
  }

  protected getMetadataMaskPlaceHolder(key: string): any {
    const mv = this.getMetadata(key);
    return mv != null ? mv.metadataMaskPlaceHolder : null;
  }

  protected getMetadataLabel(key: string): any {
    const mv = this.getMetadata(key);
    return mv != null ? mv.metadataLabel : null;
  }

  protected getMetadata(key: string): EmployeeMetadata {
    if (!this.metadata) {
      return null;
    }

    const mvalues = this.metadata.filter(
      employeeFile => employeeFile.metadataSystemName === key
    );

    if (mvalues.length > 0) {
      return mvalues[0];
    }

    return null;
  }

  replaceMask(mask: string): String {
    const m = this.replaceAll(mask, /\*/g, 'A');

    return this.replaceAll(m, '9', '0');
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }
}
