import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
   ReactiveFormsModule,
   ValidatorFn
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  smsSent: boolean = false;
  isLoading = false;
  showToast = false;
  isHiding = false;
  toastMessage = '';
  isSuccessToast = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]).{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      authMethod: ['none'],
      phone: ['']
    }, { validators: this.passwordMatchValidator() });

    // Escucha cambios en authMethod para agregar/quitar validación de phone
    this.registerForm.get('authMethod')?.valueChanges.subscribe((method) => {
      const phoneControl = this.registerForm.get('phone')!;
      if (method === 'phone') {
        phoneControl.setValidators([Validators.required]);
      } else {
        phoneControl.clearValidators();
        phoneControl.setValue('');
        this.smsSent = false;
      }
      phoneControl.updateValueAndValidity();
    });
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;
      return password && confirmPassword && password !== confirmPassword
        ? { mismatch: true }
        : null;
    };
  }

  /**
   * Envía un código por SMS al número indicado.
   * En un caso real, aquí llamarías a tu servicio de backend que dispara el SMS.
   */
  sendPhoneCode() {
    const phoneValue = this.registerForm.get('phone')?.value;
    if (phoneValue && this.registerForm.get('phone')?.valid) {
      console.log('Enviando código SMS a:', phoneValue);
      this.smsSent = true;
    }
  }

  /**
   * Al enviar el formulario:
   * 1) Verifica que sea válido
   * 2) En un backend real, aquí harías la lógica de:
   *    - Crear un usuario provisional
   *    - Enviar correo de verificación (o OTP por SMS)
   *    - Manejar respuestas, errores, etc.
   */
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.registerForm.value;
    
    // Usar el email como username y agregar el rol
    const userData = {
      fullname: formData.fullName,
      email: formData.email,
      username: formData.email, // Usar email como username
      password: formData.password,
      roles:[1] 
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.showToastMessage('Usuario registrado exitosamente. Por favor, revise su correo electrónico para confirmar su cuenta.', true);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        if (error.status === 400) {
          this.showToastMessage('El email ya está registrado');
        } else {
          this.showToastMessage('Error al registrar usuario');
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  showToastMessage(message: string, isSuccess: boolean = false) {
    this.toastMessage = message;
    this.showToast = true;
    this.isHiding = false;
    this.isSuccessToast = isSuccess;

    setTimeout(() => {
      this.isHiding = true;
      setTimeout(() => {
        this.showToast = false;
      }, 300);
    }, 3000);
  }
}