import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticated = false;
    private token: string;
    private tokenTimer: NodeJS.Timer;
    private authStatusListener = new Subject<boolean>();

    constructor(private http: HttpClient, private router: Router) {}

    getAuthStatusListener(): Observable<boolean> {
        return this.authStatusListener.asObservable();
    }

    getToken(): string {
        return this.token;
    }

    getIsAuth(): boolean {
        return this.isAuthenticated;
    }

    createUser(email: string, password: string): void {
        const authData: AuthData = { email, password };
        this.http.post('http://localhost:3000/api/user/signup', authData);
    }

    login(email: string, password: string): void {
        const authData: AuthData = { email, password };
        this.http.post<{ token, expiresIn, message }>('http://localhost:3000/api/user/login', authData)
            .subscribe(data => {
                this.token = data.token;
                if (this.token) {
                    const expiresInDuration = data.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    this.isAuthenticated = true;
                    this.authStatusListener.next(true);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(this.token, expirationDate);
                    this.router.navigate(['/']);
                }
            });
    }

    logout(): void {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
    }

    autoAuthUser(): void {
        const authData = this.getAuthData();
        if (!authData) {
            return;
        }
        const now = new Date();
        const expiresIn = authData.expirationDate.getTime() - now.getTime();
        if (expiresIn > 0) {
            this.token = authData.token;
            this.isAuthenticated = true;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
        }
    }

    private setAuthTimer(duration: number): void {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date): void {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
    }

    private clearAuthData(): void {
        localStorage.removeItem('toekn');
        localStorage.removeItem('expiration');
    }

    private getAuthData(): { token: string, expirationDate: Date } {
        const token = localStorage.getItem('toekn');
        const expirationDate = localStorage.getItem('expiration');
        if (!token || !expirationDate) {
            return;
        }
        return { token, expirationDate: new Date(expirationDate) };
    }
 }
