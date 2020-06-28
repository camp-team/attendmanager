import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/interfaces/user';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  notificationCount: number;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationsService
  ) {
    this.authService.getUser(this.authService.uid).subscribe((user: User) => {
      this.notificationCount = user.notificationCount;
    });
  }

  ngOnInit(): void {}

  clearNotificationCount() {
    this.notificationService.clearNotificationCount(this.authService.uid);
  }
}
