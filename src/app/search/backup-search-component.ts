import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ExportService } from '../services/export.service';
import { map, filter, switchMap } from 'rxjs/operators';

export interface PeriodicElement {
    id: number;
    userId: number;
    title: string;
    body: string
}

const ELEMENT_DATA: PeriodicElement[] = [

];


declare var jQuery: any;
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    _baseUrl: string = '';

    MyDataSource: any;
    displayedColumns = ['id', 'userId', 'title', 'body'];
    dataSource = new MatTableDataSource(ELEMENT_DATA);
    pipe: DatePipe;

    filterForm = new FormGroup({
        fromDate: new FormControl(),
        toDate: new FormControl(),
    });

    get fromDate() { return this.filterForm.get('fromDate').value; }
    get toDate() { return this.filterForm.get('toDate').value; }

    getAlls;

    constructor(private http: HttpClient, private api: ApiService, private router: Router, private exportService: ExportService) {
        this._baseUrl = "https://jsonplaceholder.typicode.com/";
        this.pipe = new DatePipe('en');
    }

    RenderDataTable() {
        this.GetAllRecords()
            .subscribe(
                res => {
                    this.MyDataSource = new MatTableDataSource();
                    this.MyDataSource.data = res;
                    console.log(this.MyDataSource.data);
                    this.MyDataSource.filterPredicate = (res, filter) => {
                        if (this.fromDate && this.toDate) {
                            return res.userId >= this.fromDate && res.userId <= this.toDate;
                        }
                        return true;
                    }
                },
                error => {
                    console.log('There was an error while retrieving Posts !!!' + error);
                });
    }

    public GetAllRecords() {
        return this.http.get(this._baseUrl + 'posts').pipe(map((response: any) => JSON.parse(JSON.stringify(response))));
    }

    applyFilter() {
        this.MyDataSource.filter = '' + Math.random();
    }

    applySearchFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.MyDataSource.filter = filterValue;
    }

    ngOnInit(): void {

        this.RenderDataTable();

        this.api.getFileStatus().subscribe(res => {
            this.getAlls = res;
        });
    }

}
