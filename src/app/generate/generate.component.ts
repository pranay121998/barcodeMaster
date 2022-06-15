import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as JsBarcode from 'jsbarcode';
import { Papa } from 'ngx-papaparse';
import * as html2pdf from 'html2pdf.js';
import { Router } from '@angular/router';
@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css'],
})
export class GenerateComponent implements OnInit {
  title = 'Generate Barcode';
  multiple = [];
  single = [];
  number = 0;

  constructor(private papa: Papa, private router: Router) {}

  ngOnInit(): void {
    //this.number = Math.min(9, Math.max(0, this.number));
  }

  getPDF() {
    var element = document.getElementById('pdfSink');
    
    // console.log(element);
    var opt = {
      margin: 1,
      filename: '36px.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'pt', format: [1200, 800], orientation: 'p' },
    };
    // New Promise-based usage:
    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .catch((err: any) => {
        console.log(err);
      });
  }
  generateBarcode() {
    let text = (<HTMLInputElement>document.getElementById('generatebarcode'))
      .value;
    if (text === '') {
      console.log('Empty!!!');
      alert("Empty!!!")
    } else {
      this.number++;
      // console.log(`#barcode${this.number}`);
      JsBarcode(`#barcode${this.number}`, text);
    }
    //console.log("THE NO. IS NOW: ", this.number);
    //this.single.push(this.number);
    // console.log(this.single);
  }

  getAlls;
  details;

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
          for (let i = 0; i < res.data.length; i++) {
            this.details = {
              barcode: res.data[i]['Barcode No'],
            };
            this.multiple.push(this.details);
          }
          console.log(this.multiple);
          //this.test.push(results.data);
          console.log('Parsed: k', res.data);
        },
        error: (res, file) => {
          alert('Error Ocurred: ' + res + 'On File: ' + file);
        },
      });
    };
  }

  generateMultiple() {
    this.multiple.forEach((res, index) => {
      JsBarcode(`#csvbarcode${index}`, res.barcode, {
        format: 'CODE128',
        lineColor: '#000',
        width: 4,
        height: 85,
        displayValue: false,
      });
      // console.log(`#csvbarcode${index}`, res.barcode);
    });
  }

  htmlToPdf() {}

  goBack() {
    this.router.navigate(['/menu']);
  }
}
