import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenDto {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  preLogin(request: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/pre-login`, request);
  }

  login(loginRequest: LoginRequest, code: string): Observable<TokenDto> {
    return this.http.post<TokenDto>(`${this.apiUrl}/login/${code}`, loginRequest);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  setToken(token: string): void {
    console.log('Setting token:', token);
    localStorage.setItem(this.TOKEN_KEY, token);
    console.log('Token after setting:', localStorage.getItem(this.TOKEN_KEY));
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('Getting token:', token);
    return token;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('Checking authentication, token:', token);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      const expirationDate = new Date(payload.exp * 1000);
      const isValid = expirationDate > new Date();
      console.log('Token expiration:', expirationDate, 'Is valid:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { responseType: 'text' });
  }
} 