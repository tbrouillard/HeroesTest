import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';
import { ESHeroService } from '../ESheroes.service';

@Component({
  selector: 'app-test-es',
  templateUrl: './test-es.component.html',
  styleUrls: ['./test-es.component.css']
})
export class TestEsComponent implements OnInit {
  isConnected = false;
  status: string;

  constructor(private hs: ESHeroService, private cd: ChangeDetectorRef) {
    this.isConnected = false; }

  ngOnInit() {
    this.hs.isAvailable().then(() => {
      this.status = 'OK';
      this.isConnected = true;
    }, error => {
      this.status = 'ERROR';
      this.isConnected = false;
      console.error('Server is down', error);
    }).then(() => {
      this.cd.detectChanges();
    });
  }

}
