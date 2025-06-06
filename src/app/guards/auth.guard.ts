import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    
    const token = this.authService.getToken();
    console.log('AuthGuard - Token:', token);
  
    
    if (!token) {
      console.log('AuthGuard - No token found');
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('AuthGuard - Token payload:', payload);
      
      // Verificar si el token tiene los campos necesarios
      if (!payload.sub || !payload.fullName) {
        console.log('AuthGuard - Invalid token payload');
        this.authService.logout();
        this.router.navigate(['/login']);
        return false;
      }

      return true;
    } catch (error) {
      console.error('AuthGuard - Error decoding token:', error);
      this.authService.logout();
      this.router.navigate(['/login']);
      return false;
    }
  }
} 