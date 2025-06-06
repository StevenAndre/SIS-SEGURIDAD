import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading = false;
  showToast = false;
  isHiding = false;
  toastMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  showErrorToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    this.isHiding = false;

    // Hide toast after 3 seconds
    setTimeout(() => {
      this.isHiding = true;
      setTimeout(() => {
        this.showToast = false;
      }, 300); // Match the slideOut animation duration
    }, 3000);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginRequest: LoginRequest = this.loginForm.value;
      
      this.authService.preLogin(loginRequest)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            // Store login request in session storage for verification step
            sessionStorage.setItem('loginRequest', JSON.stringify(loginRequest));
            this.router.navigate(['/verification']);
          },
          error: (error) => {
            console.error('Login error:', error);
            if (error.status === 401) {
              this.showErrorToast('Usuario o contraseña incorrectos');
            } else if (error.status === 404) {
              this.showErrorToast('Usuario no encontrado');
            } else {
              this.showErrorToast('Error al iniciar sesión. Por favor, intente nuevamente');
            }
          }
        });
    }
  }
}
