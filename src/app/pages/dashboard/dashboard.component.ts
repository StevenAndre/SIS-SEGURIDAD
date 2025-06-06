import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UsersComponent } from './users/users.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, UsersComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userFullName: string = '';
  userRoles: string[] = [];
  isAdmin: boolean = false;
  currentView: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const userInfo = this.userService.getUserInfo();
    if (userInfo) {
      this.userFullName = userInfo.fullName;
      this.userRoles = userInfo.roles || [];
      this.isAdmin = this.userRoles.includes('ADMINISTRADOR');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  setView(view: string) {
    this.currentView = view;
  }
}
