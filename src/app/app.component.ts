import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadService } from './loader/load.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'barcode';
  // isLogged;
  constructor(private router: Router,public loading:LoadService) {}
  ngOnInit() {
  // this.isLogged=this.api.isLogin;
  // console.log("lod",this.isLogged)
  console.log("islof",this.loading.isLoading$)
    this.router.navigate(['/login'])
  }

}

