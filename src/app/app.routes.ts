import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [


     { path: 'login', component: LoginComponent },
     { path: 'register-user', component: UserRegisterComponent },
     { path: '', component: HomeComponent },
    
];
