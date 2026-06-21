import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  uploadReferenceProduct(clientId: string, name: string, skuCode: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('name', name);
    formData.append('skuCode', skuCode);
    formData.append('image', file);
    return this.http.post<any>(`${this.baseUrl}/admin/reference-products`, formData);
  }

  uploadShelfImage(storeId: string, sectionId: string, planogramId: string | null, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('storeId', storeId);
    formData.append('sectionId', sectionId);
    if (planogramId) {
      formData.append('planogramId', planogramId);
    }
    formData.append('image', file);
    return this.http.post<any>(`${this.baseUrl}/compliance/jobs`, formData);
  }

  uploadShelfImageWithProgress(storeId: string, sectionId: string, planogramId: string | null, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('storeId', storeId);
    formData.append('sectionId', sectionId);
    if (planogramId) {
      formData.append('planogramId', planogramId);
    }
    formData.append('image', file);
    return this.http.post<any>(`${this.baseUrl}/compliance/jobs`, formData, {
      observe: 'events',
      reportProgress: true
    });
  }
}
