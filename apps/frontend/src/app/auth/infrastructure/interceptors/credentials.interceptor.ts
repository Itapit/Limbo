import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  private backendUrl = environment.BACKEND_BASE_URL;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.url.startsWith(this.backendUrl)) {
      // Clone the request and add the withCredentials flag
      const clonedReq = req.clone({
        withCredentials: true,
      });
      return next.handle(clonedReq);
    }

    return next.handle(req);
  }
}
