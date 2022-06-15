import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {  LoadService } from './loader/load.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {

  // constructor(private spinnerService:loading) {}

  // intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  //   this.spinnerService.requestStarted()
  //   return next.handle(request).pipe(
  //     finalize(()=>{
  //       this.spinnerService.requestEnded();
  //     })
  //   );
  // }
  private totalRequests = 0;
  debugger;
  constructor(private loading: LoadService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    if (request && request.body && request.body.stopLoader) {
    } else {
      this.totalRequests++;
      this.loading.setLoading(true);
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (request && request.body && request.body.stopLoader) {
        } else {
          this.totalRequests--;
          if (this.totalRequests === 0) {
            this.loading.setLoading(false);
          }
        }
      })
    );
  }
}
// export class LoadingInterceptor implements HttpInterceptor {
//   private totalRequests = 0;
//   debugger;
//   constructor(private loadingService: LoadingService) {}

//   intercept(request: HttpRequest<any>, next: HttpHandler) {
//     if (request && request.body && request.body.stopLoader) {
//     } else {
//       this.totalRequests++;
//       this.loadingService.setLoading(true);
//     }

//     return next.handle(request).pipe(
//       finalize(() => {
//         if (request && request.body && request.body.stopLoader) {
//         } else {
//           this.totalRequests--;
//           if (this.totalRequests === 0) {
//             this.loadingService.setLoading(false);
//           }
//         }
//       })
//     );
//   }
// }

