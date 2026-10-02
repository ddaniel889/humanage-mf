export interface Certificate {
    id: number;
    expirationDate: Date;
    enabled: boolean;
    provider: string;
    providerId: string;
    providerDescription: string;
    requirePassword: boolean;
    supportDisagreement: boolean;
    isPending: boolean;
    massiveSignatureAction: string;
    singleSignatureAction: string;
    type: string;
    typeId: CertificateType;
    organizationalUnitName: string;
    organizationalUnitDescription: string;
    organizationalUnitId: number;
    lastUseDate?: Date;
}

export enum CertificateType {
    Employee = 0,
    Employer = 1,
}
