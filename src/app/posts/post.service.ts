import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{ posts: Post[], totalPosts: number }>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts(pageSize: number, currentPage: number): void {
        const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
        this.http.get<{ message: string, posts: any, totalPosts: number }>(`http://localhost:3000/api/posts${queryParams}`)
            .pipe(map(data => {
                return {
                    posts: data.posts.map(post => ({
                        title: post.title,
                        content: post.content,
                        id: post._id,
                        imagePath: post.imagePath
                    })),
                    totalPosts: data.totalPosts
                };
            }))
            .subscribe((data) => {
                this.posts = data.posts;
                this.postsUpdated.next({ posts: [...this.posts], totalPosts: data.totalPosts });
            });
    }

    getPostUpdateListener(): Observable<{ posts: Post[], totalPosts: number }> {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string): Observable<{ message: string, post: any }> {
        return this.http.get<{ message: string, post: any }>(`http://localhost:3000/api/posts/${id}`);
    }

    addPost(title: string, content: string, image: File): void {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);

        this.http.post<{ message: string, post: any }>('http://localhost:3000/api/posts', postData)
            .pipe(map(data => ({
                title: data.post.title,
                content: data.post.content,
                id: data.post._id,
                imagePath: data.post.imagePath
            })))
            .subscribe(() => this.router.navigate(['/']));
    }

    updatePost(id: string, title: string, content: string, image: File | string): void {
        let postData: Post | FormData;
        if (typeof(image) === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        } else {
            postData = { id, title, content, imagePath: image };
        }

        this.http.put<{ message: string, post: Post }>(`http://localhost:3000/api/posts/${id}`, postData)
            .subscribe(() => this.router.navigate(['/']));
    }

    deletePost(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`http://localhost:3000/api/posts/${id}`);
    }
}
