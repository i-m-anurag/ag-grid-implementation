import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { CustomTextFilterComponent } from './components/custom-text-filter/custom-text-filter.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AG-Grid Implementation with Custom Filter';

  // Column definitions with custom filter for the 'athlete' column
  columnDefs: ColDef[] = [
    {
      field: 'athlete',
      headerName: 'Athlete',
      filter: CustomTextFilterComponent, // Using our custom text filter
      minWidth: 200
    },
    {
      field: 'age',
      headerName: 'Age',
      filter: 'agNumberColumnFilter',
      maxWidth: 100
    },
    {
      field: 'country',
      headerName: 'Country',
      filter: 'agTextColumnFilter',
      minWidth: 150
    },
    {
      field: 'year',
      headerName: 'Year',
      filter: 'agNumberColumnFilter',
      maxWidth: 100
    },
    {
      field: 'sport',
      headerName: 'Sport',
      filter: 'agTextColumnFilter',
      minWidth: 150
    },
    {
      field: 'gold',
      headerName: 'Gold',
      filter: 'agNumberColumnFilter',
      maxWidth: 100
    },
    {
      field: 'silver',
      headerName: 'Silver',
      filter: 'agNumberColumnFilter',
      maxWidth: 100
    },
    {
      field: 'bronze',
      headerName: 'Bronze',
      filter: 'agNumberColumnFilter',
      maxWidth: 100
    }
  ];

  // Sample row data
  rowData = [
    { athlete: 'Michael Phelps', age: 23, country: 'United States', year: 2008, sport: 'Swimming', gold: 8, silver: 0, bronze: 0 },
    { athlete: 'Michael Phelps', age: 19, country: 'United States', year: 2004, sport: 'Swimming', gold: 6, silver: 0, bronze: 2 },
    { athlete: 'Michael Phelps', age: 27, country: 'United States', year: 2012, sport: 'Swimming', gold: 4, silver: 2, bronze: 0 },
    { athlete: 'Natalie Coughlin', age: 25, country: 'United States', year: 2008, sport: 'Swimming', gold: 1, silver: 2, bronze: 3 },
    { athlete: 'Aleksey Nemov', age: 24, country: 'Russia', year: 2000, sport: 'Gymnastics', gold: 2, silver: 1, bronze: 3 },
    { athlete: 'Alicia Coutts', age: 24, country: 'Australia', year: 2012, sport: 'Swimming', gold: 1, silver: 3, bronze: 1 },
    { athlete: 'Missy Franklin', age: 17, country: 'United States', year: 2012, sport: 'Swimming', gold: 4, silver: 0, bronze: 1 },
    { athlete: 'Ryan Lochte', age: 27, country: 'United States', year: 2012, sport: 'Swimming', gold: 2, silver: 2, bronze: 1 },
    { athlete: 'Allison Schmitt', age: 22, country: 'United States', year: 2012, sport: 'Swimming', gold: 3, silver: 1, bronze: 1 },
    { athlete: 'Natalie Coughlin', age: 21, country: 'United States', year: 2004, sport: 'Swimming', gold: 2, silver: 2, bronze: 1 },
    { athlete: 'Ian Thorpe', age: 17, country: 'Australia', year: 2000, sport: 'Swimming', gold: 3, silver: 2, bronze: 0 },
    { athlete: 'Dara Torres', age: 33, country: 'United States', year: 2000, sport: 'Swimming', gold: 0, silver: 2, bronze: 3 },
    { athlete: 'Cindy Klassen', age: 26, country: 'Canada', year: 2006, sport: 'Speed Skating', gold: 1, silver: 2, bronze: 2 },
    { athlete: 'Nastia Liukin', age: 18, country: 'United States', year: 2008, sport: 'Gymnastics', gold: 1, silver: 3, bronze: 1 },
    { athlete: 'Marit Bjørgen', age: 29, country: 'Norway', year: 2010, sport: 'Cross Country Skiing', gold: 3, silver: 1, bronze: 1 },
    { athlete: 'Sun Yang', age: 20, country: 'China', year: 2012, sport: 'Swimming', gold: 2, silver: 1, bronze: 1 }
  ];
}
