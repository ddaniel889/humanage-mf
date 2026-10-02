export interface CertificatePost {
  ExpirationDate?: Date;
  Type: number;
  ProviderId: number;
  ProviderName?: string;
  Enabled: boolean;
  DocumentIds?: number[];
  UserId?: number;
  OrganizationalUnitId?: number;
  RevocationPin?: string;
  isAutoDeclarated: boolean;
  url?: string;
  Cuil?: string;
}
