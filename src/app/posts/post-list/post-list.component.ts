import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../post.service';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
    posts: Post[] = [];
    isLoading = false;
    totalPosts = 0;
    postsPerPage = 1;
    currentPage = 1;
    pageSizeOptions = [1, 2, 5, 10];
    isAuthenticated = false;
    private postsSub: Subscription;
    private authStateSubs: Subscription;

    constructor(public postService: PostsService, private authService: AuthService) {}

    ngOnInit(): void {
        this.isLoading = true;
        this.postService.getPosts(this.postsPerPage, this.currentPage);
        this.postsSub = this.postService
            .getPostUpdateListener()
            .subscribe((data: { posts: Post[], totalPosts: number }) => {
                this.isLoading = false;
                this.posts = data.posts;
                this.totalPosts = data.totalPosts;
            });
        this.isAuthenticated = this.authService.getIsAuth();
        this.authStateSubs = this.authService
            .getAuthStatusListener()
            .subscribe(isAuthenticated => this.isAuthenticated = isAuthenticated);
    }

    ngOnDestroy(): void {
        this.postsSub.unsubscribe();
        this.authStateSubs.unsubscribe();
    }

    onDelete(id: string): void {
        this.isLoading = true;
        this.postService.deletePost(id).subscribe(() => {
            this.postService.getPosts(this.postsPerPage, this.currentPage);
        });
    }

    onChangedPage(pageData: PageEvent): void {
        this.currentPage = pageData.pageIndex + 1;
        this.postsPerPage = pageData.pageSize;
        this.postService.getPosts(this.postsPerPage, this.currentPage);
    }
}
