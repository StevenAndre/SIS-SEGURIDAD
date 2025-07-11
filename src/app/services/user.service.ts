import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface UserInfo {
  username: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface UserSessionDto {
  sessionId: number;
  loginTime: string;
  logoutTime: string | null;
  duration: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userInfo: UserInfo | null = null;

  constructor(private http: HttpClient) {
    this.loadUserInfo();
  }

  private loadUserInfo() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userInfo = {
          username: decodedToken.sub,
          fullName: decodedToken.fullName,
          email: decodedToken.email,
          roles: decodedToken.roles || []
        };
      } catch (error) {
        console.error('Error decoding token:', error);
        this.userInfo = null;
      }
    }
  }

  getUserInfo(): UserInfo | null {
    if (!this.userInfo) {
      this.loadUserInfo();
    }
    return this.userInfo;
  }

  clearUserInfo() {
    this.userInfo = null;
  }

  getUserSessions(userId: number): Observable<UserSessionDto[]> {
    return this.http.get<UserSessionDto[]>(`${environment.apiUrl}/users/${userId}/sessions`);
  }

  getAllSessions(): Observable<UserSessionDto[]> {
    return this.http.get<UserSessionDto[]>(`${environment.apiUrl}/users/sessions`);
  }
} 