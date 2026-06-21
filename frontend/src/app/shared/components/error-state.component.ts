import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, NzAlertModule, NzButtonModule],
  template: `
    <div class="error-container" *ngIf="visible">
      <nz-alert
        nzType="error"
        [nzMessage]="title"
        [nzDescription]="message"
        nzShowIcon>
      </nz-alert>
      <div class="retry-action" *ngIf="showRetry">
        <button nz-button nzType="primary" nzDanger (click)="retry.emit()">Retry</button>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
      width: 100%;
    }
    .retry-action {
      display: flex;
      justify-content: center;
    }
  `]
})
export class ErrorStateComponent {
  @Input() visible = true;
  @Input() title = 'An error occurred';
  @Input() message = 'Failed to load resources. Please check your network connection and try again.';
  @Input() showRetry = false;
  
  @Output() retry = new EventEmitter<void>();
}
