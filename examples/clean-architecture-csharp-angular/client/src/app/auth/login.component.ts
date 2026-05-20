import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  template: '<div>Login</div>',
})
export class LoginComponent {
  constructor(private auth: AuthService) {}
}
