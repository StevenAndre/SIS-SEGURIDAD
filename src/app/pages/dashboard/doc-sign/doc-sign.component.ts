import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

const API_BASE = `${environment.apiUrl}/enc/api`;

interface EncryptResponse {
  encryptedDocument: string;
  originalHash: string;
  fileName: string;
  signedBy: string;
  signatureTimestamp: string;
  status: string;
  message: string;
}

interface DecryptResponse {
  fileName: string;
  content: string;
  contentBase64: string;
  originalHash: string;
  currentHash: string;
  integrityValid: boolean;
  signedBy: string;
  signatureTimestamp: string;
  digitalSignature: string; // NUEVO
  isBinaryFile: boolean; // NUEVO
  status: string;
  message: string;
  warning?: string;
}

interface SignatureVerificationResponse {
  fileName: string;
  signedBy: string;
  signatureTimestamp: string;
  digitalSignature: string; // NUEVO
  status: string;
  message: string;
}

@Component({
  selector: 'app-doc-sign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doc-sign.component.html',
  styleUrls: ['./doc-sign.component.css']
})
export class DocSignComponent {
  selectedFile: File | null = null;
  loadingEncrypt = false;
  loadingDecrypt = false;
  loadingVerify = false;
  encryptResult: EncryptResponse | null = null;
  decryptInput: string = '';
  decryptResult: DecryptResponse | null = null;
  verifyInput: string = '';
  verifyResult: SignatureVerificationResponse | null = null;
  publicKey: string = '';

  constructor(private http: HttpClient) {
    this.loadPublicKey();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.encryptResult = null;
    }
  }

  loadPublicKey() {
    this.http.get<any>(`${API_BASE}/public-key`).subscribe({
      next: (data) => {
        this.publicKey = data.publicKey;
      },
      error: (err) => {
        console.error('Error loading public key:', err);
      }
    });
  }

  encryptDocument() {
    if (!this.selectedFile) return;
    
    this.loadingEncrypt = true;
    this.encryptResult = null;
    
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
    this.http.post<EncryptResponse>(`${API_BASE}/encrypt-document`, formData).subscribe({
      next: (data) => {
        this.encryptResult = data;
        this.loadingEncrypt = false;
      },
      error: (err) => {
        this.encryptResult = { 
          status: 'error', 
          message: err.error?.message || 'Error de conexión',
          encryptedDocument: '',
          originalHash: '',
          fileName: '',
          signedBy: '',
          signatureTimestamp: ''
        };
        this.loadingEncrypt = false;
      }
    });
  }

  downloadEncryptedFile() {
    if (!this.encryptResult?.encryptedDocument || !this.encryptResult?.fileName) return;
    
    const fileName = `${this.encryptResult.fileName}.encrypted`;
    const blob = new Blob([this.encryptResult.encryptedDocument], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  decryptDocument() {
    if (!this.decryptInput.trim()) return;
    
    this.loadingDecrypt = true;
    this.decryptResult = null;
    
    this.http.post<DecryptResponse>(`${API_BASE}/decrypt-document`, { 
      encryptedDocument: this.decryptInput.trim() 
    }).subscribe({
      next: (data) => {
        this.decryptResult = data;
        if (!data.integrityValid) {
          this.decryptResult.status = 'warning';
        }
        this.loadingDecrypt = false;
      },
      error: (err) => {
        this.decryptResult = { 
          status: 'error', 
          message: err.error?.message || 'Error de conexión',
          fileName: '',
          content: '',
          contentBase64: '',
          originalHash: '',
          currentHash: '',
          integrityValid: false,
          signedBy: '',
          signatureTimestamp: '',
          digitalSignature: '', // NUEVO
          isBinaryFile: false // NUEVO
        };
        this.loadingDecrypt = false;
      }
    });
  }

  verifySignature() {
    if (!this.verifyInput.trim()) return;
    
    this.loadingVerify = true;
    this.verifyResult = null;
    
    this.http.post<SignatureVerificationResponse>(`${API_BASE}/verify-signature`, { 
      encryptedDocument: this.verifyInput.trim() 
    }).subscribe({
      next: (data) => {
        this.verifyResult = data;
        this.loadingVerify = false;
      },
      error: (err) => {
        this.verifyResult = { 
          status: 'error', 
          message: err.error?.message || 'Error de conexión',
          fileName: '',
          signedBy: '',
          signatureTimestamp: '',
          digitalSignature: '' // NUEVO
        };
        this.loadingVerify = false;
      }
    });
  }

  // MÉTODO ACTUALIZADO para manejar archivos binarios y firma digital
  downloadDecryptedFile() {
    if (!this.decryptResult?.fileName) return;
    
    try {
      const fileName = this.decryptResult.fileName;
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      let blob: Blob;
      let mimeType = 'text/plain; charset=utf-8';
      
      if (this.decryptResult.isBinaryFile) {
        // Para archivos binarios, usar contentBase64
        if (this.decryptResult.contentBase64) {
          const binaryString = atob(this.decryptResult.contentBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          switch (extension) {
            case 'pdf':
              mimeType = 'application/pdf';
              break;
            case 'doc':
              mimeType = 'application/msword';
              break;
            case 'docx':
              mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              break;
            default:
              mimeType = 'application/octet-stream';
          }
          
          blob = new Blob([bytes], { type: mimeType });
        } else {
          throw new Error('No hay contenido binario disponible');
        }
      } else {
        // Para archivos de texto, agregar la firma digital al contenido
        let finalContent = this.decryptResult.content;
        
        if (this.decryptResult.digitalSignature) {
          finalContent += this.decryptResult.digitalSignature;
        }
        
        switch (extension) {
          case 'json':
            mimeType = 'application/json';
            break;
          case 'txt':
          default:
            mimeType = 'text/plain; charset=utf-8';
            break;
        }
        
        blob = new Blob([finalContent], { type: mimeType });
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Error al descargar el archivo: ' + error.message);
      console.error('Error downloading file:', error);
    }
  }

  // NUEVO MÉTODO: Descargar documento con firma digital (para archivos binarios)
  downloadWithSignature() {
    if (!this.decryptResult?.fileName || !this.decryptResult?.digitalSignature) return;
    
    try {
      const fileName = this.decryptResult.fileName;
      const signatureFileName = `${fileName.split('.')[0]}_signature.txt`;
      
      const blob = new Blob([this.decryptResult.digitalSignature], { type: 'text/plain; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = signatureFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Error al descargar la firma: ' + error.message);
      console.error('Error downloading signature:', error);
    }
  }

  // Función para determinar si el archivo es binario
  isBinaryFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'].includes(extension || '');
  }

  // MÉTODO ACTUALIZADO para mostrar contenido apropiado
  getPreviewContent(): string {
    if (!this.decryptResult?.content || !this.decryptResult?.fileName) return '';
    
    if (this.decryptResult.isBinaryFile) {
      return '[Archivo binario - No se puede mostrar vista previa de texto]\n\n' + 
             `Tipo: ${this.decryptResult.fileName.split('.').pop()?.toUpperCase()}\n` +
             `Nombre: ${this.decryptResult.fileName}\n` +
             'Use el botón "Descargar Archivo Original" para obtener el archivo.\n' +
             'Use el botón "Descargar Firma Digital" para obtener la firma por separado.';
    }
    
    // Para archivos de texto, mostrar contenido + firma
    let content = this.decryptResult.content;
    if (this.decryptResult.digitalSignature) {
      content += this.decryptResult.digitalSignature;
    }
    
    return content;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiado al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }

  clearEncryptForm() {
    this.selectedFile = null;
    this.encryptResult = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearDecryptForm() {
    this.decryptInput = '';
    this.decryptResult = null;
  }

  clearVerifyForm() {
    this.verifyInput = '';
    this.verifyResult = null;
  }
}