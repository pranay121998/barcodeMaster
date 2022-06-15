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
declare var jQuery: any;
var $j = jQuery.noConflict();
@Component({
    selector: 'app-bulk',
    templateUrl: './bulk.component.html',
    styleUrls: ['./bulk.component.css']
})
export class BulkComponent implements OnInit {

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
                            outDate: res.data[i]["Out Date"],
                            requestedBy: res.data[i]["Requested By"],
                            retrievalType: res.data[i]["Retrieval Type"],
                            subRetrivalType: res.data[i]["Sub Retrieval Type"],
                            approvalType: res.data[i]["Approved Type"],
                            remarkOutward: res.data[i]["Outward Remarks"],
                            type: (res.data[i]["Inward Date (dd-mm-yyyy)"]) ? "Inward" : "outward",
                            status: "",
                            info: "No Errors For Now"
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
            console.log("called!!")
            this.test.forEach(res => {
                var inwarddateString, indateObject, outdateString, outdateObject;
                if (res.type === "Inward") {
                    inwarddateString = res.inwardDate; // 9 June
                    this.dateParts = inwarddateString.split("-");
                    indateObject = new Date(+this.dateParts[2], this.dateParts[1] - 1, +this.dateParts[0]);

                } else if (res.type === "outward") {
                    outdateString = res.outDate;
                    this.outDateparts = outdateString.split("-");
                    outdateObject = new Date(+this.outDateparts[2], this.outDateparts[1] - 1, +this.outDateparts[0]);

                }

                firstloop: for (let i = 0; i < Object.keys(status).length; i++) {
                    // if (this.disableCheckIt === true) {
                    //   break firstloop;
                    // }
                    if (res.barcode === status[i].payload.doc.id) {
                        this.stopLoop = true;
                        this.setIn = false;
                        //localStorage.setItem("BulkInOrOut", "true");

                        console.log("Upper " + res.type);
                        for (let j = 0; j < status[i].payload.doc.data()['log'].length; j++) {

                            let length = status[i].payload.doc.data()['log'].length - 1;
                            // console.log('YOU JUST PRINTED ME: ' + status[i].payload.doc.data()['log'][length]['type']);

                            if (res.type === "Inward") {
                                if (this.today < indateObject) {
                                    if (this.disableCheckIt === false) {
                                        res.info = "The Barcode: " + res.barcode + " have future date, please change it to today's date or any past date.";
                                        res.status = "Failure";
                                        this.hideIn = true;
                                        break;
                                    }
                                }
                                else if (status[i].payload.doc.data()['log'][length]['type'] === "Inward") {
                                    if (this.disableCheckIt === false) {
                                        res.info = "The Barcode: " + res.barcode + " is Already Inward, Please Upload New File with new Values by Clicking Cancel.\r\n" + "Note: If you still Upload, the data will be replaced with same values.\r\n" + "Also, make sure you upload file with new values each time OR the data will be replaced with same values.";
                                        res.status = "Failure";
                                        this.hideIn = true;
                                        this.firebasetype = "Inward";
                                        let firebasetypedetails = {
                                            barcode: res.barcode + "Inward"
                                        }
                                        this.firebasetypearr.push(firebasetypedetails);
                                        break;
                                    }

                                } else if (status[i].payload.doc.data()['log'][length]['type'] === "outward") {
                                    if (this.disableCheckIt === false) {
                                        this.hideIn = true;
                                        this.setIn = true;
                                        this.firebasetype = "outward";
                                        let firebasetypedetails = {
                                            barcode: res.barcode + "outward"
                                        }
                                        this.firebasetypearr.push(firebasetypedetails);
                                    }
                                    //localStorage.setItem("BulkInOrOut", "true");
                                    this.existence = true;
                                    this.hideIn = true;
                                    this.setIn = true;
                                    this.firebasetype = "outward";
                                } else if (res.lanno === "") {
                                    res.info = "Please Fill in all the details";
                                    res.status = "Failure";
                                }
                            } else if (res.type === "outward") {
                                if (this.today < outdateObject) {
                                    if (this.disableCheckIt === false) {
                                        res.info = "The Barcode: " + res.barcode + " have future date, please change it to today's date or any past date.";
                                        res.status = "Failure";
                                        this.hideOut = true;
                                        break;
                                    }
                                } else if (status[i].payload.doc.data()['log'][length]['type'] === "outward") {
                                    if (this.disableCheckIt === false) {
                                        this.hideOut = false;
                                        res.info = "The Barcode: " + res.barcode + " is Already Outward, Please Upload New File with new Values by Clicking Cancel.\r\n" + "Note: If you still Upload (if Upload button appears), the data will be replaced with same values.\r\n" + "Also, make sure you upload file with new values each time OR the data will be replaced with same values.";
                                        res.status = "Failure";
                                        this.firebasetype = "outward"
                                        let firebasetypedetails = {
                                            barcode: res.barcode + "outward"
                                        }
                                        this.firebasetypearr.push(firebasetypedetails);
                                        this.hideOut = true;

                                        break;
                                    }
                                } else if (status[i].payload.doc.data()['log'][length]['type'] === "Inward") {
                                    //Local Storage to set value for add or update
                                    //localStorage.setItem("BulkInOrOut", "true");
                                    this.existence = true;
                                    this.hideOut = true;
                                    this.firebasetype = "Inward";
                                    let firebasetypedetails = {
                                        barcode: res.barcode + "Inward",
                                    }
                                    this.firebasetypearr.push(firebasetypedetails);
                                }
                            }

                        }
                        break;
                    }
                }
                secondloop: for (let i = 0; i < Object.keys(status).length; i++) {
                    if (res.barcode !== status[i].payload.doc.id) {
                        if (this.stopLoop === false) {
                            // console.log("IN ELSE IF STATEMENT")
                            // console.log("Checking it: " + res.barcode);
                            // console.log("With: " + status[i].payload.doc.id);
                            // console.log(i);
                            //localStorage.setItem("BulkInOrOut", "false");
                            this.existence = false;
                            if (res.type === "Inward") {
                                var dateString = res.inwardDate; // 9 June
                                this.dateParts = dateString.split("-");
                                var dateObject = new Date(+this.dateParts[2], this.dateParts[1] - 1, +this.dateParts[0]);
                                //console.log(dateObject);

                                if (this.disableCheckIt === false) {
                                    if (this.today < dateObject) {
                                        res.info = "The Barcode: " + res.barcode + "have future date, please change it to today's date or any past date.";
                                        res.status = "Failure";
                                    } else {
                                        this.hideIn = true;
                                        this.hideOut = false;
                                        break secondloop;
                                    }
                                }
                            } else if (res.type === "outward") {
                                // this.hideOut = false;
                                // this.hideIn = false;
                                if (this.disableCheckIt === false) {
                                    res.info = "This Barcode: " + res.barcode + " Doesn't Exist For Doing Outward Entry. Please Do New Entry First By Clicking Cancel. If you still click on 'Upload Outward' Button (It will appear if there's any outward entry) Other outward entries will be added except " + res.barcode;
                                    res.status = "Failure";
                                    break;
                                }
                            }
                        }
                    }
                }

            });
        });

    }



    isError;
    isSuccess;

    uploadIn = async _ => {
        this.disableCheckIt = true;
        console.log("Start");
        let newFormulalist = this.firebasetypearr.filter((v, i) => this.firebasetypearr.findIndex(item => item.barcode == v.barcode) === i);
        mainloop: for (let i = 0; i < this.test.length; i++) {

            var testIn = this.test[i].barcode + "Inward";

            var dateString = this.test[i].inwardDate; // 9 June
            this.dateParts = dateString.split("-");
            var dateObject = new Date(+this.dateParts[2], this.dateParts[1] - 1, +this.dateParts[0]);
            var date = this.test[i].inwardDate;
            var newdate = date.split("-").reverse().join("-");
            this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.test[i].barcode, Validators.required),
                lanno: new FormControl(this.test[i].lanno, Validators.required),
                docType: new FormControl(this.test[i].docType, Validators.required),
                log: this.formBuilder.group({
                    inwardDate: new FormControl(newdate, Validators.required),
                    location: new FormControl(this.test[i].location, Validators.required),
                    remarksInward: new FormControl(this.test[i].remarksInward),
                    type: "Inward"
                })
            });

            if (this.existence === false) {
                if (!this.barcode.valid) {
                    this.test[i].info = "For Barcode: " + this.barcode.value.barcodeno + ", Please Fill in All the fields and Add it to new CSV Inward File and Upload that new File \r\n" + "Note: Only Inward Remarks is not mandatory.";
                    this.test[i].status = "Error";
                } else if (this.today < dateObject) {
                    this.test[i].info = "This Barcode: " + this.test[i].barcode + " have future dates.";
                    this.test[i].status = "Failure";
                } else {

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

            else if (this.existence === true) {
                if (!this.barcode.valid) {
                    this.test[i].info = "For Barcode: " + this.barcode.value.barcodeno + ", Please Fill in All the fields and Add it to new CSV Inward File and Upload that new File \r\n" + "Note: Only Inward Remarks is not mandatory.";
                    this.test[i].status = "Failure";

                } else if (newFormulalist[i].barcode === testIn) {
                    this.test[i].info = `This Barcode: ${this.test[i].barcode} is Already Inward`;
                    this.test[i].status = "Failure";
                }
                else if (this.today < dateObject) {
                    this.test[i].info = "This Barcode: " + this.test[i].barcode + " have future dates.";
                    this.test[i].status = "Failure";
                } else {
                    console.log("existence is: ", this.existence)
                    // Get a new write batch
                    var batch = this.db.firestore.batch();
                    // Set the value id of barcode
                    var nycRef = this.db.firestore.collection("scanned").doc(this.test[i].barcode);
                    batch.update(nycRef, {
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
            }
        }

        this.hideIn = false;
        this.hideCancel = false;
        this.refreshBtn = true;
        //this.uploadnowbtn = true;
        console.log("End");


    }

    uploadOut = async _ => {
        this.disableCheckIt = true;
        console.log("Start");
        let newFormulalist = this.firebasetypearr.filter((v, i) => this.firebasetypearr.findIndex(item => item.barcode == v.barcode) === i);
        for (let i = 0; i < this.test.length; i++) {
            var testOut = this.test[i].barcode + "outward";
            var dateString = this.test[i].outDate; // 9 June
            this.dateParts = dateString.split("-");
            var dateObject = new Date(+this.dateParts[2], this.dateParts[1] - 1, +this.dateParts[0]);
            var date = this.test[i].outDate;
            var newdate = date.split("-").reverse().join("-");
            this.barcode = this.formBuilder.group({
                barcodeno: new FormControl(this.test[i].barcode, Validators.required),
                lanno: new FormControl(this.test[i].lanno, Validators.required),
                docType: new FormControl(this.test[i].docType, Validators.required),
                log: this.formBuilder.group({
                    approvalType: new FormControl(this.test[i].approvalType, Validators.required),
                    outDate: new FormControl(newdate, Validators.required),
                    remarkOutward: new FormControl(this.test[i].remarkOutward, Validators.required),
                    requestedBy: new FormControl(this.test[i].requestedBy, Validators.required),
                    retrievalType: new FormControl(this.test[i].retrievalType, Validators.required),
                    subRetrivalType: new FormControl(this.test[i].subRetrivalType, Validators.required),
                    fileurl: this.downloadUrl,
                    type: "outward"
                })
            });
            if (this.existence === true) {
                if (!this.barcode.valid) {
                    this.test[i].info = "For Barcode: " + this.barcode.value.barcodeno + ", Please Fill in All the fields and Add it to new CSV Outward File and Upload that new File.";
                    this.test[i].status = "Error";
                } else if (newFormulalist[i].barcode === testOut) {
                    this.test[i].info = "This Barcode: " + this.test[i].barcode + " already Outward";
                    this.test[i].status = "Failure";
                }
                else if (this.today < dateObject) {
                    this.test[i].info = "This Barcode: " + this.test[i].barcode + " have future dates.";
                    this.test[i].status = "Failure";
                } else {
                    console.log("existence is: ", this.existence)
                    // Get a new write batch
                    var batch = this.db.firestore.batch();
                    // Set the value id of barcode
                    var nycRef = this.db.firestore.collection("scanned").doc(this.test[i].barcode);
                    batch.update(nycRef, {
                        latestAt: firebase.firestore.FieldValue.serverTimestamp(),
                        log: firebase.firestore.FieldValue.arrayUnion(this.barcode.value.log),
                    });
                    batch.commit().then(res => {
                        this.test[i].status = "Success";
                    })
                        .catch(err => {
                            this.test[i].status = "Error";
                            this.test[i].info = err;
                        });

                }

            }
        }
        this.hideOut = false;
        this.hideCancel = false;
        this.refreshBtn = true;
        console.log("End");
    }

    back() {
        //localStorage.setItem("gotobulk", "false");
        this.router.navigate(['menu']);
        this.api.uploadProgress = new Observable<0>();
    }

}
