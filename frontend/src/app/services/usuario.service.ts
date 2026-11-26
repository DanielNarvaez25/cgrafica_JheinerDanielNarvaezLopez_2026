import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../api.config';
import {
    Estado,
    Usuario,
    UsuarioPayload
} from '../models/usuario';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private readonly http = inject(HttpClient);

    private readonly baseUrl =
        `${API_URL}/usuarios`;

    getAll(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(
            this.baseUrl
        );
    }

    create(
        datos: UsuarioPayload
    ): Observable<Usuario> {
        return this.http.post<Usuario>(
            this.baseUrl,
            datos
        );
    }

    update(
        id: number,
        datos: UsuarioPayload
    ): Observable<Usuario> {
        return this.http.put<Usuario>(
            `${this.baseUrl}/${id}`,
            datos
        );
    }

    cambiarEstado(
        id: number,
        estado: Estado
    ): Observable<Usuario> {
        return this.http.patch<Usuario>(
            `${this.baseUrl}/${id}/estado`,
            { estado }
        );
    }

    delete(
        id: number
    ): Observable<{ message: string }> {
        return this.http.delete<{
            message: string;
        }>(
            `${this.baseUrl}/${id}`
        );
    }
}