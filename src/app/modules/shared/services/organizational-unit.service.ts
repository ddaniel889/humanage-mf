import { Injectable } from '@angular/core';
import { OrganizationalUnit } from '../models/organizational-unit.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationalUnitService {
  getCurrentOrChildOU(): OrganizationalUnit | null {
    const currentOu = this.getCurrentOU();
    if (currentOu === null) return null;

    // Si es una OU grupo devuelvo la primer hija que tenga disponible
    return currentOu.isRoot ? currentOu.childs[0] : currentOu;
  }

  getCurrentOU(): OrganizationalUnit | null {
    const value = localStorage.getItem('currentOU');
    if (value === null) return null;
    return JSON.parse(value) as OrganizationalUnit;
  }

  getTreeInMemory(): OrganizationalUnit[] | null {
    const value = localStorage.getItem('treeOu');
    if (value === null) return null;
    return JSON.parse(value) as OrganizationalUnit[];
  }

  getRootOU(): OrganizationalUnit | null {
    const tree = this.getTreeInMemory();
    if (tree === null) return null;
    return tree.find(ou => ou.isRoot) || null;
  }

  setCurrentOU(ou: OrganizationalUnit) {
    localStorage.setItem('currentOU', JSON.stringify(ou));
  }
}
