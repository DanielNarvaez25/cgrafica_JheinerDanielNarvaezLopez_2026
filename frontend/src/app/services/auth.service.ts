import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../api.config';
import {
  LoginResponse,
  Usuario,
  UsuarioPayload
} from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly usuarioActual = signal<Usuario | null>(null);

  private _token: string | null = null;

  constructor() {
    this.cargarSesion();
  }

  login(
    identificacion: string,
    password: string
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${API_URL}/auth/login`,
        {
          identificacion,
          password
        }
      )
      .pipe(
        tap((respuesta: LoginResponse) => {
          this.guardarSesion(respuesta);
        })
      );
  }

  registrar(
    datos: UsuarioPayload
  ): Observable<Usuario> {
    return this.http.post<Usuario>(
      `${API_URL}/auth/registro`,
      datos
    );
  }

  logout(): void {
    this._token = null;
    this.usuarioActual.set(null);

    try {
      sessionStorage.removeItem('hospital_token');
    } catch {
      // Ignorado
    }

    try {
      sessionStorage.removeItem('hospital_usuario');
    } catch {
      // Ignorado
    }

    void this.router.navigate(['/login']);
  }

  get token(): string | null {
    return this._token;
  }

  estaAutenticado(): boolean {
    return !!this._token;
  }

  private guardarSesion(
    respuesta: LoginResponse
  ): void {
    this._token = respuesta.access_token;
    this.usuarioActual.set(respuesta.usuario);

    try {
      sessionStorage.setItem(
        'hospital_token',
        respuesta.access_token
      );
    } catch {
      // Ignorado
    }

    try {
      sessionStorage.setItem(
        'hospital_usuario',
        JSON.stringify(respuesta.usuario)
      );
    } catch {
      // Ignorado
    }
  }

  private cargarSesion(): void {
    try {
      const token: string | null =
        sessionStorage.getItem('hospital_token');

      if (token) {
        this._token = token;
      }
    } catch {
      this._token = null;
    }

    try {
      const usuarioGuardado: string | null =
        sessionStorage.getItem('hospital_usuario');

      if (usuarioGuardado) {
        const usuario: Usuario =
          JSON.parse(usuarioGuardado) as Usuario;

        this.usuarioActual.set(usuario);
      }
    } catch {
      this.usuarioActual.set(null);
    }
  }
}