import {Component, OnInit} from '@angular/core';
import {NbPosition, NbThemeService} from '@nebular/theme';
import {FormControl} from '@angular/forms';
import {SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  logo = 'assets/logo.svg';
  themeFC = new FormControl('default');

  constructor(private nbThemeService: NbThemeService) {}

  ngOnInit() {
    this.themeFC.valueChanges.subscribe((theme) => {
      this.setTheme(theme);
    });
  }

  setTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    this.nbThemeService.changeTheme(theme);
    switch (theme) {
      case 'dark':
        this.logo = 'assets/logo_dark.svg';
        break;
      case 'default':
        this.logo = 'assets/logo.svg';
        break;
    }
  }
}
