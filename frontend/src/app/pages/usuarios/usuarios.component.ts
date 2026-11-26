import { HttpErrorResponse } from '@angular/common/http';
import {
    Component,
    computed,
    inject,
    OnInit,
    signal
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

import {
    Cargo,
    Estado,
    Usuario,
    UsuarioPayload
} from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        ToolbarModule,
        CardModule,
        TableModule,
        ButtonModule,
        TagModule,
        DialogModule,
        InputTextModule,
        PasswordModule,
        SelectModule,
        IconFieldModule,
        InputIconModule,
        TooltipModule
    ],
    templateUrl: './usuarios.component.html',
    styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    readonly authService = inject(AuthService);
    private readonly usuarioService = inject(UsuarioService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);

    readonly usuarios = signal<Usuario[]>([]);
    readonly cargando = signal(false);
    readonly guardando = signal(false);

    dialogVisible = false;
    usuarioEditandoId: number | null = null;

    readonly cargos = [
        { label: 'Doctor', value: 'Doctor' },
        { label: 'Especialista', value: 'Especialista' },
        { label: 'Administrativo', value: 'Administrativo' }
    ];

    readonly totalUsuarios = computed(
        () => this.usuarios().length
    );

    readonly totalActivados = computed(
        () =>
            this.usuarios().filter(
                (u) => u.estado === 'Activado'
            ).length
    );

    readonly totalDesactivados = computed(
        () =>
            this.usuarios().filter(
                (u) => u.estado === 'Desactivado'
            ).length
    );

    readonly form = this.fb.group({
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
            Validators.required
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
        password: ['']
    });

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.cargando.set(true);

        this.usuarioService.getAll().subscribe({
            next: (usuarios: Usuario[]) => {
                this.usuarios.set(usuarios);
            },
            error: (_error: HttpErrorResponse) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail:
                        'No se pudo cargar la lista de usuarios.'
                });

                this.cargando.set(false);
            },
            complete: () => {
                this.cargando.set(false);
            }
        });
    }

    abrirNuevo(): void {
        this.limpiarFormulario();

        this.form.controls.password.setValidators([
            Validators.required,
            this.passwordValidator
        ]);

        this.form.controls.password.updateValueAndValidity();

        this.dialogVisible = true;
    }

    editar(usuario: Usuario): void {
        this.limpiarFormulario();

        this.usuarioEditandoId = usuario.id;

        this.form.patchValue({
            identificacion: usuario.identificacion,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            cargo: usuario.cargo,
            telefono: usuario.telefono,
            nombre_usuario: usuario.nombre_usuario,
            password: ''
        });

        this.form.controls.password.setValidators([
            this.passwordValidator
        ]);

        this.form.controls.password.updateValueAndValidity();

        this.dialogVisible = true;
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const valor = this.form.getRawValue();

        const payload: UsuarioPayload = {
            identificacion: valor.identificacion ?? '',
            nombre: valor.nombre ?? '',
            apellido: valor.apellido ?? '',
            email: valor.email ?? '',
            cargo: valor.cargo as Cargo,
            telefono: valor.telefono ?? '',
            nombre_usuario:
                valor.nombre_usuario ?? ''
        };

        if (
            valor.password &&
            valor.password.trim() !== ''
        ) {
            payload.password = valor.password;
        }

        this.guardando.set(true);

        const request =
            this.usuarioEditandoId === null
                ? this.usuarioService.create(payload)
                : this.usuarioService.update(
                      this.usuarioEditandoId,
                      payload
                  );

        request.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail:
                        this.usuarioEditandoId === null
                            ? 'Usuario creado correctamente.'
                            : 'Usuario actualizado correctamente.'
                });

                this.cerrarDialogo();
                this.cargarUsuarios();
            },
            error: (error: HttpErrorResponse) => {
                this.manejarError(error);
            }
        });
    }

    cambiarEstado(usuario: Usuario): void {
        const nuevoEstado: Estado =
            usuario.estado === 'Activado'
                ? 'Desactivado'
                : 'Activado';

        this.confirmationService.confirm({
            message: `${
                nuevoEstado === 'Desactivado'
                    ? '¿Desactivar'
                    : '¿Activar'
            } a ${usuario.nombre} ${usuario.apellido}?`,
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.usuarioService
                    .cambiarEstado(
                        usuario.id,
                        nuevoEstado
                    )
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail:
                                    'Estado actualizado correctamente.'
                            });

                            this.cargarUsuarios();
                        },
                        error: (error: HttpErrorResponse) => {
                            this.manejarError(error);
                        }
                    });
            }
        });
    }

    eliminar(usuario: Usuario): void {
        this.confirmationService.confirm({
            message: `¿Eliminar a ${usuario.nombre} ${usuario.apellido}?`,
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.usuarioService
                    .delete(usuario.id)
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail:
                                    'Usuario eliminado.'
                            });

                            this.cargarUsuarios();
                        },
                        error: (error: HttpErrorResponse) => {
                            this.manejarError(error);
                        }
                    });
            }
        });
    }

    cerrarDialogo(): void {
        this.dialogVisible = false;
        this.limpiarFormulario();
        this.guardando.set(false);
    }

    soloDigitos(
        event: Event,
        campo: 'identificacion' | 'telefono'
    ): void {
        const input = event.target as HTMLInputElement;
        const valor = input.value.replace(/\D/g, '');

        input.value = valor;

        this.form.get(campo)?.setValue(valor);
    }

    severityEstado(
        estado: Estado
    ): 'success' | 'danger' {
        return estado === 'Activado'
            ? 'success'
            : 'danger';
    }

    esPropioUsuario(usuario: Usuario): boolean {
        return (
            usuario.id ===
            this.authService.usuarioActual()?.id
        );
    }

    private limpiarFormulario(): void {
        this.usuarioEditandoId = null;
        this.form.reset();
    }

    private passwordValidator(
        control: AbstractControl
    ): ValidationErrors | null {
        const valor = String(
            control.value ?? ''
        );

        if (!valor) {
            return null;
        }

        if (
            valor.length < 8 ||
            valor.length > 72 ||
            !/[A-Za-z]/.test(valor) ||
            !/\d/.test(valor)
        ) {
            return { password: true };
        }

        return null;
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
        } else if (error.status === 400) {
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
        }

        this.guardando.set(false);
    }
}