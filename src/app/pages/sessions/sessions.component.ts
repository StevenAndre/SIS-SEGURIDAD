import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserSessionDto } from '../../services/user.service';

interface SessionWithUser extends UserSessionDto {
  username?: string;
  fullName?: string;
}

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css']
})
export class SessionsComponent implements OnInit {
  sessions: SessionWithUser[] = [];
  loading = true;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getAllSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar las sesiones';
        this.loading = false;
      }
    });
  }


formatISODurationFull(durationStr: string): string {
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);

  if (!match) return '00:00:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = Math.floor(parseFloat(match[3] || '0'));

  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');

  return `${h}:${m}:${s}`;
}


} 