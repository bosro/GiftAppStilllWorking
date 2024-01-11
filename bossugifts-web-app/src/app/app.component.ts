import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, Subject, of, takeUntil } from 'rxjs';
import { AppService } from './services/app.service';
import Swal from 'sweetalert2';
// import { CustomSelectComponent } from './custom-select/custom-select.component';
import { FooterComponent } from './footer/footer.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [AppService],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterOutlet,
    ReactiveFormsModule,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // Include CustomSelectComponent here
  // declarations: [CustomSelectComponent],
})
export class AppComponent {
  myimage:string="assets/images/arrowicon.png";
  myCardLogo:string="assets/images/netflixx.png";

  loading: boolean = false;
  form: FormGroup;
  category$: Observable<any[]> = of([]);
  cards$: Observable<any[]> = of([]);
  quantity: Array<number> = Array.from(new Array(10)).map((_, i) => i + 1);
  networks: Array<{ name: string; value: string }> = [
    { name: 'Mtn', value: 'mtn' },
    { name: 'Vodafone', value: 'vodafone' },
    { name: 'Airteltigo', value: 'airteltigo' },
  ];

  price$: Observable<number> = of(0);

  private sub$ = new Subject();
  myScriptElement: HTMLScriptElement;
  constructor(private fb: FormBuilder, private $service: AppService) {
    this.myScriptElement = document.createElement("script");
    this.myScriptElement.src = "src/assets/input.js";
    document.body.appendChild(this.myScriptElement);
    this.category$ = this.$service.getCategory();
    this.form = this.fb.group({
      recipient: this.fb.group({
        name: [null, Validators.required],
        phone: [
          null,
          [
            Validators.required,
            Validators.maxLength(10),
            Validators.minLength(10),
          ],
        ],
      }),
      order: this.fb.group({
        accountType: ['momo', Validators.required],
        customerId: [null, Validators.required],
        cart: [[], [Validators.required]],
        accountNumber: [
          null,
          [
            Validators.required,
            Validators.maxLength(10),
            Validators.minLength(10),
          ],
        ],
        accountIssuer: ['', Validators.required],
        recipient: [null, Validators.required],
      }),
      items: this.fb.group({
        categoryId: ['', Validators.required],
        giftcardId: ['', Validators.required],
        quantity: ['', Validators.required],
      }),
    });
    this.form
      .get('items')
      ?.valueChanges.pipe(takeUntil(this.sub$))
      .subscribe((i) => {
        if (this.form.get('items')?.valid) {
          const item = this.form.get('items')?.value;
          this.cart.push(item);
          this.price$ = this.$service.calculatePrice({
            currency: 'GHS',
            giftcard: item.giftcardId,
            quantity: item.quantity,
          });
        }
      });
    this.form
      .get('items')
      ?.get('categoryId')
      ?.valueChanges.pipe(takeUntil(this.sub$))
      .subscribe((v) => {
        if (typeof v === 'string' && v !== '') {
          this.cards$ = this.$service.getCards(v);
        }
      });
  }

  ngOnInit() {}

  get order() {
    return this.form.get('order');
  }

  get recipient() {
    return this.form.get('recipient');
  }

  get items() {
    return this.form.get('items');
  }

  get cart(): FormArray {
    return this.form.get('order')?.get('cart')?.value as FormArray;
  }

  get disabled(): boolean {
    return this.form.get('recipient')?.invalid ||
      this.form.get('items')?.invalid ||
      this.form.get('order')?.get('accountNumber')?.invalid ||
      this.form.get('order')?.get('accountIssuer')?.invalid ||
      this.loading
      ? true
      : false;
  }

  buy(): void {
    this.loading = true;
    this.$service.onboard(this.form.get('recipient')?.value).subscribe({
      next: ({ _id, token }) => {
        const order = this.form.get('order');
        order?.patchValue({ customerId: _id, recipient: _id });
        this.$service.order(order?.value, token).then((res) => {
          try {
            if (!res.success) {
              throw Error(res.message);
            }
            this.loading = false;
            this.form.reset();
            Swal.fire({
              title: 'Success',
              text: res.message,
              icon: 'success',
            });
          } catch (err) {
            this.loading = false;
            Swal.fire({
              title: 'Error',
              text: (err as Error)?.message,
              icon: 'error',
            });
          }
        });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: 'Error',
          text: err.message,
          icon: 'error',
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }
}
