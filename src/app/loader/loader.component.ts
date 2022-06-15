import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { LoadService } from './load.service';
import { HttpInterceptor} from '@angular/common/http';
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  showSpinner =false;

  constructor(private loading:LoadService,private cdRef:ChangeDetectorRef) { }

  ngOnInit(): void {
    // this.init();
    console.log("",this.loading)
  }


  // init(){
  //   this.spinnerService.getSpinnerObserver().subscribe((status) => {
  //     this.showSpinner = (status === 'start');
  //     this.cdRef.detectChanges();
  //   });
  // }
  @Input() display: boolean;
  
     

}
