import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-verification-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verification-code.component.html',
  styleUrls: ['./verification-code.component.css']
})
export class VerificationCodeComponent implements OnInit {
  verificationForm!: FormGroup;
  private loginRequest!: LoginRequest;
  isLoading = false;
  isToastVisible = false;
  isHiding = false;
  toastMessage = '';
  isSuccessToast = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    // Get login request from session storage
    const storedRequest = sessionStorage.getItem('loginRequest');
    if (!storedRequest) {
      this.router.navigate(['/login']);
      return;
    }
    this.loginRequest = JSON.parse(storedRequest);
  }

  ngOnInit() {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.pattern('^[0-9]*$')]]
    });
  }

  showToast(message: string, isSuccess: boolean = false) {
    this.toastMessage = message;
    this.isToastVisible = true;
    this.isHiding = false;
    this.isSuccessToast = isSuccess;

    // Hide toast after 3 seconds
    setTimeout(() => {
      this.isHiding = true;
      setTimeout(() => {
        this.isToastVisible = false;
      }, 300); // Match the slideOut animation duration
    }, 3000);
  }

  onSubmit() {
    if (this.verificationForm.valid) {
      this.isLoading = true;
      const code = this.verificationForm.get('code')?.value;
      
      this.authService.login(this.loginRequest, code)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Login response:', response);
            if (response && response.token) {
              this.authService.setToken(response.token);
              console.log('Token saved:', this.authService.getToken());
              sessionStorage.removeItem('loginRequest');
              
              // Get user info and show welcome message
              const userInfo = this.userService.getUserInfo();
              console.log('User info:', userInfo);
              if (userInfo) {
                this.showToast(`¡Bienvenido ${userInfo.fullName}!`, true);
                setTimeout(() => {
                  this.router.navigate(['/main']);
                }, 1000);
              } else {
                this.router.navigate(['/main']);
              }
            } else {
              console.error('No token in response');
              this.showToast('Error: No se recibió el token de autenticación');
            }
          },
          error: (error) => {
            console.error('Error during verification:', error);
            if (error.status === 401) {
              this.showToast('Código de verificación incorrecto');
            } else if (error.status === 400) {
              this.showToast('El código ha expirado. Por favor, intente nuevamente');
            } else {
              this.showToast('Error al verificar el código. Por favor, intente nuevamente');
            }
          }
        });
    }
  }
} 