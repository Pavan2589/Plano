import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { UploadService } from '../../core/services/upload.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ScoreBadgeComponent } from '../../shared/components/score-badge.component';
import { ViolationTableComponent } from '../../shared/components/violation-table.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { Subscription, catchError, interval, of, switchMap, takeUntil, takeWhile, timer } from 'rxjs';

// NG-Zorro imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ScoreBadgeComponent,
    ViolationTableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    NzCardModule,
    NzFormModule,
    NzSelectModule,
    NzButtonModule,
    NzUploadModule,
    NzProgressModule,
    NzGridModule,
    NzTagModule
  ],
  template: `
    <div class="agent-container">
      <div class="agent-header">
        <div class="brand">
          <span class="logo">🛰️</span>
          <span class="title">Plano Agent</span>
        </div>
        <div class="user-info">
          <span>Agent Console</span>
          <button nz-button nzType="text" nzDanger (click)="logout()">Log Out</button>
        </div>
      </div>

      <div class="agent-body">
        <nz-card class="upload-card" nzTitle="Submit Shelf Audit">
          <form nz-form [formGroup]="auditForm" (ngSubmit)="submitAudit()">
            <nz-form-item>
              <nz-form-control nzErrorTip="Please select store">
                <nz-select formControlName="storeId" (ngModelChange)="onStoreChange($event)" nzPlaceHolder="Select Assigned Store">
                  <nz-option *ngFor="let s of stores" [nzValue]="s.id" [nzLabel]="s.name + ' (' + s.location + ')'"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-control nzErrorTip="Please select section">
                <nz-select formControlName="sectionId" nzPlaceHolder="Select Section">
                  <nz-option *ngFor="let sec of sections" [nzValue]="sec.id" [nzLabel]="sec.name"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <div class="image-picker-container">
              <label class="custom-file-upload">
                <input type="file" (change)="onFileSelected($event)" accept="image/*" />
                <span class="upload-icon">📸</span>
                <span class="upload-text">{{ selectedFile ? selectedFile.name : 'Take Photo or Choose File' }}</span>
              </label>
            </div>

            <button nz-button nzType="primary" class="submit-btn" [nzLoading]="uploading" [disabled]="auditForm.invalid || !selectedFile">
              Run Planogram Audit
            </button>
            <nz-progress *ngIf="uploading" [nzPercent]="uploadProgress" nzStatus="active"></nz-progress>
          </form>
        </nz-card>

        <!-- Loading / Polling Status Card -->
        <nz-card *ngIf="currentJob" class="status-card">
          <div class="status-header">
            <h3>Audit Status</h3>
            <nz-tag [nzColor]="getJobStatusColor(currentJob.status)">{{ currentJob.status.toUpperCase() }}</nz-tag>
          </div>
          
          <div class="status-content" *ngIf="currentJob.status !== 'complete' && currentJob.status !== 'failed'">
            <app-loading-spinner [tip]="'Processing Planogram CV Analysis...'"></app-loading-spinner>
            <nz-progress [nzPercent]="getProgressPercentage(currentJob.status)" nzStatus="active"></nz-progress>
          </div>
          
          <div *ngIf="currentJob.status === 'failed'" class="status-failed">
            <app-error-state title="Analysis Failed" message="The CV pipeline encountered an issue. Please try uploading a clearer photo of the shelf." [showRetry]="true" (retry)="resetAudit()"></app-error-state>
          </div>
        </nz-card>

        <!-- Results Card -->
        <nz-card *ngIf="result" class="results-card" nzTitle="Audit Results">
          <div class="scores-grid" nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="8" class="score-col">
              <app-score-badge [score]="result.overall_score" label="Overall"></app-score-badge>
            </div>
            <div nz-col [nzSpan]="16" class="breakdown-col">
              <div class="metric-row">
                <span>Product Accuracy:</span>
                <strong>{{ result.product_accuracy | number:'1.0-1' }}%</strong>
              </div>
              <div class="metric-row">
                <span>Spacing Accuracy:</span>
                <strong>{{ result.spacing_accuracy | number:'1.0-1' }}%</strong>
              </div>
              <div class="metric-row">
                <span>Facing Accuracy:</span>
                <strong>{{ result.facing_accuracy | number:'1.0-1' }}%</strong>
              </div>
            </div>
          </div>

          <div class="annotated-image-wrapper" *ngIf="result.annotated_image_url">
            <h4>Annotated Detection Output</h4>
            <div class="image-zoom-container">
              <img [src]="result.annotated_image_url" alt="Annotated Shelf" class="annotated-image" />
            </div>
          </div>

          <div class="violations-wrapper">
            <h4>Detections & Violations Breakdown</h4>
            <app-violation-table [violations]="result.violations"></app-violation-table>
            <app-empty-state *ngIf="result.violations.length === 0" message="Perfect match! No violations detected."></app-empty-state>
          </div>
        </nz-card>
      </div>
    </div>
  `,
  styles: [`
    .agent-container {
      min-height: 100vh;
      background: #0f172a;
      color: #f8fafc;
      font-family: 'Inter', sans-serif;
      padding-bottom: 40px;
    }
    .agent-header {
      background: #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo {
      font-size: 1.4rem;
    }
    .title {
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: -0.01em;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .agent-body {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px 15px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .upload-card, .status-card, .results-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
    }
    ::ng-deep .ant-card-head {
      border-bottom: 1px solid rgba(255,255,255,0.08) !important;
      color: #ffffff !important;
    }
    ::ng-deep .ant-card-head-title {
      font-weight: 600;
    }
    ::ng-deep .ant-select-selector {
      background: rgba(15, 23, 42, 0.6) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      color: #ffffff !important;
      border-radius: 8px !important;
    }
    ::ng-deep .ant-select-arrow {
      color: #94a3b8;
    }
    .image-picker-container {
      margin-bottom: 20px;
    }
    .custom-file-upload {
      border: 2px dashed rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
      background: rgba(15, 23, 42, 0.3);
    }
    .custom-file-upload:hover {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.05);
    }
    .custom-file-upload input[type="file"] {
      display: none;
    }
    .upload-icon {
      font-size: 2.2rem;
      margin-bottom: 8px;
    }
    .upload-text {
      font-size: 0.9rem;
      color: #94a3b8;
      text-align: center;
    }
    .submit-btn {
      width: 100%;
      height: 44px;
      border-radius: 8px;
      font-weight: 600;
      background: #38bdf8;
      border: none;
      color: #0f172a;
    }
    .submit-btn:hover:not([disabled]) {
      background: #0ea5e9;
    }
    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .status-header h3 {
      margin: 0;
      color: #ffffff;
    }
    .status-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .scores-grid {
      align-items: center;
      margin-bottom: 24px;
    }
    .breakdown-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 4px;
      font-size: 0.95rem;
    }
    .metric-row span {
      color: #94a3b8;
    }
    .annotated-image-wrapper {
      margin-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 16px;
    }
    .annotated-image-wrapper h4, .violations-wrapper h4 {
      color: #ffffff;
      margin-bottom: 12px;
    }
    .image-zoom-container {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
      background: #000;
      display: flex;
      justify-content: center;
    }
    .annotated-image {
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: contain;
    }
    .violations-wrapper {
      margin-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 16px;
    }
  `]
})
export class AgentDashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private upload = inject(UploadService);
  private auth = inject(AuthService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  auditForm!: FormGroup;
  stores: any[] = [];
  sections: any[] = [];
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;

  currentJob: any = null;
  result: any = null;
  private pollSub?: Subscription;

  ngOnInit(): void {
    this.auditForm = this.fb.group({
      storeId: [null, Validators.required],
      sectionId: [null, Validators.required]
    });
    this.loadStores();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadStores(): void {
    this.api.get<any[]>('agent/stores').subscribe({
      next: (data) => {
        this.stores = data;
        if (data.length > 0) {
          this.auditForm.patchValue({ storeId: data[0].id });
        }
      },
      error: () => this.notification.error('Failed to load assigned stores')
    });
  }

  onStoreChange(storeId: string): void {
    if (!storeId) return;
    this.sections = [];
    this.auditForm.patchValue({ sectionId: null });
    
    this.api.get<any[]>(`stores/${storeId}/sections`).subscribe({
      next: (data) => {
        this.sections = data;
        if (data.length > 0) {
          this.auditForm.patchValue({ sectionId: data[0].id });
        }
      },
      error: () => this.notification.error('Failed to load sections')
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  submitAudit(): void {
    if (this.auditForm.invalid || !this.selectedFile) return;
    
    this.uploading = true;
    this.uploadProgress = 0;
    this.result = null;
    this.currentJob = null;
    
    const { storeId, sectionId } = this.auditForm.value;
    
    this.upload.uploadShelfImageWithProgress(storeId, sectionId, null, this.selectedFile).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
          return;
        }
        if (event.type !== HttpEventType.Response || !event.body) return;
        const job = event.body;
        this.uploading = false;
        this.uploadProgress = 100;
        this.currentJob = job;
        this.notification.info('Audit uploaded successfully. Analyzing shelf photo...');
        this.startPolling(job.id);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.notification.error(err.error?.error || 'Failed to submit audit');
      }
    });
  }

  startPolling(jobId: string): void {
    this.stopPolling();
    
    this.pollSub = interval(2000).pipe(
      switchMap(() => this.api.get<any>(`agent/compliance/jobs/${jobId}`).pipe(
        catchError(() => of(null))
      )),
      takeWhile((job) => {
        if (!job) return true;
        this.currentJob = job;
        return job.status !== 'complete' && job.status !== 'failed';
      }, true),
      takeUntil(timer(120000))
    ).subscribe({
      complete: () => {
        if (this.currentJob && this.currentJob.status === 'complete') {
          this.loadResults(jobId);
        } else if (this.currentJob && this.currentJob.status === 'failed') {
          this.notification.error('CV analysis failed.');
        } else if (this.currentJob && !['complete', 'failed'].includes(this.currentJob.status)) {
          this.notification.warning('Analysis is taking longer than expected. Please submit again later if no result appears.');
        }
      }
    });
  }

  stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }

  loadResults(jobId: string): void {
    this.api.get<any>(`agent/compliance/results/${jobId}`).subscribe({
      next: (res) => {
        this.result = res;
        this.notification.success('Planogram analysis completed!');
      },
      error: () => this.notification.error('Failed to load compliance results')
    });
  }

  getProgressPercentage(status: string): number {
    switch (status) {
      case 'queued': return 25;
      case 'processing': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  }

  getJobStatusColor(status: string): string {
    switch (status) {
      case 'complete': return 'success';
      case 'processing': return 'processing';
      case 'queued': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  }

  resetAudit(): void {
    this.stopPolling();
    this.currentJob = null;
    this.result = null;
    this.selectedFile = null;
    this.uploadProgress = 0;
  }

  logout(): void {
    this.auth.logout();
  }
}
