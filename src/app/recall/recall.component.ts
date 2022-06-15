import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  Injectable,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { ExportService } from '../services/export.service';
import { Papa } from 'ngx-papaparse';

@Injectable()
@Component({
  selector: 'app-recall',
  templateUrl: './recall.component.html',
  styleUrls: ['./recall.component.css'],
})
export class RecallComponent implements OnInit {
  title = 'Recall';
  recalled = [];

  recallForm: FormGroup;

  isTable = false;

  inTable = [];

  refresh = false;

  addOn = true;

  hideIn;hideOut;hideCancel;refreshBtn;
  @ViewChild('userTable') userTable: ElementRef;
  getAlls: any;
  details; //{ barcode: any; lanno: any; docType: any; inwardDate: any; location: any; remarksInward: any; outDate: any; requestedBy: any; retrievalType: any; subRetrivalType: any; approvalType: any; remarkOutward: any; type: string; status: string; info: string; typeError: boolean; exist: boolean; };
  test=[];

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private exportService: ExportService,
    private render: Renderer2,private papa: Papa,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.recallForm = this.fb.group({
      barcodes: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    console.log(this.recallForm.value.barcodes.length);

  }

  goBack() {
    this.router.navigate(['/menu']);
  }

  barcodes(): FormArray {
    return this.recallForm.get('barcodes') as FormArray;
  }

  newBarcode(): FormGroup {
    return this.fb.group({
      barcode: '',
    });
  }

  addBarcode() {
    this.barcodes().push(this.newBarcode());
  }

  removeBarcode(i: number) {
    this.barcodes().removeAt(i);
  }

  get barcodeFormControl() {
    return this.recallForm.controls;
  }


  handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      var csv = event.target.result; // Content of CSV file
      this.papa.parse(csv, {
        skipEmptyLines: true,
        header: true,
        complete: (res) => {
          this.getAlls = res;
          for (let i = 0; i < res.data.length; i++) {
            this.api.getFileById(res.data[i]['Barcode No']).subscribe((exts) => {
              if(!exts.exists){
                this.details = {
                  barcode: res.data[i]['Barcode No'],
                  // lanno: res.data[i]['Lan No'],
                  // docType: res.data[i]['Doc Type'],
                  // inwardDate: res.data[i]['Inward Date (dd-mm-yyyy)'],
                  // location: res.data[i]['Location'],
                  // remarksInward: res.data[i]['Inward Remarks'],
                  // outDate: res.data[i]['Out Date'],
                  // requestedBy: res.data[i]['Requested By'],
                  // retrievalType: res.data[i]['Retrieval Type'],
                  // subRetrivalType: res.data[i]['Sub Retrieval Type'],
                  // approvalType: res.data[i]['Approved Type'],
                  // remarkOutward: res.data[i]['Outward Remarks'],
                  // type: "Does'nt exists!",
                  // status: '',
                  // info: 'This file does not exists',
                  // typeError: false,
                  // exist: false,
                };
                this.hideCancel = true;
                this.test.push(this.details);

              }
              else{
                this.details = {
                  barcode: res.data[i]['Barcode No'],
                  // lanno: res.data[i]['Lan No'],
                  // docType: res.data[i]['Doc Type'],
                  // inwardDate: res.data[i]['Inward Date (dd-mm-yyyy)'],
                  // location: res.data[i]['Location'],
                  // remarksInward: res.data[i]['Inward Remarks'],
                  // outDate: res.data[i]['Out Date'],
                  // requestedBy: res.data[i]['Requested By'],
                  // retrievalType: res.data[i]['Retrieval Type'],
                  // subRetrivalType: res.data[i]['Sub Retrieval Type'],
                  // approvalType: res.data[i]['Approved Type'],
                  // remarkOutward: res.data[i]['Outward Remarks'],
                  // type: res.data[i]['Inward Date (dd-mm-yyyy)']
                  //   ? 'Inward'
                  //   : 'outward',
                  // status: '',
                  // info: 'No Errors For Now',
                  // typeError: false,
                  // exist: true,
                };
                console.log(
                  'jsd;fvb  ',
                  res.data[i]['Inward Date (dd-mm-yyyy)'] ? 'Inward' : 'outward'
                );
                if (res.data[i]['Inward Date (dd-mm-yyyy)'] !== '') {
                  //this.hideIn = true;
                  //this.hideOut = false;
                  this.hideCancel = true;
                } else if (res.data[i]['Inward Date (dd-mm-yyyy)'] === '') {
                  //this.hideIn = false;
                  //this.hideOut = true;
                  this.hideCancel = true;
                }
                this.test.push(this.details);
              }
            })
      
          }
          console.log(this.test);
          //this.test.push(results.data);
          console.log('Parsed: k', res.data);
        },
        error: (res, file) => {
          alert('Error Ocurred: ' + res + 'On File: ' + file);
        },
      });
    };
  }

  recall() {
    debugger;
    for (let i = 0; i < this.test.length; i++) {
      if (this.test[i].barcode !== '') {
        this.recalled.push(this.test[i].barcode);
      }
      // this.recallForm.value.barcodes.splice(0, this.recallForm.value.barcodes.length);

    }

    /* this.api.getRecall(this.recalled).pipe(take(1)).subscribe(res => {
       console.log(res[0].payload.doc.id);
     }) */

    for (let j = 0; j < this.recalled.length; j++) {
      this.api
        .getRecall(this.recalled[j])
        .pipe(take(1))
        .subscribe((res) => {
          console.log('recall ', this.recalled[j]);
          if (res.exists) {
            let length = res.data()['log'].length - 1;
            console.log('data  ', res.data()['log'].length - 1);
            console.log('data type ', res.data()['log'][length]['type']);
            let tableObj = {
              barcode: this.recalled[j],
              recall: 'Inward',
              status: res.data()['log'][length]['type'],
              isSame: false,
            };
            console.log(tableObj);
            if (
              tableObj.status === 'Inward' ||
              tableObj.status === 'Reinward'
            ) {
              tableObj.isSame = true;
            } else {
              tableObj.isSame = false;
            }

            this.inTable.push(tableObj);
            //  style.background]="
            // barcode.recall === 'Inward'||'Reinward' ? 'green' : 'red'
            // "
            console.log('MATCH');
          } else {
            let tableObj = {
              barcode: this.recalled[j],
              recall: 'Inward',
              status: 'Not Found',
            };
            this.inTable.push(tableObj);
            console.log("Didn't Match");
          }

        });
       
    }
    this.isTable = true;

    //console.log(this.inTable);

    this.refresh = true;
  }



  exportElmToExcel(): void {
    this.exportService.exportTableElmToExcel(this.userTable, 'user_data');
  }
  cancel() {
    //location.reload();
    //localStorage.setItem("gotobulk", "true");
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
    this.api.uploadProgress = new Observable<0>();
  }
}
