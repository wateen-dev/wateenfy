import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    phone_number: string;
    status: string;
    created_at: string;
    deleted_at: string | null;
    is_deleted: string | null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly API_URL = 'http://172.26.52.46/watify/api';

  constructor(private http: HttpClient) {}

  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private safeGetItem(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private safeSetItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    }
  }

  private safeRemoveItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  isLoggedIn(): boolean {
    return !!this.safeGetItem(this.TOKEN_KEY);
  }

  login(phoneNumber: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.API_URL}/auth/login`,
      {
        phone_number: phoneNumber,
        password: password
      },
      { headers }
    ).pipe(
      tap(response => {
        if (response && response.token) {
          this.safeSetItem(this.TOKEN_KEY, response.token);
          this.safeSetItem(this.USER_KEY, JSON.stringify(response.user));
        }
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Call logout API, then clear local storage
    return this.http.get(`${this.API_URL}/auth/logout`, { headers }).pipe(
      tap({
        next: () => {
          this.safeRemoveItem(this.TOKEN_KEY);
          this.safeRemoveItem(this.USER_KEY);
        },
        error: () => {
          // Even if API fails, clear local storage for security
          this.safeRemoveItem(this.TOKEN_KEY);
          this.safeRemoveItem(this.USER_KEY);
        }
      })
    );
  }

  getToken(): string | null {
    return this.safeGetItem(this.TOKEN_KEY);
  }

  getUser(): any {
    const userStr = this.safeGetItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
} 