import { DatePipe, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, combineLatest, Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ExportService } from '../services/export.service';
import { map, filter, switchMap, first } from 'rxjs/operators';

import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ConditionalExpr } from '@angular/compiler';
import { LoadService } from '../loader/load.service';
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

declare var jQuery: any;
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class SearchComponent implements OnInit {
  title = 'Search';
  showSpinner =false;

  accessEmail;

  toggleDataRange: boolean = false;

  togglenorm: boolean = true;

  dataSource: MatTableDataSource<any>;

  filterForm = new FormGroup({
    fromDate: new FormControl(),
    toDate: new FormControl(),
  });
  // spinnerService: any;
  // cdRef: any;

  get fromDate() {
    return this.filterForm.get('fromDate').value;
  }
  get toDate() {
    return this.filterForm.get('toDate').value;
  }

  displayedColumns = [
    'barcodeno',
    'docType',
    'lanno',
    'inwardDate',
    'location',
    'remarksInward',
    'outDate',
    'requestedBy',
    'retrievalType',
    'subRetrivalType',
    'approvalType',
    'remarkOutward',
  ];

  getIDatas;

  getAlls;

  //Delete Log
  inwardLog = new FormGroup({
    inwardDate: new FormControl(''),
    location: new FormControl(''),
    remarksInward: new FormControl(''),
    type: new FormControl(''),
  });

  outwardLog = new FormGroup({
    approvalType: new FormControl(''),
    fileurl: new FormControl(''),
    outDate: new FormControl(''),
    remarkOutward: new FormControl(''),
    requestedBy: new FormControl(''),
    retrievalType: new FormControl(''),
    subRetrivalType: new FormControl(''),
    type: new FormControl(''),
  });

  @ViewChild('userTable') userTable: ElementRef;
  @ViewChild('matTableExporter') exporter: ElementRef;
  @ViewChild('firstDialog') firstDialog: TemplateRef<any>;

  test = [];
  details;

  updateLogbtn: boolean = true;

  //For Log Edit
  barcodeno;
  lanno;
  docType;
  @ViewChild('editinwardDate') editinwardDate: ElementRef;
  @ViewChild('editlocation') editlocation: ElementRef;
  @ViewChild('editremarksInward') editremarksInward: ElementRef;
  @ViewChild('editoutDate') editoutDate: ElementRef;
  @ViewChild('editrequestedBy') editrequestedBy: ElementRef;
  @ViewChild('editretrievalType') editretrievalType: ElementRef;
  @ViewChild('editapprovalType') editapprovalType: ElementRef;
  @ViewChild('editremarkOutward') editremarkOutward: ElementRef;

  constructor(
    private afs: AngularFirestore,
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    private exportService: ExportService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private location: Location,
    private spinnerService:LoadService,
    private cdRef:ChangeDetectorRef
  ) {};

  ngOnInit(): void {
    // this.init();
    (function ($) { 
      $(document).ready(function () {
        console.log('Hello from jQuery!');
        $('#yInput').on('keyup', function () {
          var value = $(this).val().toLowerCase();
          $('#myTable tbody tr').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
          });
        });
        // $("#range").click(function () {
        //   console.log('FROM DATE FILTER');
        //   var min = $('#min').val();
        //   var max = $('#max').val();
        //   var $rowsNo = $('#myTable tbody tr').filter(function () {
        //     return $.trim($(this).find('td').eq(2).text()) < min && $.trim($(this).find('td').eq(2).text()) > max
        //   }).toggle();
        // });
      });
    })(jQuery);

    this.accessEmail = sessionStorage.getItem('email');

    this.api.getFileStatus().subscribe((res) => {
      this.getAlls = res;
      // console.log("getall  ",this.getAlls[13].payload?.doc)
    });
    this.afs
      .collection('scanned', (ref) => ref.orderBy('latestAt', 'desc'))
      .valueChanges()
      .subscribe((data) => {
        this.dataSource = new MatTableDataSource(data);
        //console.log(this.dataSource);
        // console.log(this.dataSource.data.forEach(data => {
        //   console.log(data.log);
        //   for (let i = 0; i < data.log.length; i++) {
        //     console.log("AFS COUNT: " + i);
        //     console.log("FILTER OUTWARD DATE: " + data.log[i].outDate);
        //   }
        // }))
        this.dataSource.filterPredicate = (data, filter) => {
          if (this.fromDate && this.toDate) {
            let i;
            for (i = 0; i < data.log.length; i++) {
              i = i;
            }
            if (data.log[i - 1].inwardDate) {
              return (
                data.log[i - 1].inwardDate >= this.fromDate &&
                data.log[i - 1].inwardDate <= this.toDate
              );
            } else {
              return (
                data.log[i - 1].outDate >= this.fromDate &&
                data.log[i - 1].outDate <= this.toDate
              );
            }
            // for (let j = 0; j < data.log.length; j++) {
            //   //return data.created >= this.fromDate && data.created <= this.toDate;
            //   return data.log[j].inwardDate >= this.fromDate && data.log[j].inwardDate <= this.toDate;
            // }
          }
          return true;
        };
      });
  }

  // init(){
  //   this.spinnerService.getSpinnerObserver().subscribe((status) => {
  //     this.showSpinner = (status === 'start');
  //     this.cdRef.detectChanges();
  //   });
  // }
  downloadUrl;

  onFileChanged = async (event) => {
    this.api.onFileChanged(event);
    await this.api.apiData$.subscribe((url) => (this.downloadUrl = url));
    console.log(this.downloadUrl);
  };

  toggleDate() {
    this.toggleDataRange = true;
    this.togglenorm = false;
  
  }

   toggleNormal() {
    this.togglenorm = true;
    this.toggleDataRange = false;
    console.log(this.togglenorm);
  }

  // ngAfterViewInit() {
  //   this.afs.collection('scanned').valueChanges().subscribe(data => {
  //     this.dataSource = new MatTableDataSource(data);
  //   })
  // }

  applyFilter() {
    this.dataSource.filter = '' + Math.random();
  }

  // data;





getPdf;
  pdfData(id) {
    // this.api.getmyStatus(id).subscribe((res)=>{
      // for(let i=0;i<res.payload.data()['log'].length; i++){
      //   if(res.payload.data()['log'][i]['type']==='outward'&&res.payload.data()['log'][i]['fileurl']!==null){
      this.getPdf=id; //res.payload.data()['log'][i]['fileurl'];
      console.log("pda fdsaf ",this.getPdf)
        // var file = new Blob([this.getPdf.blob()], {type: 'application/pdf'});
        // var fileURL = window.URL.createObjectURL(this.getPdf);
        window.open(this.getPdf);
      }
    // }
    // })
  // }

pdfStatus:boolean=false;

  loadData(id, lanno, docType) {
    this.barcodeno = id;
    this.lanno = lanno;
    this.docType = docType;
    // this.api.history().subscribe((his)=>{
    //   this.data.push(Array.of(his));
    //   console.log("hiafdaf   ",this.data);
    // })
    this.api.getmyStatus(id).subscribe((res) => {
  
      this.getIDatas = Array.of(res);
      for (let i = 0; i < res.payload.data()['log'].length; i++) {
        console.log('IDATAS: ' + res.payload.data()['log'][i]['inwardDate']);
      }
      // this.data=[]
      this.test = [];
      for (let i = 0; i < res.payload.data()['log'].length; i++) {
          //  if(i>=res.payload.data()['log'].length-1){
        this.details = {
          no: i,
          inwardDate: res.payload.data()['log'][i]['inwardDate'],
          location: res.payload.data()['log'][i]['location'],
          remarksInward: res.payload?.data()['log'][i]['remarksInward'],
          type: res.payload.data()['log'][i]['type'],
          outDate: res.payload.data()['log'][i]['outDate'],
          requestedBy: res.payload.data()['log'][i]['requestedBy'],
          retrievalType: res.payload.data()['log'][i]['retrievalType'],
          subRetrivalType: res.payload.data()['log'][i]['subRetrivalType'],
          approvalType: res.payload.data()['log'][i]['approvalType'],
          remarkOutward: res.payload.data()['log'][i]['remarkOutward'],
          fileurl: res.payload.data()['log'][i]['fileurl'],
        };
        console.log("details  ",this.details);
        // this.data.push(this.details);
        this.test.push(this.details);
          
        // if(res.payload.data()['log'][i]['type']==='outward' && res.payload.data()['log'][i]['fileurl']!==('undefined'||'null'))
        //   {
        //     this.pdfStatus=true;
        //     // return;
        //   }
    }
      
    });
    // console.log("hold up ",this.data);
  }

  changeDesc(
    index,
    inwardDate,
    location,
    remarksInward,
    outDate,
    requestedBy,
    retrievalType,
    approvalType,
    remarkOutward
  ) {
    // console.log("gadvb  ",index);
    for (var i in this.test) {
      if (this.test[i].no == index) {
        this.test[i].inwardDate = inwardDate;
        this.test[i].location = location;
        this.test[i].remarksInward = remarksInward;
        this.test[i].outDate = outDate;
        this.test[i].requestedBy = requestedBy;
        this.test[i].retrievalType = retrievalType;
        this.test[i].approvalType = approvalType;
        this.test[i].remarkOutward = remarkOutward;
        break; //Stop this loop, we found it!
      }
    }
  }

  reload() {
    //location.reload();
    this.location.back();
    sessionStorage.setItem('gotosearch', 'true');
  }

  barcode: FormGroup;

  indexUpdateatMsg;

  editLogIndexValue;
  editLogType;
  editLogInwardDate;
  editLogLocation;
  editLogInwardRemarks;
  editLogOutwardDate;
  editLogRequestedBy;
  editLogRetreivalType;
  editLogSubRetreivalType;
  editLogApprovalType;
  editLogOutwardRemarks;
  editLogToggleType;

  editLogModal(index, type) {
    this.editLogIndexValue = index;
    if (type === 'Inward') {
      this.editLogToggleType = true;
      this.editLogType = 'Inward';
      this.editLogInwardDate = this.test[index].inwardDate;
      this.editLogLocation = this.test[index].location;
      this.editLogInwardRemarks = this.test[index].remarksInward;
    }
    if (type === 'Reinward') {
      this.editLogToggleType = true;
      this.editLogType = 'Reinward';
      this.editLogInwardDate = this.test[index].inwardDate;
      this.editLogLocation = this.test[index].location;
      this.editLogInwardRemarks = this.test[index].remarksInward;
    }
    if (type === 'outward') {
      this.editLogToggleType = false;
      this.editLogType = 'outward';
      this.editLogOutwardDate = this.test[index].outDate;
      this.editLogRequestedBy = this.test[index].requestedBy;
      this.editLogRetreivalType = this.test[index].retrievalType;
      this.editLogSubRetreivalType = this.test[index].subRetrivalType;
      this.editLogApprovalType = this.test[index].approvalType;
      this.editLogOutwardRemarks = this.test[index].remarkOutward;
    }
  }

  permInwardLog = new FormGroup({
    inwardDate: new FormControl(''),
    location: new FormControl(''),
    remarksInward: new FormControl(''),
    type: new FormControl(''),
  });

  permOutwardLog = new FormGroup({
    approvalType: new FormControl(''),
    fileurl: new FormControl(''),
    outDate: new FormControl(''),
    remarkOutward: new FormControl(''),
    requestedBy: new FormControl(''),
    retrievalType: new FormControl(''),
    subRetrivalType: new FormControl(''),
    type: new FormControl(''),
  });

  reset() {
    //location.reload();
    (<HTMLInputElement>document.getElementById('closeEditModal')).click();
    (<HTMLInputElement>document.getElementById('closeModal')).click();
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
    this.api.uploadProgress = new Observable<0>();
    this.progress.nativeElement.style.width = '0%';
    this.downloadUrl = null;
  }

  @ViewChild('progress') progress: ElementRef;

  // permission = [];
  editIndexPermission(index, type) {
    let form;
    if (type === 'Inward') {
      this.permInwardLog.value.inwardDate = (<HTMLInputElement>(
        document.getElementById('editinwardDate')
      )).value;
      this.permInwardLog.value.location = (<HTMLInputElement>(
        document.getElementById('editlocation')
      )).value;
      this.permInwardLog.value.remarksInward = (<HTMLInputElement>(
        document.getElementById('editremarksInward')
      )).value;
      this.permInwardLog.value.type = 'Inward';
      form = new FormGroup({
        log: this.permInwardLog,
      });
    }
    if (type === 'Reinward') {
      this.permInwardLog.value.inwardDate = (<HTMLInputElement>(
        document.getElementById('editinwardDate')
      )).value;
      this.permInwardLog.value.location = (<HTMLInputElement>(
        document.getElementById('editlocation')
      )).value;
      this.permInwardLog.value.remarksInward = (<HTMLInputElement>(
        document.getElementById('editremarksInward')
      )).value;
      this.permInwardLog.value.type = 'Reinward';
      form = new FormGroup({
        log: this.permInwardLog,
      });
    }
    if (type === 'outward') {
      // debugger;
      this.permOutwardLog.value.outDate = (<HTMLInputElement>(
        document.getElementById('editoutDate')
      )).value;
      this.permOutwardLog.value.requestedBy = (<HTMLInputElement>(
        document.getElementById('editrequestedBy')
      )).value;
      this.permOutwardLog.value.retrievalType = (<HTMLInputElement>(
        document.getElementById('editretrievalType')
      )).value;
      this.permOutwardLog.value.subRetrivalType = (<HTMLInputElement>(
        document.getElementById('editsubretrievalType')
      )).value;
      this.permOutwardLog.value.approvalType = (<HTMLInputElement>(
        document.getElementById('editapprovalType')
      )).value;
      this.permOutwardLog.value.remarkOutward = (<HTMLInputElement>(
        document.getElementById('editremarkOutward')
      )).value;
      this.permOutwardLog.value.type = 'outward';
      if (this.downloadUrl) {
        this.permOutwardLog.value.fileurl = this.downloadUrl;
      }
      if (!this.downloadUrl) {
        this.permOutwardLog.value.fileurl = this.test[index].fileurl;
      }

      form = new FormGroup({
        log: this.permOutwardLog,
      });
    }
    this.api.permissionEdit(
      index,
      form.value,
      this.barcodeno,
      this.accessEmail
    );
    this.reset();
  }

  editIndex(index, type) {
    this.updateLogbtn = false;
    if (type === 'Inward') {
      //var result = document.getElementsByClassName("editinwardDate" + index);
      console.log(
        (<HTMLInputElement>document.getElementById('editinwardDate')).value
      );
      console.log(this.test);
      //Find index of specific object using findIndex method.
      let objIndex = this.test.findIndex((obj) => obj.no == index);

      //Log object to Console.
      console.log('Before update: ', this.test[objIndex]);

      //Update object's name property.
      // this.test[objIndex].inwardDate = (<HTMLInputElement>document.getElementById("editinwardDate" + index)).value;
      // this.test[objIndex].location = (<HTMLInputElement>document.getElementById("editlocation" + index)).value;
      // this.test[objIndex].remarksInward = (<HTMLInputElement>document.getElementById("editremarksInward" + index)).value;

      this.test[objIndex].inwardDate = (<HTMLInputElement>(
        document.getElementById('editinwardDate')
      )).value;
      this.test[objIndex].location = (<HTMLInputElement>(
        document.getElementById('editlocation')
      )).value;
      this.test[objIndex].remarksInward = (<HTMLInputElement>(
        document.getElementById('editremarksInward')
      )).value;
      //Log object to console again.
      console.log('After update: ', this.test[objIndex]);

      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.barcodeno),
        lanno: new FormControl(this.lanno),
        docType: new FormControl(this.docType),
        log: this.formBuilder.group({
          inwardDate: new FormControl(this.test[0].inwardDate),
          location: new FormControl(this.test[0].location),
          remarksInward: new FormControl(this.test[0].remarksInward),
          type: 'Inward',//new FormControl(this.test[0].type)
        }),
      });
      this.api.deleteBarcodeData(this.barcodeno, this.accessEmail);
      // this.editIndexPermission(this.editLogIndexValue,this.editLogType);
      console.log(this.test);
      console.log(this.barcode.value);
      this.api
        .addToDb(this.barcode.value, this.barcodeno)
        .then((res) => {
          for (let i = 1; i < this.test.length; i++) {
            if (this.test[i].type === 'Inward') {
              this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.barcode),
                lanno: new FormControl(this.lanno),
                docType: new FormControl(this.docType),
                log: this.formBuilder.group({
                  inwardDate: new FormControl(this.test[i].inwardDate),
                  location: new FormControl(this.test[i].location),
                  remarksInward: new FormControl(this.test[i].remarksInward),
                  type: 'Inward',
                }),
              });
            }
            if (this.test[i].type === 'Reinward') {
              this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.barcode),
                lanno: new FormControl(this.lanno),
                docType: new FormControl(this.docType),
                log: this.formBuilder.group({
                  inwardDate: new FormControl(this.test[i].inwardDate),
                  location: new FormControl(this.test[i].location),
                  remarksInward: new FormControl(this.test[i].remarksInward),
                  type: 'Reinward',
                }),
              });
            }
            if (this.test[i].type === 'outward') {
              this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.barcode),
                lanno: new FormControl(this.lanno),
                docType: new FormControl(this.docType),
                log: this.formBuilder.group({
                  approvalType: new FormControl(this.test[i].approvalType),
                  outDate: new FormControl(this.test[i].outDate),
                  remarkOutward: new FormControl(this.test[i].remarkOutward),
                  requestedBy: new FormControl(this.test[i].requestedBy),
                  retrievalType: new FormControl(this.test[i].retrievalType),
                  subRetrivalType: new FormControl(
                    this.test[i].subRetrivalType
                  ),
                  type: 'outward',
                }),
              });
            }
            this.api
              .upDate(this.barcode.value, this.barcodeno)
              .then((res) => {
                console.log('Successfully Update Logs');
              })
              .catch((err) => {
                console.log('Update Error: ' + err);
              });
          }
          (this.indexUpdateatMsg = 'Updated at: '), index++;
          // (function ($) {
          //   $('#searchModal').modal('hide');
          //   $('#editLogModal').modal('hide');
          // })(jQuery);
          this.reload();
        })
        .catch((err) => {
          console.log('Error is: ' + err);
        });
      // //this.uploadIn;
      // (<HTMLInputElement>document.getElementById("closeModal")).click();
    }
    if (type === 'Reinward') {
      //var result = document.getElementsByClassName("editinwardDate" + index);
      console.log(
        (<HTMLInputElement>document.getElementById('editinwardDate')).value
      );

      //Find index of specific object using findIndex method.
      let objIndex = this.test.findIndex((obj) => obj.no == index);

      //Log object to Console.
      console.log('Before update: ', this.test[objIndex]);

      //Update object's name property.
      // this.test[objIndex].inwardDate = (<HTMLInputElement>document.getElementById("editinwardDate" + index)).value;
      // this.test[objIndex].location = (<HTMLInputElement>document.getElementById("editlocation" + index)).value;
      // this.test[objIndex].remarksInward = (<HTMLInputElement>document.getElementById("editremarksInward" + index)).value;

      this.test[objIndex].inwardDate = (<HTMLInputElement>(
        document.getElementById('editinwardDate')
      )).value;
      this.test[objIndex].location = (<HTMLInputElement>(
        document.getElementById('editlocation')
      )).value;
      this.test[objIndex].remarksInward = (<HTMLInputElement>(
        document.getElementById('editremarksInward')
      )).value;
      //Log object to console again.
      console.log('After update: ', this.test[objIndex]);

      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.barcodeno),
        lanno: new FormControl(this.lanno),
        docType: new FormControl(this.docType),
        log: this.formBuilder.group({
          inwardDate: new FormControl(this.test[0].inwardDate),
          location: new FormControl(this.test[0].location),
          remarksInward: new FormControl(this.test[0].remarksInward),
          type: 'Inward',
        }),
      });
      this.api.deleteBarcodeData(this.barcodeno, this.accessEmail);
      // this.editIndexPermission(this.editLogIndexValue,this.editLogType);

      console.log(this.test);
      console.log(this.barcode.value);
      this.api
        .addToDb(this.barcode.value, this.barcodeno)
        .then((res) => {
          for (let i = 1; i < this.test.length; i++) {
            if (this.test[i].type === 'Reinward') {
              this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.barcode),
                lanno: new FormControl(this.lanno),
                docType: new FormControl(this.docType),
                log: this.formBuilder.group({
                  inwardDate: new FormControl(this.test[i].inwardDate),
                  location: new FormControl(this.test[i].location),
                  remarksInward: new FormControl(this.test[i].remarksInward),
                  type: 'Reinward',//
                }),
              });
            }
            if (this.test[i].type === 'outward') {
              this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.barcode),
                lanno: new FormControl(this.lanno),
                docType: new FormControl(this.docType),
                log: this.formBuilder.group({
                  approvalType: new FormControl(this.test[i].approvalType),
                  outDate: new FormControl(this.test[i].outDate),
                  remarkOutward: new FormControl(this.test[i].remarkOutward),
                  requestedBy: new FormControl(this.test[i].requestedBy),
                  retrievalType: new FormControl(this.test[i].retrievalType),
                  subRetrivalType: new FormControl(
                    this.test[i].subRetrivalType
                  ),
                  type: 'outward',
                }),
              });
            }
            this.api
              .upDate(this.barcode.value, this.barcodeno)
              .then((res) => {
                console.log('Successfully Update Logs');
              })
              .catch((err) => {
                console.log('Update Error: ' + err);
              });
          }
          (this.indexUpdateatMsg = 'Updated at: '), index++;
          // (function ($) {
          //   $('#searchModal').modal('hide');
          //   $('#editLogModal').modal('hide');
          // })(jQuery);
          this.reload();
        })
        .catch((err) => {
          console.log('Error is: ' + err);
        });
      // //this.uploadIn;
      // (<HTMLInputElement>document.getElementById("closeModal")).click();
    }
    if (type === 'outward') {
      console.log(
        (<HTMLInputElement>document.getElementById('editoutDate')).value
      );

      //Find index of specific object using findIndex method.
      let objIndex = this.test.findIndex((obj) => obj.no == index);

      //Log object to Console.
      console.log('Before update: ', this.test[objIndex]);

      //Update object's name property.
      this.test[objIndex].outDate = (<HTMLInputElement>(
        document.getElementById('editoutDate')
      )).value;
      this.test[objIndex].requestedBy = (<HTMLInputElement>(
        document.getElementById('editrequestedBy')
      )).value;
      this.test[objIndex].retrievalType = (<HTMLInputElement>(
        document.getElementById('editretrievalType')
      )).value;
      this.test[objIndex].subRetrivalType = (<HTMLInputElement>(
        document.getElementById('editsubretrievalType')
      )).value;
      this.test[objIndex].approvalType = (<HTMLInputElement>(
        document.getElementById('editapprovalType')
      )).value;
      this.test[objIndex].remarkOutward = (<HTMLInputElement>(
        document.getElementById('editremarkOutward')
      )).value;

      //var retrieval = (<HTMLInputElement>document.getElementById("editretrievalType")).value;
      // var ret_value;
      // if ((<HTMLInputElement>document.getElementById("r1")).checked) {
      //   ret_value = (<HTMLInputElement>document.getElementById("r1")).value;
      // } else if ((<HTMLInputElement>document.getElementById("r2")).checked) {
      //   ret_value = (<HTMLInputElement>document.getElementById("r1")).value;
      // }

      //Log object to console again.
      console.log('After update: ', this.test[objIndex]);

      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.barcodeno),
        lanno: new FormControl(this.lanno),
        docType: new FormControl(this.docType),
        log: this.formBuilder.group({
          inwardDate: new FormControl(this.test[0].inwardDate),
          location: new FormControl(this.test[0].location),
          remarksInward: new FormControl(this.test[0].remarksInward),
          type: 'Inward',
        }),
      });
      // this.editIndexPermission(this.editLogIndexValue,this.editLogType);

      this.api.deleteBarcodeData(this.barcodeno, this.accessEmail);
      console.log(this.test);
      console.log(this.barcode.value);
      this.api
        .addToDb(this.barcode.value, this.barcodeno)
        .then((res) => {
          for (let i = 1; i < this.test.length; i++) {
            if (this.test[i].type === 'Inward') {
              this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.barcode),
                lanno: new FormControl(this.lanno),
                docType: new FormControl(this.docType),
                log: this.formBuilder.group({
                  inwardDate: new FormControl(this.test[i].inwardDate),
                  location: new FormControl(this.test[i].location),
                  remarksInward: new FormControl(this.test[i].remarksInward),
                  type: 'Inward',
                }),
              });
            }
            if (this.test[i].type === 'Reinward') {
              this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.barcode),
                lanno: new FormControl(this.lanno),
                docType: new FormControl(this.docType),
                log: this.formBuilder.group({
                  inwardDate: new FormControl(this.test[i].inwardDate),
                  location: new FormControl(this.test[i].location),
                  remarksInward: new FormControl(this.test[i].remarksInward),
                  type: 'Reinward',
                }),
              });
            }
            if (this.test[i].type === 'outward') {
              this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.barcode),
                lanno: new FormControl(this.lanno),
                docType: new FormControl(this.docType),
                log: this.formBuilder.group({
                  approvalType: new FormControl(this.test[i].approvalType),
                  outDate: new FormControl(this.test[i].outDate),
                  remarkOutward: new FormControl(this.test[i].remarkOutward),
                  requestedBy: new FormControl(this.test[i].requestedBy),
                  retrievalType: new FormControl(this.test[i].retrievalType),
                  subRetrivalType: new FormControl(
                    this.test[i].subRetrivalType
                  ),
                  type: 'outward',
                }),
              });
            }
            this.api
              .upDate(this.barcode.value, this.barcodeno)
              .then((res) => {
                console.log('Successfully Update Logs');
              })
              .catch((err) => {
                console.log('Update Error: ' + err);
              });
          }
          this.indexUpdateatMsg = 'Updated at: ' + index;
          (<HTMLInputElement>document.getElementById('closeEditModal')).click();
          (<HTMLInputElement>document.getElementById('closeModal')).click();
          this.reload();
        })
        .catch((err) => {
          console.log('Error is: ' + err);
        });
      // //this.uploadIn;
    }
  }

  uploadIn = async (_) => {
    console.log('Start');
    for (let i = 1; i < this.test.length; i++) {
      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.barcode),
        lanno: new FormControl(this.lanno),
        docType: new FormControl(this.docType),
        log: this.formBuilder.group({
          inwardDate: new FormControl(this.test[i].inwardDate),
          location: new FormControl(this.test[i].location),
          remarksInward: new FormControl(this.test[i].remarksInward),
          type: 'Inward',
        }),
      });
      await this.api
        .upDate(this.barcode.value, this.barcodeno)
        .then((res) => {
          console.log('Successfully Update Logs');
        })
        .catch((err) => {
          console.log('Update Error: ' + err);
        });
    }
    console.log('End');
  };

  exportElmToExcel(): void {
    this.exportService.exportTableElmToExcel(this.userTable, 'user_data');
  }

  exporterXml(){
    // this.exportService.exportToCsv(this.exporter,)
    // (<HTMLInputElement>document.getElementById('export')).setAttribute=this.exporter.exportTable('csv');

    console.log("dasfj ",this.exporter.nativeElement);
    this.exporter.nativeElement.subscribe((res)=>{
                 console.log("respod table ",res)
    })
  }

  //Delete Log
  deleteLog(index: number, type, id) {

    if (window.confirm('Really want to delete?')) {
      //console.log("TYPE IS: " + type);
      //console.log("INDEX VALUE IS: " + index)
      if (type === 'Inward' || type === 'Reinward') {
        this.api
          .getmyStatus(id)
          .pipe(first())
          .subscribe((res) => {
            this.inwardLog.value.inwardDate =
              res.payload.data()['log'][index]['inwardDate'];
            this.inwardLog.value.location =
              res.payload.data()['log'][index]['location'];
            this.inwardLog.value.remarksInward =
              res.payload.data()['log'][index]['remarksInward'];
            this.inwardLog.value.type =
              res.payload.data()['log'][index]['type'];
            let form = new FormGroup({
              log: this.inwardLog,
            });
            console.log("delete log ",form.value);
            this.api.deleteLog(form.value, id, this.accessEmail);
          });
      }
      if (type === 'outward') {
        this.api
          .getmyStatus(id)
          .pipe(first())
          .subscribe((res) => {
            this.outwardLog.value.approvalType =
              res.payload.data()['log'][index]['approvalType'];
            this.outwardLog.value.fileurl =
              res.payload.data()['log'][index]['fileurl'];
            this.outwardLog.value.outDate =
              res.payload.data()['log'][index]['outDate'];
            this.outwardLog.value.remarkOutward =
              res.payload.data()['log'][index]['remarkOutward'];
            this.outwardLog.value.requestedBy =
              res.payload.data()['log'][index]['requestedBy'];
            this.outwardLog.value.retrievalType =
              res.payload.data()['log'][index]['retrievalType'];
            this.outwardLog.value.subRetrivalType =
              res.payload.data()['log'][index]['subRetrivalType'];
            this.outwardLog.value.type =
              res.payload.data()['log'][index]['type'];
            console.log(res.payload.data()['log'][index]['approvalType']);
            let form = new FormGroup({
              log: this.outwardLog,
            });
            console.log("deletelof formfaj",form.value);
            this.api.deleteLog(form.value, id, this.accessEmail);
          });
      }
    }
  }

  //Delete Barcode Data By ID
  deleteData(id) {
    if (window.confirm('Really want to delete?')) {
      this.api.deleteBarcodeData(id, this.accessEmail);
    }
  }

  back() {
    sessionStorage.setItem('gotosearch', 'false');
    this.router.navigate(['menu']);
  }
}
