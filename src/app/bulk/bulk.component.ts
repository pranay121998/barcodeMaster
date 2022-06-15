import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import { ApiService } from '../services/api.service';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { first } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
declare var jQuery: any;
var $j = jQuery.noConflict();
@Component({
  selector: 'app-bulk',
  templateUrl: './bulk.component.html',
  styleUrls: ['./bulk.component.css'],
})
export class BulkComponent implements OnInit {
  title: any = 'Bulk Upload';

  barcode: FormGroup;
  hideIn;
  hideOut;
  hideCancel;

  setOut = true;

  @ViewChild('focus') focus: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private papa: Papa,
    public api: ApiService,
    private router: Router,
    private db: AngularFirestore,
    private datepipe: DatePipe
  ) {}

  refreshBtn;

  getAlls;
  details;

  setIn = true;

  disableCheckIt = false;

  //CSV to JSON Conversion
  test = [];
  ConvertCSVtoJSON() {
    console.log(JSON.stringify(this.test));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focus.nativeElement.focus();
    }, 100);
  }

  downloadUrl;
  onFileChanged = async (event) => {
    this.api.onFileChanged(event);
    await this.api.apiData$.subscribe((url) => (this.downloadUrl = url));
    console.log(this.downloadUrl);
  };

  today = new Date();
  dateParts = [];
  outDateparts = [];
  ngOnInit(): void {
    this.today.setHours(0, 0, 0, 0);
    //console.log("TODAY: " + this.today)
    setTimeout(() => {
      this.focus.nativeElement.focus();
    }, 100);
    (function ($) {
      $(document).ready(function () {
        // console.log("Hello jQuery! from Bulk");
        $('#focus').focus();
      });
    })(jQuery);
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
                  lanno: res.data[i]['Lan No'],
                  docType: res.data[i]['Doc Type'],
                  inwardDate: res.data[i]['Inward Date (dd-mm-yyyy)'],
                  location: res.data[i]['Location'],
                  remarksInward: res.data[i]['Inward Remarks'],
                  outDate: res.data[i]['Out Date'],
                  requestedBy: res.data[i]['Requested By'],
                  retrievalType: res.data[i]['Retrieval Type'],
                  subRetrivalType: res.data[i]['Sub Retrieval Type'],
                  approvalType: res.data[i]['Approved Type'],
                  remarkOutward: res.data[i]['Outward Remarks'],
                  type: "Does'nt exists!",
                  status: '',
                  info: 'This file does not exists',
                  typeError: false,
                  exist: false,
                };
                this.hideCancel = true;
                this.test.push(this.details);

              }
              else{
                this.details = {
                  barcode: res.data[i]['Barcode No'],
                  lanno: res.data[i]['Lan No'],
                  docType: res.data[i]['Doc Type'],
                  inwardDate: res.data[i]['Inward Date (dd-mm-yyyy)'],
                  location: res.data[i]['Location'],
                  remarksInward: res.data[i]['Inward Remarks'],
                  outDate: res.data[i]['Out Date'],
                  requestedBy: res.data[i]['Requested By'],
                  retrievalType: res.data[i]['Retrieval Type'],
                  subRetrivalType: res.data[i]['Sub Retrieval Type'],
                  approvalType: res.data[i]['Approved Type'],
                  remarkOutward: res.data[i]['Outward Remarks'],
                  type: res.data[i]['Inward Date (dd-mm-yyyy)']
                    ? 'Inward'
                    : 'outward',
                  status: '',
                  info: 'No Errors For Now',
                  typeError: false,
                  exist: true,
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

  cancel() {
    //location.reload();
    //sessionStorage.setItem("gotobulk", "true");
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
    this.api.uploadProgress = new Observable<0>();
  }

  existence;
  stopLoop: boolean = false;
  firebasetype;
  firebasetypearr = [];

  checkIt() {
    this.api
      .getFiles()
      .pipe(first())
      .subscribe((status) => {
        // console.log('BULK: ', status[2].payload.doc.data()['log']);
        this.test.forEach((res) => {
          this.api.getFileById(res.barcode).subscribe((exts) => {
            if (!exts.exists) {
              res.info = 'The Barcode: ' + res.barcode + ' does not exits!...';
              res.status = 'Error';
              res.type="Does'nt exists!";
            } else {
              // console.log("hi from here",status[2].payload.doc.id);

              var inwarddateString, indateObject, outdateString, outdateObject;
              if (res.type === 'Inward' || res.type === 'Reinward') {
                inwarddateString = res.inwardDate; // 9 June
                this.dateParts = inwarddateString.split('-');
                indateObject = new Date(
                  +this.dateParts[2],
                  this.dateParts[1] - 1,
                  +this.dateParts[0]
                );
              } else if (res.type === 'outward') {
                outdateString = res.outDate;
                this.outDateparts = outdateString.split('-');
                outdateObject = new Date(
                  +this.outDateparts[2],
                  this.outDateparts[1] - 1,
                  +this.outDateparts[0]
                );
              }
              if (
                (res.type === 'Inward' || res.type === 'Reinward') &&
                this.today < indateObject
              ) {
                res.info =
                  'The Barcode: ' +
                  res.barcode +
                  " have future date, please change it to today's date or any past date.";
                res.status = 'Error';
              } else if (res.type === 'outward' && this.today < outdateObject) {
                res.info =
                  'The Barcode: ' +
                  res.barcode +
                  " have future date, please change it to today's date or any past date.";
                res.status = 'Error';
              } else {
                for (let i = 0; i < status.length; i++) {
                  if (res.barcode !== status[i].payload.doc.id) {
                    if (res.type === 'Inward' || res.type === 'Reinward') {
                      this.hideIn = true;
                      this.existence = false;
                      res.exist = false;
                      res.status = 'Good To Go';
                    } else if (res.type === 'outward') {
                      res.status = 'Not Found in DB';
                      res.info = 'Not Found for Outward Entry';
                    }
                  }
                }
              }
            }
          });
        });

        this.test.forEach((res) => { 
          this.api.getFileById(res.barcode).subscribe((exts) => {
            if (!exts.exists) {
              res.info = 'The Barcode: ' + res.barcode + ' does not exits!...';
              res.status = 'Error';
              res.type = "Does'nt exists!";
            } else {
              console.log('test response', res);
              for (let i = 0; i < status.length; i++) {
                // console.log("hi",status[i].payload.doc.id);
                console.log(' status ', status[i].payload.doc.get('log'));
                console.log('res  ', res);
                if (res.barcode === status[i].payload.doc.id) {
                  this.existence = true;
                  res.exist = true;
                  let length = status[i].payload.doc.data()['log'].length - 1;
                  if (
                    res.type === 'Inward' &&
                    status[i].payload.doc.data()['log'][length]['type'] ===
                      'pending'
                  ) {
                    res.status = 'Good To Go';
                    this.hideIn = true;
                  } else if (
                    res.type === 'Inward' &&
                    (status[i].payload.doc.data()['log'][length]['type'] ===
                      'Inward' ||
                      status[i].payload.doc.data()['log'][length]['type'] ===
                        'Reinward')
                  ) {
                    res.info =
                      'The Barcode: ' +
                      res.barcode +
                      ' is Already ' +
                      status[i].payload.doc.data()['log'][length]['type'] +
                      ' Please Upload New File with new Values by Clicking Cancel.\r\n' +
                      'Note: If you still Upload, the data will be replaced with same values.\r\n' +
                      'Also, make sure you upload file with new values each time OR the data will be replaced with same values.';
                    res.status = 'Failure';
                    res.typeError = true;
                  } else if (
                    (res.type === 'Inward' || res.type === 'Reinward') &&
                    status[i].payload.doc.data()['log'][length]['type'] ===
                      'outward'
                  ) {
                    let isSameFile: Boolean = true;
                    status[i].payload.doc.get('log').forEach((k) => {
                      let date = this.datepipe.transform(
                        k.inwardDate,
                        'dd-MM-yyyy'
                      );
                      console.log('k k k', k);
                      console.log('approval  ', res.approvalType);
                      console.log(
                        'k a ppprooval ',
                        k.approvalType,
                        k.requestedBy,
                        k.retrievalType,
                        k.subRetrivalType,
                        date
                      );
                      if (
                        res.inwardDate === date &&
                        res.location === k.location &&
                        res.remarksInward === k.remarksInward &&
                        res.type === ('Inward' || 'Reinward')
                      ) {
                        console.log('hi');
                        isSameFile = false;
                        return false;
                      } else {
                        return true;
                      }
                    });

                    console.log('same firle', isSameFile);
                    if (!isSameFile) {
                      res.info =
                        'The Barcode: ' +
                        res.barcode +
                        ' is Already Inward, Please Upload New File with new Values by Clicking Cancel.\r\n' +
                        'Note: If you still Upload (if Upload button appears), the data will be replaced with same values.\r\n' +
                        'Also, make sure you upload file with new values each time OR the data will be replaced with same values.';
                      res.status = 'Failure';
                      res.typeError = true;
                    } else {
                      res.status = 'Good To Go';
                      this.hideIn = true;
                      res.type = 'Reinward';
                      // this.test[i].push(res.type);
                    }
                  } else if (
                    res.type === 'outward' &&
                    status[i].payload.doc.data()['log'][length]['type'] ===
                      'outward'
                  ) {
                    res.info =
                      'The Barcode: ' +
                      res.barcode +
                      ' is Already Outward , Please Upload New File with new Values by Clicking Cancel.\r\n' +
                      'Note: If you still Upload (if Upload button appears), the data will be replaced with same values.\r\n' +
                      'Also, make sure you upload file with new values each time OR the data will be replaced with same values.';
                    res.status = 'Failure';
                    res.typeError = true;
                  } else if (
                    res.type === 'outward' &&
                    (status[i].payload.doc.data()['log'][length]['type'] ===
                      'Inward' ||
                      status[i].payload.doc.data()['log'][length]['type'] ===
                        'Reinward')
                  ) {
                    let isSameFile: Boolean = true;
                    status[i].payload.doc.get('log').forEach((k) => {
                      // let length = status[i].payload.doc.data()['log'].length-k;
                      // let date = k.outDate.split("-").reverse().join("-");
                      // isSameFile=true
                      let date = this.datepipe.transform(
                        k.outDate,
                        'dd-MM-yyyy'
                      );
                      console.log('k k k', k);
                      console.log(
                        'approval  ',
                        res.approvalType,
                        res.type,
                        k.type
                      );
                      console.log(
                        'k a ppprooval ',
                        k.approvalType,
                        k.requestedBy,
                        k.retrievalType,
                        k.subRetrivalType,
                        date
                      );
                      if (
                        res.approvalType === k.approvalType &&
                        res.requestedBy === k.requestedBy &&
                        res.retrievalType === k.retrievalType &&
                        res.subRetrivalType === k.subRetrivalType &&
                        res.outDate === date &&
                        res.type === k.type&&
                        res.remarkOutward=== k.remarkOutward
                      ) {
                        console.log('hi');
                        isSameFile = false;
                        return false;
                      } else {
                        return true;
                      }
                    });

                    console.log('same firle', isSameFile);
                    if (!isSameFile) {
                      res.info =
                        'The Barcode: ' +
                        res.barcode +
                        ' is Already Outward, Please Upload New File with new Values by Clicking Cancel.\r\n' +
                        'Note: If you still Upload (if Upload button appears), the data will be replaced with same values.\r\n' +
                        'Also, make sure you upload file with new values each time OR the data will be replaced with same values.';
                      res.status = 'Failure';
                      res.typeError = true;
                    } else {
                      res.status = 'Good To Go';
                      this.hideOut = true;
                    }
                  } else {
                    //if (res.type === "outward" && (status[i].payload.doc.data()['log'][length]['type'] === "Inward"||status[i].payload.doc.data()['log'][length]['type'] ==="Reinward")) {
                    res.status = 'Good To Go';
                    this.hideOut = true;
                  }
                }
              }
            }
          });
        });
      });
  }

  isError;
  isSuccess;

  uploadIn = async (_) => {
    this.disableCheckIt = true;
    console.log('Start');
    for (let i = 0; i < this.test.length; i++) {
      //var testIn = this.test[i].barcode + "Inward";
      console.log('yeah', this.test[i]);
      var dateString = this.test[i].inwardDate; // 9 June
      this.dateParts = dateString.split('-');
      var dateObject = new Date(
        +this.dateParts[2],
        this.dateParts[1] - 1,
        +this.dateParts[0]
      );
      var date = this.test[i].inwardDate;
      var newdate = date.split('-').reverse().join('-');
      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.test[i].barcode, Validators.required),
        lanno: new FormControl(this.test[i].lanno, Validators.required),
        docType: new FormControl(this.test[i].docType, Validators.required),
        log: this.formBuilder.group({
          inwardDate: new FormControl(newdate, Validators.required),
          location: new FormControl(this.test[i].location, Validators.required),
          remarksInward: new FormControl(this.test[i].remarksInward),
          type: new FormControl(this.test[i].type),
        }),
      });
      console.log('oye', this.barcode);
      if (!this.test[i].exist) {
        if (!this.barcode.valid) {
          this.test[i].info =
            'For Barcode: ' +
            this.barcode.value.barcodeno +
            ', Please Fill in All the fields and Add it to new CSV Inward File and Upload that new File \r\n' +
            'Note: Only Inward Remarks is not mandatory.';
          this.test[i].status = 'Error';
        } else if (this.today < dateObject) {
          this.test[i].info =
            'This Barcode: ' + this.test[i].barcode + ' have future dates.';
          this.test[i].status = 'Failure';
        } else {
          console.log('existence is: ', this.existence);
          // Get a new write batch
          var batch = this.db.firestore.batch();
          // // Set the value id of barcode
          var nycRef = this.db.firestore
            .collection('scanned')
            .doc(this.test[i].barcode);
          batch.set(nycRef, {
            barcodeno: this.barcode.value.barcodeno,
            lanno: this.barcode.value.lanno,
            docType: this.barcode.value.docType,
            log: firebase.firestore.FieldValue.arrayUnion(
              this.barcode.value.log
            ),
            latestAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
          // batch.set(nycRef, this.barcode.value);
          batch
            .commit()
            .then((res) => {
              this.test[i].status = 'Success';
              return;
            })
            .catch((err) => {
              this.test[i].status = 'Error';
              this.test[i].info = err;
            });
        }
      } else if (this.test[i].exist) {
        console.log('ERROR VALUE: ', this.test[i].error);
        if (!this.barcode.valid) {
          this.test[i].info =
            'For Barcode: ' +
            this.barcode.value.barcodeno +
            ', Please Fill in All the fields and Add it to new CSV Inward File and Upload that new File \r\n' +
            'Note: Only Inward Remarks is not mandatory.';
          this.test[i].status = 'Failure';
        } else if (this.test[i].typeError === true) {
          this.test[i].info =
            'Barcode: ' + this.barcode.value.barcodeno + ', is Already Inward';
          this.test[i].status = 'Failure';
        } else if (this.today < dateObject) {
          this.test[i].info =
            'This Barcode: ' + this.test[i].barcode + ' have future dates.';
          this.test[i].status = 'Failure';
        } else if (this.test[i].exist === false) {
          this.test[i].info =
            'For Barcode: ' +
            this.test[i].barcode +
            " can't add as new while batch Updating other ones.";
          this.test[i].status = 'Failure';
        }
        // else if(this.test[i].type === 'Reinward'){
        //   console.log("existence is: ", this.existence)
        //   // Get a new write batch
        //   var batch = this.db.firestore.batch();
        //   // Set the value id of barcode
        //   var nycRef = this.db.firestore.collection("scanned").doc(this.test[i].barcode);
        //   batch.set(nycRef, {
        //     latestAt: firebase.firestore.FieldValue.serverTimestamp(),
        //     log: firebase.firestore.FieldValue.arrayUnion(this.barcode.value.log),
        //   });
        //   batch.commit().then(res => {
        //     this.test[i].status = "Success";
        //   })
        //     .catch(err => {
        //       this.test[i].status = "Failure";
        //       this.test[i].info = err;
        //       this.api.addErrorLog(err, this.existence, this.test[i].barcode);
        //       console.log("value of existence is: " + this.existence);
        //     });

        // }
        else {
          console.log('existence is: ', this.existence);
          // Get a new write batch
          var batch = this.db.firestore.batch();
          // Set the value id of barcode
          var nycRef = this.db.firestore
            .collection('scanned')
            .doc(this.test[i].barcode);
          batch.update(nycRef, {
            latestAt: firebase.firestore.FieldValue.serverTimestamp(),
            log: firebase.firestore.FieldValue.arrayUnion(
              this.barcode.value.log
            ),
          });
          batch
            .commit()
            .then((res) => {
              this.test[i].status = 'Success';
            })
            .catch((err) => {
              this.test[i].status = 'Failure';
              this.test[i].info = err;
              this.api.addErrorLog(err, this.existence, this.test[i].barcode);
              console.log('value of existence is: ' + this.existence);
            });
        }
      }
    }

    this.hideIn = false;
    this.hideCancel = false;
    this.refreshBtn = true;
    //this.uploadnowbtn = true;
    console.log('End');
  };

  uploadOut = async (_) => {
    this.disableCheckIt = true;
    console.log('Start');
    for (let i = 0; i < this.test.length; i++) {
      var dateString = this.test[i].outDate; // 9 June
      this.dateParts = dateString.split('-');
      var dateObject = new Date(
        +this.dateParts[2],
        this.dateParts[1] - 1,
        +this.dateParts[0]
      );
      var date = this.test[i].outDate;
      var newdate = date.split('-').reverse().join('-');
      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.test[i].barcode, Validators.required),
        lanno: new FormControl(this.test[i].lanno, Validators.required),
        docType: new FormControl(this.test[i].docType, Validators.required),
        log: this.formBuilder.group({
          approvalType: new FormControl(
            this.test[i].approvalType,
            Validators.required
          ),
          outDate: new FormControl(newdate, Validators.required),
          remarkOutward: new FormControl(
            this.test[i].remarkOutward,
            Validators.required
          ),
          requestedBy: new FormControl(
            this.test[i].requestedBy,
            Validators.required
          ),
          retrievalType: new FormControl(
            this.test[i].retrievalType,
            Validators.required
          ),
          subRetrivalType: new FormControl(
            this.test[i].subRetrivalType,
            Validators.required
          ),
          fileurl: this.downloadUrl,
          type: new FormControl(this.test[i].type), //"outward" pranay change here
        }),
      });
      if (this.test[i].exist) {
        if (!this.barcode.valid) {
          this.test[i].info =
            'For Barcode: ' +
            this.barcode.value.barcodeno +
            ', Please Fill in All the fields and Add it to new CSV Outward File and Upload that new File.';
          this.test[i].status = 'Error';
        } else if (this.test[i].typeError === true) {
          this.test[i].info =
            'This Barcode: ' + this.test[i].barcode + ' already Outward';
          this.test[i].status = 'Failure';
        } else if (this.today < dateObject) {
          this.test[i].info =
            'This Barcode: ' + this.test[i].barcode + ' have future dates.';
          this.test[i].status = 'Failure';
        } else if (this.test[i].exist === false) {
          this.test[i].info =
            'For Barcode: ' +
            this.test[i].barcode +
            " can't add as new while batch Updating other ones.";
          this.test[i].status = 'Failure';
        }
        //  else if(this.test[i].type === 'Reinward'){
        //   console.log("existence is: ", this.existence)
        //   // Get a new write batch
        //   var batch = this.db.firestore.batch();
        //   // Set the value id of barcode
        //   var nycRef = this.db.firestore.collection("scanned").doc(this.test[i].barcode);
        //   batch.set(nycRef, {
        //     latestAt: firebase.firestore.FieldValue.serverTimestamp(),
        //     log: firebase.firestore.FieldValue.arrayUnion(this.barcode.value.log),
        //   });
        //   batch.commit().then(res => {
        //     this.test[i].status = "Success";
        //   })
        //     .catch(err => {
        //       this.test[i].status = "Error";
        //       this.test[i].info = err;
        //     });

        // }
        else {
          console.log('existence is: ', this.existence);
          // Get a new write batch
          var batch = this.db.firestore.batch();
          // Set the value id of barcode
          var nycRef = this.db.firestore
            .collection('scanned')
            .doc(this.test[i].barcode);
          batch.update(nycRef, {
            latestAt: firebase.firestore.FieldValue.serverTimestamp(),
            log: firebase.firestore.FieldValue.arrayUnion(
              this.barcode.value.log
            ),
          });
          batch
            .commit()
            .then((res) => {
              this.test[i].status = 'Success';
            })
            .catch((err) => {
              this.test[i].status = 'Error';
              this.test[i].info = err;
            });
        }
      } else if (!this.test[i].exist) {
        this.test[i].info =
          'This Barcode: ' +
          this.test[i].barcode +
          ' is not in DB for Outward Entry';
        this.test[i].status = 'Failure';
      }
    }
    this.hideOut = false;
    this.hideCancel = false;
    this.refreshBtn = true;
    console.log('End');
  };

  back() {
    //sessionStorage.setItem("gotobulk", "false");
    this.router.navigate(['menu']);
    this.api.uploadProgress = new Observable<0>();
  }
}
