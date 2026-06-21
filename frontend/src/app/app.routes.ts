import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'agent',
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['agent'] },
    loadChildren: () => import('./features/agent/agent.routes').then(m => m.AGENT_ROUTES)
  },
  {
    path: 'client-manager',
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['client_manager'] },
    loadChildren: () => import('./features/client-manager/client-manager.routes').then(m => m.CLIENT_MANAGER_ROUTES)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
