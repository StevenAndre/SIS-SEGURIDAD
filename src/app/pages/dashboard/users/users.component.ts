import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface RoleDto {
  id: number;
  name: string;
}

interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: RoleDto[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<UserDto[]>(`${environment.apiUrl}/users`)
      .subscribe({
        next: (data) => {
          console.log(data)
          this.users = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar los usuarios';
          this.loading = false;
          console.error('Error loading users:', error);
        }
      });
  }

  isAdmin(user: UserDto): boolean {
    return user.roles.some(role => role.name === 'ADMINISTRADOR');
  }

  toggleAdmin(user: UserDto) {
    if (!this.isAdmin(user)) {
      this.http.put(`${environment.apiUrl}/users/make-admin/${user.id}`, {})
        .subscribe({
          next: () => {
            this.loadUsers(); // Recargar la lista de usuarios
          },
          error: (error) => {
            console.error('Error making user admin:', error);
            this.error = 'Error al actualizar el rol del usuario';
          }
        });
    }
  }
} 