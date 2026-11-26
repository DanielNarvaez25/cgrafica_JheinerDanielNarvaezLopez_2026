export type Cargo =
    | 'Doctor'
    | 'Especialista'
    | 'Administrativo';

export type Estado =
    | 'Activado'
    | 'Desactivado';

export interface Usuario {
    id: number;
    identificacion: string;
    nombre: string;
    apellido: string;
    email: string;
    cargo: Cargo;
    telefono: string;
    nombre_usuario: string;
    estado: Estado;
    fecha_creacion?: string;
}

export interface UsuarioPayload {
    identificacion: string;
    nombre: string;
    apellido: string;
    email: string;
    cargo: Cargo;
    telefono: string;
    nombre_usuario: string;
    password?: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    usuario: Usuario;
}