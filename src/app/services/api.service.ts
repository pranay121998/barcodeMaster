import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Barcode } from './barcode';
import firebase from 'firebase/app';
import 'firebase/firestore';
import firestore from 'firebase/app';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { Pending } from '../models/pending';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //FileUpload
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  basePath = '/docs';
  downloadableURL = '';
  uploadProgress: Observable<number>;

  scanned: Observable<any[]>;

  isInOrOut;

  Email;
  isLogin;

  pendingDb = 'scanned';
  pendingCollection: AngularFirestoreCollection<Pending>;
  pending: Observable<Pending[]>;

  constructor(
    public firestore: AngularFirestore,
    public afStorage: AngularFireStorage,
    private toastr: ToastrService
  ) {
    this.pendingCollection = this.firestore.collection<Pending>(this.pendingDb);
    this.pending = this.pendingCollection.valueChanges({ idField: 'number' });
  }

  // don't use "any", type your data instead!
  private apiData = new BehaviorSubject<any>(null);
  public apiData$ = this.apiData.asObservable();

  //FileUpload
  //Setting Progress for Img Upload then getting Img Url
  async onFileChanged(event) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `${this.basePath}/${file.name}`; // path at which image will be stored in the firebase storage
      this.task = this.afStorage.upload(filePath, file); // upload task
      // this.progress = this.snapTask.percentageChanges();
      this.uploadProgress = this.task
        .snapshotChanges()
        .pipe(map((s) => (s.bytesTransferred / s.totalBytes) * 100));
      // observe upload progress
      this.uploadProgress = this.task.percentageChanges();
      (await this.task).ref.getDownloadURL().then((url) => {
        this.downloadableURL = url;
        console.log(this.downloadableURL);
        this.apiData.next(this.downloadableURL);
      }); // <<< url is found here
    } else {
      alert('No docs selected');
      this.downloadableURL = '';
    }
  }

  firesearch(start, end) {
    return this.firestore
      .collection('scanned', (ref) =>
        ref.limit(5).orderBy('barcodeno').startAt(start).endAt(end)
      )
      .valueChanges();
    // return this.firestore.collection(`scanned/${id}`).get();
  }

  getLoginInfo() {
    return this.firestore.collection('login').snapshotChanges();
  }

  getFileStatus() {
    return this.firestore
      .collection('scanned', (ref) => ref.orderBy('latestAt', 'desc'))
      .snapshotChanges();
  }

  getSpecific(start, end) {
    return this.firestore
      .collection('date', (ref) =>
        ref.where('date', '>=', start).where('date', '<=', end)
      )
      .snapshotChanges();
  }

  getFiles() {
    return this.firestore.collection('scanned').snapshotChanges();
  }

  getCollect(): Observable<any> {
    return this.firestore
      .collection('scanned', (ref) => ref.orderBy('latestAt', 'desc'))
      .snapshotChanges();
  }

  getFileById(id) {
    return this.firestore
      .doc(`/scanned/${id}`)
      .get()
      // .subscribe((res) => {
      //   if (res.exists) {
      //     console.log('Exist!');
      //     sessionStorage.setItem('myExistence', 'true');
      //   }
      //   if (!res.exists) {
      //     console.log("Not Exist :'(");
      //     sessionStorage.setItem('myExistence', 'false');
      //   }
      // });
  }

  returnId(id) {
    let value;
    this.firestore
      .doc(`/scanned/${id}`)
      .get()
      .subscribe((res) => {
        if (res.exists) {
          console.log('RETURN IS TRUE');
          value = true;
        } else {
          console.log('RETURN IS FALSE');
          value = false;
        }
      });
    return value;
  }

// history=[]

  getmyStatus(id) {
    // this.history.push(this.firestore.doc(`/scanned/${id}`).snapshotChanges().subscribe((res)=>{res.payload.data()['log']}));
    return this.firestore.doc(`/scanned/${id}`).snapshotChanges();
  }

  // history() {
  //   return this.firestore.doc(`scanned`).snapshotChanges();
  // }

  getLogs(id) {
    return this.firestore.collection('scanned').doc(id).snapshotChanges();
  }

  getDateStatus() {
    return this.firestore.collection('date').snapshotChanges();
  }

  addErrorLog(errorMsg, variableStatus, id) {
    return this.firestore.collection('errorLogs').doc(id).set({
      errorMsg: errorMsg,
      variableStatus: variableStatus,
    });
  }

  addToDb(barcode: Barcode, id) {
    return this.firestore
      .collection('scanned')
      .doc(id)
      .set({
        barcodeno: barcode.barcodeno,
        lanno: barcode.lanno,
        docType: barcode.docType,
        log: firebase.firestore.FieldValue.arrayUnion(barcode.log),
        latestAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

  upDate(barcode: Barcode, id) {
    const userRef: AngularFirestoreDocument<any> = this.firestore.doc(
      `scanned/${id}`
    );
    console.log('barcode value ',barcode.log);
    return userRef.update({
      docType: barcode.docType,
      latestAt: firebase.firestore.FieldValue.serverTimestamp(),
      log: firebase.firestore.FieldValue.arrayUnion(barcode.log),
    });
  }
  // updateTime;
  // sortTime(){
  //   this.getpermissions().subscribe(response => {
  //     // this.permissions = response;
  //     for(let i=0;i<response.length;i++){
  //       let time=response[i].payload?.doc?.data()['latestAt'].seconds
  //       var d = Math.floor(time / (3600*24));
  //       var h = Math.floor(time % (3600*24) / 3600);
  //       var m = Math.floor(time % 3600 / 60);
  //       var s = Math.floor(time % 60);
  //       var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  //       var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  //       var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  //       var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  //       var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  //       this.updateTime= dDisplay + hDisplay + mDisplay + sDisplay;
  //          console.log(this.updateTime);
  //     }
  //   });
  // }

  permissionEdit(index, barcode: Barcode, id, access) {

    this.firestore
      .collection('permissions')
      .add({
        barcode: id,
        permission: 'editLog',
        latestAt: firebase.firestore.FieldValue.serverTimestamp(),
        updateAt:'',
        log: barcode.log,
        index: index,
        email: access,
      })
      .then(() => {
        this.toastr.warning('Asked Edit Permission', id);
      })
      .catch((error) => {
        console.error('Error Asking', error);
      });
  }

  deleteLog(barcode: Barcode, id, access) {
    /*  var data = this.firestore.collection('scanned').doc(id);
      return data.update({
        log: firebase.firestore.FieldValue.arrayRemove(barcode.log)
      }); */
    this.firestore
      .collection('permissions')
      .add({
        barcode: id,
        permission: 'deleteLog',
        log: barcode.log,
        email: access,
      })
      .then(() => {
        this.toastr.warning('Asked Delete Permission', id);
      })
      .catch((error) => {
        console.error('Error Asking', error);
      });
  }

  realDeleteLog(id, permission_id, barcode) {
    console.log("realdelete ",id,permission_id,barcode);
    var data = this.firestore.collection('scanned').doc(id);
    return data
      .update({
        log: firebase.firestore.FieldValue.arrayRemove(barcode.log),
      })
      .then(() => {
        this.toastr.success('Successfully Deleted Log');
      })
      .then(() => {
        this.firestore
          .collection('permissions')
          .doc(permission_id)
          .delete()
          .then(() => {
            console.log('Permission Also Deleted');
          });
      });
  }

  deleteBarcodeData(id, access) {
    /*  this.firestore.collection('scanned').doc(id).delete().then(() => {
        console.log("Record successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      }); */

    this.firestore
      .collection('permissions')
      .add({
        permission: 'delete',
        barcode: id,
        email: access,
      })
      .then(() => {
        this.toastr.warning('Asked Delete Permission', id);
      })
      .catch((error) => {
        console.error('Error Asking', error);
      });
  }

  realDeleteBarcode(barcode_id, permission_id) {
    this.firestore
      .collection('scanned')
      .doc(barcode_id)
      .delete()
      .then(() => {
        console.log('Record successfully deleted!');
        this.toastr.success('Deleted Successfully', barcode_id);
      })
      .then(() => {
        this.firestore
          .collection('permissions')
          .doc(permission_id)
          .delete()
          .then(() => {
            console.log('Permission Also Deleted');
          });
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  }

  deletebarforLog(barcode_id) {
    this.firestore
      .collection('scanned')
      .doc(barcode_id)
      .delete()
      .then(() => {
        console.log('Record successfully deleted!');
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  }

  delPermissionLog(permission_id) {
    console.log(permission_id);
    this.firestore
      .collection('permissions')
      .doc(permission_id)
      .delete()
      .then(() => {
        console.log('Permission Also Deleted');
      })
      .catch((err) => {
        console.log('Error: ', err);
      });
  }

  toasted;

  permissionRejected(id, type, permission_id) {
    this.firestore
      .collection('permissions')
      .doc(permission_id)
      .delete()
      .then(() => {
        this.toastr.error(`Permission Rejected for ${type}`, id);
      })
      .catch((error) => {
        console.log('Error Rejecting Permission', error);
      });
  }

  getpermissions() {
    // return this.firestore.collection('permissions').snapshotChanges();
    return this.firestore
      .collection('permissions')//, (ref) => ref.orderBy('latestAt', 'desc'))
      .snapshotChanges();
  }

  getJson() {
    return this.firestore
      .collection('scanned')
      .get()
      .subscribe((res) => {
        res.forEach(function (doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.data());
        });
      });
  }

  getRecall(id) {
    return this.firestore.doc(`/scanned/${id}`).get();
    //return this.firestore.collection('scanned', ref => ref.where(firebase.firestore.FieldPath.documentId(), 'in', barcodes)).snapshotChanges();
  }

  getemailpass(email, pass) {
    return this.firestore
      .collection('login', (ref) =>
       ref.where('email', '==', email).where('password', '==', pass)
      )
      .get();
  }

//   getemail() {
//     console.log();
//     try{
     
//   }catch(err){console.log(err);}
// }


}
