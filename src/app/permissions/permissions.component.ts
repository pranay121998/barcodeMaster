import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
   
  title='Permission';

  test = [];
  details;

  barcodeno;
  lanno;
  docType;

  permissions;

  barcode: FormGroup;

  indexUpdateatMsg;

  accessEmail;

  constructor(private api: ApiService, private formBuilder: FormBuilder, private loc: Location, private router: Router,private toastr: ToastrService) { }

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

  ngOnInit(): void {
    this.getPermission();
    this.accessEmail = sessionStorage.getItem("email");
    console.log(this.accessEmail);
  }

  goBack() {
    this.router.navigate(['/menu']);
  }

  getPermission() {
    this.api.getpermissions().subscribe(response => {
      // this.api.sortTime();
      this.permissions = response;
      // for(let i=0;i<response.length;i++){
      //   let time=response[i].payload?.doc?.data()['latestAt'].seconds
      //   var d = Math.floor(time / (3600*24));
      //   var h = Math.floor(time % (3600*24) / 3600);
      //   var m = Math.floor(time % 3600 / 60);
      //   var s = Math.floor(time % 60);
      //   var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      //   var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
      //   var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      //   var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
      //   var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
      //  
 
      // }
      // console.log("sort permission",response[2].payload?.doc?.data()['latestAt']);
    });
  }

  deleteBarcode(id, permission_id) {
    //console.log(id, permission_id);
    this.api.realDeleteBarcode(id, permission_id);
  }

  deleteRejected(id, permission_id, type) {
    this.api.permissionRejected(id, type, permission_id);
  }

  deleteLog(id, permission_id, log) {
    // console.log("Log", log);
    var form;
    if (log.type === "Inward") {
      this.inwardLog.value.inwardDate = log.inwardDate;
      this.inwardLog.value.location = log.location;
      this.inwardLog.value.remarksInward = log.remarksInward;
      this.inwardLog.value.type = log.type;
      form = new FormGroup({
        log: this.inwardLog
      })
    }
    if (log.type === "Reinward") {
      this.inwardLog.value.inwardDate = log.inwardDate;
      this.inwardLog.value.location = log.location;
      this.inwardLog.value.remarksInward = log.remarksInward;
      this.inwardLog.value.type = log.type;
      form = new FormGroup({
        log: this.inwardLog
      })
    }

    if (log.type === "outward") {
      this.outwardLog.value.approvalType = log.approvalType;
      this.outwardLog.value.fileurl = log.fileurl;
      this.outwardLog.value.outDate = log.outDate;
      this.outwardLog.value.remarkOutward = log.remarkOutward;
      this.outwardLog.value.requestedBy = log.requestedBy;
      this.outwardLog.value.retrievalType = log.retrievalType;
      this.outwardLog.value.subRetrivalType = log.subRetrivalType;
      this.outwardLog.value.type = log.type;
      form = new FormGroup({
        log: this.outwardLog
      })
    }
    console.log("Form Value", form.value);
    this.api.realDeleteLog(id, permission_id, form.value);
  }

  async editIndex(id, type, index, log, permission_id) {
    console.log("TYPE IS: ", type);
    console.log("INDEX IS: ", index);
    this.loadData(id, index, log, permission_id);
    // console.log("Log is: ", log);
  }

  async loadData(id, index, log, permission_id) {
    this.barcodeno = id;
    /* this.lanno = lanno;
     this.docType = docType; */
    this.api.getmyStatus(id).pipe(take(1)).subscribe(res => {
      this.lanno = res.payload.data()['lanno'];
      this.docType = res.payload.data()['docType'];
      /* for (let i = 0; i < res.payload.data()['log'].length; i++) {
        console.log("IDATAS: " + res.payload.data()['log'][i]['inwardDate']);
      } */
      this.test = [];
      for (let i = 0; i < res.payload.data()['log'].length; i++) {
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
        this.test.push(this.details);
      }
      console.log("ouoj",this.test)
      this.getTestObj(index, log, permission_id);
    });

  }

  async getTestObj(index, log, permission_id) {
    //Find index of specific object using findIndex method.
    let objIndex = this.test.findIndex((obj => obj.no == index));
    console.log(objIndex);
    //Log object to Console.
    console.log("Before update: ", this.test[objIndex]);
    console.log("Log is: ", log);
    this.setLog(log, objIndex, permission_id);
  }

  setLog(log, objIndex, permission_id) {
    if (log.type === "Inward") {
      console.log("in inward")
      this.test[objIndex].inwardDate = log.inwardDate;
      this.test[objIndex].location = log.location;
      this.test[objIndex].remarksInward = log.remarksInward;
    }
    if (log.type === "Reinward") {
      console.log("in reinward")

      this.test[objIndex].inwardDate = log.inwardDate;
      this.test[objIndex].location = log.location;
      this.test[objIndex].remarksInward = log.remarksInward;
    }
    if (log.type === "outward") {
      console.log("in outward")

      this.test[objIndex].outDate = log.outDate;
      this.test[objIndex].requestedBy = log.requestedBy;
      this.test[objIndex].retrievalType = log.retrievalType;
      this.test[objIndex].subRetrivalType = log.subRetrivalType;
      this.test[objIndex].approvalType = log.approvalType;
      this.test[objIndex].remarkOutward = log.remarkOutward;
      this.test[objIndex].fileurl = log.fileurl;
    }
    //Log object to console again.
    console.log("After update: ", this.test[objIndex]);
    this.toastr.success('Successfully Edited !');

    this.doEdit(log, permission_id);
  }

  doEdit(log, permission_id) {
    if (log.type === "Inward") {
      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.barcodeno),
        lanno: new FormControl(this.lanno),
        docType: new FormControl(this.docType),
        log: this.formBuilder.group({
          inwardDate: new FormControl(this.test[0].inwardDate),
          location: new FormControl(this.test[0].location),
          remarksInward: new FormControl(this.test[0].remarksInward),
          type: new FormControl(this.test[0].type)//type: "Inward"
        })
      });
      this.api.deletebarforLog(this.barcodeno);
      console.log(this.test);
      console.log(this.barcode.value);
      this.api.addToDb(this.barcode.value, this.barcodeno).then(res => {
        for (let i = 1; i < this.test.length; i++) {
          if (this.test[i].type === "Inward") {
      console.log("in inward2");
            this.barcode = this.formBuilder.group({
              barcodeno: new FormControl(this.barcode),
              lanno: new FormControl(this.lanno),
              docType: new FormControl(this.docType),
              log: this.formBuilder.group({
                inwardDate: new FormControl(this.test[i].inwardDate),
                location: new FormControl(this.test[i].location),
                remarksInward: new FormControl(this.test[i].remarksInward),
                type: "Inward"
              })
            });
          }
          if (this.test[i].type === "Reinward") {
      console.log("in reinward2");

            this.barcode = this.formBuilder.group({
              barcodeno: new FormControl(this.barcode),
              lanno: new FormControl(this.lanno),
              docType: new FormControl(this.docType),
              log: this.formBuilder.group({
                inwardDate: new FormControl(this.test[i].inwardDate),
                location: new FormControl(this.test[i].location),
                remarksInward: new FormControl(this.test[i].remarksInward),
                type: "Reinward"
              })
            });
          }
          if (this.test[i].type === "outward") {
      console.log("in outward2")
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
                subRetrivalType: new FormControl(this.test[i].subRetrivalType),
                fileurl: new FormControl(this.test[i].fileurl),
                type: "outward"
              })
            });
          }
          this.api.upDate(this.barcode.value, this.barcodeno).then(() => {
            // console.log("Successfully Update Logs");
          }).catch(err => {
            console.log("Update Error: " + err);
          })
        }
        //this.indexUpdateatMsg = "Updated at: ", index++;
        // (function ($) {
        //   $('#searchModal').modal('hide');
        //   $('#editLogModal').modal('hide');
        // })(jQuery);
        // this.reload();
      }).then(() => {
        this.api.delPermissionLog(permission_id);
      }).catch(err => {
        console.log("Error is: " + err);
      });
    }
    if (log.type === "Reinward") {
      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.barcodeno),
        lanno: new FormControl(this.lanno),
        docType: new FormControl(this.docType),
        log: this.formBuilder.group({
          inwardDate: new FormControl(this.test[0].inwardDate),
          location: new FormControl(this.test[0].location),
          remarksInward: new FormControl(this.test[0].remarksInward),
          type: new FormControl(this.test[0].type)//type: "Reinward"
        })
      });
      this.api.deletebarforLog(this.barcodeno);
      console.log(this.test);
      console.log(this.barcode.value);
      this.api.addToDb(this.barcode.value, this.barcodeno).then(res => {
        for (let i = 1; i < this.test.length; i++) {
          if (this.test[i].type === "Inward") {
      console.log("in inward3")
            this.barcode = this.formBuilder.group({
              barcodeno: new FormControl(this.barcode),
              lanno: new FormControl(this.lanno),
              docType: new FormControl(this.docType),
              log: this.formBuilder.group({
                inwardDate: new FormControl(this.test[i].inwardDate),
                location: new FormControl(this.test[i].location),
                remarksInward: new FormControl(this.test[i].remarksInward),
                type: "Inward"
              })
            });
          }
          if (this.test[i].type === "Reinward") {
      console.log("in reinward3")
            this.barcode = this.formBuilder.group({
              barcodeno: new FormControl(this.barcode),
              lanno: new FormControl(this.lanno),
              docType: new FormControl(this.docType),
              log: this.formBuilder.group({
                inwardDate: new FormControl(this.test[i].inwardDate),
                location: new FormControl(this.test[i].location),
                remarksInward: new FormControl(this.test[i].remarksInward),
                type: "Reinward"
              })
            });
          }
          if (this.test[i].type === "outward") {
      console.log("in outward3")
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
                subRetrivalType: new FormControl(this.test[i].subRetrivalType),
                fileurl: new FormControl(this.test[i].fileurl),
                type: "outward"
              })
            });
          }
          this.api.upDate(this.barcode.value, this.barcodeno).then(() => {
            // console.log("Successfully Update Logs");
          }).catch(err => {
            console.log("Update Error: " + err);
          })
        }
        //this.indexUpdateatMsg = "Updated at: ", index++;
        // (function ($) {
        //   $('#searchModal').modal('hide');
        //   $('#editLogModal').modal('hide');
        // })(jQuery);
        // this.reload();
      }).then(() => {
        this.api.delPermissionLog(permission_id);
      }).catch(err => {
        console.log("Error is: " + err);
      });
    }

    if (log.type === "outward") {
      this.barcode = this.formBuilder.group({
        barcodeno: new FormControl(this.barcodeno),
        lanno: new FormControl(this.lanno),
        docType: new FormControl(this.docType),
        log: this.formBuilder.group({
          inwardDate: new FormControl(this.test[0].inwardDate),
          location: new FormControl(this.test[0].location),
          remarksInward: new FormControl(this.test[0].remarksInward),
          type: new FormControl(this.test[0].type)//,"Inward"
        })
      });
      this.api.deletebarforLog(this.barcodeno);
      console.log(this.test);
      console.log(this.barcode.value);
      this.api.addToDb(this.barcode.value, this.barcodeno).then(res => {
        for (let i = 1; i < this.test.length; i++) {
          // if (this.test[i].type === "pending") {
          //   console.log("in pending4")
          //         this.barcode = this.formBuilder.group({
          //           barcodeno: new FormControl(this.barcode),
          //           lanno: new FormControl(this.lanno),
          //           docType: new FormControl(this.docType),
          //           log: this.formBuilder.group({
          //             inwardDate: new FormControl(this.test[i].inwardDate),
          //             // location: new FormControl(this.test[i].location),
          //             // remarksInward: new FormControl(this.test[i].remarksInward),
          //             type: "pending"
          //           })
          //         });
          //       }
          if (this.test[i].type === "Inward") {
      console.log("in inward4")
            this.barcode = this.formBuilder.group({
              barcodeno: new FormControl(this.barcode),
              lanno: new FormControl(this.lanno),
              docType: new FormControl(this.docType),
              log: this.formBuilder.group({
                inwardDate: new FormControl(this.test[i].inwardDate),
                location: new FormControl(this.test[i].location),
                remarksInward: new FormControl(this.test[i].remarksInward),
                type: "Inward"
              })
            });
          }
          if (this.test[i].type === "Reinward") {
      console.log("in reinward4")
            this.barcode = this.formBuilder.group({
              barcodeno: new FormControl(this.barcode),
              lanno: new FormControl(this.lanno),
              docType: new FormControl(this.docType),
              log: this.formBuilder.group({
                inwardDate: new FormControl(this.test[i].inwardDate),
                location: new FormControl(this.test[i].location),
                remarksInward: new FormControl(this.test[i].remarksInward),
                type: "Reinward"
              })
            });
          }
          if (this.test[i].type === "outward") {
      console.log("in outward4")
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
                subRetrivalType: new FormControl(this.test[i].subRetrivalType),
                fileurl: new FormControl(this.test[i].fileurl),
                type: "outward"
              })
            });
          }
          this.api.upDate(this.barcode.value, this.barcodeno).then(res => {
            // console.log("Successfully Update Logs");
            this.api.delPermissionLog(permission_id);
          }).catch(err => {
            console.log("Update Error: " + err);
          })
        }
        //this.indexUpdateatMsg = "Updated at: " + index;
        //this.reload();

      }).catch(err => {
        console.log("Error is: " + err);
      });
    }

  }

  reload() {
    this.loc.back();
    sessionStorage.setItem("gotoperm", "true");
  }

}
