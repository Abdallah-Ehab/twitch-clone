import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { AuthService, IRegisterUserData, IResUsernameCheck } from '../../../../services/auth-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div class="w-full max-w-md">
        <div class="bg-card border border-border rounded-lg p-6 shadow-lg">
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-foreground">Create Account</h1>
            <p class="text-sm text-muted-foreground mt-1">Join StreamHub and start streaming</p>
          </div>

          <form class="space-y-4" [formGroup]="registerForm" (ngSubmit)="submit()">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                formControlName="username"
                class="w-full h-10 px-4 bg-secondary border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p class="text-xs text-muted-foreground mt-1">This will be your public display name</p>
              @if (registerForm.get('username')?.dirty || registerForm.get('username')?.touched) {
                @if (registerForm.get('username')?.errors?.['required']) {
                  <p class="text-xs text-destructive mt-1">Username is required</p>
                }
                @if (registerForm.get('username')?.errors?.['minlength']) {
                  <p class="text-xs text-destructive mt-1">Username must be at least 3 characters</p>
                }
                @if (registerForm.get('username')?.errors?.['maxlength']) {
                  <p class="text-xs text-destructive mt-1">Username cannot exceed 20 characters</p>
                }
                @if (registerForm.get('username')?.errors?.['userNameExists']) {
                  <p class="text-xs text-destructive mt-1">Username is already taken</p>
                }
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you&#64;example.com"
                formControlName="email"
                class="w-full h-10 px-4 bg-secondary border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              @if (registerForm.get('email')?.dirty || registerForm.get('email')?.touched) {
                @if (registerForm.get('email')?.errors?.['required']) {
                  <p class="text-xs text-destructive mt-1">Email is required</p>
                }
                @if (registerForm.get('email')?.errors?.['email']) {
                  <p class="text-xs text-destructive mt-1">Please enter a valid email address</p>
                }
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                formControlName="password"
                class="w-full h-10 px-4 bg-secondary border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              @if (registerForm.get('password')?.dirty || registerForm.get('password')?.touched) {
                @if (registerForm.get('password')?.errors?.['required']) {
                  <p class="text-xs text-destructive mt-1">Password is required</p>
                }
                @if (registerForm.get('password')?.errors?.['minlength']) {
                  <p class="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
                }
              }
            </div>

            <div>
              <div class="flex items-start gap-2">
                <input type="checkbox" id="terms" formControlName="terms" class="w-4 h-4 mt-0.5 rounded border-input bg-secondary text-primary focus:ring-primary" />
                <label for="terms" class="text-xs text-muted-foreground">
                  I agree to the <button class="text-primary hover:underline" type="button">Terms of Service</button> and
                  <button class="text-primary hover:underline" type="button">Privacy Policy</button>
                </label>
              </div>
              @if ((registerForm.get('terms')?.dirty || registerForm.get('terms')?.touched) && registerForm.get('terms')?.errors?.['required']) {
                <p class="text-xs text-destructive mt-2">You must agree to the terms and conditions</p>
              }
            </div>

            <button type="submit" [disabled]="loading || registerForm.invalid" class="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              @if (loading) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              } @else {
                Create Account
              }
            </button>
          </form>

          @if(this.error) {
            <p class="text-destructive text-sm mt-4">{{ this.error }}</p>
          }

          <p class="text-center text-sm text-muted-foreground mt-6">
            Already have an account?
            <a routerLink="/login" class="text-primary hover:underline font-medium cursor-pointer">Log in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  error: string | null = null;
  loading = false;

  registerForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)], [this.userNamevalidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, [Validators.requiredTrue]]
    }
  );

  userNamevalidator(control: FormControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }
    return timer(500).pipe(
      switchMap(() => {
        return this.authService.checkUsernameExists(control.value).pipe(
          map(res => {
            if (res.exists) {
              return { userNameExists: true };
            } else {
              return null;
            }
          }),
          catchError((err) => {
            console.error('Error checking username:', err);
            return of(null);
          })
        );
      })
    );
  }

  submit(){
      if(this.registerForm.valid){
        this.error = null;
        this.loading = true;
        this.authService.register((this.registerForm.value) as unknown as IRegisterUserData).subscribe({
          next: (res)=>{
            this.loading = false;
            this.router.navigate(['/login']);
          },
          error: (err: any)=>{
            this.loading = false;
            this.error = err.error?.error || 'An error occurred during registration';
          }
        });
      }
  }
}
