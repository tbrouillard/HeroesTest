import { Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  title = "MY HEROES"
  description = "An Example Hero Application"

  constructor() {}

  ngOnInit() {}

}
