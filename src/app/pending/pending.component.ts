import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import { ApiService } from '../services/api.service';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { first } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { map } from 'jquery';
declare var jQuery: any;
var $j = jQuery.noConflict();

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css']
})
export class PendingComponent implements OnInit {

  title='Pending';

  barcode: FormGroup;
  hideIn;
  hideOut;
  hideCancel;

  pendform: FormGroup;

  setOut = true;

  @ViewChild('focus') focus: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private papa: Papa,
    public api: ApiService,
    private router: Router,
    private db: AngularFirestore
  ) { }
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
    await this.api.apiData$.subscribe(url => this.downloadUrl = url);
    console.log(this.downloadUrl);
  }


  today = new Date();
  dateParts = [];
  outDateparts = []
  ngOnInit(): void {
    this.today.setHours(0, 0, 0, 0)
    //console.log("TODAY: " + this.today)
    setTimeout(() => {
      this.focus.nativeElement.focus();
    }, 100);
    (function ($) {
      $(document).ready(function () {
        // console.log("Hello jQuery! from Bulk");
        $("#focus").focus();
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
            this.details = {
              barcode: res.data[i]["Barcode No"],
              lanno: res.data[i]["Lan No"],
              docType: res.data[i]["Doc Type"],
              inwardDate: res.data[i]["Inward Date (dd-mm-yyyy)"],
              location: res.data[i]["Location"],
              remarksInward: res.data[i]["Inward Remarks"],
              type: (res.data[i]["Inward Date (dd-mm-yyyy)"]) ? "Inward" : "pending",
              status: "",
              info: "No Errors For Now",
              error: false,
              exist: true,
            };
            console.log(res.data[i]["Inward Date (dd-mm-yyyy)"])
            if (res.data[i]["Inward Date (dd-mm-yyyy)"] !== "") {
              //this.hideIn = true;
              //this.hideOut = false;
              this.hideCancel = true;
            } else if (res.data[i]["Inward Date (dd-mm-yyyy)"] === "") {
              //this.hideIn = false;
              //this.hideOut = true;
              this.hideCancel = true;
            }
            this.test.push(this.details);
          }
          console.log(this.test);
          //this.test.push(results.data);
          console.log('Parsed: k', res.data);
        },
        error: (res, file) => {
          alert("Error Ocurred: " + res + "On File: " + file);
        }
      });
    }
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

  existence;
  stopLoop: boolean = false;
  firebasetype;
  firebasetypearr = [];
  checkIt() {
    this.api.getFiles().pipe(first()).subscribe(status => {
      console.log("STATUS: ", status);
    });
    this.api.pending.pipe(first()).subscribe(status => {
      console.log("PENDING: ", status);
      this.test.forEach(res => {
        var inwarddateString, indateObject;

        if (res.type === "Inward" || res.type === 'Reinward') {
          inwarddateString = res.inwardDate; // 9 June
          this.dateParts = inwarddateString.split("-");
          indateObject = new Date(+this.dateParts[2], this.dateParts[1] - 1, +this.dateParts[0]);
        }
        if ((res.type === "Inward" || res.type === 'Reinward') && this.today < indateObject) {
          res.info = "The Barcode: " + res.barcode + " have future date, please change it to today's date or any past date.";
          res.status = "Failure";
        } else {
          for (let i = 0; i < status.length; i++) {
            if (res.barcode !== status[i].number) {
              this.hideIn = true;
              this.existence = false;
              res.exist = false;
              res.status = "Good to GO";
            }
          }
        }
      });

      /*  this.test.forEach(res => {
          for (let i = 0; i < status.length; i++) {
            if (res.barcode === status[i].number) {
              console.log("No. is: ", status[i].number)
              console.log("LENGTH: ", status[i].log.length);
              this.existence = true;
              res.exist = true;
              if (status[i].log.length > 1) {
                console.log("ALREADY INWARD");
                res.status = "Error"
                res.info = "Already Inward";
                res.error = true;
              } else {
                console.log("Found A Match");
                res.status = "Will be Inward"
              }
            }
          }
        }); */

      this.test.forEach(res => {
        for (let i = 0; i < status.length; i++) {
          if (res.barcode === status[i].number) {
            console.log("No. is: ", status[i].number)
            console.log("LENGTH: ", status[i].log.length);
            this.existence = true;
            res.exist = true;
            res.status = "Failure";
            res.info = "Already in Database";
          }
        }
      });

    })
  }



  isError;
  isSuccess;

  uploadIn = async _ => {
    this.disableCheckIt = true;
    console.log("Start");

    mainloop: for (let i = 0; i < this.test.length; i++) {

      var date = "22-09-2021";
      var newdate;

      //var testIn = this.test[i].barcode + "Inward";
      if (this.test[i].type === "Inward") {
        var dateString = this.test[i].inwardDate; // 9 June
        this.dateParts = dateString.split("-");
        var dateObject = new Date(+this.dateParts[2], this.dateParts[1] - 1, +this.dateParts[0]);
        date = this.test[i].inwardDate;
      }else if (this.test[i].type === "Reinward") {
        var dateString = this.test[i].inwardDate; // 9 June
        this.dateParts = dateString.split("-");
        var dateObject = new Date(+this.dateParts[2], this.dateParts[1] - 1, +this.dateParts[0]);
        date = this.test[i].inwardDate;
      }

      newdate = date.split("-").reverse().join("-");
      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.test[i].barcode, Validators.required),
        lanno: new FormControl(this.test[i].lanno, Validators.required),
        docType: new FormControl(this.test[i].docType, Validators.required),
        log: this.formBuilder.group({
          inwardDate: new FormControl(newdate, Validators.required),
          location: new FormControl(this.test[i].location, Validators.required),
          remarksInward: new FormControl(this.test[i].remarksInward),
          type: "pending"
        })
      });


      if (!this.test[i].exist) {

        if (this.barcode.value.barcodeno === "" && this.barcode.value.lanno === "") {
          this.test[i].info = "For Barcode: " + this.barcode.value.barcodeno + ", Please Fill in All the fields and Add it to new CSV Inward File and Upload that new File \r\n" + "Note: Only Inward Remarks is not mandatory.";
          this.test[i].status = "Error";
        }
        else if ((this.test[i].type === "Inward" || this.test[i].type === "Reinward") && this.today < dateObject) {
          this.test[i].info = "This Barcode: " + this.test[i].barcode + " have future dates.";
          this.test[i].status = "Failure";
        }
        else {
          console.log("existence is: ", this.existence)
          // Get a new write batch
          var batch = this.db.firestore.batch();
          // // Set the value id of barcode
          var nycRef = this.db.firestore.collection("scanned").doc(this.test[i].barcode);
          batch.set(nycRef, {
            barcodeno: this.barcode.value.barcodeno,
            lanno: this.barcode.value.lanno,
            docType: this.barcode.value.docType,
            log: firebase.firestore.FieldValue.arrayUnion(this.barcode.value.log),
            latestAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          // batch.set(nycRef, this.barcode.value);
          batch.commit().then(res => {
            this.test[i].status = "Success";
            return;
          })
            .catch(err => {
              this.test[i].status = "Error";
              this.test[i].info = err;
            });

        }
      }

      /*  else if (this.test[i].exist) {
          console.log("ERROR VALUE: ", this.test[i].error);
          this.barcode.value.log['type'] = "Inward";
          if (!this.barcode.valid) {
            this.test[i].info = "For Barcode: " + this.barcode.value.barcodeno + ", Please Fill in All the fields and Add it to new CSV Inward File and Upload that new File \r\n" + "Note: Only Inward Remarks is not mandatory.";
            this.test[i].status = "Failure";
          }
          else if (this.test[i].error === true) {
            this.test[i].info = "Barcode: " + this.barcode.value.barcodeno + ", is Already Inward";
            this.test[i].status = "Failure";
          }
          else if (this.today < dateObject) {
            this.test[i].info = "This Barcode: " + this.test[i].barcode + " have future dates.";
            this.test[i].status = "Failure";
          }
          else if (this.test[i].exist === false) {
            this.test[i].info = "For Barcode: " + this.test[i].barcode + " can't add as new while batch Updating other ones.";
            this.test[i].status = "Failure";
          }
          else {
            console.log("existence is: ", this.existence)
            // Get a new write batch
            var batch = this.db.firestore.batch();
            // Set the value id of barcode
            var nycRef = this.db.firestore.collection("scanned").doc(this.test[i].barcode);
            batch.update(nycRef, {
              docType: this.barcode.value.docType,
              latestAt: firebase.firestore.FieldValue.serverTimestamp(),
              log: firebase.firestore.FieldValue.arrayUnion(this.barcode.value.log),
            });
            batch.commit().then(res => {
              this.test[i].status = "Success";
            })
              .catch(err => {
                this.test[i].status = "Failure";
                this.test[i].info = err;
                this.api.addErrorLog(err, this.existence, this.test[i].barcode);
                console.log("value of existence is: " + this.existence);
              });
  
          }
        } */
      else if (this.test[i].exist) {
        this.test[i].status = "Failure";
        this.test[i].info = "Already in Database";
      }
    }

    this.hideIn = false;
    this.hideCancel = false;
    this.refreshBtn = true;
    //this.uploadnowbtn = true;
    console.log("End");


  }

  back() {
    //localStorage.setItem("gotobulk", "false");
    this.router.navigate(['menu']);
    this.api.uploadProgress = new Observable<0>();
  }

}
