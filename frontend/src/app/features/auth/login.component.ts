import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzAlertModule
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-background"></div>
      <div class="login-container">
        <div class="brand-header">
          <div class="logo">🛰️</div>
          <h1 class="brand-title">Plano</h1>
          <p class="brand-subtitle">Planogram Compliance System</p>
        </div>

        <nz-card class="login-card" [nzBordered]="false">
          <h2 class="card-title">Sign In</h2>
          <p class="card-subtitle">Enter your credentials to access the console</p>

          <form nz-form [formGroup]="loginForm" (ngSubmit)="submitForm()" class="login-form">
            <nz-form-item>
              <nz-form-control nzErrorTip="Please input a valid email address!">
                <nz-input-group nzPrefixIcon="user">
                  <input type="email" nz-input formControlName="email" placeholder="Email Address" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-control nzErrorTip="Please input your password!">
                <nz-input-group nzPrefixIcon="lock">
                  <input type="password" nz-input formControlName="password" placeholder="Password" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <div *ngIf="errorMessage" class="error-alert">
              <nz-alert nzType="error" [nzMessage]="errorMessage" nzShowIcon></nz-alert>
            </div>

            <button nz-button class="login-button" nzType="primary" [nzLoading]="loading" [disabled]="!loginForm.valid">
              Log In
            </button>
          </form>
        </nz-card>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
    .login-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      z-index: 1;
    }
    .login-container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 400px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 3rem;
      margin-bottom: 8px;
      animation: float 4s ease-in-out infinite;
    }
    .brand-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.03em;
    }
    .brand-subtitle {
      font-size: 0.9rem;
      color: #94a3b8;
      margin: 4px 0 0 0;
    }
    .login-card {
      width: 100%;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
    }
    ::ng-deep .login-card .ant-card-body {
      padding: 32px 24px;
    }
    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .card-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 4px 0 24px 0;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    ::ng-deep .ant-form-item {
      margin-bottom: 0;
    }
    ::ng-deep .ant-input {
      background: rgba(15, 23, 42, 0.5) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #ffffff !important;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 0.95rem;
    }
    ::ng-deep .ant-input:focus {
      border-color: #38bdf8 !important;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2) !important;
    }
    ::ng-deep .ant-input-prefix {
      color: #94a3b8 !important;
    }
    .error-alert {
      margin-top: 8px;
    }
    ::ng-deep .ant-alert-error {
      background: rgba(239, 68, 68, 0.15) !important;
      border: 1px solid rgba(239, 68, 68, 0.2) !important;
      color: #fca5a5 !important;
      border-radius: 8px;
    }
    .login-button {
      width: 100%;
      height: 44px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      background: #38bdf8;
      border: none;
      color: #0f172a;
      transition: all 0.2s ease;
      cursor: pointer;
      margin-top: 8px;
    }
    .login-button:hover:not([disabled]) {
      background: #0ea5e9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
    }
    .login-button:active:not([disabled]) {
      transform: translateY(0);
    }
    .login-button[disabled] {
      background: rgba(255, 255, 255, 0.15);
      color: #64748b;
      cursor: not-allowed;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  submitForm(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        this.notification.success('Signed in successfully!');
        
        // Redirect to appropriate dashboard based on role
        const role = this.authService.getUserRole();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'agent') {
          this.router.navigate(['/agent']);
        } else if (role === 'client_manager') {
          this.router.navigate(['/client-manager']);
        } else {
          this.router.navigate(['/unauthorized']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Invalid credentials. Please try again.';
        this.notification.error(this.errorMessage);
      }
    });
  }
}
