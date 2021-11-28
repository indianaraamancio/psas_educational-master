import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { MatSort, MatSortable, Sort } from '@angular/material';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

/**
 * @title Table with pagination
 */
@Component({
  selector: 'table-pagination',
  styleUrls: ['table-pagination.component.css'],
  templateUrl: 'table-pagination.component.html',
})
export class TablePaginationComponent implements AfterViewInit {
  displayedColumns: string[] = ['projeto', 'time', 'aplicacao', 'criterio', 'autoavaliacao', 'professor'];
  
  @Input()
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.dataSource.data = this.dataSource.data;
  }

}

