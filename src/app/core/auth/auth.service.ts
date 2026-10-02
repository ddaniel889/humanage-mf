import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { emitEventAndWait } from '../utils/event.utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getAccesToken() {
    return localStorage.getItem('access_token');
  }

  refreshToken(): Observable<boolean> {
    return from(emitEventAndWait<boolean>('refreshtoken'));
  }

  getUserId(): string {
    return localStorage.getItem("userId");
  }

  getUserNick(): string {
    return localStorage.getItem("userNick");
  }

  getOrganizationId(): string {
    return localStorage.getItem("organizationId");
  }

  getOrganizationName(): string {
    return localStorage.getItem('organizationName');
  }

  getOrganizationDescription(): string {
    return localStorage.getItem('organizationDescription');
  }

  getUserFirstName(): string {
    return localStorage.getItem('userFirstname');
  }

  getUserLastName(): string {
    return localStorage.getItem('userLastname');
  }

  isInRole(rol: string): boolean {
    if (!localStorage.getItem("roles")) {
      return false;
    }
    const roles = localStorage.getItem("roles").split(",");

    return roles.includes(rol);
  }

  isRRHH() {
    return this.isInRole('RRHH_CONTENT');
  }

  RRHHManagment() {
    return this.isInRole('RRHH_ADMIN');
  }

  isAdministrator() {
    return this.isInRole('RRHH_ACCESS');
  }

  isLeaveManager(){
     return this.isInRole('LEAVEMANAGE');
  }

  isLeaveApprov(){
    return this.isInRole('LEAVEAPROV');
  }

  isLeaveConfig(){
    return this.isInRole('LEAVECONFIG');
 }

  employeeManagement() {
    return this.isInRole('MANAGE_EMPLOYEES');
  }

  isCandidateAdmin() {
    return this.isInRole('CANDIDATEADMIN');
  }

  isLSDSigner() {
    return this.isInRole('LAWBOOK SIGN');
  }

  isLSDWrite() {
    return this.isInRole('LAWBOOK WRITE');
  }

  isOverseer() {
    return this.isInRole('OVERSEER');
  }

  canEdit() {
    return this.isInRole('EMPLOYER EDIT');
  }

  isFirmante() {
    return this.isInRole('FIRMANTE');
  }

  isGestorDocumental() {
    return this.isInRole('RRHH_DOCUMENTS');
  }

  isCandidate() {
    return !this.isInRole('EMPLOYEE LD') && this.isInRole('CANDIDATE');
  }
}
