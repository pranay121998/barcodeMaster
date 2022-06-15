import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
  Inject,
} from '@angular/core';
import { formatDate ,DOCUMENT} from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ExportService } from '../services/export.service';
import { Subject, Observable, combineLatest, of } from 'rxjs';
// declare const changeSection: any;
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
   title='Single/Bulk Entry';

  isInOrOut;

  barcode: FormGroup;
  log: FormArray;
  barcodeno = new FormControl('', Validators.required);
  lanno = new FormControl('', Validators.required);
  docType = new FormControl('', Validators.required);
  inwardDate = new FormControl('', Validators.required);
  location = new FormControl('', Validators.required);
  remarksInward = new FormControl('');
  approvalType = new FormControl('', Validators.required);
  outDate = new FormControl('', Validators.required);
  remarkOutward = new FormControl('', Validators.required);
  requestedBy = new FormControl('', Validators.required);
  retrievalType = new FormControl('', Validators.required);
  subRetrivalType = new FormControl('', Validators.required);
  filepdf = new FormControl('', Validators.required);

  ngLan;
  ngDoc;
  ngInDate;
  ngLoc;
  ngReIn;
  ngApType;
  ngOutDate;
  ngReOut;
  ngReqBy;
  ngRetType;
  ngSubRetType;
  getExistence;
  setIn = true;
  setOut = true;
  myExistence = true;

  testExi;

  getAlls;

  checkvalid: boolean;

  //search stuff
  searchterm: string;
  startAt = new Subject();
  endAt = new Subject();
  clubs;
  startobs = this.startAt.asObservable();
  endobs = this.endAt.asObservable();

  //@ViewChild('userTable') userTable: ElementRef;
  @ViewChild('barcodeFocus') barcodeFocus: ElementRef;

  today;

  getIDatas;

  searchOn: boolean = false;

  constructor(
    private render: Renderer2,
    private router: Router,
    private formBuilder: FormBuilder,@Inject(DOCUMENT) private document: Document,
    public api: ApiService,
    public exportService: ExportService,
    private toastr:ToastrService
  ) {      
    // this.router.routeReuseStrategy.shouldReuseRoute = () => true;
    // this.document.location.reload();

  }
  

  ngOnInit() {
    // this.render.removeClass(document.body, 'mat-typography')
    
    this.barcode = this.formBuilder.group({
      barcodeno: this.barcodeno,
      lanno: this.lanno,
      docType: this.docType,
      log: this.createLog(),
    });
    this.api.getFileStatus().subscribe((res) => {
      this.getAlls = res;
    });
    //search
    combineLatest(this.startobs, this.endobs).subscribe((value) => {
      this.api.firesearch(value[0], value[1]).subscribe((res) => {
        console.log(res);
        this.clubs = res;
      });
    });
    this.today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    //console.log(this.today);
    this.ngInDate = this.today;
    //console.log(this.ngInDate);
    // let nextWeekDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    // console.log(nextWeekDate);
  
  }
  onload(){
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.barcodeFocus.nativeElement.focus();
    }, 500);
  }

  downloadUrl;

  onFileChanged = async (event) => {
    this.api.onFileChanged(event);
    await this.api.apiData$.subscribe((url) => (this.downloadUrl = url));
    console.log(this.downloadUrl);
  };

  onClick() {
    // document.addEventListener('DOMContentLoaded', () => {
      const inward: any = document.querySelector('#inward');
      const outward: any = document.querySelector('#outward');

      document.querySelector('#linkInward').addEventListener('click', (e) => {
        e.preventDefault();
        inward.style.display = 'inherit';
        outward.style.display = 'none';
      });

      document.querySelector('#linkOutward').addEventListener('click', (e) => {
        e.preventDefault();

        outward.style.display = 'inherit';
        inward.style.display = 'none';
      });
    // });
  }

  search($event ) {
    let q = $event.target.value;
    this.startAt.next(q);
    this.endAt.next(q + '\uf8ff');
    this.searchOn = true;
  }

getPdf;
  pdfData(id) {
    // this.api.getmyStatus(id).subscribe((res)=>{
    //   for(let i=0;i<res.payload.data()['log'].length; i++){
    //     if(res.payload.data()['log'][i]['type']==='outward'){
      this.getPdf=id;
      console.log("pda  ",this.getPdf)
        // var file = new Blob([this.getPdf.blob()], {type: 'application/pdf'});
        // var fileURL = window.URL.createObjectURL(this.getPdf);
        window.open(this.getPdf);
    //   }
    // }
    // })
  }


  loadData(id) {
    this.api.getmyStatus(id).subscribe((data) => {
      this.getIDatas = Array.of(data);
      for (let i = 0; i < Object.keys(data).length; i++) {
        console.log('IDATAS: ', data.payload.data()['log'][i]['type']);
      }
    });
  }

  go() {
    this.api.getFileById(this.barcode.value.barcodeno).subscribe(res => {
        if (!res.exists) {
          console.log("Not Exist :'(");
          this.toastr.warning("Given barcode does not exits!...");
          sessionStorage.setItem('myExistence', 'false');
        }else{
          sessionStorage.setItem('myExistence', 'true');
          if (sessionStorage.getItem('myExistence') === 'false') {
            this.setIn = false;
            this.myExistence = false;
            console.log('IN ANOTHER IF STATEMENT');
            console.log(this.barcode.value.barcodeno);
      
            let char = this.barcode.value.barcodeno.charAt(0);
            this.ngLan = this.barcode.value.barcodeno;
            if (char === 'F') {
              this.ngDoc = 'File';
              this.ngLan = this.barcode.value.barcodeno.substring(1);
              this.myExistence = true;
            } else if (char === 'D') {
              this.ngDoc = 'Property Doc';
              this.ngLan = this.barcode.value.barcodeno.substring(1);
              this.myExistence = true;
            } else {
              console.log('Select From PDC and Others');
              // this.myExistence = true;
            }
          }
          this.isInOrOut = sessionStorage.setItem('inwardOrOutward', '');
      
          this.api.getFileStatus().subscribe((res) => {
            for (let i = 0; i < Object.keys(res).length; i++) {
              if (this.barcode.value.barcodeno === res[i].payload.doc.id) {
                console.log(this.setIn);
                console.log(this.setOut);
                console.log(this.myExistence);
                this.myExistence = true;
                console.log('Length is ' + res[i].payload.doc.data()['log'].length);
                this.ngLan = res[i].payload.doc.data()['lanno'];
                this.ngDoc = res[i].payload.doc.data()['docType'];
                for (let j = 0; j < res[i].payload.doc.data()['log'].length; j++) {
                  this.isInOrOut = res[i].payload.doc.data()['log'][j]['type'];
                  if (this.isInOrOut === 'pending') {
                    let char = this.barcode.value.barcodeno.charAt(0);
                    this.ngLan = this.barcode.value.barcodeno;
                    if (char === 'F') {
                      this.ngDoc = 'File';
                      this.ngLan = this.barcode.value.barcodeno.substring(1);
                      this.myExistence = true;
                    } else if (char === 'D') {
                      this.ngDoc = 'Property Doc';
                      this.ngLan = this.barcode.value.barcodeno.substring(1);
                      this.myExistence = true;
                    } else {
                      console.log('Select From PDC and Others');
                    }
                    /* this.ngInDate = "";
                     this.ngLoc = "";
                     this.ngReIn = ""; */
                    this.docType = this.ngDoc;
      
                    console.log('NGDOCTHIS: ', this.docType);
                    this.ngApType = '';
                    this.ngOutDate = this.today;
                    this.ngReOut = '';
                    this.ngReqBy = '';
                    this.ngRetType = '';
                    this.ngSubRetType = '';
                    this.setIn = false;
                    this.setOut = true;
                    sessionStorage.setItem('inwardOrOutward', 'pending');
                  }
                  if (this.isInOrOut === 'Inward'||this.isInOrOut==='') {
                    this.myExistence = true;
                    this.ngInDate = res[i].payload.doc.data()['log'][j]['inwardDate'];
                    this.ngLoc = res[i].payload.doc.data()['log'][j]['location'];
                    this.ngReIn =
                      res[i].payload.doc.data()['log'][j]['remarksInward'];
                    this.ngApType = '';
                    this.ngOutDate = this.today;
                    this.ngReOut = '';
                    this.ngReqBy = '';
                    this.ngRetType = '';
                    this.ngSubRetType = '';
                    this.setOut = false;
                    this.setIn = true;
                    sessionStorage.setItem('inwardOrOutward', 'Inward');
                  }
                  else if (this.isInOrOut === 'Reinward') {
                    this.myExistence = true;
                    this.ngInDate = res[i].payload.doc.data()['log'][j]['inwardDate'];
                    this.ngLoc = res[i].payload.doc.data()['log'][j]['location'];
                    this.ngReIn =
                      res[i].payload.doc.data()['log'][j]['remarksInward'];
                    this.ngApType = '';
                    this.ngOutDate = this.today;
                    this.ngReOut = '';
                    this.ngReqBy = '';
                    this.ngRetType = '';
                    this.ngSubRetType = '';
                    this.setOut = false;
                    this.setIn = true;
                    sessionStorage.setItem('inwardOrOutward', 'Reinward');
                  }
                   else if (this.isInOrOut === 'outward') {
                    this.ngApType =
                      res[i].payload.doc.data()['log'][j]['approvalType'];
                    this.ngOutDate = res[i].payload.doc.data()['log'][j]['outDate'];
                    this.ngReOut =
                      res[i].payload.doc.data()['log'][j]['remarkOutward'];
                    this.ngReqBy = res[i].payload.doc.data()['log'][j]['requestedBy'];
                    this.ngRetType =
                      res[i].payload.doc.data()['log'][j]['retrievalType'];
                    this.ngSubRetType =
                      res[i].payload.doc.data()['log'][j]['subRetrivalType'];
                    this.ngInDate = this.today;
                    this.ngLoc = '';
                    this.ngReIn = '';
                    this.setIn = false;
                    this.setOut = true;
                    sessionStorage.setItem('inwardOrOutward', 'outward');
                  } else {
                    console.log('Unable to fetch Status');
                  }
                  //break;
                }
                console.log(this.isInOrOut);
                // sessionStorage.setItem("myExistence", "true");
                break;
              } else {
                console.log('Unable to fetch status');
              }
            }
          });
        }
      });
    
  
  }

  reset() {
    //location.reload();
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
    this.api.uploadProgress = new Observable<0>();
  }

  reload() {
    this.barcode.reset();
    this.ngApType = '';
    this.ngOutDate = '';
    this.ngReOut = '';
    this.ngReqBy = '';
    this.ngRetType = '';
    this.ngSubRetType = '';
    this.ngInDate = '';
    this.ngLoc = '';
    this.ngReIn = '';
    this.barcodeFocus.nativeElement.focus();
    if (!this.setIn === this.setIn) {
      this.setIn = false;
    } else {
      this.setIn = true;
    }
    if (!this.setOut === this.setOut) {
      this.setOut = false;
    } else {
      this.setOut = true;
    }
    if (!this.myExistence === this.myExistence) {
      this.myExistence = false;
    } else {
      this.myExistence = true;
    }
  }

  add() {
    this.barcode = this.formBuilder.group({
      barcodeno: this.barcodeno,
      lanno: this.lanno,
      docType: this.docType,
      log: this.createLog(),
    });
    if (!this.barcode.valid) {
      //alert("Please Fill the required Fields marked with *");
      this.checkvalid = true;
    } else {
      if (sessionStorage.getItem('myExistence') === 'false') {
        this.api
          .addToDb(this.barcode.value, this.barcode.value.barcodeno)
          .then((res) => {
            this.reset();
          })
          .catch((err) => {
            alert(' Error: ' + err);
          });

        this.reset();
      } else if (sessionStorage.getItem('myExistence') === 'true') {
        this.api
          .upDate(this.barcode.value, this.barcode.value.barcodeno)
          .then((res) => {
            this.reset();
          })
          .catch((err) => {
            alert('Error: ' + err);
          });
      }
    }
  }

  createLog(): FormGroup {
    if (sessionStorage.getItem('inwardOrOutward') === 'Inward'||sessionStorage.getItem('inwardOrOutward') ==='Reinward') {
      return this.formBuilder.group({
        approvalType: this.approvalType,
        outDate: this.outDate,
        remarkOutward: this.remarkOutward,
        requestedBy: this.requestedBy,
        retrievalType: this.retrievalType,
        subRetrivalType: this.subRetrivalType,
        fileurl: this.downloadUrl,
        type: 'outward',
      });
    }
    // else if(sessionStorage.getItem('inwardOrOutward') === 'outward'){
    //   return this.formBuilder.group({
    //     inwardDate: this.inwardDate,
    //     location: this.location,
    //     remarksInward: this.remarksInward,
    //     type: 'Reinward',
    //   });
    // }
     else {
      if(sessionStorage.getItem('inwardOrOutward') === 'pending'||sessionStorage.getItem('inwardOrOutward') === ''){
          return this.formBuilder.group({
            inwardDate: this.inwardDate,
            location: this.location,
            remarksInward: this.remarksInward,
            type: 'Inward',
          });
        }else{
      return this.formBuilder.group({
        inwardDate: this.inwardDate,
        location: this.location,
        remarksInward: this.remarksInward,
        type: 'Reinward',
      });
    }
    }
  }

  download() {
    this.api.getJson();
  }

  exportElmToExcel(): void {
    // this.exportService.exportTableElmToExcel(this.userTable, 'user_data');
    // this.barcodeFocus.nativeElement.focus();
  }

  back() {
    this.router.navigate(['menu']);
    this.api.uploadProgress = new Observable<0>();
  }

  logOut() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
