import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  name: string;
  email: string;
  accessToken:string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  // private readonly API_URL = 'https://172.26.52.46/watify/api';
   private readonly API_URL = 'https://watify.wateen.com/watify/api';


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

  login(email: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post<LoginResponse>(
      `${this.API_URL}/auth/login`,
      {
        email: email,
        password: password
      },
      { headers }
    ).pipe(
      tap(response => {
        if (response && response.accessToken) {
          this.safeSetItem(this.TOKEN_KEY, response.accessToken);
          this.safeSetItem(this.USER_KEY, JSON.stringify({
            name: response.name,
            email: response.email
          }));
        }
      })
    );
  }
  logout(): void {
    this.safeRemoveItem(this.TOKEN_KEY);
    this.safeRemoveItem(this.USER_KEY);
  }
  logoutAdmin(): void {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.getToken()}`, // ✅ Call the method
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });

  this.http.post(`${this.API_URL}/auth/logout`, {}, { headers }).subscribe({
    next: () => {
      console.log('Logged out from server.');
    },
    error: (err) => {
      console.error('Logout API failed', err);
    }
  });

  // Always clear localStorage
  this.safeRemoveItem(this.TOKEN_KEY);
  this.safeRemoveItem(this.USER_KEY);
}


  getToken(): string | null {
    return this.safeGetItem(this.TOKEN_KEY);
  }

  getUser(): any {
    const userStr = this.safeGetItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
} 