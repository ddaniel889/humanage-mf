/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class User {
  id: number;
  organizationalUnitId: number;
  organizationalUnitName?: string;
  organizationalUnitIds?: number[];
  certificateProviderName?: string;
  certificateProviderId?: number;
  certificateExpirationDate?: Date;
  functions?: string[];
  loginId?: number;
  nickName: string;
  firstName: string;
  lastName: string;
  delegatedSystemId?: string;
  userName: string;
  mail: string;
  mailConfirm?: string;
  cuil: string;
  enabled: boolean;
  locked?: boolean;
  creationDate: Date;
  roles?: any[];
  applicationId?: number;
  url?: string;
  selected?: boolean;
  fullName?: string;
  lastLoginDate?: Date;
  lastFailedLoginDate?: Date;
  isSamlActive?: boolean;
  welcomeSent?: boolean;
  constructor() {
    this.url = `${location.origin}/#/pwd-first-time/{0}`;
    this.selected = false;
    this.locked = false;
    this.enabled = false;
    this.roles = [];
    this.organizationalUnitIds = [];
  }

  // No se utiliza en este proyecto
  public showCertificate(): boolean {
    throw new Error('Do not use');

    if (this.certificateProviderName) {
      if (this.certificateExpirationDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dueDate: Date;

        try {
          dueDate = new Date(<any>this.certificateExpirationDate);
        } catch (error) {
          const x = (<any>this.certificateExpirationDate.toDateString()).split('/');
          dueDate = new Date(x[2], x[1] - 1, x[0]);
        }

        if (dueDate >= today) {
          return true;
        }
      } else {
        return true;
      }
    }

    return false;
  }

  /// No se utiliza en este proyecto
  public getTooltipMessage(): string {
    throw new Error('Do not use');

    if (this.certificateProviderName) {
      if (this.certificateExpirationDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dueDate: Date;

        try {
          dueDate = new Date(<any>this.certificateExpirationDate);
        } catch (error) {
          const x = (<any>this.certificateExpirationDate.toDateString()).split('/');
          dueDate = new Date(x[2], x[1] - 1, x[0]);
        }

        if (dueDate >= today) {
          return `${this.certificateProviderName} - ${dueDate.toLocaleDateString()}`;
        }
      } else {
        return `${this.certificateProviderName} - Sin caducidad indicada`;
      }
    }

    return 'Sin Certificado Habilitado';
  }

  public getRolesTooltipMessage(): string {
    let tooltip = '';
    if (this.functions.indexOf('RRHH_CONTENT') != -1) {
      tooltip += 'RRHH, ';
    }

    if (this.functions.indexOf('RRHH_ACCESS') != -1) {
      tooltip += 'Administrador, ';
    }

    if (this.functions.indexOf('FIRMANTE') != -1) {
      tooltip += 'Firmante, ';
    }

    if (this.functions.indexOf('OVERSEER') != -1) {
      tooltip += 'Consulta, ';
    }

    if (tooltip.length > 0) {
      // Remove trailing comma and space
      tooltip = tooltip.replace(/, $/g, '');
    }

    return tooltip;
  }

  public getRolIconClass(): string {
    if (
      (this.functions.indexOf('RRHH_CONTENT') != -1 ||
        this.functions.indexOf('RRHH_ACCESS') != -1) &&
      this.functions.indexOf('FIRMANTE') != -1
    ) {
      // definir icono ambos roles
      return 'fa-user-crown';
    }

    if (
      (this.functions.indexOf('RRHH_CONTENT') != -1 ||
        this.functions.indexOf('RRHH_ACCESS') != -1) &&
      this.functions.indexOf('FIRMANTE') == -1
    ) {
      // definir icono empleador
      return 'fa-user-cog ';
    }

    if (
      this.functions.indexOf('RRHH_CONTENT') == -1 &&
      this.functions.indexOf('RRHH_ACCESS') == -1 &&
      this.functions.indexOf('FIRMANTE') != -1
    ) {
      // definir icono apoderado
      return 'fa-user-tie';
    }

    if (this.functions.indexOf('OVERSEER') != -1) {
      // definir icono fiscalizador
      return 'fa-user-ninja';
    }

    return '';
  }
}
