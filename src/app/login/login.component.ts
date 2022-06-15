import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isLogged;
  checkem;
  checkps;
mail;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern("^[A-Z a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  document: any;

  constructor(public api: ApiService, private router: Router,@Inject(DOCUMENT) private documents: Document) { }

  ngOnInit(): void {
    this.isLogged = sessionStorage.getItem("isLogged");
    this.api.isLogin=sessionStorage.getItem("isLogged");
    if (this.isLogged === 'true') {
      this.router.navigate(['menu']);
    }
    // onReload(){
      
    //  }
  }

  onReload(){
    this.documents.location.reload();
  }
  onSubmit() {
    /* this.api.getLoginInfo().subscribe(res => {
       for (let i = 0; i < Object.keys(res).length; i++) {
         this.checkem = res[i].payload.doc.data()['email'];
         this.checkps = res[i].payload.doc.data()['password'];
         if (this.loginForm.value.email === this.checkem && this.loginForm.value.password === this.checkps) {
           alert("Logged In Successfully");
           this.router.navigate(['menu']);
           localStorage.setItem("isLogged", "true")
           localStorage.setItem("email", this.checkem);
         } else {
           console.log("Wrong Credentials");
           alert("Wrong Credentials!");
         }
       }
     }); */

    this.api.getemailpass(this.loginForm.value.email, this.loginForm.value.password)
      .pipe(take(1)).subscribe(res => {
        // console.log("responser",res);
        if (!res.empty) {
          sessionStorage.setItem("isLogged", "true");
          sessionStorage.setItem("email", res.docs[0].data()['email']);
            this.mail=  res.docs[0].data()['email'];
            
              this.api.Email=this.mail
            
          this.router.navigate(['menu']);
        } else {
          console.log("Wrong Credentials");
          alert("Wrong Credentials!");
        }
      });


      

  }


}
