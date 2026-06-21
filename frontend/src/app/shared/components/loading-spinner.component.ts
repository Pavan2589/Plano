import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  template: `
    <div class="spinner-container" *ngIf="visible">
      <nz-spin nzSimple [nzSize]="size" [nzTip]="tip"></nz-spin>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      width: 100%;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() visible = true;
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Input() tip = 'Loading...';
}
