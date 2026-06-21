import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, NzEmptyModule],
  template: `
    <div class="empty-container" *ngIf="visible">
      <nz-empty [nzNotFoundContent]="message"></nz-empty>
    </div>
  `,
  styles: [`
    .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px 24px;
      width: 100%;
      background: #fafafa;
      border: 1px dashed #e8e8e8;
      border-radius: 8px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() visible = true;
  @Input() message = 'No data available';
}
