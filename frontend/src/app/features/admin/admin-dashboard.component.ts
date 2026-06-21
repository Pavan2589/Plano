import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { UploadService } from '../../core/services/upload.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, catchError, interval, of, switchMap, takeWhile } from 'rxjs';

// NG-Zorro imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzLayoutModule,
    NzMenuModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCardModule,
    NzTagModule,
    NzTabsModule,
    NzModalModule,
    NzListModule,
    NzGridModule
  ],
  template: `
    <nz-layout class="admin-layout-container">
      <nz-header class="admin-header">
        <div class="header-content">
          <div class="logo-area">
            <span class="logo-icon">🛰️</span>
            <span class="logo-text">Plano Admin</span>
          </div>
          <div class="user-profile">
            <span class="username">Welcome, {{ userName }}</span>
            <button nz-button nzType="text" nzDanger (click)="logout()">Log Out</button>
          </div>
        </div>
      </nz-header>
      
      <nz-content class="admin-content">
        <nz-card class="main-card">
          <nz-tabset nzTabPosition="left" [(nzSelectedIndex)]="activeTab" (nzSelectedIndexChange)="onTabChange($event)">
            
            <!-- Clients & Stores Tab -->
            <nz-tab nzTitle="Clients & Stores">
              <div class="tab-header">
                <h2>Clients & Stores Management</h2>
                <div class="actions">
                  <button nz-button nzType="primary" (click)="showClientModal()">+ Add Client</button>
                </div>
              </div>

              <nz-table #clientTable [nzData]="clients" nzSize="middle">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Email Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let client of clientTable.data">
                    <td><strong>{{ client.name }}</strong></td>
                    <td>{{ client.contact_email }}</td>
                    <td>
                      <nz-tag [nzColor]="client.is_active ? 'green' : 'red'">
                        {{ client.is_active ? 'Active' : 'Inactive' }}
                      </nz-tag>
                    </td>
                    <td>
                      <button nz-button nzSize="small" (click)="viewStores(client)">View Stores</button>
                    </td>
                  </tr>
                </tbody>
              </nz-table>

              <!-- Stores list section (visible if client selected) -->
              <div *ngIf="selectedClient" class="stores-section">
                <div class="tab-header">
                  <h3>Stores under {{ selectedClient.name }}</h3>
                  <button nz-button nzType="default" (click)="showStoreModal()">+ Add Store</button>
                </div>

                <nz-table #storeTable [nzData]="stores" nzSize="middle">
                  <thead>
                    <tr>
                      <th>Store Name</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let store of storeTable.data">
                      <td>{{ store.name }}</td>
                      <td>{{ store.location || 'N/A' }}</td>
                      <td>
                        <nz-tag [nzColor]="store.is_active ? 'green' : 'red'">
                          {{ store.is_active ? 'Active' : 'Inactive' }}
                        </nz-tag>
                      </td>
                      <td>
                        <button nz-button nzSize="small" (click)="viewSections(store)">Manage Sections</button>
                      </td>
                    </tr>
                  </tbody>
                </nz-table>
              </div>

              <!-- Sections list section (visible if store selected) -->
              <div *ngIf="selectedStore" class="sections-section">
                <div class="tab-header">
                  <h3>Sections in {{ selectedStore.name }}</h3>
                  <button nz-button nzType="dashed" (click)="showSectionModal()">+ Add Section</button>
                </div>
                <div class="sections-grid">
                  <nz-tag *ngFor="let sec of sections" nzColor="blue" class="section-tag">
                    {{ sec.name }}
                  </nz-tag>
                  <p *ngIf="sections.length === 0" class="empty-text">No sections added yet</p>
                </div>
              </div>
            </nz-tab>

            <!-- User Creation & Assignments Tab -->
            <nz-tab nzTitle="Users & Assignments">
              <div class="tab-header">
                <h2>User Management</h2>
              </div>
              
              <div nz-row [nzGutter]="24">
                <div nz-col [nzLg]="12" [nzXs]="24">
                  <nz-card nzTitle="Create New User" class="form-card">
                    <form nz-form [formGroup]="userForm" (ngSubmit)="createUser()">
                      <nz-form-item>
                        <nz-form-label [nzSpan]="6">Name</nz-form-label>
                        <nz-form-control [nzSpan]="18" nzErrorTip="Name is required">
                          <input nz-input formControlName="name" />
                        </nz-form-control>
                      </nz-form-item>
                      <nz-form-item>
                        <nz-form-label [nzSpan]="6">Email</nz-form-label>
                        <nz-form-control [nzSpan]="18" nzErrorTip="Valid email required">
                          <input nz-input type="email" formControlName="email" />
                        </nz-form-control>
                      </nz-form-item>
                      <nz-form-item>
                        <nz-form-label [nzSpan]="6">Password</nz-form-label>
                        <nz-form-control [nzSpan]="18" nzErrorTip="Password is required">
                          <input nz-input type="password" formControlName="password" />
                        </nz-form-control>
                      </nz-form-item>
                      <nz-form-item>
                        <nz-form-label [nzSpan]="6">Role</nz-form-label>
                        <nz-form-control [nzSpan]="18">
                          <nz-select formControlName="role" (ngModelChange)="onRoleChange($event)">
                            <nz-option nzValue="admin" nzLabel="Admin"></nz-option>
                            <nz-option nzValue="agent" nzLabel="Field Agent"></nz-option>
                            <nz-option nzValue="client_manager" nzLabel="Client Manager"></nz-option>
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                      <nz-form-item *ngIf="userForm.get('role')?.value === 'client_manager'">
                        <nz-form-label [nzSpan]="6">Client</nz-form-label>
                        <nz-form-control [nzSpan]="18">
                          <nz-select formControlName="clientId">
                            <nz-option *ngFor="let c of clients" [nzValue]="c.id" [nzLabel]="c.name"></nz-option>
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                      <button nz-button nzType="primary" class="submit-btn" [nzLoading]="loading">Create User</button>
                    </form>
                  </nz-card>
                </div>

                <div nz-col [nzLg]="12" [nzXs]="24">
                  <nz-card nzTitle="Assign Agent to Store" class="form-card">
                    <form nz-form [formGroup]="assignForm" (ngSubmit)="assignAgent()">
                      <nz-form-item>
                        <nz-form-label [nzSpan]="6">Store</nz-form-label>
                        <nz-form-control [nzSpan]="18">
                          <nz-select formControlName="storeId">
                            <nz-option *ngFor="let s of allStores" [nzValue]="s.id" [nzLabel]="s.name"></nz-option>
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                      <nz-form-item>
                        <nz-form-label [nzSpan]="6">Agent</nz-form-label>
                        <nz-form-control [nzSpan]="18">
                          <nz-select formControlName="agentId">
                            <nz-option *ngFor="let a of agents" [nzValue]="a.id" [nzLabel]="a.name + ' (' + a.email + ')'"></nz-option>
                          </nz-select>
                        </nz-form-control>
                      </nz-form-item>
                      <button nz-button nzType="primary" class="submit-btn" [nzLoading]="loading">Create Assignment</button>
                    </form>
                  </nz-card>
                </div>
              </div>

              <nz-table #userTable [nzData]="users" nzSize="middle" class="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of userTable.data">
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td><nz-tag>{{ user.role }}</nz-tag></td>
                    <td><nz-tag [nzColor]="user.is_active ? 'green' : 'red'">{{ user.is_active ? 'Active' : 'Inactive' }}</nz-tag></td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-tab>

            <!-- Reference Products Tab -->
            <nz-tab nzTitle="Reference Products">
              <div class="tab-header">
                <h2>Reference Products Catalog</h2>
                <button nz-button nzType="primary" (click)="showProductModal()">+ Add Product</button>
              </div>

              <nz-table #productTable [nzData]="products" nzSize="middle">
                <thead>
                  <tr>
                    <th>Product Image</th>
                    <th>Product Name</th>
                    <th>SKU Code</th>
                    <th>Embedding Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let prod of productTable.data">
                    <td>
                      <img [src]="prod.image_url" alt="Product Image" class="product-thumb" />
                    </td>
                    <td><strong>{{ prod.name }}</strong></td>
                    <td><code>{{ prod.sku_code }}</code></td>
                    <td>
                      <nz-tag [nzColor]="getEmbeddingStatusColor(prod.embedding_status)">
                        {{ prod.embedding_status.toUpperCase() }}
                      </nz-tag>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
              <p *ngIf="products.length === 0" class="empty-text">
                Existing products cannot be listed because the backend exposes upload and status APIs only. Products uploaded in this session will appear here.
              </p>
            </nz-tab>

            <!-- Planograms Builder Tab -->
            <nz-tab nzTitle="Planograms Builder">
              <div class="tab-header">
                <h2>Planograms Manager</h2>
                <button nz-button nzType="primary" (click)="showPlanogramModal()">+ Add Planogram</button>
              </div>

              <nz-table #planogramTable [nzData]="planograms" nzSize="middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Reference URL</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let plano of planogramTable.data">
                    <td><strong>{{ plano.name }}</strong></td>
                    <td><a [href]="plano.reference_image_url" target="_blank">View Image</a></td>
                    <td>
                      <nz-tag [nzColor]="plano.is_active ? 'green' : 'red'">
                        {{ plano.is_active ? 'Active' : 'Inactive' }}
                      </nz-tag>
                    </td>
                    <td class="action-buttons">
                      <button nz-button nzSize="small" (click)="openGridBuilder(plano)">Grid Builder</button>
                      <button *ngIf="!plano.is_active" nz-button nzSize="small" nzType="primary" (click)="activatePlanogram(plano)">Activate</button>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-tab>

            <!-- Store Flags Tab -->
            <nz-tab nzTitle="Store Flags">
              <div class="tab-header">
                <h2>Compliance Flags & Escalations</h2>
              </div>

              <nz-table #flagsTable [nzData]="unresolvedFlags" nzSize="middle">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Section</th>
                    <th>Flag Reason</th>
                    <th>Date Flagged</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let flag of flagsTable.data">
                    <td>{{ flag.store_name }}</td>
                    <td>{{ flag.section_name || 'N/A' }}</td>
                    <td><span class="flag-reason-text">{{ flag.flag_reason }}</span></td>
                    <td>{{ flag.flagged_at | date:'short' }}</td>
                    <td>
                      <nz-tag [nzColor]="flag.is_active ? 'red' : 'green'">
                        {{ flag.is_active ? 'Active' : 'Resolved' }}
                      </nz-tag>
                    </td>
                    <td>
                      <button *ngIf="flag.is_active" nz-button nzSize="small" nzDanger (click)="openResolveModal(flag)">Resolve</button>
                      <span *ngIf="!flag.is_active" class="resolved-note">Notes: {{ flag.notes }}</span>
                    </td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-tab>
            
          </nz-tabset>
        </nz-card>
      </nz-content>

      <!-- Client Creation Modal -->
      <nz-modal [(nzVisible)]="clientModalVisible" nzTitle="Add New Client" (nzOnCancel)="hideClientModal()" (nzOnOk)="createClient()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="clientForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Client Name</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Client name is required">
                <input nz-input formControlName="name" />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Contact Email</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Valid email required">
                <input nz-input type="email" formControlName="contactEmail" />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Store Creation Modal -->
      <nz-modal [(nzVisible)]="storeModalVisible" nzTitle="Add New Store" (nzOnCancel)="hideStoreModal()" (nzOnOk)="createStore()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="storeForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Store Name</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Store name is required">
                <input nz-input formControlName="name" />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Location</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <input nz-input formControlName="location" />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Section Creation Modal -->
      <nz-modal [(nzVisible)]="sectionModalVisible" nzTitle="Add New Section" (nzOnCancel)="hideSectionModal()" (nzOnOk)="createSection()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="sectionForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Section Name</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Section name is required">
                <input nz-input formControlName="name" placeholder="e.g. Carbonated Beverages" />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Reference Product Upload Modal -->
      <nz-modal [(nzVisible)]="productModalVisible" nzTitle="Upload Reference Product" (nzOnCancel)="hideProductModal()" (nzOnOk)="uploadProduct()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="productForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Client</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <nz-select formControlName="clientId">
                  <nz-option *ngFor="let c of clients" [nzValue]="c.id" [nzLabel]="c.name"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Product Name</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Name is required">
                <input nz-input formControlName="name" />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">SKU Code</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="SKU code is required">
                <input nz-input formControlName="skuCode" />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Image File</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <input type="file" (change)="onProductImageSelected($event)" accept="image/*" />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Planogram Creation Modal -->
      <nz-modal [(nzVisible)]="planogramModalVisible" nzTitle="Create Planogram" (nzOnCancel)="hidePlanogramModal()" (nzOnOk)="createPlanogram()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="planogramForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Client</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <nz-select formControlName="clientId" (ngModelChange)="onPlanogramClientChange($event)">
                  <nz-option *ngFor="let c of clients" [nzValue]="c.id" [nzLabel]="c.name"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Store</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <nz-select formControlName="storeId" (ngModelChange)="onPlanogramStoreChange($event)">
                  <nz-option *ngFor="let s of planogramStores" [nzValue]="s.id" [nzLabel]="s.name"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Section</nz-form-label>
              <nz-form-control [nzSpan]="18">
                <nz-select formControlName="sectionId">
                  <nz-option *ngFor="let sec of planogramSections" [nzValue]="sec.id" [nzLabel]="sec.name"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Planogram Name</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Name is required">
                <input nz-input formControlName="name" />
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Reference Image URL</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="URL is required">
                <input nz-input formControlName="referenceImageUrl" placeholder="e.g. http://localhost:9000/..." />
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

      <!-- Planogram Grid Builder Modal -->
      <nz-modal [(nzVisible)]="gridBuilderVisible" nzTitle="Planogram Grid Cell Configuration" nzWidth="800px" (nzOnCancel)="hideGridBuilder()" (nzOnOk)="savePlanogramGrid()">
        <ng-container *nzModalContent>
          <div class="grid-builder-wrapper">
            <p class="builder-description">Define expected product cells by row and position sequence on the shelf.</p>
            
            <div class="builder-actions">
              <button nz-button nzType="dashed" (click)="addGridCell()">+ Add Grid Cell</button>
            </div>

            <nz-table #cellTable [nzData]="gridCells" nzSize="small" [nzScroll]="{ y: '300px' }">
              <thead>
                <tr>
                  <th nzWidth="100px">Row</th>
                  <th nzWidth="100px">Position</th>
                  <th>Expected Product</th>
                  <th nzWidth="120px">Facing Count</th>
                  <th nzWidth="80px">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cell of cellTable.data; let idx = index">
                  <td>
                    <input type="number" nz-input [(ngModel)]="cell.row" min="1" class="cell-num-input" />
                  </td>
                  <td>
                    <input type="number" nz-input [(ngModel)]="cell.position" min="1" class="cell-num-input" />
                  </td>
                  <td>
                    <nz-select [(ngModel)]="cell.referenceProductId" style="width: 100%">
                      <nz-option *ngFor="let p of products" [nzValue]="p.id" [nzLabel]="p.name + ' (' + p.sku_code + ')'"></nz-option>
                    </nz-select>
                  </td>
                  <td>
                    <input type="number" nz-input [(ngModel)]="cell.facingCount" min="1" class="cell-num-input" />
                  </td>
                  <td>
                    <button nz-button nzDanger nzShape="circle" (click)="removeGridCell(idx)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </nz-table>
          </div>
        </ng-container>
      </nz-modal>

      <!-- Flag Resolution Modal -->
      <nz-modal [(nzVisible)]="resolveModalVisible" nzTitle="Resolve Escalated Flag" (nzOnCancel)="hideResolveModal()" (nzOnOk)="resolveFlag()">
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="resolveForm">
            <nz-form-item>
              <nz-form-label [nzSpan]="6">Resolution Notes</nz-form-label>
              <nz-form-control [nzSpan]="18" nzErrorTip="Resolution notes are required">
                <textarea nz-input formControlName="notes" rows="4" placeholder="Enter resolution details..."></textarea>
              </nz-form-control>
            </nz-form-item>
          </form>
        </ng-container>
      </nz-modal>

    </nz-layout>
  `,
  styles: [`
    .admin-layout-container {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', sans-serif;
    }
    .admin-header {
      background: #0f172a;
      padding: 0 24px;
      height: 64px;
      line-height: 64px;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      font-size: 1.6rem;
    }
    .logo-text {
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .username {
      font-size: 0.9rem;
      color: #cbd5e1;
    }
    .admin-content {
      padding: 24px;
    }
    .main-card {
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .tab-header h2 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .stores-section, .sections-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
    }
    .sections-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }
    .section-tag {
      font-size: 0.9rem;
      padding: 6px 12px;
      border-radius: 6px;
    }
    .form-card {
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .submit-btn {
      width: 100%;
      height: 40px;
      font-weight: 600;
      border-radius: 6px;
    }
    .product-thumb {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    .flag-reason-text {
      color: #dc2626;
      font-weight: 500;
    }
    .resolved-note {
      font-size: 0.85rem;
      color: #64748b;
      font-style: italic;
    }
    .builder-description {
      color: #64748b;
      margin-bottom: 16px;
    }
    .builder-actions {
      margin-bottom: 16px;
    }
    .cell-num-input {
      width: 70px;
    }
    .empty-text {
      color: #94a3b8;
      font-style: italic;
    }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private upload = inject(UploadService);
  private auth = inject(AuthService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  userName = '';
  activeTab = 0;
  loading = false;

  // Data arrays
  clients: any[] = [];
  stores: any[] = [];
  sections: any[] = [];
  allStores: any[] = [];
  agents: any[] = [];
  users: any[] = [];
  products: any[] = [];
  planograms: any[] = [];
  flags: any[] = [];

  // Selections
  selectedClient: any = null;
  selectedStore: any = null;
  selectedPlanogram: any = null;

  // Modals Visibility
  clientModalVisible = false;
  storeModalVisible = false;
  sectionModalVisible = false;
  productModalVisible = false;
  planogramModalVisible = false;
  gridBuilderVisible = false;
  resolveModalVisible = false;

  // Forms
  clientForm!: FormGroup;
  storeForm!: FormGroup;
  sectionForm!: FormGroup;
  userForm!: FormGroup;
  assignForm!: FormGroup;
  productForm!: FormGroup;
  planogramForm!: FormGroup;
  resolveForm!: FormGroup;

  // Planogram creation store/section helpers
  planogramStores: any[] = [];
  planogramSections: any[] = [];

  // Temporary selected product image file
  selectedProductImage: File | null = null;

  // Grid builder cells
  gridCells: Array<{ row: number; position: number; referenceProductId: string; facingCount: number }> = [];

  // Flag resolution reference
  selectedFlag: any = null;
  private embeddingPolls = new Map<string, Subscription>();

  get unresolvedFlags(): any[] {
    return this.flags.filter(flag => flag.is_active);
  }

  ngOnInit(): void {
    this.userName = this.auth.getUserName() || 'Admin';
    this.initForms();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.embeddingPolls.forEach(subscription => subscription.unsubscribe());
    this.embeddingPolls.clear();
  }

  initForms(): void {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]]
    });

    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      location: ['']
    });

    this.sectionForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['agent', Validators.required],
      clientId: [null]
    });

    this.assignForm = this.fb.group({
      storeId: [null, Validators.required],
      agentId: [null, Validators.required]
    });

    this.productForm = this.fb.group({
      clientId: [null, Validators.required],
      name: ['', Validators.required],
      skuCode: ['', Validators.required]
    });

    this.planogramForm = this.fb.group({
      clientId: [null, Validators.required],
      storeId: [null, Validators.required],
      sectionId: [null, Validators.required],
      name: ['', Validators.required],
      referenceImageUrl: ['', Validators.required]
    });

    this.resolveForm = this.fb.group({
      notes: ['', Validators.required]
    });
  }

  loadInitialData(): void {
    // Clients
    this.api.get<any[]>('clients').subscribe({
      next: (data) => {
        this.clients = data;
        if (data.length > 0) {
          this.userForm.patchValue({ clientId: data[0].id });
          this.productForm.patchValue({ clientId: data[0].id });
          this.planogramForm.patchValue({ clientId: data[0].id });
        }
      }
    });

    // All Stores (for assignment)
    this.api.get<any[]>('clients').subscribe({
      next: (clientList) => {
        this.allStores = [];
        clientList.forEach(c => {
          this.api.get<any[]>(`clients/${c.id}/stores`).subscribe({
            next: (storeList) => {
              this.allStores = [...this.allStores, ...storeList];
              if (this.allStores.length > 0) {
                this.assignForm.patchValue({ storeId: this.allStores[0].id });
              }
            }
          });
        });
      }
    });

    // Load users/agents
    this.api.get<any[]>('users').subscribe({
      next: (data) => {
        this.users = data;
        this.agents = data.filter(u => u.role === 'agent');
        if (this.agents.length > 0) {
          this.assignForm.patchValue({ agentId: this.agents[0].id });
        }
      },
      error: () => {
        this.notification.error('Failed to load users');
        this.users = [];
        this.agents = [];
      }
    });

    // Planograms
    this.api.get<any[]>('planograms').subscribe({
      next: (data) => this.planograms = data
    });

    // Flags
    this.api.get<any[]>('flags').subscribe({
      next: (data) => this.flags = data
    });
  }

  onTabChange(index: number): void {
    if (index === 2) { // Reference Products tab
      this.loadReferenceProducts();
    }
  }

  loadReferenceProducts(): void {
    // The backend has no reference-product listing endpoint. Keep products
    // uploaded during this session and poll their supported status endpoints.
    this.products.forEach(product => this.startEmbeddingStatusPolling(product.id));
  }

  // --- Clients & Stores ---
  showClientModal(): void {
    this.clientModalVisible = true;
  }

  hideClientModal(): void {
    this.clientModalVisible = false;
    this.clientForm.reset();
  }

  createClient(): void {
    if (this.clientForm.invalid) return;
    this.api.post<any>('clients', this.clientForm.value).subscribe({
      next: (res) => {
        this.notification.success('Client added successfully!');
        this.clients = [...this.clients, res];
        this.hideClientModal();
      },
      error: (err) => this.notification.error(err.error?.error || 'Failed to create client')
    });
  }

  viewStores(client: any): void {
    this.selectedClient = client;
    this.selectedStore = null;
    this.stores = [];
    this.sections = [];
    
    this.api.get<any[]>(`clients/${client.id}/stores`).subscribe({
      next: (res) => this.stores = res,
      error: (err) => this.notification.error('Failed to load stores')
    });
  }

  showStoreModal(): void {
    this.storeModalVisible = true;
  }

  hideStoreModal(): void {
    this.storeModalVisible = false;
    this.storeForm.reset();
  }

  createStore(): void {
    if (this.storeForm.invalid || !this.selectedClient) return;
    this.api.post<any>(`clients/${this.selectedClient.id}/stores`, this.storeForm.value).subscribe({
      next: (res) => {
        this.notification.success('Store added successfully!');
        this.stores = [...this.stores, res];
        this.allStores = [...this.allStores, res];
        this.hideStoreModal();
      },
      error: (err) => this.notification.error(err.error?.error || 'Failed to create store')
    });
  }

  viewSections(store: any): void {
    this.selectedStore = store;
    this.sections = [];
    
    this.api.get<any[]>(`stores/${store.id}/sections`).subscribe({
      next: (res) => this.sections = res,
      error: (err) => this.notification.error('Failed to load sections')
    });
  }

  showSectionModal(): void {
    this.sectionModalVisible = true;
  }

  hideSectionModal(): void {
    this.sectionModalVisible = false;
    this.sectionForm.reset();
  }

  createSection(): void {
    if (this.sectionForm.invalid || !this.selectedStore) return;
    this.api.post<any>(`stores/${this.selectedStore.id}/sections`, this.sectionForm.value).subscribe({
      next: (res) => {
        this.notification.success('Section added successfully!');
        this.sections = [...this.sections, res];
        this.hideSectionModal();
      },
      error: (err) => this.notification.error(err.error?.error || 'Failed to create section')
    });
  }

  // --- Users & Assignments ---
  onRoleChange(role: string): void {
    if (role === 'client_manager') {
      this.userForm.get('clientId')?.setValidators([Validators.required]);
    } else {
      this.userForm.get('clientId')?.clearValidators();
    }
    this.userForm.get('clientId')?.updateValueAndValidity();
  }

  createUser(): void {
    if (this.userForm.invalid) return;
    this.loading = true;
    
    this.api.post<any>('users', this.userForm.value).subscribe({
      next: (u) => {
        this.loading = false;
        this.notification.success('User created successfully!');
        if (u.role === 'agent') {
          this.agents = [...this.agents, u];
        }
        this.users = [...this.users, u];
        this.userForm.reset({ role: 'agent' });
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(err.error?.error || 'Failed to create user');
      }
    });
  }

  assignAgent(): void {
    if (this.assignForm.invalid) return;
    this.loading = true;
    
    this.api.post<any>('agent-assignments', this.assignForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.notification.success('Agent assigned to store successfully!');
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(err.error?.error || 'Failed to assign agent');
      }
    });
  }

  // --- Reference Products ---
  showProductModal(): void {
    this.productModalVisible = true;
  }

  hideProductModal(): void {
    this.productModalVisible = false;
    this.productForm.reset({ clientId: this.clients[0]?.id });
    this.selectedProductImage = null;
  }

  onProductImageSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedProductImage = files[0];
    }
  }

  uploadProduct(): void {
    if (this.productForm.invalid || !this.selectedProductImage) {
      this.notification.error('Please fill all details and select an image file!');
      return;
    }
    
    const { clientId, name, skuCode } = this.productForm.value;
    
    this.upload.uploadReferenceProduct(clientId, name, skuCode, this.selectedProductImage).subscribe({
      next: (res) => {
        this.notification.success('Product uploaded and embedding generation scheduled!');
        this.products = [...this.products, res];
        this.startEmbeddingStatusPolling(res.id);
        this.hideProductModal();
      },
      error: (err) => this.notification.error(err.error?.error || 'Failed to upload reference product')
    });
  }

  getEmbeddingStatusColor(status: string): string {
    switch (status) {
      case 'complete': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'default';
    }
  }


  private startEmbeddingStatusPolling(productId: string): void {
    if (!productId || this.embeddingPolls.has(productId)) return;

    const subscription = interval(2000).pipe(
      switchMap(() => this.api.get<any>(`reference-products/${productId}/status`).pipe(
        catchError(() => of(null))
      )),
      takeWhile(status => !status || !['complete', 'failed'].includes(status.embedding_status), true)
    ).subscribe({
      next: status => {
        if (!status) return;
        this.products = this.products.map(product => product.id === productId
          ? { ...product, embedding_status: status.embedding_status }
          : product);
      },
      complete: () => this.embeddingPolls.delete(productId)
    });

    this.embeddingPolls.set(productId, subscription);
  }

  // --- Planograms ---
  showPlanogramModal(): void {
    this.planogramModalVisible = true;
  }

  hidePlanogramModal(): void {
    this.planogramModalVisible = false;
    this.planogramForm.reset({ clientId: this.clients[0]?.id });
    this.planogramStores = [];
    this.planogramSections = [];
  }

  onPlanogramClientChange(clientId: string): void {
    if (!clientId) return;
    this.api.get<any[]>(`clients/${clientId}/stores`).subscribe({
      next: (res) => this.planogramStores = res
    });
  }

  onPlanogramStoreChange(storeId: string): void {
    if (!storeId) return;
    this.api.get<any[]>(`stores/${storeId}/sections`).subscribe({
      next: (res) => this.planogramSections = res
    });
  }

  createPlanogram(): void {
    if (this.planogramForm.invalid) return;
    
    const { sectionId, name, referenceImageUrl } = this.planogramForm.value;
    
    this.api.post<any>('planograms', { sectionId, name, referenceImageUrl }).subscribe({
      next: (res) => {
        this.notification.success('Planogram created successfully!');
        this.planograms = [...this.planograms, res];
        this.hidePlanogramModal();
      },
      error: (err) => this.notification.error(err.error?.error || 'Failed to create planogram')
    });
  }

  activatePlanogram(plano: any): void {
    this.api.patch<any>(`planograms/${plano.id}/activate`, {}).subscribe({
      next: () => {
        this.notification.success('Planogram activated successfully!');
        this.planograms = this.planograms.map(p => {
          if (p.section_id === plano.section_id) {
            p.is_active = (p.id === plano.id);
          }
          return p;
        });
      },
      error: (err) => this.notification.error(err.error?.error || 'Failed to activate planogram')
    });
  }

  // --- Grid Builder ---
  openGridBuilder(plano: any): void {
    this.selectedPlanogram = plano;
    this.gridCells = [];
    
    // We load all reference products for selection
    this.loadReferenceProducts();
    
    // Existing cells cannot be loaded because the backend exposes only the
    // cell-definition POST endpoint.
    this.gridBuilderVisible = true;
  }

  hideGridBuilder(): void {
    this.gridBuilderVisible = false;
    this.selectedPlanogram = null;
    this.gridCells = [];
  }

  addGridCell(): void {
    // Auto-compute next row & position
    let nextRow = 1;
    let nextPos = 1;
    if (this.gridCells.length > 0) {
      const last = this.gridCells[this.gridCells.length - 1];
      nextRow = last.row;
      nextPos = last.position + 1;
    }
    
    this.gridCells = [...this.gridCells, {
      row: nextRow,
      position: nextPos,
      referenceProductId: this.products[0]?.id || '',
      facingCount: 1
    }];
  }

  removeGridCell(index: number): void {
    this.gridCells = this.gridCells.filter((_, idx) => idx !== index);
  }

  savePlanogramGrid(): void {
    if (!this.selectedPlanogram) return;
    
    // Validate inputs
    for (const cell of this.gridCells) {
      if (cell.row <= 0 || cell.position <= 0 || cell.facingCount <= 0 || !cell.referenceProductId) {
        this.notification.error('All fields must be valid and positive numbers!');
        return;
      }
    }
    
    this.api.post<any>(`planograms/${this.selectedPlanogram.id}/cells`, { cells: this.gridCells }).subscribe({
      next: () => {
        this.notification.success('Planogram grid cell definition saved!');
        this.hideGridBuilder();
      },
      error: (err) => this.notification.error(err.error?.error || 'Failed to save planogram cells')
    });
  }

  // --- Flags Resolution ---
  openResolveModal(flag: any): void {
    this.selectedFlag = flag;
    this.resolveModalVisible = true;
  }

  hideResolveModal(): void {
    this.resolveModalVisible = false;
    this.resolveForm.reset();
    this.selectedFlag = null;
  }

  resolveFlag(): void {
    if (this.resolveForm.invalid || !this.selectedFlag) return;
    
    this.api.patch<any>(`flags/${this.selectedFlag.id}/resolve`, this.resolveForm.value).subscribe({
      next: (res) => {
        this.notification.success('Store flag resolved successfully!');
        this.flags = this.flags.map(f => f.id === res.id ? { ...f, is_active: false, notes: res.notes } : f);
        this.hideResolveModal();
      },
      error: (err) => this.notification.error(err.error?.error || 'Failed to resolve flag')
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
