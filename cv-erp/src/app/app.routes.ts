import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin.guard'; // ✅ THÊM

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/auth/login/login').then((m) => m.LoginComponent),
    },

    {
        path: '',
        loadComponent: () =>
            import('./layouts/main-layout/main-layout').then(
                (m) => m.MainLayoutComponent
            ),
        canActivate: [authGuard],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'ai-classification' },

            {
                path: 'ai-classification',
                loadComponent: () =>
                    import('./pages/ai-classification/ai-classification/ai-classification').then(
                        (m) => m.AiClassificationComponent
                    ),
            },
            {
                path: 'candidates',
                loadComponent: () =>
                    import('./pages/candidates/candidates/candidates').then(
                        (m) => m.CandidatesComponent
                    ),
            },
            {
                path: 'jobs',
                loadComponent: () =>
                    import('./pages/jobs/jobs/jobs').then((m) => m.JobsComponent),
            },
            {
                path: 'reports',
                loadComponent: () =>
                    import('./pages/reports/reports/reports').then((m) => m.ReportsComponent),
            },

            // ✅ settings root
            {
                path: 'settings',
                loadComponent: () =>
                    import('./pages/settings/settings/settings').then((m) => m.SettingsComponent),
            },

            // ✅ users nằm cùng level trong children (đúng như bạn đang làm)
            {
                path: 'settings/users',
                loadComponent: () =>
                    import('./pages/settings/settings/users/users.component').then(
                        (m) => m.UsersComponent
                    ),
                canActivate: [adminGuard], // ✅ authGuard đã nằm ở parent rồi, không cần lặp
            },
        ],
    },

    { path: '**', redirectTo: '' },
];
