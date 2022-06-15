import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { mainModule } from 'process';
import { take } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
checkem;
checkps;
Email; 
  constructor(private router: Router,private api:ApiService) { }

  ngOnInit(): void {
    if (sessionStorage.getItem("gotosearch") === "true") {
      this.router.navigate(['search']);
    }
    if (sessionStorage.getItem("gotoperm") === "true") {
      this.router.navigate(['permission'])
    }

    console.log(sessionStorage.getItem("email"));
    this.Email=sessionStorage.getItem("email");
    // this.subscription = this.api.getLoginInfo().subscribe(msg => this.firestore.collection('login') = msg);
    this.api.getLoginInfo().subscribe(res => {
      // this.Email=res[0].payload.doc.data()['email']
      for (let i = 0; i < Object.keys(res).length; i++) {
        this.checkem = res[i].payload.doc.data()['email'];
        // this.checkps = res[i].payload.doc.data()['password'];
        // if (this.loginForm.value.email === this.checkem && this.loginForm.value.password === this.checkps) {
        //   alert("Logged In Successfully");
        //   this.router.navigate(['menu']);
        //   sessionStorage.setItem("isLogged", "true")
        //   sessionStorage.setItem("email", this.checkem);
        // } else {
          // console.log("Wrong Credentials");
          // alert("Wrong Credentials!");
        }
      }
    ); 

   
    // this.api.getemail(this.mail).subscribe(res => {
    //     console.log("responser",res);
    //       // sessionStorage.setItem("isLogged", "true");
    //       // sessionStorage.setItem("email", res.docs[0].data()['email']);
    //         this.Email= res;
    //         // console.log(this.Email);
    //     } )
      
   
  }

  // getEmail(Email){
  //   this.Email=Email;
  //   console.log(this.Email);
  //   }

  generate() {
    this.router.navigate(['generate']);
  //   this.router.navigateByUrl('/generate', { skipLocationChange: true }).then(() => {
  //     this.router.navigate(['generate']);
  // }); 
  }

  single() {
    this.router.navigate(['dashboard']);
    // this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
    //   this.router.navigate(['dashboard']);
  // }); 
  }

  bulk() {
    this.router.navigate(['bulk']);
    // this.router.navigateByUrl('/bulk', { skipLocationChange: true }).then(() => {
    //   this.router.navigate(['bulk']);
  // }); 
  }

  search() {
    this.router.navigate(['search']);
    // this.router.navigateByUrl('/search', { skipLocationChange: true }).then(() => {
    //   this.router.navigate(['search']);
  // }); 
  }

  permission() {
    this.router.navigate(['permission']);
  //   this.router.navigateByUrl('/permission', { skipLocationChange: true }).then(() => {
  //     this.router.navigate(['permission']);
  // }); 
  }

  pending() {
    this.router.navigate(['pending']);
  //   this.router.navigateByUrl('/pending', { skipLocationChange: true }).then(() => {
  //     this.router.navigate(['pending']);
  // }); 
  }

  recall() {
    // this.router.navigate(['recall']);
    this.router.navigateByUrl('/recall', { skipLocationChange: true }).then(() => {
      this.router.navigate(['recall']);
  }); 
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

}
