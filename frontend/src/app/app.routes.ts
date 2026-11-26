import { Routes } from '@angular/router';

import {
    authGuard,
    guestGuard
} from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        title: 'Iniciar sesión',
        canActivate: [guestGuard],
        loadComponent: () =>
            import(
                './pages/login/login.component'
            ).then(
                (m) => m.LoginComponent
            )
    },
    {
        path: 'registro',
        title: 'Registro de usuario',
        canActivate: [guestGuard],
        loadComponent: () =>
            import(
                './pages/registro/registro.component'
            ).then(
                (m) => m.RegistroComponent
            )
    },
    {
        path: 'usuarios',
        title: 'Gestión de usuarios',
        canActivate: [authGuard],
        loadComponent: () =>
            import(
                './pages/usuarios/usuarios.component'
            ).then(
                (m) => m.UsuariosComponent
            )
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];