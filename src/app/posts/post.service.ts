import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient) {}

    getPosts(): void {
        this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
            .pipe(map(data => {
                return data.posts.map(post => ({
                    title: post.title,
                    content: post.content,
                    id: post._id,
                }));
            }))
            .subscribe((posts: Post[]) => {
                this.posts = posts;
                this.postsUpdated.next([...this.posts]);
            });
    }

    getPostUpdateListener(): Observable<Post[]> {
        return this.postsUpdated.asObservable();
    }

    addPost(title: string, content: string): void {
        const newPost = { title, content };
        this.http.post<{ message: string, post: any }>('http://localhost:3000/api/posts', newPost)
            .pipe(map(data => ({
                title: data.post.title,
                content: data.post.content,
                id: data.post._id,
            })))
            .subscribe(post => {
                this.posts.push(post);
                this.postsUpdated.next([...this.posts]);
            });
    }

    deletePost(id: string): void {
        this.http.delete<{ message: string }>(`http://localhost:3000/api/posts/${id}`)
            .subscribe(data => {
                const updatedPosts = this.posts.filter(post => post.id !== id);
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
            });
    }
}
