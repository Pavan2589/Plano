import { Injectable, inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private message = inject(NzMessageService);

  success(content: string): void {
    this.message.success(content);
  }

  error(content: string): void {
    this.message.error(content);
  }

  info(content: string): void {
    this.message.info(content);
  }

  warning(content: string): void {
    this.message.warning(content);
  }
}
