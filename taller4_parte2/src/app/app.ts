import { Component } from '@angular/core';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { Content } from './content/content';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [Header, Sidebar, Content, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}