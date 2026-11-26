import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        CardModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        MessageModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly cargando = signal(false);

    errorMensaje = '';

    readonly form = this.fb.nonNullable.group({
        identificacion: [
            '',
            [Validators.required]
        ],
        password: [
            '',
            [Validators.required]
        ]
    });

    soloDigitos(event: Event): void {
        const input = event.target as HTMLInputElement;
        const valor = input.value.replace(/\D/g, '');

        input.value = valor;

        this.form.controls.identificacion.setValue(valor);
    }

    ingresar(): void {
        this.errorMensaje = '';

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const {
            identificacion,
            password
        } = this.form.getRawValue();

        this.cargando.set(true);

        this.authService.login(
            identificacion,
            password
        ).subscribe({
            next: () => {
                this.router.navigate(['/usuarios']);
            },
            error: (error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.errorMensaje =
                        'Usuario o contraseña inválidos. Si aún no tiene cuenta, regístrese.';
                } else if (error.status === 403) {
                    this.errorMensaje =
                        error.error?.detail ??
                        'Acceso denegado';
                } else if (error.status === 0) {
                    this.errorMensaje =
                        'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
                } else {
                    this.errorMensaje =
                        'Ocurrió un error inesperado';
                }

                this.cargando.set(false);
            },
            complete: () => {
                this.cargando.set(false);
            }
        });
    }
}