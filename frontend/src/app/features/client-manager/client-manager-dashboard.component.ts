import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { Chart } from 'chart.js/auto';

// NG-Zorro imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-client-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingSpinnerComponent,
    NzCardModule,
    NzSelectModule,
    NzButtonModule,
    NzTableModule,
    NzGridModule,
    NzListModule,
    NzDividerModule,
    NzTagModule
  ],
  template: `
    <div class="client-manager-container">
      <div class="client-header">
        <div class="brand">
          <span class="logo">🛰️</span>
          <span class="title">Plano Client Console</span>
        </div>
        <div class="user-info">
          <span>Client Manager Portal</span>
          <button nz-button nzType="text" nzDanger (click)="logout()">Log Out</button>
        </div>
      </div>

      <div class="client-body">
        <app-loading-spinner *ngIf="loading"></app-loading-spinner>
        <app-error-state *ngIf="errorMessage" [message]="errorMessage" [showRetry]="true" (retry)="loadStores()"></app-error-state>
        <nz-card class="store-selector-card">
          <div class="selector-row">
            <span class="label">Select Store to View Insights:</span>
            <nz-select [(ngModel)]="selectedStoreId" (ngModelChange)="onStoreChange($event)" style="width: 250px;">
              <nz-option *ngFor="let s of stores" [nzValue]="s.id" [nzLabel]="s.name"></nz-option>
            </nz-select>
          </div>
        </nz-card>

        <div *ngIf="selectedStoreId" nz-row [nzGutter]="24">
          <!-- Left Column - Chart & Details -->
          <div nz-col [nzLg]="16" [nzXs]="24">
            <nz-card nzTitle="Compliance Score Trends" class="chart-card">
              <div class="chart-wrapper">
                <canvas #trendsChart></canvas>
              </div>
            </nz-card>

            <nz-card nzTitle="Historical Audit Logs" class="log-card">
              <nz-table #historyTable [nzData]="history" nzSize="middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Overall Score</th>
                    <th>Product Acc.</th>
                    <th>Spacing Acc.</th>
                    <th>Facing Acc.</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let audit of historyTable.data">
                    <td>{{ audit.created_at | date:'short' }}</td>
                    <td>
                      <nz-tag [nzColor]="getScoreTagColor(audit.overall_score)">
                        {{ audit.overall_score }}%
                      </nz-tag>
                    </td>
                    <td>{{ audit.product_accuracy }}%</td>
                    <td>{{ audit.spacing_accuracy }}%</td>
                    <td>{{ audit.facing_accuracy }}%</td>
                    <td>
                      <button nz-button nzSize="small" (click)="exportReport(audit.id)">Export CSV</button>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
              <app-empty-state *ngIf="history.length === 0" message="No audit history found for this store."></app-empty-state>
            </nz-card>
          </div>

          <!-- Right Column - Active Alerts / Section Scores -->
          <div nz-col [nzLg]="8" [nzXs]="24">
            <nz-card nzTitle="Compliance Breakdown" class="metric-card">
              <div class="breakdown-wrapper" *ngIf="currentScores">
                <div class="metric-block">
                  <div class="label">Average Product Accuracy</div>
                  <div class="val">{{ currentScores.product_accuracy || 0 | number:'1.0-1' }}%</div>
                </div>
                <nz-divider></nz-divider>
                <div class="metric-block">
                  <div class="label">Average Spacing Accuracy</div>
                  <div class="val">{{ currentScores.spacing_accuracy || 0 | number:'1.0-1' }}%</div>
                </div>
                <nz-divider></nz-divider>
                <div class="metric-block">
                  <div class="label">Average Facing Accuracy</div>
                  <div class="val">{{ currentScores.facing_accuracy || 0 | number:'1.0-1' }}%</div>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="Active Store Flags" class="alerts-card">
              <div class="alert-item" *ngFor="let alert of storeFlags">
                <span class="alert-icon">⚠️</span>
                <div class="alert-info">
                  <div class="reason">{{ alert.flag_reason }}</div>
                  <div class="date">{{ alert.flagged_at | date:'short' }}</div>
                </div>
              </div>
              <p class="empty-alerts" *ngIf="storeFlags.length === 0">No active flags or warnings</p>
            </nz-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .client-manager-container {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', sans-serif;
      padding-bottom: 40px;
    }
    .client-header {
      background: #0f172a;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 24px;
      color: #ffffff;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo {
      font-size: 1.5rem;
    }
    .title {
      font-weight: 700;
      font-size: 1.15rem;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 0.9rem;
    }
    .client-body {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .store-selector-card {
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .selector-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .selector-row .label {
      font-weight: 600;
      color: #475569;
    }
    .chart-card, .log-card, .metric-card, .alerts-card {
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }
    .chart-wrapper {
      height: 300px;
      position: relative;
    }
    .metric-block {
      text-align: center;
      padding: 8px 0;
    }
    .metric-block .label {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 4px;
    }
    .metric-block .val {
      font-size: 1.8rem;
      font-weight: 700;
      color: #0f172a;
    }
    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px;
      background: #fff5f5;
      border: 1px solid #fed7d7;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .alert-icon {
      font-size: 1.2rem;
    }
    .alert-info .reason {
      font-weight: 600;
      color: #c53030;
      font-size: 0.85rem;
    }
    .alert-info .date {
      font-size: 0.75rem;
      color: #718096;
      margin-top: 2px;
    }
    .empty-alerts {
      color: #94a3b8;
      font-style: italic;
      text-align: center;
      padding: 12px 0;
    }
  `]
})
export class ClientManagerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private notification = inject(NotificationService);

  @ViewChild('trendsChart') trendsChartRef!: ElementRef;
  chart: Chart | null = null;

  selectedStoreId: string | null = null;
  stores: any[] = [];
  history: any[] = [];
  storeFlags: any[] = [];
  currentScores: any = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadStores();
  }

  ngAfterViewInit(): void {
    // Initialized when store selected
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadStores(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.get<any[]>('client/stores').subscribe({
      next: (data) => {
        this.loading = false;
        this.stores = data;
        if (data.length > 0) {
          this.selectedStoreId = data[0].id;
          this.onStoreChange(data[0].id);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load stores. Please retry.';
        this.notification.error('Failed to load stores');
      }
    });
  }

  onStoreChange(storeId: string): void {
    if (!storeId) return;
    
    // Load historical records
    this.api.get<any[]>(`client/stores/${storeId}/results`).subscribe({
      next: (res) => {
        this.history = res;
        setTimeout(() => this.updateTrendsChart());
      },
      error: () => this.notification.error('Failed to load compliance history')
    });

    // Load trends & avg scores
    this.api.get<any>(`client/stores/${storeId}/scores`).subscribe({
      next: (res) => {
        this.currentScores = res;
      },
      error: () => this.notification.error('Failed to load score breakdown')
    });

    // Store flags are not available to client-manager users in the backend.
    this.storeFlags = [];
  }

  updateTrendsChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    if (!this.trendsChartRef || this.history.length === 0) return;

    const ctx = this.trendsChartRef.nativeElement.getContext('2d');
    
    // Prepare data sorted oldest to newest
    const sorted = [...this.history].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const labels = sorted.map(h => new Date(h.created_at).toLocaleDateString());
    const scores = sorted.map(h => h.overall_score);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Overall Compliance Score (%)',
          data: scores,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100
          }
        }
      }
    });
  }

  getScoreTagColor(score: number): string {
    if (score >= 90) return 'green';
    if (score >= 75) return 'orange';
    return 'red';
  }

  exportReport(resultId: string): void {
    this.notification.info('Downloading compliance report CSV...');
    this.api.download(`client/results/${resultId}/export`).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compliance-report-${resultId}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notification.error('Failed to export compliance report')
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
