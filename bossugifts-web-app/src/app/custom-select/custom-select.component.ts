import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.css'],
})

export class CustomSelectComponent implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const selectField = this.el.nativeElement.querySelector('#selectField');
    const selectText = this.el.nativeElement.querySelector('#selectText');
    const options = this.el.nativeElement.querySelectorAll('.options');
    const list = this.el.nativeElement.querySelector('#list');
    const arrowIcon = this.el.nativeElement.querySelector('#arrowIcon');

    selectField.addEventListener('click', () => {
      list.classList.toggle('hide');
      arrowIcon.classList.toggle('rotate');
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        selectText.innerHTML = option.textContent;
        list.classList.toggle('hide');
        arrowIcon.classList.toggle('rotate');
      });
    });
  }
}
