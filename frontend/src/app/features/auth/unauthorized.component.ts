import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink, NzResultModule, NzButtonModule],
  template: `
    <nz-result
      nzStatus="403"
      nzTitle="403 Forbidden"
      nzSubTitle="Sorry, you are not authorized to access this page.">
      <div nz-result-extra>
        <button nz-button nzType="primary" routerLink="/login">Back to Login</button>
      </div>
    </nz-result>
  `
})
export class UnauthorizedComponent {}
