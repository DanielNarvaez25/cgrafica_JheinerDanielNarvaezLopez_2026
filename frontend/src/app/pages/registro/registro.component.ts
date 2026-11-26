import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';

import { Cargo } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-registro',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        CardModule,
        InputTextModule,
        PasswordModule,
        SelectModule,
        ButtonModule
    ],
    templateUrl: './registro.component.html',
    styleUrl: './registro.component.css'
})
export class RegistroComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly messageService = inject(MessageService);
    private readonly router = inject(Router);

    readonly cargando = signal(false);

    readonly cargos = [
        { label: 'Doctor', value: 'Doctor' },
        { label: 'Especialista', value: 'Especialista' },
        { label: 'Administrativo', value: 'Administrativo' }
    ];

    readonly form = this.fb.group(
        {
            identificacion: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^\d{5,20}$/)
                ]
            ],
            nombre: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(100)
                ]
            ],
            apellido: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(100)
                ]
            ],
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                    Validators.maxLength(150),
                    Validators.pattern(
                        /^[^@\s]+@[^@\s]+\.[^@\s]+$/
                    )
                ]
            ],
            cargo: [
                '',
                [Validators.required]
            ],
            telefono: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^\d{7,20}$/)
                ]
            ],
            nombre_usuario: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        /^[A-Za-z0-9._-]{4,50}$/
                    )
                ]
            ],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(72),
                    Validators.pattern(
                        /^(?=.*[A-Za-z])(?=.*\d).+$/
                    )
                ]
            ],
            confirmarPassword: [
                '',
                [Validators.required]
            ]
        },
        {
            validators: this.passwordsIguales
        }
    );

    soloDigitos(
        event: Event,
        campo: 'identificacion' | 'telefono'
    ): void {
        const input = event.target as HTMLInputElement;
        const valor = input.value.replace(/\D/g, '');

        input.value = valor;

        this.form.get(campo)?.setValue(valor);
    }

    esInvalido(nombre: string): boolean {
        const control = this.form.get(nombre);

        return !!(
            control &&
            control.invalid &&
            (control.touched || control.dirty)
        );
    }

    registrar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const valor = this.form.getRawValue();

        this.cargando.set(true);

        this.authService.registrar({
            identificacion: valor.identificacion ?? '',
            nombre: valor.nombre ?? '',
            apellido: valor.apellido ?? '',
            email: valor.email ?? '',
            cargo: valor.cargo as Cargo,
            telefono: valor.telefono ?? '',
            nombre_usuario: valor.nombre_usuario ?? '',
            password: valor.password ?? ''
        }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail:
                        'Cuenta creada. Ya puede iniciar sesión.'
                });

                this.router.navigate(['/login']);
            },
            error: (error: HttpErrorResponse) => {
                this.manejarError(error);
            },
            complete: () => {
                this.cargando.set(false);
            }
        });
    }

    private passwordsIguales(
        control: AbstractControl
    ): ValidationErrors | null {
        const password =
            control.get('password')?.value;

        const confirmarPassword =
            control.get('confirmarPassword')?.value;

        return password === confirmarPassword
            ? null
            : { passwordMismatch: true };
    }

    private manejarError(
        error: HttpErrorResponse
    ): void {
        if (error.status === 409) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.error?.detail
            });
        } else if (error.status === 422) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail:
                    'Revise los datos ingresados'
            });
        } else if (error.status === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Conexión',
                detail:
                    'No se pudo conectar con el servidor.'
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail:
                    'Ocurrió un error inesperado.'
            });
        }

        this.cargando.set(false);
    }
}