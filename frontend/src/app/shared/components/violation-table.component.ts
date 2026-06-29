import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

export interface Violation {
  id?: string;
  row: number;
  position: number;
  violation_type: string;
  expected_product_id?: string | null;
  detected_product_id?: string | null;
  expected_product_name?: string | null;
  detected_product_name?: string | null;
  similarity?: number | null;
  expected_facing_count?: number | null;
  detected_facing_count?: number | null;
  display_title?: string | null;
  display_details?: string[] | null;
  expected_gap?: number | null;
  detected_gap?: number | null;
}

@Component({
  selector: 'app-violation-table',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzTagModule],
  template: `
    <nz-table #violationTable [nzData]="violations" [nzPageSize]="5" nzSize="middle" [nzScroll]="{ x: '600px' }">
      <thead>
        <tr>
          <th nzWidth="80px">Row</th>
          <th nzWidth="80px">Position</th>
          <th nzWidth="150px">Violation Type</th>
          <th>Expected Product</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of violationTable.data">
          <td>{{ data.row }}</td>
          <td>{{ data.position }}</td>
          <td>
            <nz-tag [nzColor]="getTagColor(data.violation_type)">
              {{ formatViolationType(data.violation_type) }}
            </nz-tag>
          </td>
          <td>
            <strong>{{ data.expected_product_name || data.expected_product_id || 'N/A' }}</strong>
          </td>
          <td>
            <div *ngIf="data.display_details?.length; else legacyDetails" class="violation-details">
              <div *ngFor="let detail of data.display_details">{{ detail }}</div>
            </div>
            <ng-template #legacyDetails>
              <span *ngIf="data.violation_type === 'gap_violation'">
                Gap: {{ data.detected_gap != null ? (data.detected_gap * 100 | number:'1.0-1') + '%' : 'N/A' }} 
                (Expected: &lt; {{ data.expected_gap != null ? (data.expected_gap * 100 | number:'1.0-1') + '%' : '5%' }})
              </span>
              <span *ngIf="data.violation_type === 'facing_violation'">
                Facing Count Deficit
              </span>
              <span *ngIf="data.violation_type === 'wrong_product'">
                Product Mismatch
              </span>
              <span *ngIf="data.violation_type === 'missing_product'">
                Product Missing
              </span>
            </ng-template>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `,
  styles: [`
    .product-id-text {
      font-family: monospace;
      font-size: 0.85rem;
      color: #555;
    }
    .violation-details {
      line-height: 1.5;
      white-space: pre-line;
    }
  `]
})
export class ViolationTableComponent {
  @Input() violations: Violation[] = [];

  getTagColor(type: string): string {
    switch (type) {
      case 'wrong_product':
        return 'volcano';
      case 'missing_product':
        return 'red';
      case 'facing_violation':
        return 'orange';
      case 'gap_violation':
        return 'blue';
      default:
        return 'default';
    }
  }

  formatViolationType(type: string): string {
    return type.replace(/_/g, ' ').toUpperCase();
  }
}
