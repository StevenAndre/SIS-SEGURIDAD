import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class HashUrlService {
  private secretKey = 'mi-app-secret-key-2024';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  // Codificar el estado de la vista a hash
  encodeViewState(viewInfo: any): string {
    const stateString = JSON.stringify(viewInfo);
    const encrypted = CryptoJS.AES.encrypt(stateString, this.secretKey).toString();
    // Hacer URL-safe
    return encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Decodificar el hash a estado
  decodeViewState(hashedString: string): any {
    try {
      // Restaurar formato original
      const restored = hashedString.replace(/-/g, '+').replace(/_/g, '/');
      // Añadir padding si es necesario
      const padded = restored + '==='.slice(0, (4 - restored.length % 4) % 4);
      
      const bytes = CryptoJS.AES.decrypt(padded, this.secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decodificando estado:', error);
      return null;
    }
  }

  // Navegar manteniendo URL fija pero cambiando el hash
  navigateWithHashedView(viewInfo: any, currentRoute: string = '/dashboard') {
    const hashedState = this.encodeViewState(viewInfo);
    
    // Mantener la URL base igual, solo cambiar el fragment
    this.router.navigate([currentRoute], { 
      fragment: hashedState,
      replaceUrl: true // No agregar al historial
    });
  }

  // Obtener estado actual desde URL
  getCurrentViewState(): any {
    const fragment = this.activatedRoute.snapshot.fragment;
    if (fragment) {
      return this.decodeViewState(fragment);
    }
    return null;
  }

  // Limpiar hash de la URL
  clearHash() {
    this.router.navigate([], { fragment: '', replaceUrl: true });
  }
}