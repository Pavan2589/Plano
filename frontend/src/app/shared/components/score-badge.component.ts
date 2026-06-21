import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-badge" [ngStyle]="getBadgeStyle()">
      <span class="score-value">{{ score !== null ? (score | number:'1.0-1') + '%' : 'N/A' }}</span>
      <span class="score-label" *ngIf="label">{{ label }}</span>
    </div>
  `,
  styles: [`
    .score-badge {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      padding: 12px 18px;
      font-weight: 700;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      min-width: 90px;
      text-align: center;
    }
    .score-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
    .score-value {
      font-size: 1.8rem;
      line-height: 1;
    }
    .score-label {
      font-size: 0.75rem;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.9;
      white-space: nowrap;
    }
  `]
})
export class ScoreBadgeComponent {
  @Input() score: number | null = null;
  @Input() label: string = 'Score';

  getBadgeStyle(): { [key: string]: string } {
    if (this.score === null) {
      return {
        'background-color': '#7f8c8d'
      };
    }
    
    // Dynamic color matching from red to green (HSL)
    const hue = Math.min(120, Math.max(0, (this.score / 100) * 120));
    return {
      'background': `linear-gradient(135deg, hsl(${hue}, 75%, 45%) 0%, hsl(${hue}, 75%, 35%) 100%)`
    };
  }
}
