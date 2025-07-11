import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { HashUrlService } from '../../services/hash-url.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionsComponent } from "../sessions/sessions.component";
import { DocSignComponent } from "./doc-sign/doc-sign.component";
import { UsersComponent } from "./users/users.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
    standalone: true,
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, FormsModule, NgIf, SessionsComponent, DocSignComponent, UsersComponent]
})
export class DashboardComponent implements OnInit {
  userFullName: string = '';
  userRoles: string[] = [];
  isAdmin: boolean = false;
  currentView: string = 'dashboard'; // Vista por defecto
  isToastVisible = false;
  isHiding = false;
  toastMessage = '';
  isSuccessToast = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private hashUrlService: HashUrlService
  ) {}

  ngOnInit() {
    const userInfo = this.userService.getUserInfo();
    if (userInfo) {
      this.userFullName = userInfo.fullName;
      this.userRoles = userInfo.roles || []; 
      this.isAdmin = this.userRoles.includes('ADMINISTRADOR');
    }

    // Cargar vista desde URL hasheada
    this.loadViewFromUrl();

    // Escuchar cambios en la URL
    this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment) {
        this.loadViewFromUrl();
      }
    });
  }

  // Cargar vista desde URL hasheada
  loadViewFromUrl() {
    const viewState = this.hashUrlService.getCurrentViewState();
    if (viewState && viewState.view) {
      this.currentView = viewState.view;
    }
  }

  // Método modificado para usar hash
  setView(view: string) {
    this.currentView = view;
    
    // Crear objeto de estado
    const viewState = {
      view: view,
      timestamp: Date.now(),
      user: this.userFullName,
      // Puedes agregar más datos si necesitas
      metadata: {
        isAdmin: this.isAdmin,
        roles: this.userRoles
      }
    };

    // Navegar con hash
    this.hashUrlService.navigateWithHashedView(viewState, '/dashboard');
  }

  // Método para navegar a módulos principales
  navigateToModule(moduleName: string) {
    const moduleState = {
      view: moduleName,
      module: moduleName,
      timestamp: Date.now(),
      user: this.userFullName,
      data: {
        // Cualquier data específica del módulo
        permissions: this.userRoles
      }
    };

    this.hashUrlService.navigateWithHashedView(moduleState, '/dashboard');
    this.currentView = moduleName;
  }

  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        this.showToast('Sesión cerrada correctamente', true);
        localStorage.removeItem('token');
        // Limpiar hash antes de redirigir
        this.hashUrlService.clearHash();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (error) => {
        this.showToast('Error al cerrar sesión', false);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      }
    });
  }

  showToast(message: string, isSuccess: boolean = false) {
    this.toastMessage = message;
    this.isToastVisible = true;
    this.isHiding = false;
    this.isSuccessToast = isSuccess;
    setTimeout(() => {
      this.isHiding = true;
      setTimeout(() => {
        this.isToastVisible = false;
      }, 300);
    }, 1000);
  }
}