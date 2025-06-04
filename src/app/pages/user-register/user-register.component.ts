import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
   ReactiveFormsModule
} from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  smsSent: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email],
        // aquí podrías poner validación asíncrona para chequear unicidad
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]).{8,}$/
          ),
        ],
      ],
      authMethod: ['none'], // 'none' (email), 'google', 'facebook', 'phone'
      phone: [''], // se validará sólo si authMethod === 'phone'
    });

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
   * Envía un código por SMS al número indicado.
   * En un caso real, aquí llamarías a tu servicio de backend que dispara el SMS.
   */
  sendPhoneCode() {
    const phoneValue = this.registerForm.get('phone')?.value;
    if (phoneValue && this.registerForm.get('phone')?.valid) {
      // Simulación de envío:
      console.log('Enviando código SMS a:', phoneValue);
      this.smsSent = true;
      // En producción, llama a un servicio que envíe el SMS real y capture la respuesta/errores.
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

    // Extraemos los valores para mostrarlos (en producción, envías al backend)
    const formValues = this.registerForm.value;
    console.log('Formulario válido. Datos a enviar:', formValues);

    // Ejemplo: Si authMethod es 'none', envías email-verificación.
    // Si es 'google' o 'facebook', rediriges al flujo de OAuth.
    // Si es 'phone', verificas el OTP que el usuario ingrese en otro paso.
  }
}
