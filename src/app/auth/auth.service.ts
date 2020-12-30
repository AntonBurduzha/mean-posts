import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { threadId } from 'worker_threads';
import { AuthData } from './auth-data.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticated = false;
    private token: string;
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
        this.http.post('http://localhost:3000/api/user/signup', authData)
            .subscribe(() => {

            });
    }

    login(email: string, password: string): void {
        const authData: AuthData = { email, password };
        this.http.post<{ token }>('http://localhost:3000/api/user/login', authData)
            .subscribe(data => {
                this.token = data.token;
                if (this.token) {
                    this.isAuthenticated = true;
                    this.authStatusListener.next(true);
                    this.router.navigate(['/']);
                }
            });
    }

    logout(): void {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.router.navigate(['/']);
    }
}
